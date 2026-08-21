import { validateEvent } from '@polar-sh/sdk/webhooks';
import { dbBillingInfo, dbOrganization, dbPaymentGateway } from 'database';
import type { Context } from 'hono';
import { logger } from '../utils/backend-logger';
import { decryptGatewayCredentials, polarCredentialsSchema } from '../utils/gateway-credentials';
import { getPaymentGatewayEnvironment } from '../utils/payment-gateway';

export async function polarWebhookHandler(context: Context) {
  const gateway = await dbPaymentGateway.findByProvider('POLAR', getPaymentGatewayEnvironment());
  if (!gateway) return context.text('', 503);
  const credentials = decryptGatewayCredentials(gateway.encryptedCredentials, polarCredentialsSchema);
  if (!credentials.webhookSecret) return context.text('', 503);

  try {
    const body = await context.req.text();
    const headers: Record<string, string> = {};
    context.req.raw.headers.forEach((value, key) => { headers[key] = value; });
    const event = validateEvent(body, headers, credentials.webhookSecret);
    if (!event.type.startsWith('subscription.')) return context.text('', 202);

    const subscription = event.data as {
      id: string;
      status: string;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      endsAt: Date | null;
      endedAt: Date | null;
      customerId: string;
      productId: string;
      checkoutId: string | null;
      metadata: Record<string, unknown>;
    };
    const organizationId = typeof subscription.metadata.organizationId === 'string'
      ? subscription.metadata.organizationId
      : undefined;
    if (!organizationId) {
      logger.warn({ eventType: event.type, subscriptionId: subscription.id }, 'Polar webhook has no organizationId');
      return context.text('', 202);
    }

    const mappedProduct = await dbPaymentGateway.findProductByExternalId(gateway.id, subscription.productId);
    if (!mappedProduct) {
      logger.error({ productId: subscription.productId }, 'Polar webhook product is not mapped');
      return context.text('', 422);
    }

    await dbOrganization.update(organizationId, { pricingOnboarded: true });
    await dbBillingInfo.upsert({
      organizationId,
      paymentProvider: 'POLAR',
      customerId: subscription.customerId,
      addressId: '',
      businessId: null,
      transactionId: subscription.checkoutId ?? '',
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionNextBilledAt: subscription.currentPeriodEnd,
      subscriptionEndDate: subscription.cancelAtPeriodEnd ? subscription.endsAt : subscription.endedAt,
      productId: subscription.productId,
      priceId: mappedProduct.externalProductId,
    });
    return context.text('', 202);
  } catch (error) {
    logger.warn({ err: error }, 'Rejected Polar webhook');
    return context.text('', 400);
  }
}
