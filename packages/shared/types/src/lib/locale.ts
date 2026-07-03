/**
 * i18n foundation (G33) — shared locale core.
 *
 * Pure, dependency-free locale model + resolution used by both web and backend
 * so the localization layer exists before service screens multiply (cheap now,
 * expensive to retrofit). String catalogs/UI wiring adopt this incrementally.
 *
 * Resolution order (first supported wins): explicit user preference → school
 * default → `Accept-Language` → platform default.
 */

/** Locales the platform supports today (Ukraine-first). */
export const SUPPORTED_LOCALES = ['uk', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Platform fallback when nothing else resolves. */
export const DEFAULT_LOCALE: Locale = 'uk';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Normalize a raw locale-ish string (`uk-UA`, `EN`) to a supported `Locale` or null. */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return isLocale(base) ? base : null;
}

/**
 * Parse an `Accept-Language` header into supported locales, ordered by q-weight.
 * Unsupported entries are dropped; duplicates collapsed.
 */
export function parseAcceptLanguage(header: string | null | undefined): Locale[] {
  if (!header) return [];
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.split('=')[1]) : 1;
      return { locale: normalizeLocale(tag), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((e): e is { locale: Locale; q: number } => e.locale !== null)
    .sort((a, b) => b.q - a.q);

  const seen = new Set<Locale>();
  const out: Locale[] = [];
  for (const { locale } of ranked) {
    if (!seen.has(locale)) {
      seen.add(locale);
      out.push(locale);
    }
  }
  return out;
}

/**
 * Resolve the active locale from prioritized candidates (each may be a raw
 * locale string, an `Accept-Language` header, or null). Returns the first
 * supported match, else `DEFAULT_LOCALE`.
 */
export function resolveLocale(input: {
  userPreference?: string | null;
  schoolDefault?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  return (
    normalizeLocale(input.userPreference) ??
    normalizeLocale(input.schoolDefault) ??
    parseAcceptLanguage(input.acceptLanguage)[0] ??
    DEFAULT_LOCALE
  );
}
