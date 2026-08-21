const SENSITIVE_KEY = /(access.?token|password|secret|credential)/i;
const REDACTED = '[REDACTED]';

export function redactSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitiveData);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        SENSITIVE_KEY.test(key) ? REDACTED : redactSensitiveData(child),
      ]),
    );
  }

  if (typeof value === 'string') {
    try {
      return JSON.stringify(redactSensitiveData(JSON.parse(value)));
    } catch {
      return value;
    }
  }

  return value;
}
