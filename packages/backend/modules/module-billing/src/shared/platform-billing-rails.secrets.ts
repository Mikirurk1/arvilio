import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ENCRYPTION_VERSION = 'v1';

export type PlatformRailSecretsMap = Record<string, Record<string, string>>;

function deriveKey(masterKey: string): Buffer {
  return createHash('sha256').update(masterKey).digest();
}

function cleanMap(raw: unknown): PlatformRailSecretsMap {
  if (!raw || typeof raw !== 'object') return {};
  const out: PlatformRailSecretsMap = {};
  for (const [railId, fields] of Object.entries(raw as Record<string, unknown>)) {
    if (!fields || typeof fields !== 'object') continue;
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) cleaned[k] = v.trim();
    }
    if (Object.keys(cleaned).length > 0) out[railId] = cleaned;
  }
  return out;
}

export function encryptPlatformBillingSecrets(
  secrets: PlatformRailSecretsMap,
  masterKey: string,
): string {
  const normalized = cleanMap(secrets);
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

export function decryptPlatformBillingSecrets(
  payload: string,
  masterKey: string,
): PlatformRailSecretsMap {
  const [version, ivBase64, tagBase64, encryptedBase64] = payload.split(':');
  if (version !== ENCRYPTION_VERSION || !ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error('Unsupported platform billing secret payload');
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
  return cleanMap(JSON.parse(decrypted.toString('utf8')));
}

export function mergePlatformBillingSecrets(
  current: PlatformRailSecretsMap,
  updates: PlatformRailSecretsMap,
): PlatformRailSecretsMap {
  const next: PlatformRailSecretsMap = { ...current };
  for (const [railId, fields] of Object.entries(updates)) {
    const merged = { ...(next[railId] ?? {}) };
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === 'string' && v.trim()) merged[k] = v.trim();
    }
    if (Object.keys(merged).length > 0) next[railId] = merged;
    else delete next[railId];
  }
  return next;
}
