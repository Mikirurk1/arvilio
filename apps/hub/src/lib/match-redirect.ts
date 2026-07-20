import { SUPPORTED_LOCALES } from '@pkg/types';

export type RedirectMatch = {
  fromPath: string;
  toPath?: string | null;
  toUrl?: string | null;
  statusCode?: '301' | '302' | string | null;
  enabled?: boolean | null;
};

/** Match Hub pathname to a CMS redirect (locale-aware). */
export function matchRedirect<T extends RedirectMatch>(
  pathname: string,
  redirects: T[],
): T | null {
  const exact = redirects.find((r) => r.fromPath === pathname);
  if (exact) return exact;
  const parts = pathname.split('/');
  if (parts.length >= 2 && (SUPPORTED_LOCALES as readonly string[]).includes(parts[1])) {
    const withoutLocale = '/' + parts.slice(2).join('/');
    const normalized = withoutLocale === '/' ? '/' : withoutLocale.replace(/\/$/, '') || '/';
    return redirects.find((r) => r.fromPath === normalized || r.fromPath === withoutLocale) ?? null;
  }
  return null;
}
