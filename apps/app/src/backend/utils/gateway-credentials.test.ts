import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { decryptGatewayCredentials, encryptGatewayCredentials, polarCredentialsSchema } from './gateway-credentials';

describe('payment gateway credential encryption', () => {
  const originalSecret = process.env.BETTER_AUTH_SECRET;
  beforeEach(() => { process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-thirty-two-characters'; });
  afterEach(() => { process.env.BETTER_AUTH_SECRET = originalSecret; });

  it('round trips credentials without storing cleartext', () => {
    const encrypted = encryptGatewayCredentials({ accessToken: 'polar_test_token', webhookSecret: 'whsec_test' });
    expect(encrypted).not.toContain('polar_test_token');
    expect(decryptGatewayCredentials(encrypted, polarCredentialsSchema)).toEqual({
      accessToken: 'polar_test_token',
      webhookSecret: 'whsec_test',
    });
  });

  it('rejects ciphertext changed after encryption', () => {
    const encrypted = encryptGatewayCredentials({ accessToken: 'polar_test_token' });
    expect(() => decryptGatewayCredentials(`${encrypted.slice(0, -1)}x`, polarCredentialsSchema)).toThrow();
  });
});
