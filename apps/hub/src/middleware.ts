import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE } from '@pkg/types';
import { fetchEnabledRedirects, matchRedirect } from './lib/cms';
import { isHubLocale } from './lib/locales';

const PUBLIC_FILE = /\.[^/]+$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  try {
    const redirects = await fetchEnabledRedirects();
    const hit = matchRedirect(pathname, redirects);
    if (hit) {
      const status = hit.statusCode === '302' ? 302 : 301;
      if (hit.toUrl?.trim()) {
        return NextResponse.redirect(hit.toUrl.trim(), status);
      }
      if (hit.toPath?.trim()) {
        const url = request.nextUrl.clone();
        let dest = hit.toPath.trim();
        if (!dest.startsWith('/')) dest = `/${dest}`;
        // Preserve locale prefix when target is locale-less
        const seg = pathname.split('/')[1];
        if (isHubLocale(seg) && !isHubLocale(dest.split('/')[1])) {
          dest = `/${seg}${dest === '/' ? '' : dest}`;
        }
        url.pathname = dest;
        return NextResponse.redirect(url, status);
      }
    }
  } catch {
    // CMS unreachable — skip redirects
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  const segment = pathname.split('/')[1];
  if (!isHubLocale(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
