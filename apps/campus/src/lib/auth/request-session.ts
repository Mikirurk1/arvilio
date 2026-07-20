import { DEFAULT_LOCALE, type AuthUserDto, type WebRequestSessionDto } from '@pkg/types';
import {
  buildWebSessionCacheKey,
  readCachedWebSession,
  writeCachedWebSession,
} from './proxy-session-cache';
import {
  classifyRouteAccess,
  type RouteAccessDescriptor,
  type RouteSurface,
  type ShellVariant,
} from './route-policy';

export { classifyRouteAccess };

/** Must match backend `ACCESS_COOKIE` / `REFRESH_COOKIE`. */
export const ACCESS_COOKIE = 'arvilio_at';
export const REFRESH_COOKIE = 'arvilio_rt';

const API_BASE_URL = (process.env.API_URL ?? 'http://127.0.0.1:3000/api').replace(/\/$/, '');

export class WebSessionError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string | null = null,
  ) {
    super(message);
  }
}

export const REQUEST_AUTH_HEADERS = {
  routeSurface: 'x-arvilio-route-surface',
  shellVariant: 'x-arvilio-shell-variant',
  authenticated: 'x-arvilio-authenticated',
  authStrategy: 'x-arvilio-auth-strategy',
  authUser: 'x-arvilio-auth-user',
  authScope: 'x-arvilio-auth-scope',
  availableScopes: 'x-arvilio-available-scopes',
  tenantKey: 'x-arvilio-tenant-key',
  impersonation: 'x-arvilio-impersonation',
  trial: 'x-arvilio-trial',
  locale: 'x-arvilio-locale',
} as const;

export type RequestAuthState = {
  route: RouteAccessDescriptor;
  authenticated: boolean;
  authStrategy: WebRequestSessionDto['authStrategy'];
  scope: WebRequestSessionDto['scope'];
  availableScopes: WebRequestSessionDto['availableScopes'];
  tenantKey: string | null;
  impersonation: WebRequestSessionDto['impersonation'];
  trial: WebRequestSessionDto['trial'];
  /** Resolved UI locale (URL → user → school → Accept-Language → en). */
  locale: string;
  user: AuthUserDto | null;
};

export function hasAuthCookies(requestHeaders: Headers): boolean {
  const cookieHeader = requestHeaders.get('cookie');
  if (!cookieHeader) return false;
  return (
    cookieHeader.includes(`${ACCESS_COOKIE}=`) || cookieHeader.includes(`${REFRESH_COOKIE}=`)
  );
}

/** When false, proxy can skip the web-session HTTP roundtrip. */
export function shouldResolveWebRequestSession(
  route: RouteAccessDescriptor,
  requestHeaders: Headers,
): boolean {
  if (!route.isPublic) return true;
  if (!hasAuthCookies(requestHeaders)) return false;
  if (!route.redirectAuthenticatedTo) return false;
  return true;
}

function resolveWebSessionUrl(requestUrl?: string): string {
  if (requestUrl) {
    return new URL('/api/auth/web-session', requestUrl).toString();
  }
  return `${API_BASE_URL}/auth/web-session`;
}

export async function fetchWebRequestSession(
  requestHeaders: Headers,
  requestUrl?: string,
): Promise<WebRequestSessionDto> {
  const cacheKey = buildWebSessionCacheKey(requestHeaders.get('cookie'));
  if (cacheKey) {
    const cached = readCachedWebSession(cacheKey);
    if (cached) return cached;
  }

  const session = await fetchWebRequestSessionUncached(requestHeaders, requestUrl);
  if (cacheKey) writeCachedWebSession(cacheKey, session);
  return session;
}

async function fetchWebRequestSessionUncached(
  requestHeaders: Headers,
  requestUrl?: string,
): Promise<WebRequestSessionDto> {
  const forwardedHeaders = new Headers();
  const cookie = requestHeaders.get('cookie');
  const userAgent = requestHeaders.get('user-agent');
  const forwardedFor = requestHeaders.get('x-forwarded-for');

  if (cookie) forwardedHeaders.set('cookie', cookie);
  if (userAgent) forwardedHeaders.set('user-agent', userAgent);
  if (forwardedFor) forwardedHeaders.set('x-forwarded-for', forwardedFor);
  // Forward E2E throttle-bypass header so the proxy's own API call isn't rate-limited.
  const skipThrottle = requestHeaders.get('x-e2e-skip-throttle');
  if (skipThrottle) forwardedHeaders.set('x-e2e-skip-throttle', skipThrottle);

  const response = await fetch(resolveWebSessionUrl(requestUrl), {
    method: 'GET',
    headers: forwardedHeaders,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw await readWebSessionError(response);
  }
  return (await response.json()) as WebRequestSessionDto;
}

export function applyRequestAuthHeaders(
  targetHeaders: Headers,
  state: RequestAuthState,
): Headers {
  const headers = new Headers(targetHeaders);
  headers.set(REQUEST_AUTH_HEADERS.routeSurface, state.route.surface);
  headers.set(REQUEST_AUTH_HEADERS.shellVariant, state.route.shell);
  headers.set(REQUEST_AUTH_HEADERS.authenticated, state.authenticated ? '1' : '0');
  headers.set(REQUEST_AUTH_HEADERS.authStrategy, state.authStrategy);
  headers.set(REQUEST_AUTH_HEADERS.authScope, state.scope);
  headers.set(REQUEST_AUTH_HEADERS.availableScopes, state.availableScopes.join(','));
  headers.set(REQUEST_AUTH_HEADERS.tenantKey, state.tenantKey ?? '');
  if (state.impersonation) {
    headers.set(
      REQUEST_AUTH_HEADERS.impersonation,
      `${state.impersonation.actorUserId}:${state.impersonation.schoolId}`,
    );
  } else {
    headers.delete(REQUEST_AUTH_HEADERS.impersonation);
  }
  if (state.trial) {
    headers.set(REQUEST_AUTH_HEADERS.trial, `${state.trial.trialEndsAt}|${state.trial.daysLeft}`);
  } else {
    headers.delete(REQUEST_AUTH_HEADERS.trial);
  }
  headers.set(REQUEST_AUTH_HEADERS.locale, state.locale || DEFAULT_LOCALE);
  if (state.user) {
    headers.set(REQUEST_AUTH_HEADERS.authUser, encodeUserHeader(state.user));
  } else {
    headers.delete(REQUEST_AUTH_HEADERS.authUser);
  }
  return headers;
}

export function readRequestAuthState(headers: Headers): RequestAuthState {
  const routeSurface = headers.get(REQUEST_AUTH_HEADERS.routeSurface);
  const shellVariant = headers.get(REQUEST_AUTH_HEADERS.shellVariant);
  const user = decodeUserHeader(headers.get(REQUEST_AUTH_HEADERS.authUser));
  const authenticated = headers.get(REQUEST_AUTH_HEADERS.authenticated) === '1';
  const authStrategy = normalizeAuthStrategy(headers.get(REQUEST_AUTH_HEADERS.authStrategy));
  const scope = normalizeScope(headers.get(REQUEST_AUTH_HEADERS.authScope));
  const availableScopes = normalizeAvailableScopes(headers.get(REQUEST_AUTH_HEADERS.availableScopes));
  const surface = normalizeRouteSurface(routeSurface);
  const route = {
    surface,
    shell: normalizeShellVariant(shellVariant, surface),
    isPublic: surface === 'public',
    redirectAuthenticatedTo: null,
    requiredScope: surface === 'public' ? null : surface === 'platform-app' ? 'platform' : 'school',
    allowedRoles: null,
    deniedRedirectTo: '/dashboard',
  } satisfies RouteAccessDescriptor;

  return {
    route,
    authenticated,
    authStrategy,
    scope,
    availableScopes,
    tenantKey: headers.get(REQUEST_AUTH_HEADERS.tenantKey) || null,
    impersonation: parseImpersonationHeader(headers.get(REQUEST_AUTH_HEADERS.impersonation)),
    trial: parseTrialHeader(headers.get(REQUEST_AUTH_HEADERS.trial)),
    locale: headers.get(REQUEST_AUTH_HEADERS.locale) || DEFAULT_LOCALE,
    user,
  };
}

function parseImpersonationHeader(value: string | null): RequestAuthState['impersonation'] {
  if (!value) return null;
  const sep = value.indexOf(':');
  if (sep <= 0 || sep === value.length - 1) return null;
  return { actorUserId: value.slice(0, sep), schoolId: value.slice(sep + 1) };
}

function parseTrialHeader(value: string | null): RequestAuthState['trial'] {
  if (!value) return null;
  const sep = value.lastIndexOf('|');
  if (sep <= 0) return null;
  const trialEndsAt = value.slice(0, sep);
  const daysLeft = Number(value.slice(sep + 1));
  if (!Number.isFinite(daysLeft)) return null;
  return { trialEndsAt, daysLeft };
}

export function serializeAuthBootstrap(user: AuthUserDto | null): string {
  return JSON.stringify({ user }).replace(/</g, '\\u003c');
}

function encodeUserHeader(user: AuthUserDto): string {
  return encodeURIComponent(JSON.stringify(user));
}

function decodeUserHeader(value: string | null): AuthUserDto | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as AuthUserDto;
  } catch {
    return null;
  }
}

function normalizeShellVariant(value: string | null, surface: RouteSurface): ShellVariant {
  if (value === 'auth' || value === 'app') return value;
  return surface === 'public' ? 'auth' : 'app';
}

function normalizeRouteSurface(value: string | null): RouteSurface {
  if (value === 'public' || value === 'platform-app') return value;
  return 'school-app';
}

function normalizeAuthStrategy(value: string | null): WebRequestSessionDto['authStrategy'] {
  if (value === 'access' || value === 'refresh') return value;
  return 'anonymous';
}

function normalizeScope(value: string | null): WebRequestSessionDto['scope'] {
  return value === 'platform' ? 'platform' : 'school';
}

function normalizeAvailableScopes(value: string | null): WebRequestSessionDto['availableScopes'] {
  const scopes = value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter((entry): entry is WebRequestSessionDto['scope'] => entry === 'school' || entry === 'platform');
  return scopes && scopes.length > 0 ? scopes : ['school'];
}

async function readWebSessionError(response: Response): Promise<WebSessionError> {
  let message = `Failed to resolve web session (${response.status})`;
  let code: string | null = null;
  try {
    const text = await response.text();
    if (text) {
      try {
        const parsed = JSON.parse(text) as {
          message?: string | string[];
          code?: string;
        };
        if (parsed?.message) {
          message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
        } else {
          message = text;
        }
        code = typeof parsed?.code === 'string' ? parsed.code : null;
      } catch {
        message = text;
      }
    }
  } catch {
    // ignore parse errors
  }
  return new WebSessionError(response.status, message, code);
}
