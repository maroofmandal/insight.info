import { dbPaymentGateway, type BillingInfo, type Organization } from 'database';
import { getPaymentGatewayEnvironment } from './payment-gateway';

export const getSubscriptionStatus = async (organization: Organization & { billingInfo: BillingInfo | null }) => {
  const billingInfo = organization.billingInfo;
  let gatewayPlan: Awaited<ReturnType<typeof dbPaymentGateway.findProductByExternalId>> = null;
  if (billingInfo?.paymentProvider === 'POLAR') {
    const gateway = await dbPaymentGateway.findByProvider('POLAR', getPaymentGatewayEnvironment());
    if (gateway) gatewayPlan = await dbPaymentGateway.findProductByExternalId(gateway.id, billingInfo.productId);
  }

  return {
    isActive: billingInfo?.subscriptionStatus === 'active' || billingInfo?.subscriptionStatus === 'past_due',
    isPastDue: billingInfo?.subscriptionStatus === 'past_due',
    priceId: billingInfo?.priceId,
    customPlanEvents: organization.customPlanEvents ?? gatewayPlan?.events,
    pricingPlanIndex: gatewayPlan?.tierIndex,
    isYearly: gatewayPlan?.billingInterval === 'YEAR',
  };
};

export type SubscriptionStatus = Awaited<ReturnType<typeof getSubscriptionStatus>>;
