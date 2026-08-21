import { getBaseDomain } from '@vemetric/common/env';
import type { PaymentGatewayEnvironment } from 'database';

export const getPaymentGatewayEnvironment = (): PaymentGatewayEnvironment =>
  getBaseDomain().includes('localhost') ? 'SANDBOX' : 'PRODUCTION';

export const paymentGatewayEnvironmentLabel = (environment: PaymentGatewayEnvironment) =>
  environment === 'SANDBOX' ? 'Sandbox' : 'Production';

type PolarApiError = Error & {
  statusCode?: number;
  body?: string;
};

export function getPolarSetupErrorMessage(error: unknown, environment: PaymentGatewayEnvironment): string {
  const polarError = error as Partial<PolarApiError>;
  const body = polarError.body ?? '';
  const isInvalidToken = polarError.statusCode === 401 || body.includes('invalid_token');

  if (isInvalidToken) {
    const selectedEnvironment = paymentGatewayEnvironmentLabel(environment);
    const otherEnvironment = paymentGatewayEnvironmentLabel(environment === 'SANDBOX' ? 'PRODUCTION' : 'SANDBOX');
    return `Polar rejected this access token for ${selectedEnvironment}. Polar Sandbox and Production use separate access tokens. Select ${otherEnvironment} if the token belongs to that environment, or create a new ${selectedEnvironment} token.`;
  }

  return polarError.message || 'Polar could not validate the gateway configuration';
}
