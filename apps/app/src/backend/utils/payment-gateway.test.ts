import { describe, expect, it } from 'vitest';
import { getPolarSetupErrorMessage } from './payment-gateway';

describe('getPolarSetupErrorMessage', () => {
  it('explains a sandbox token mismatch without exposing the raw API response', () => {
    const error = Object.assign(new Error('raw sdk error'), {
      statusCode: 401,
      body: '{"error":"invalid_token"}',
    });

    expect(getPolarSetupErrorMessage(error, 'SANDBOX')).toBe(
      'Polar rejected this access token for Sandbox. Polar Sandbox and Production use separate access tokens. Select Production if the token belongs to that environment, or create a new Sandbox token.',
    );
  });

  it('preserves useful non-authentication errors', () => {
    expect(getPolarSetupErrorMessage(new Error('Webhook URL is invalid'), 'PRODUCTION')).toBe('Webhook URL is invalid');
  });
});
