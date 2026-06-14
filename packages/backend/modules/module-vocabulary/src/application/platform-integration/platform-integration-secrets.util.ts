import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import type {
  IntegrationSecretFieldStatusDto,
  IntegrationSecretStatusesDto,
  PlatformIntegrationSecretsDto,
} from '@pkg/types';

const ENCRYPTION_VERSION = 'v1';

export type StoredIntegrationSecrets = {
  smtpPass?: string;
  libreTranslateApiKey?: string;
  reversoApiKey?: string;
  deeplAuthKey?: string;
  googleTranslateApiKey?: string;
  azureTranslatorKey?: string;
  openaiWhisperApiKey?: string;
  telegramBotToken?: string;
  googleClientSecret?: string;
  facebookAppSecret?: string;
  zoomClientSecret?: string;
  zoomWebhookSecret?: string;
  livekitApiSecret?: string;
};

function cleanSecret(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function normalizeIntegrationSecrets(
  raw: unknown,
): StoredIntegrationSecrets {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  return {
    smtpPass: cleanSecret(obj['smtpPass']),
    libreTranslateApiKey: cleanSecret(obj['libreTranslateApiKey']),
    reversoApiKey: cleanSecret(obj['reversoApiKey']),
    deeplAuthKey: cleanSecret(obj['deeplAuthKey']),
    googleTranslateApiKey: cleanSecret(obj['googleTranslateApiKey']),
    azureTranslatorKey: cleanSecret(obj['azureTranslatorKey']),
    openaiWhisperApiKey: cleanSecret(obj['openaiWhisperApiKey']),
    telegramBotToken: cleanSecret(obj['telegramBotToken']),
    googleClientSecret: cleanSecret(obj['googleClientSecret']),
    facebookAppSecret: cleanSecret(obj['facebookAppSecret']),
    zoomClientSecret: cleanSecret(obj['zoomClientSecret']),
    zoomWebhookSecret: cleanSecret(obj['zoomWebhookSecret']),
    livekitApiSecret: cleanSecret(obj['livekitApiSecret']),
  };
}

export function mergeIntegrationSecrets(
  current: StoredIntegrationSecrets,
  updates?: PlatformIntegrationSecretsDto,
): StoredIntegrationSecrets {
  if (!updates) return normalizeIntegrationSecrets(current);
  const next = { ...normalizeIntegrationSecrets(current) };
  const apply = (
    key: keyof StoredIntegrationSecrets,
    value: string | null | undefined,
  ) => {
    if (value === undefined) return;
    if (value === null || value === '') {
      delete next[key];
      return;
    }
    const cleaned = cleanSecret(value);
    if (cleaned) next[key] = cleaned;
    else delete next[key];
  };
  apply('smtpPass', updates.smtpPass);
  apply('libreTranslateApiKey', updates.libreTranslateApiKey);
  apply('reversoApiKey', updates.reversoApiKey);
  apply('deeplAuthKey', updates.deeplAuthKey);
  apply('googleTranslateApiKey', updates.googleTranslateApiKey);
  apply('azureTranslatorKey', updates.azureTranslatorKey);
  apply('openaiWhisperApiKey', updates.openaiWhisperApiKey);
  apply('telegramBotToken', updates.telegramBotToken);
  apply('googleClientSecret', updates.googleClientSecret);
  apply('facebookAppSecret', updates.facebookAppSecret);
  apply('zoomClientSecret', updates.zoomClientSecret);
  apply('zoomWebhookSecret', updates.zoomWebhookSecret);
  apply('livekitApiSecret', updates.livekitApiSecret);
  return next;
}

export function hasIntegrationSecretUpdates(
  updates?: PlatformIntegrationSecretsDto,
): boolean {
  if (!updates) return false;
  return Object.values(updates).some(value => value !== undefined);
}

function deriveKey(masterKey: string): Buffer {
  return createHash('sha256').update(masterKey).digest();
}

export function encryptIntegrationSecrets(
  secrets: StoredIntegrationSecrets,
  masterKey: string,
): string {
  const normalized = normalizeIntegrationSecrets(secrets);
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

export function decryptIntegrationSecrets(
  payload: string,
  masterKey: string,
): StoredIntegrationSecrets {
  const [version, ivBase64, tagBase64, encryptedBase64] = payload.split(':');
  if (
    version !== ENCRYPTION_VERSION ||
    !ivBase64 ||
    !tagBase64 ||
    !encryptedBase64
  ) {
    throw new Error('Unsupported integration secret payload');
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
  return normalizeIntegrationSecrets(JSON.parse(decrypted.toString('utf8')));
}

export function integrationSecretStatus(
  stored: string | undefined,
  env: string | undefined,
): IntegrationSecretFieldStatusDto {
  if (stored) return { configured: true, source: 'stored' };
  if (env) return { configured: true, source: 'env' };
  return { configured: false, source: 'missing' };
}

export function emptyIntegrationSecretStatuses(): IntegrationSecretStatusesDto {
  const missing: IntegrationSecretFieldStatusDto = {
    configured: false,
    source: 'missing',
  };
  return {
    smtpPass: { ...missing },
    libreTranslateApiKey: { ...missing },
    reversoApiKey: { ...missing },
    deeplAuthKey: { ...missing },
    googleTranslateApiKey: { ...missing },
    azureTranslatorKey: { ...missing },
    openaiWhisperApiKey: { ...missing },
    telegramBotToken: { ...missing },
    googleClientSecret: { ...missing },
    facebookAppSecret: { ...missing },
    zoomClientSecret: { ...missing },
    zoomWebhookSecret: { ...missing },
    livekitApiSecret: { ...missing },
  };
}
