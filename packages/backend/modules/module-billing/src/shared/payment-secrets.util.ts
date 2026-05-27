import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import type {
  PaymentSecretFieldStatusDto,
  PaymentSecretStatusesDto,
  PaymentSecretsDto,
} from '@pkg/types';

const ENCRYPTION_VERSION = 'v1';

function cleanSecret(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function cleanProviderSecrets<T extends Record<string, unknown>>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const cleaned = cleanSecret(value);
    if (cleaned) out[key] = cleaned;
  }
  return Object.keys(out).length > 0 ? (out as T) : undefined;
}

export function normalizePaymentSecrets(raw: unknown): PaymentSecretsDto {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  return {
    stripe: cleanProviderSecrets(obj['stripe']),
    liqpay: cleanProviderSecrets(obj['liqpay']),
    wayforpay: cleanProviderSecrets(obj['wayforpay']),
    lemonsqueezy: cleanProviderSecrets(obj['lemonsqueezy']),
    paddle: cleanProviderSecrets(obj['paddle']),
    monopay: cleanProviderSecrets(obj['monopay']),
    paypal: cleanProviderSecrets(obj['paypal']),
  };
}

export function mergePaymentSecrets(
  current: PaymentSecretsDto,
  updates?: PaymentSecretsDto,
): PaymentSecretsDto {
  if (!updates) return normalizePaymentSecrets(current);
  const next = normalizePaymentSecrets({
    stripe: { ...(current.stripe ?? {}), ...(updates.stripe ?? {}) },
    liqpay: { ...(current.liqpay ?? {}), ...(updates.liqpay ?? {}) },
    wayforpay: { ...(current.wayforpay ?? {}), ...(updates.wayforpay ?? {}) },
    lemonsqueezy: { ...(current.lemonsqueezy ?? {}), ...(updates.lemonsqueezy ?? {}) },
    paddle: { ...(current.paddle ?? {}), ...(updates.paddle ?? {}) },
    monopay: { ...(current.monopay ?? {}), ...(updates.monopay ?? {}) },
    paypal: { ...(current.paypal ?? {}), ...(updates.paypal ?? {}) },
  });
  return next;
}

export function hasPaymentSecretUpdates(updates?: PaymentSecretsDto): boolean {
  if (!updates) return false;
  return Object.values(updates).some((provider) =>
    provider ? Object.values(provider).some((value) => Boolean(cleanSecret(value))) : false,
  );
}

function deriveKey(masterKey: string): Buffer {
  return createHash('sha256').update(masterKey).digest();
}

export function encryptPaymentSecrets(secrets: PaymentSecretsDto, masterKey: string): string {
  const normalized = normalizePaymentSecrets(secrets);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(masterKey), iv);
  const data = Buffer.from(JSON.stringify(normalized), 'utf8');
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENCRYPTION_VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

export function decryptPaymentSecrets(payload: string, masterKey: string): PaymentSecretsDto {
  const [version, ivBase64, tagBase64, encryptedBase64] = payload.split(':');
  if (version !== ENCRYPTION_VERSION || !ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error('Unsupported payment secret payload');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    deriveKey(masterKey),
    Buffer.from(ivBase64, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, 'base64')),
    decipher.final(),
  ]);
  return normalizePaymentSecrets(JSON.parse(decrypted.toString('utf8')));
}

export function secretStatus(
  systemValue: string | undefined,
  envValue: string | undefined,
): PaymentSecretFieldStatusDto {
  if (systemValue) {
    return { configured: true, source: 'system' };
  }
  if (envValue) {
    return { configured: true, source: 'env' };
  }
  return { configured: false, source: 'missing' };
}

export function emptyPaymentSecretStatuses(): PaymentSecretStatusesDto {
  const missing: PaymentSecretFieldStatusDto = { configured: false, source: 'missing' };
  return {
    stripe: {
      liveSecretKey: { ...missing },
      liveWebhookSecret: { ...missing },
      testSecretKey: { ...missing },
      testWebhookSecret: { ...missing },
    },
    liqpay: {
      livePrivateKey: { ...missing },
      testPrivateKey: { ...missing },
    },
    wayforpay: {
      liveSecretKey: { ...missing },
      testSecretKey: { ...missing },
    },
    lemonsqueezy: {
      liveApiKey: { ...missing },
      liveWebhookSecret: { ...missing },
      testApiKey: { ...missing },
      testWebhookSecret: { ...missing },
    },
    paddle: {
      liveApiKey: { ...missing },
      liveWebhookSecret: { ...missing },
      testApiKey: { ...missing },
      testWebhookSecret: { ...missing },
    },
    monopay: {
      liveToken: { ...missing },
      testToken: { ...missing },
    },
    paypal: {
      liveClientSecret: { ...missing },
      liveWebhookId: { ...missing },
      testClientSecret: { ...missing },
      testWebhookId: { ...missing },
    },
  };
}
