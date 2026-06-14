import type { AuthUserDto, WebRequestSessionDto } from '@pkg/types';

export type AuthRoleKey = AuthUserDto['role'];
export type RouteSurface = 'public' | 'school-app' | 'platform-app';
export type ShellVariant = 'auth' | 'app';

export type RouteAccessDescriptor = {
  surface: RouteSurface;
  shell: ShellVariant;
  isPublic: boolean;
  redirectAuthenticatedTo: string | null;
  requiredScope: WebRequestSessionDto['scope'] | null;
  allowedRoles: AuthRoleKey[] | null;
  deniedRedirectTo: string;
};

type RouteRule = {
  match: (pathname: string) => boolean;
  route: RouteAccessDescriptor;
};

const PUBLIC_ROUTES = new Set(['/login', '/forgot-password', '/reset-password']);
const CMS_ROUTE_PREFIX = '/cms-admin';
const AUTH_REDIRECT_ROUTES = new Set(['/login']);

const ROUTE_RULES: RouteRule[] = [
  {
    match: (pathname) => matchesPath(pathname, CMS_ROUTE_PREFIX),
    route: {
      surface: 'public',
      shell: 'auth',
      isPublic: true,
      redirectAuthenticatedTo: null,
      requiredScope: null,
      allowedRoles: null,
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => PUBLIC_ROUTES.has(pathname),
    route: {
      surface: 'public',
      shell: 'auth',
      isPublic: true,
      redirectAuthenticatedTo: '/dashboard',
      requiredScope: null,
      allowedRoles: null,
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/platform'),
    route: {
      surface: 'platform-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'platform',
      allowedRoles: ['super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/system'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/finance'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['admin', 'super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/staff'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['admin', 'super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/admin'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['admin', 'super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/materials/view'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: null,
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/materials'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['teacher', 'admin', 'super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/students'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['teacher', 'admin', 'super_admin'],
      deniedRedirectTo: '/dashboard',
    },
  },
  {
    match: (pathname) => matchesPath(pathname, '/payment'),
    route: {
      surface: 'school-app',
      shell: 'app',
      isPublic: false,
      redirectAuthenticatedTo: null,
      requiredScope: 'school',
      allowedRoles: ['student'],
      deniedRedirectTo: '/dashboard',
    },
  },
];

export function classifyRouteAccess(pathname: string): RouteAccessDescriptor {
  const normalized = normalizePathname(pathname);
  const matched = ROUTE_RULES.find((rule) => rule.match(normalized));
  if (matched) {
    if (matched.route.isPublic && matched.route.redirectAuthenticatedTo === '/dashboard') {
      return {
        ...matched.route,
        redirectAuthenticatedTo: AUTH_REDIRECT_ROUTES.has(normalized) ? '/dashboard' : null,
      };
    }
    return matched.route;
  }

  return {
    surface: 'school-app',
    shell: 'app',
    isPublic: false,
    redirectAuthenticatedTo: null,
    requiredScope: 'school',
    allowedRoles: null,
    deniedRedirectTo: '/dashboard',
  };
}

export function canRoleAccessPathname(pathname: string, role: AuthRoleKey): boolean {
  const route = classifyRouteAccess(pathname);
  return canRoleAccessRoute(route, role);
}

export function canRoleAccessRoute(route: RouteAccessDescriptor, role: AuthRoleKey): boolean {
  if (!route.allowedRoles) return true;
  return route.allowedRoles.includes(role);
}

export function canScopeAccessRoute(
  route: RouteAccessDescriptor,
  availableScopes: WebRequestSessionDto['availableScopes'],
): boolean {
  if (!route.requiredScope) return true;
  return availableScopes.includes(route.requiredScope);
}

function matchesPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
