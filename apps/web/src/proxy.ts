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

const PROXY_TIMING_HEADER = 'x-soenglish-proxy-ms';
const PROXY_HIT_HEADER = 'x-soenglish-proxy-hit';

function redirectTo(pathname: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function anonymousAuthState(route: RequestAuthState['route']): RequestAuthState {
  return {
    route,
    authenticated: false,
    authStrategy: 'anonymous',
    scope: 'school',
    availableScopes: ['school'],
    tenantKey: null,
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
      headers: applyRequestAuthHeaders(request.headers, state),
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
  matcher: ['/((?!api|payload-api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
