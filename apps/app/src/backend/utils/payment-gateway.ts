import { getBaseDomain } from '@vemetric/common/env';
import type { PaymentGatewayEnvironment } from 'database';

export const getPaymentGatewayEnvironment = (): PaymentGatewayEnvironment =>
  getBaseDomain().includes('localhost') ? 'SANDBOX' : 'PRODUCTION';

export const paymentGatewayEnvironmentLabel = (environment: PaymentGatewayEnvironment) =>
  environment === 'SANDBOX' ? 'Sandbox' : 'Production';
