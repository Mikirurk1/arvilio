import {
  DEFAULT_LOCALE,
  SHIPPED_LOCALES,
  SUPPORTED_LOCALES,
  clampLocaleToEnabled,
  getLocaleMeta,
  isLocale,
  isSupportedLocale,
  normalizeLocale,
  parseAcceptLanguage,
  replaceLocaleInPath,
  resolveLocale,
  resolveLocaleFallback,
  resolveSchoolDefaultLocale,
  resolveSwitcherLocales,
  sanitizeEnabledLocales,
  stripLocalePrefix,
  withLocalePrefix,
} from './locale';

describe('locale core', () => {
  it('exposes an extensible allowlist with v1 ship set', () => {
    expect([...SUPPORTED_LOCALES]).toEqual(['uk', 'en']);
    expect([...SHIPPED_LOCALES]).toEqual(['uk', 'en']);
    expect(SHIPPED_LOCALES.every((c) => isLocale(c))).toBe(true);
  });

  it('defaults to English', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('isLocale validates supported locales only', () => {
    expect(isLocale('uk')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isSupportedLocale('en')).toBe(true);
  });

  it('normalizeLocale strips region/case', () => {
    expect(normalizeLocale('uk-UA')).toBe('uk');
    expect(normalizeLocale('EN')).toBe('en');
    expect(normalizeLocale('en_US')).toBe('en');
    expect(normalizeLocale('de')).toBeNull();
    expect(normalizeLocale('')).toBeNull();
  });

  it('parseAcceptLanguage orders by q-weight and drops unsupported', () => {
    expect(parseAcceptLanguage('en;q=0.8, uk;q=0.9, de')).toEqual(['uk', 'en']);
    expect(parseAcceptLanguage('fr, de')).toEqual([]);
    expect(parseAcceptLanguage('uk, uk-UA')).toEqual(['uk']);
    expect(parseAcceptLanguage(null)).toEqual([]);
  });

  it('resolveLocale follows user → school → accept-language → default', () => {
    expect(resolveLocale({ userPreference: 'en', schoolDefault: 'uk' })).toBe('en');
    expect(resolveLocale({ userPreference: 'de', schoolDefault: 'en' })).toBe('en');
    expect(resolveLocale({ schoolDefault: null, acceptLanguage: 'uk;q=1, en;q=0.5' })).toBe('uk');
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE);
    expect(resolveLocale({ userPreference: 'fr', acceptLanguage: 'fr' })).toBe(DEFAULT_LOCALE);
  });

  it('resolveLocaleFallback uses requested → en → default → first enabled', () => {
    expect(resolveLocaleFallback({ requested: 'en' })).toBe('en');
    expect(resolveLocaleFallback({ requested: 'de', defaultLocale: 'uk' })).toBe('en');
    expect(
      resolveLocaleFallback({
        requested: 'de',
        enabledLocales: ['uk'],
        defaultLocale: 'uk',
      }),
    ).toBe('uk');
    expect(
      resolveLocaleFallback({
        requested: null,
        enabledLocales: ['en', 'uk'],
        defaultLocale: 'uk',
      }),
    ).toBe('en');
  });

  it('stripLocalePrefix / withLocalePrefix — default locale unprefixed', () => {
    expect(stripLocalePrefix('/uk/login')).toEqual({ locale: 'uk', pathname: '/login' });
    expect(stripLocalePrefix('/en')).toEqual({ locale: 'en', pathname: '/' });
    expect(stripLocalePrefix('/dashboard')).toEqual({ locale: null, pathname: '/dashboard' });
    expect(withLocalePrefix('/dashboard', 'uk')).toBe('/uk/dashboard');
    expect(withLocalePrefix('/uk/dashboard', 'en')).toBe('/dashboard');
    expect(withLocalePrefix('/login', 'en')).toBe('/login');
    expect(replaceLocaleInPath('/uk/practice/quiz', 'en')).toBe('/practice/quiz');
    expect(replaceLocaleInPath('/practice/quiz', 'uk')).toBe('/uk/practice/quiz');
  });

  it('getLocaleMeta / resolveSwitcherLocales support scalable switchers', () => {
    expect(getLocaleMeta('uk').nativeName).toBe('Українська');
    expect(getLocaleMeta('en').shortCode).toBe('EN');
    expect(resolveSwitcherLocales(null)).toEqual(['uk', 'en']);
    expect(resolveSwitcherLocales(['en', 'uk', 'de'])).toEqual(['en', 'uk']);
  });

  it('sanitizeEnabledLocales keeps allowlist ∩ input, else shipped set', () => {
    expect(sanitizeEnabledLocales(['uk', 'de', 'uk'])).toEqual(['uk']);
    expect(sanitizeEnabledLocales(['EN', 'uk-UA'])).toEqual(['en', 'uk']);
    expect(sanitizeEnabledLocales([])).toEqual([...SHIPPED_LOCALES]);
    expect(sanitizeEnabledLocales(null)).toEqual([...SHIPPED_LOCALES]);
    expect(sanitizeEnabledLocales(['fr', 'de'])).toEqual([...SHIPPED_LOCALES]);
  });

  it('resolveSchoolDefaultLocale keeps default within enabled set', () => {
    expect(resolveSchoolDefaultLocale('uk', ['uk', 'en'])).toBe('uk');
    // requested default not offered → platform default when enabled, else first enabled
    expect(resolveSchoolDefaultLocale('uk', ['en'])).toBe('en');
    expect(resolveSchoolDefaultLocale('en', ['uk'])).toBe('uk');
    expect(resolveSchoolDefaultLocale(null, ['uk', 'en'])).toBe('en');
    expect(resolveSchoolDefaultLocale('de', null)).toBe(DEFAULT_LOCALE);
  });

  it('clampLocaleToEnabled falls back to school default when disabled', () => {
    expect(clampLocaleToEnabled('uk', ['uk', 'en'])).toBe('uk');
    expect(clampLocaleToEnabled('uk', ['en'], 'en')).toBe('en');
    expect(clampLocaleToEnabled('uk', ['en'], 'uk')).toBe('en');
    expect(clampLocaleToEnabled('en', null)).toBe('en');
  });
});
