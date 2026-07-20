/**
 * i18n foundation (G33) — shared UI-locale core.
 *
 * Pure, dependency-free locale model + resolution used by web, API, and (later)
 * apps/hub so the localization layer exists before service screens multiply.
 *
 * ## Extending UI locales
 *
 * `SUPPORTED_LOCALES` is the **single Platform allowlist** (ISO 639-1).
 * To add a locale (e.g. `pl`, `de`):
 * 1. Append the code here and update tests.
 * 2. Mirror in apps/cms Payload `localization.locales` / `site-settings.enabledLocales`
 *    (enabled set ⊆ this allowlist — see docs/arvilio-marketing-site-payload-plan.md).
 * 3. Ship translations before enabling in production.
 *
 * Do **not** add codes without content/QA. v1 **ship set** is `uk` + `en`;
 * the allowlist is the capacity to grow, not a promise that every code is live.
 *
 * ## Not learning languages
 *
 * This module is **UI / marketing locale** only (`User.locale`, URL `/{locale}`).
 * Subjects taught (English, German, …) live in Prisma `Language` /
 * `StudentLearningLanguage` — a separate axis.
 *
 * Resolution order (first supported wins): explicit user preference → school
 * default → `Accept-Language` → platform default (`en`).
 * Campus also prefixes UI routes as `/{locale}/…` (see `stripLocalePrefix`).
 */

/**
 * Platform UI-locale allowlist (ISO 639-1).
 * Extend this array when ready to support another UI language end-to-end.
 */
export const SUPPORTED_LOCALES = ['uk', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Locales we seed and QA in v1 marketing / early product UI (subset of allowlist). */
export const SHIPPED_LOCALES = ['uk', 'en'] as const satisfies readonly Locale[];

/** Platform fallback when nothing else resolves (Campus + CMS default). */
export const DEFAULT_LOCALE: Locale = 'en';

/** Display metadata for UI locale switchers (not learning-language names). */
export type LocaleMeta = {
  code: Locale;
  /** Endonym shown in expanded switcher menus. */
  nativeName: string;
  /** English exonym for search / admin. */
  englishName: string;
  /** Compact trigger label (e.g. sidebar collapsed). */
  shortCode: string;
  dir?: 'ltr' | 'rtl';
};

/**
 * Stable labels for every allowlisted UI locale.
 * Adding a locale to `SUPPORTED_LOCALES` requires a matching entry here —
 * switcher JSX must not branch on `en`/`uk` alone.
 */
export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    shortCode: 'EN',
    dir: 'ltr',
  },
  uk: {
    code: 'uk',
    nativeName: 'Українська',
    englishName: 'Ukrainian',
    shortCode: 'UK',
    dir: 'ltr',
  },
};

export function getLocaleMeta(code: Locale): LocaleMeta {
  return LOCALE_META[code];
}

/** Locales shown in switchers: enabled ∩ allowlist, else shipped set. */
export function resolveSwitcherLocales(
  enabledLocales?: readonly string[] | null,
): Locale[] {
  const fromEnabled = (enabledLocales ?? [])
    .map((c) => normalizeLocale(c))
    .filter((c): c is Locale => c != null);
  const list = fromEnabled.length > 0 ? fromEnabled : [...SHIPPED_LOCALES];
  const unique = [...new Set(list)];
  return unique.length > 0 ? unique : [...SHIPPED_LOCALES];
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** @deprecated Prefer `isLocale` — same allowlist check. */
export const isSupportedLocale = isLocale;

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

/**
 * Marketing / hub fallback when a translation is missing.
 * Chain: requested → `en` (if allowlisted) → `defaultLocale` → first enabled → `DEFAULT_LOCALE`.
 */
export function resolveLocaleFallback(input: {
  requested: string | null | undefined;
  enabledLocales?: readonly string[] | null;
  defaultLocale?: string | null;
}): Locale {
  const enabled = (input.enabledLocales?.length
    ? input.enabledLocales
    : SUPPORTED_LOCALES
  )
    .map((c) => normalizeLocale(c))
    .filter((c): c is Locale => c != null);
  const enabledSet = new Set(enabled.length > 0 ? enabled : [...SUPPORTED_LOCALES]);

  const pick = (code: string | null | undefined): Locale | null => {
    const n = normalizeLocale(code);
    return n && enabledSet.has(n) ? n : null;
  };

  return (
    pick(input.requested) ??
    pick('en') ??
    pick(input.defaultLocale) ??
    enabled[0] ??
    DEFAULT_LOCALE
  );
}

/**
 * Normalize a school's stored `enabledLocales` to the platform allowlist (G33).
 * Drops unknown/duplicate codes; empty input inherits the shipped set so a school
 * that has never configured locales still offers `uk` + `en`.
 */
export function sanitizeEnabledLocales(
  input?: readonly string[] | null,
): Locale[] {
  const normalized = (input ?? [])
    .map((c) => normalizeLocale(c))
    .filter((c): c is Locale => c != null);
  const unique = [...new Set(normalized)];
  return unique.length > 0 ? unique : [...SHIPPED_LOCALES];
}

/**
 * Resolve a school's default locale against its enabled set (G33).
 * Falls back to the first enabled locale, then the platform default, so the
 * returned value is always a locale the school actually offers.
 */
export function resolveSchoolDefaultLocale(
  defaultLocale: string | null | undefined,
  enabledLocales?: readonly string[] | null,
): Locale {
  const enabled = sanitizeEnabledLocales(enabledLocales);
  const wanted = normalizeLocale(defaultLocale);
  if (wanted && enabled.includes(wanted)) return wanted;
  return enabled.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : enabled[0];
}

/**
 * Constrain an already-resolved locale to a school's enabled set (G33).
 * When the locale is not offered, prefer the school default, else the first
 * enabled locale — used after `resolveLocale` so display never lands on a
 * locale the school disabled.
 */
export function clampLocaleToEnabled(
  locale: Locale,
  enabledLocales?: readonly string[] | null,
  defaultLocale?: string | null,
): Locale {
  const enabled = sanitizeEnabledLocales(enabledLocales);
  if (enabled.includes(locale)) return locale;
  return resolveSchoolDefaultLocale(defaultLocale, enabled);
}

/**
 * Cookie remembering last explicit non-default locale choice.
 * Default locale (`en`) is unprefixed in URLs — only `/uk/…` (etc.) appear in the path.
 */
export const LOCALE_COOKIE = 'arvilio_locale';

function normalizeLocalePathname(pathname: string): string {
  if (!pathname) return '/';
  if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

/**
 * Split `/{locale}/rest` → locale + rest. Unknown first segments leave path unchanged
 * (bare paths imply the default locale at the routing layer).
 */
export function stripLocalePrefix(pathname: string): { locale: Locale | null; pathname: string } {
  const raw = pathname || '/';
  const parts = raw.split('/');
  const maybe = parts[1];
  if (!isLocale(maybe)) {
    return { locale: null, pathname: normalizeLocalePathname(raw) };
  }
  const restJoined = parts.slice(2).join('/');
  const rest = restJoined ? `/${restJoined}` : '/';
  return { locale: maybe, pathname: normalizeLocalePathname(rest) };
}

/**
 * Prefix a path with `/{locale}` for non-default locales.
 * Default locale (`en`) stays unprefixed: `/dashboard`, not `/en/dashboard`.
 */
export function withLocalePrefix(pathname: string, locale: Locale): string {
  const { pathname: stripped } = stripLocalePrefix(pathname || '/');
  if (locale === DEFAULT_LOCALE) {
    return stripped === '/' ? '/' : stripped;
  }
  if (stripped === '/') return `/${locale}`;
  return `/${locale}${stripped}`;
}

/** Swap or inject locale segment for the current URL pathname. */
export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  return withLocalePrefix(stripLocalePrefix(pathname).pathname, locale);
}
