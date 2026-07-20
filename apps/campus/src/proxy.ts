import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  normalizeLocale,
  stripLocalePrefix,
  withLocalePrefix,
  type Locale,
} from '@pkg/types';
import {
  applyRequestAuthHeaders,
  classifyRouteAccess,
  fetchWebRequestSession,
  shouldResolveWebRequestSession,
  WebSessionError,
  type RequestAuthState,
} from './lib/auth/request-session';
import {
  canRoleAccessRoute,
  canScopeAccessRoute,
} from './lib/auth/route-policy';
import { classifyTenantHost } from './lib/tenant-host';

const PROXY_TIMING_HEADER = 'x-arvilio-proxy-ms';
const PROXY_HIT_HEADER = 'x-arvilio-proxy-hit';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function withTenantHint(requestHeaders: Headers, host: string | null): Headers {
  const tenant = classifyTenantHost(host);
  const headers = new Headers(requestHeaders);
  headers.delete('x-school-slug');
  headers.delete('x-school-host');
  if (tenant.kind === 'subdomain') headers.set('x-school-slug', tenant.slug);
  else if (tenant.kind === 'custom') headers.set('x-school-host', tenant.hostname);
  return headers;
}

function readLocaleCookie(request: NextRequest): Locale | null {
  return normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
}

function setLocaleCookie(response: NextResponse, locale: Locale): void {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
}

function localizedRedirect(
  path: string,
  locale: Locale,
  request: NextRequest,
  search?: string,
): NextResponse {
  const dest = new URL(withLocalePrefix(path, locale), request.url);
  dest.search = search ?? request.nextUrl.search;
  const res = NextResponse.redirect(dest);
  setLocaleCookie(res, locale);
  return res;
}

function anonymousAuthState(
  route: RequestAuthState['route'],
  locale: Locale,
): RequestAuthState {
  return {
    route,
    authenticated: false,
    authStrategy: 'anonymous',
    scope: 'school',
    availableScopes: ['school'],
    tenantKey: null,
    impersonation: null,
    trial: null,
    locale,
    user: null,
  };
}

function maybeLogProxyTiming(
  pathname: string,
  startedAt: number,
  skippedSession: boolean,
): void {
  if (process.env.DEBUG_PROXY_TIMING !== '1') return;
  const durationMs = Math.round(performance.now() - startedAt);
  console.info(
    `[proxy] ${pathname} ${skippedSession ? 'skip-session' : 'web-session'} ${durationMs}ms`,
  );
}

export async function proxy(request: NextRequest) {
  const startedAt = performance.now();
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/cms-proxy') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next({ request: { headers: withTenantHint(request.headers, host) } });
  }

  const { locale: pathLocale, pathname: strippedPath } = stripLocalePrefix(pathname);

  // `/en/…` is not canonical — default locale is unprefixed.
  if (pathLocale === DEFAULT_LOCALE) {
    return localizedRedirect(strippedPath === '/' ? '/' : strippedPath, DEFAULT_LOCALE, request);
  }

  let locale: Locale;
  let appPath: string;
  let needsRewrite: boolean;

  const localeCookie = readLocaleCookie(request);

  if (!pathLocale) {
    const preferred = localeCookie ?? DEFAULT_LOCALE;
    // Cookie says uk but URL is bare → send to /uk/…
    if (preferred !== DEFAULT_LOCALE) {
      return localizedRedirect(strippedPath === '/' ? '/' : strippedPath, preferred, request);
    }
    locale = DEFAULT_LOCALE;
    appPath = strippedPath;
    needsRewrite = false;
  } else {
    locale = isLocale(pathLocale) ? pathLocale : DEFAULT_LOCALE;
    appPath = strippedPath;
    needsRewrite = true;
  }

  const route = classifyRouteAccess(appPath);
  const skipSession = !shouldResolveWebRequestSession(route, request.headers);

  let state: RequestAuthState = anonymousAuthState(route, locale);

  if (!skipSession) {
    try {
      const session = await fetchWebRequestSession(request.headers, request.url);
      // Bare URL + no explicit cookie: honor the user's/school's explicit locale
      // preference (User.locale → School.defaultLocale, clamped to enabledLocales).
      // Accept-Language is intentionally excluded so browser language never rewrites
      // a typed canonical URL.
      if (!pathLocale && !localeCookie && session.authenticated) {
        const preferredLocale = normalizeLocale(session.preferredLocale);
        if (preferredLocale && preferredLocale !== DEFAULT_LOCALE) {
          maybeLogProxyTiming(appPath, startedAt, false);
          return localizedRedirect(
            strippedPath === '/' ? '/' : strippedPath,
            preferredLocale,
            request,
          );
        }
      }
      state = {
        route,
        authenticated: session.authenticated,
        authStrategy: session.authStrategy,
        scope: session.scope,
        availableScopes: session.availableScopes,
        tenantKey: session.tenantKey,
        impersonation: session.impersonation,
        trial: session.trial,
        // URL (or bare=default) wins over session preference for display.
        locale,
        user: session.user,
      };
    } catch (error) {
      if (
        error instanceof WebSessionError &&
        error.status === 403 &&
        typeof error.code === 'string' &&
        error.code.startsWith('account_') &&
        !route.isPublic
      ) {
        maybeLogProxyTiming(appPath, startedAt, false);
        return localizedRedirect(
          '/login',
          locale,
          request,
          `?error=${encodeURIComponent(error.code)}`,
        );
      }
      if (!route.isPublic) {
        maybeLogProxyTiming(appPath, startedAt, false);
        return localizedRedirect('/login', locale, request);
      }
    }
  }

  if (!state.authenticated && !route.isPublic) {
    maybeLogProxyTiming(appPath, startedAt, skipSession);
    return localizedRedirect('/login', locale, request);
  }

  if (state.authenticated && route.redirectAuthenticatedTo) {
    maybeLogProxyTiming(appPath, startedAt, skipSession);
    return localizedRedirect(route.redirectAuthenticatedTo, locale, request);
  }

  if (
    state.authenticated &&
    state.user &&
    (!canRoleAccessRoute(route, state.user.role) ||
      !canScopeAccessRoute(route, state.availableScopes))
  ) {
    maybeLogProxyTiming(appPath, startedAt, skipSession);
    return localizedRedirect(route.deniedRedirectTo, locale, request);
  }

  // No root page — `/` and `/uk` → login or dashboard.
  if (appPath === '/') {
    maybeLogProxyTiming(appPath, startedAt, skipSession);
    return localizedRedirect(state.authenticated ? '/dashboard' : '/login', locale, request);
  }

  maybeLogProxyTiming(appPath, startedAt, skipSession);

  const requestHeaders = applyRequestAuthHeaders(withTenantHint(request.headers, host), state);

  const response = needsRewrite
    ? (() => {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = appPath;
        return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
      })()
    : NextResponse.next({ request: { headers: requestHeaders } });

  setLocaleCookie(response, locale);

  if (process.env.DEBUG_PROXY_TIMING === '1') {
    const durationMs = Math.round(performance.now() - startedAt);
    response.headers.set(PROXY_TIMING_HEADER, String(durationMs));
    response.headers.set(
      PROXY_HIT_HEADER,
      `${pathname}->${appPath}@${startedAt.toFixed(2)}${skipSession ? '' : '+session'}`,
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)',
  ],
};
