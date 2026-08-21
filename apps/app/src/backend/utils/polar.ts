import { Polar } from '@polar-sh/sdk';
import { getVemetricUrl } from '@vemetric/common/env';
import { PUBLIC_PRICING_TIERS, YEARLY_MONTHS_CHARGED } from '@vemetric/common/pricing';
import { dbPaymentGateway, type BillingInterval, type PaymentGatewayEnvironment } from 'database';
import { decryptGatewayCredentials, encryptGatewayCredentials, polarCredentialsSchema } from './gateway-credentials';

const WEBHOOK_EVENTS = [
  'subscription.created',
  'subscription.updated',
  'subscription.active',
  'subscription.canceled',
  'subscription.uncanceled',
  'subscription.revoked',
  'subscription.past_due',
] as const;

export const createPolarClient = (encryptedCredentials: string, environment: PaymentGatewayEnvironment) => {
  const credentials = decryptGatewayCredentials(encryptedCredentials, polarCredentialsSchema);
  return {
    credentials,
    client: createPolarClientFromToken(credentials.accessToken, environment),
  };
};

export const createPolarClientFromToken = (accessToken: string, environment: PaymentGatewayEnvironment) =>
  new Polar({
    accessToken,
    server: environment === 'SANDBOX' ? 'sandbox' : 'production',
  });

export async function validatePolarAccessToken(accessToken: string, environment: PaymentGatewayEnvironment) {
  await createPolarClientFromToken(accessToken, environment).products.list({ limit: 1 });
}

const productName = (events: number, interval: BillingInterval) =>
  `Insight.info ${events.toLocaleString('en-US')} Events - ${interval === 'MONTH' ? 'Monthly' : 'Yearly'}`;

export async function syncPolarCatalog(gatewayId: string, webhookUrl?: string) {
  const gateway = await dbPaymentGateway.findById(gatewayId);
  if (!gateway || gateway.provider !== 'POLAR') throw new Error('Polar gateway not found');

  const { client, credentials } = createPolarClient(gateway.encryptedCredentials, gateway.environment);
  const catalog = await client.products.list({ limit: 100 });
  const remoteProducts = catalog.result.items;

  for (let tierIndex = 0; tierIndex < PUBLIC_PRICING_TIERS.length; tierIndex += 1) {
    const tier = PUBLIC_PRICING_TIERS[tierIndex];
    for (const billingInterval of ['MONTH', 'YEAR'] as const) {
      const recurringInterval = billingInterval === 'MONTH' ? 'month' : 'year';
      const amount = tier.monthlyPrice * 100 * (billingInterval === 'YEAR' ? YEARLY_MONTHS_CHARGED : 1);
      const metadata = {
        insight_tier_index: tierIndex,
        insight_events: tier.events,
        insight_interval: recurringInterval,
      };
      let product = remoteProducts.find(
        (candidate) =>
          candidate.metadata?.insight_tier_index === tierIndex &&
          candidate.metadata?.insight_interval === recurringInterval,
      );

      // Reuse the original $5 monthly product in the account instead of leaving a duplicate live offer.
      if (!product && tierIndex === 0 && billingInterval === 'MONTH') {
        product = remoteProducts.find((candidate) => candidate.name === 'Monthly 5K Events');
      }

      if (product) {
        const existingPrice = product.prices[0];
        const existingAmount = 'priceAmount' in existingPrice ? existingPrice.priceAmount : undefined;
        product = await client.products.update({
          id: product.id,
          productUpdate: {
            name: productName(tier.events, billingInterval),
            description: `${tier.events.toLocaleString('en-US')} analytics events per month.`,
            metadata,
            visibility: 'public',
            isArchived: false,
            prices:
              existingAmount === amount
                ? [{ id: existingPrice.id }]
                : [{ amountType: 'fixed', priceAmount: amount, priceCurrency: 'usd' }],
          },
        });
      } else {
        product = await client.products.create({
          name: productName(tier.events, billingInterval),
          description: `${tier.events.toLocaleString('en-US')} analytics events per month.`,
          metadata,
          visibility: 'public',
          recurringInterval,
          prices: [{ amountType: 'fixed', priceAmount: amount, priceCurrency: 'usd' }],
        });
        remoteProducts.push(product);
      }

      await dbPaymentGateway.upsertProduct({
        paymentGatewayId: gateway.id,
        tierIndex,
        billingInterval,
        events: tier.events,
        priceCents: amount,
        externalProductId: product.id,
        externalPriceId: product.prices[0]?.id ?? null,
        active: true,
      });
    }
  }

  let webhookConfigured = false;
  if (webhookUrl) {
    const endpoints = await client.webhooks.listWebhookEndpoints({ limit: 100 });
    let endpoint = endpoints.result.items.find((candidate) => candidate.url === webhookUrl);
    if (!endpoint) {
      endpoint = await client.webhooks.createWebhookEndpoint({
        url: webhookUrl,
        name: 'Insight.info subscriptions',
        format: 'raw',
        events: [...WEBHOOK_EVENTS],
      });
    }
    await dbPaymentGateway.update(gateway.id, {
      encryptedCredentials: encryptGatewayCredentials({
        ...credentials,
        webhookSecret: endpoint.secret,
      }),
      configuration: { webhookUrl, webhookEndpointId: endpoint.id },
    });
    webhookConfigured = true;
  }

  return { products: PUBLIC_PRICING_TIERS.length * 2, webhookConfigured };
}

export async function createPolarCheckout(input: {
  encryptedCredentials: string;
  environment: PaymentGatewayEnvironment;
  externalProductId: string;
  organizationId: string;
  email: string;
}) {
  const { client } = createPolarClient(input.encryptedCredentials, input.environment);
  return client.checkouts.create({
    products: [input.externalProductId],
    customerEmail: input.email,
    externalCustomerId: input.organizationId,
    metadata: { organizationId: input.organizationId },
    allowDiscountCodes: true,
    successUrl: `${getVemetricUrl('app')}/billing`,
    returnUrl: `${getVemetricUrl('app')}/billing`,
  });
}

export async function createPolarCustomerPortal(
  encryptedCredentials: string,
  environment: PaymentGatewayEnvironment,
  organizationId: string,
) {
  const { client } = createPolarClient(encryptedCredentials, environment);
  return client.customerSessions.create({
    externalCustomerId: organizationId,
    returnUrl: `${getVemetricUrl('app')}/billing`,
  });
}
