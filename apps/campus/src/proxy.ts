import { NextRequest, NextResponse } from 'next/server';
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

const PROXY_TIMING_HEADER = 'x-soenglish-proxy-ms';
const PROXY_HIT_HEADER = 'x-soenglish-proxy-hit';

function redirectTo(pathname: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url));
}

/**
 * Phase 2 tenant routing: classify the Host and forward a tenant hint
 * (`x-school-slug` / `x-school-host`) to the API. The backend stays source of
 * truth (verified `SchoolDomain` + auth membership); this is only a hint.
 * Non-disruptive today (single-school): no redirects/blocks.
 */
function withTenantHint(requestHeaders: Headers, host: string | null): Headers {
  const tenant = classifyTenantHost(host);
  const headers = new Headers(requestHeaders);
  headers.delete('x-school-slug');
  headers.delete('x-school-host');
  if (tenant.kind === 'subdomain') headers.set('x-school-slug', tenant.slug);
  else if (tenant.kind === 'custom') headers.set('x-school-host', tenant.hostname);
  return headers;
}

function anonymousAuthState(route: RequestAuthState['route']): RequestAuthState {
  return {
    route,
    authenticated: false,
    authStrategy: 'anonymous',
    scope: 'school',
    availableScopes: ['school'],
    tenantKey: null,
    impersonation: null,
    trial: null,
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

  // API-proxy routes: only forward the tenant hint to the backend — no session
  // resolution or route gating (those are for rendered app routes).
  if (pathname.startsWith('/api') || pathname.startsWith('/payload-api')) {
    return NextResponse.next({ request: { headers: withTenantHint(request.headers, host) } });
  }

  const route = classifyRouteAccess(request.nextUrl.pathname);
  const skipSession = !shouldResolveWebRequestSession(route, request.headers);

  let state: RequestAuthState = anonymousAuthState(route);

  if (!skipSession) {
    try {
      const session = await fetchWebRequestSession(request.headers, request.url);
      state = {
        route,
        authenticated: session.authenticated,
        authStrategy: session.authStrategy,
        scope: session.scope,
        availableScopes: session.availableScopes,
        tenantKey: session.tenantKey,
        impersonation: session.impersonation,
        trial: session.trial,
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
        maybeLogProxyTiming(request.nextUrl.pathname, startedAt, false);
        return redirectTo(`/login?error=${encodeURIComponent(error.code)}`, request);
      }
      if (!route.isPublic) {
        maybeLogProxyTiming(request.nextUrl.pathname, startedAt, false);
        return redirectTo('/login', request);
      }
    }
  }

  if (!state.authenticated && !route.isPublic) {
    maybeLogProxyTiming(request.nextUrl.pathname, startedAt, skipSession);
    return redirectTo('/login', request);
  }

  if (state.authenticated && route.redirectAuthenticatedTo) {
    maybeLogProxyTiming(request.nextUrl.pathname, startedAt, skipSession);
    return redirectTo(route.redirectAuthenticatedTo, request);
  }

  if (
    state.authenticated &&
    state.user &&
    (!canRoleAccessRoute(route, state.user.role) ||
      !canScopeAccessRoute(route, state.availableScopes))
  ) {
    maybeLogProxyTiming(request.nextUrl.pathname, startedAt, skipSession);
    return redirectTo(route.deniedRedirectTo, request);
  }

  maybeLogProxyTiming(request.nextUrl.pathname, startedAt, skipSession);

  const response = NextResponse.next({
    request: {
      headers: applyRequestAuthHeaders(withTenantHint(request.headers, host), state),
    },
  });

  if (process.env.DEBUG_PROXY_TIMING === '1') {
    const durationMs = Math.round(performance.now() - startedAt);
    response.headers.set(PROXY_TIMING_HEADER, String(durationMs));
    response.headers.set(
      PROXY_HIT_HEADER,
      `${request.nextUrl.pathname}@${startedAt.toFixed(2)}${skipSession ? '' : '+session'}`,
    );
  }

  return response;
}

export const config = {
  // Runs on app routes (full session/route logic) AND on /api + /payload-api
  // (tenant-hint forwarding only, branched at the top of `proxy`). Skips Next
  // internals and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)',
  ],
};
