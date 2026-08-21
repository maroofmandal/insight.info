import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';

const ENVELOPE_VERSION = 'v1';

const encryptionKey = () => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters to encrypt payment gateway credentials');
  }
  return createHash('sha256').update(`insight-payment-gateway:${secret}`).digest();
};

export function encryptGatewayCredentials(credentials: Record<string, unknown>): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [ENVELOPE_VERSION, iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptGatewayCredentials<T extends z.ZodType>(payload: string, schema: T): z.infer<T> {
  const [version, iv, tag, encrypted] = payload.split('.');
  if (version !== ENVELOPE_VERSION || !iv || !tag || !encrypted) {
    throw new Error('Unsupported payment gateway credential format');
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  const cleartext = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  return schema.parse(JSON.parse(cleartext));
}

export const polarCredentialsSchema = z.object({
  accessToken: z.string().min(1),
  webhookSecret: z.string().min(1).optional(),
});

export type PolarCredentials = z.infer<typeof polarCredentialsSchema>;
