import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Control Plane session only — Campus `arvilio_at` must not unlock this app. */
const PLATFORM_ACCESS_COOKIE = 'arvilio_pat';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API is proxied to Nest — never gate or rewrite these (login POST must pass).
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const hasAccess = Boolean(req.cookies.get(PLATFORM_ACCESS_COOKIE)?.value);

  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (hasAccess) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
