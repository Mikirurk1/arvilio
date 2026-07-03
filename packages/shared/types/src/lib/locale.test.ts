import {
  DEFAULT_LOCALE,
  isLocale,
  normalizeLocale,
  parseAcceptLanguage,
  resolveLocale,
} from './locale';

describe('locale core', () => {
  it('isLocale validates supported locales only', () => {
    expect(isLocale('uk')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
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
});
