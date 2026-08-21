import { describe, expect, it } from 'vitest';
import { redactSensitiveData } from './redact-sensitive-data';

describe('redactSensitiveData', () => {
  it('redacts credentials recursively without hiding safe configuration', () => {
    expect(
      redactSensitiveData({
        accessToken: 'polar-secret',
        enabled: true,
        nested: { webhookSecret: 'webhook-secret', environment: 'SANDBOX' },
      }),
    ).toEqual({
      accessToken: '[REDACTED]',
      enabled: true,
      nested: { webhookSecret: '[REDACTED]', environment: 'SANDBOX' },
    });
  });

  it('redacts JSON request bodies', () => {
    expect(redactSensitiveData('{"json":{"password":"private","name":"Insight"}}')).toBe(
      '{"json":{"password":"[REDACTED]","name":"Insight"}}',
    );
  });
});
