import { DEFAULT_LOCALE, isLocale, type Locale, SUPPORTED_LOCALES } from '@pkg/types';

export type { Locale };

/** URL / middleware allowlist for hub (Platform SoT). */
export const HUB_ROUTE_LOCALES = SUPPORTED_LOCALES;

export function isHubLocale(value: unknown): value is Locale {
  return isLocale(value);
}

export function resolveHubLocale(raw: string | undefined | null): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export function hreflangAlternates(
  pathWithoutLocale: string,
  locales: readonly string[] = HUB_ROUTE_LOCALES,
): Record<string, string> {
  const path = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`;
  const normalized = path === '/' ? '' : path;
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `/${locale}${normalized}`;
  }
  languages['x-default'] = `/${DEFAULT_LOCALE}${normalized}`;
  return languages;
}
