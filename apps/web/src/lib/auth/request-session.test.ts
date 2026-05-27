import { mockAuthUser } from '../../testing/fixtures';
import {
  applyRequestAuthHeaders,
  ACCESS_COOKIE,
  classifyRouteAccess,
  fetchWebRequestSession,
  readRequestAuthState,
  shouldResolveWebRequestSession,
  WebSessionError,
} from './request-session';
import { clearWebSessionCache } from './proxy-session-cache';
import { canRoleAccessPathname } from './route-policy';

describe('request-session', () => {
  beforeEach(() => {
    clearWebSessionCache();
  });

  it('classifies auth pages as public shell-less routes', () => {
    expect(classifyRouteAccess('/login')).toEqual({
      surface: 'public',
      shell: 'auth',
      isPublic: true,
      redirectAuthenticatedTo: '/dashboard',
      requiredScope: null,
      allowedRoles: null,
      deniedRedirectTo: '/dashboard',
    });
  });

  it('keeps password recovery pages public without forced redirect', () => {
    expect(classifyRouteAccess('/forgot-password')).toEqual({
      surface: 'public',
      shell: 'auth',
      isPublic: true,
      redirectAuthenticatedTo: null,
      requiredScope: null,
      allowedRoles: null,
      deniedRedirectTo: '/dashboard',
    });
  });

  it('classifies app routes as protected school surfaces by default', () => {
    expect(classifyRouteAccess('/dashboard')).toEqual({
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: null,
      deniedRedirectTo: '/dashboard',
    });
  });

  it('classifies scoped staff routes for middleware checks', () => {
    expect(classifyRouteAccess('/students/abc')).toEqual({
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['teacher', 'admin', 'super_admin'],
      deniedRedirectTo: '/dashboard',
    });
    expect(classifyRouteAccess('/payment')).toEqual({
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['student'],
      deniedRedirectTo: '/dashboard',
    });
  });

  it('shares the same route-policy with sidebar visibility rules', () => {
    expect(canRoleAccessPathname('/students', 'teacher')).toBe(true);
    expect(canRoleAccessPathname('/students', 'student')).toBe(false);
    expect(canRoleAccessPathname('/payment', 'student')).toBe(true);
    expect(canRoleAccessPathname('/payment', 'admin')).toBe(false);
    expect(canRoleAccessPathname('/system', 'super_admin')).toBe(true);
  });

  it('round-trips request auth headers for layouts', () => {
    const user = mockAuthUser({ id: 'u1', email: 'student@test.local' });
    const headers = applyRequestAuthHeaders(new Headers(), {
      route: classifyRouteAccess('/dashboard'),
      authenticated: true,
      authStrategy: 'refresh',
      scope: 'school',
      availableScopes: ['school'],
      tenantKey: null,
      user,
    });

    expect(readRequestAuthState(headers)).toEqual({
      route: {
        surface: 'school-app',
        shell: 'app',
        isPublic: false,
        redirectAuthenticatedTo: null,
        requiredScope: 'school',
        allowedRoles: null,
        deniedRedirectTo: '/dashboard',
      },
      authenticated: true,
      authStrategy: 'refresh',
      scope: 'school',
      availableScopes: ['school'],
      tenantKey: null,
      user,
    });
  });

  it('defaults public routes to auth shell when shell header is absent', () => {
    const headers = new Headers();
    headers.set('x-soenglish-route-surface', 'public');

    expect(readRequestAuthState(headers).route.shell).toBe('auth');
  });

  it('skips web-session on anonymous public routes', () => {
    const loginRoute = classifyRouteAccess('/login');
    const forgotRoute = classifyRouteAccess('/forgot-password');

    expect(shouldResolveWebRequestSession(loginRoute, new Headers())).toBe(false);
    expect(shouldResolveWebRequestSession(forgotRoute, new Headers())).toBe(false);
  });

  it('resolves web-session for protected routes and authenticated public redirects', () => {
    const headers = new Headers({
      cookie: `${ACCESS_COOKIE}=token`,
    });

    expect(shouldResolveWebRequestSession(classifyRouteAccess('/dashboard'), headers)).toBe(
      true,
    );
    expect(shouldResolveWebRequestSession(classifyRouteAccess('/login'), headers)).toBe(true);
    expect(
      shouldResolveWebRequestSession(classifyRouteAccess('/forgot-password'), headers),
    ).toBe(false);
  });

  it('reuses cached web-session for repeated cookie keys', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        authenticated: true,
        user: mockAuthUser(),
        authStrategy: 'access',
        scope: 'school',
        availableScopes: ['school'],
        tenantKey: null,
      }),
    } satisfies Partial<Response>);
    globalThis.fetch = fetchMock as typeof fetch;

    const headers = new Headers({ cookie: `${ACCESS_COOKIE}=cached-token` });
    await fetchWebRequestSession(headers);
    await fetchWebRequestSession(headers);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'fetch');
    }
  });

  it('uses same-origin web-session URL when request URL is provided', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        authenticated: false,
        user: null,
        authStrategy: 'anonymous',
        scope: 'school',
        availableScopes: ['school'],
        tenantKey: null,
      }),
    } satisfies Partial<Response>);
    globalThis.fetch = fetchMock as typeof fetch;

    await fetchWebRequestSession(new Headers(), 'http://localhost:4200/dashboard');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4200/api/auth/web-session',
      expect.objectContaining({ cache: 'no-store' }),
    );

    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'fetch');
    }
  });

  it('preserves backend account-status denial codes from web-session fetch', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ code: 'account_blocked', message: 'Blocked account' }),
    } satisfies Partial<Response>) as typeof fetch;

    await expect(fetchWebRequestSession(new Headers())).rejects.toMatchObject({
      status: 403,
      code: 'account_blocked',
      message: 'Blocked account',
    } satisfies Partial<WebSessionError>);

    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis as Record<string, unknown>, 'fetch');
    }
  });
});
