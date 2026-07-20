import type { WebRequestSessionDto } from '@pkg/types';
import { mockAuthUser } from '../../testing/fixtures';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './request-session';
import {
  buildWebSessionCacheKey,
  clearWebSessionCache,
  readCachedWebSession,
  writeCachedWebSession,
} from './proxy-session-cache';

const session: WebRequestSessionDto = {
  authenticated: true,
  authStrategy: 'access',
  scope: 'school',
  availableScopes: ['school'],
  tenantKey: null,
  impersonation: null,
  trial: null,
  locale: 'uk',
  preferredLocale: 'uk',
  enabledLocales: ['uk', 'en'],
  user: mockAuthUser(),
};

describe('proxy-session-cache', () => {
  beforeEach(() => {
    clearWebSessionCache();
    delete process.env.WEB_SESSION_CACHE_TTL_MS;
  });

  it('builds cache key from auth cookies only', () => {
    const key = buildWebSessionCacheKey(
      `theme=dark; ${ACCESS_COOKIE}=abc; other=1; ${REFRESH_COOKIE}=def`,
    );
    expect(key).toBe('abc|def');
  });

  it('returns null key when auth cookies are absent', () => {
    expect(buildWebSessionCacheKey('theme=dark')).toBeNull();
    expect(buildWebSessionCacheKey(null)).toBeNull();
  });

  it('reads and writes cached sessions until expiry', () => {
    const key = 'access|refresh';
    writeCachedWebSession(key, session);
    expect(readCachedWebSession(key)).toEqual(session);
    expect(readCachedWebSession('missing')).toBeNull();
  });
});
