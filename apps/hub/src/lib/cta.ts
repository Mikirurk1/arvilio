import type { Locale } from '@pkg/types';

export type CtaBaseEnv = 'campus' | 'connect' | 'custom';

export function resolveProductCtaUrl(input: {
  ctaBaseEnv: CtaBaseEnv | string | null | undefined;
  ctaPath?: string | null;
  ctaCustomBase?: string | null;
  locale?: Locale | string | null;
  utm?: Record<string, string>;
}): string | null {
  const baseEnv = input.ctaBaseEnv ?? 'campus';
  let base = '';
  if (baseEnv === 'campus') {
    base = (process.env.NEXT_PUBLIC_CAMPUS_URL ?? 'http://localhost:4200').replace(/\/$/, '');
  } else if (baseEnv === 'connect') {
    base = (process.env.NEXT_PUBLIC_CONNECT_URL ?? '').replace(/\/$/, '');
    if (!base) return null;
  } else if (baseEnv === 'custom') {
    base = (input.ctaCustomBase ?? '').replace(/\/$/, '');
    if (!base) return null;
  } else {
    return null;
  }

  const rawPath = input.ctaPath?.trim() || '/';
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const url = new URL(base);
  if (path !== '/') {
    url.pathname = path;
  }
  if (input.locale) {
    url.searchParams.set('lang', String(input.locale));
  }
  if (input.utm) {
    for (const [key, value] of Object.entries(input.utm)) {
      url.searchParams.set(key, value);
    }
  }
  // Prefer UTM defaults for marketing attribution
  if (!url.searchParams.has('utm_source')) {
    url.searchParams.set('utm_source', 'arvilio_hub');
  }
  if (!url.searchParams.has('utm_medium')) {
    url.searchParams.set('utm_medium', 'product_cta');
  }
  return url.toString();
}
