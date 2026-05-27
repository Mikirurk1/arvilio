import type { WebRequestSessionDto } from '@pkg/types';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './request-session';

type CacheEntry = {
  expiresAt: number;
  session: WebRequestSessionDto;
};

const DEFAULT_TTL_MS = 8_000;
const MAX_ENTRIES = 200;

const cache = new Map<string, CacheEntry>();

function readTtlMs(): number {
  const raw = process.env.WEB_SESSION_CACHE_TTL_MS;
  if (!raw) return DEFAULT_TTL_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
}

function readCookieValue(cookieHeader: string, name: string): string | null {
  const parts = cookieHeader.split(';');
  const prefix = `${name}=`;
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

/** Stable key from auth cookies only (ignores unrelated cookie noise). */
export function buildWebSessionCacheKey(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const access = readCookieValue(cookieHeader, ACCESS_COOKIE);
  const refresh = readCookieValue(cookieHeader, REFRESH_COOKIE);
  if (!access && !refresh) return null;
  return `${access ?? ''}|${refresh ?? ''}`;
}

export function readCachedWebSession(key: string): WebRequestSessionDto | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.session;
}

export function writeCachedWebSession(key: string, session: WebRequestSessionDto): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, {
    session,
    expiresAt: Date.now() + readTtlMs(),
  });
}

export function clearWebSessionCache(): void {
  cache.clear();
}
