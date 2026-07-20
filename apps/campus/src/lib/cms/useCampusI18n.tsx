'use client';

import {
  campusUiFallbackMap,
  DEFAULT_LOCALE,
  type Locale,
} from '@pkg/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  formatCampusString,
  normalizeCampusLocale,
  tFromMap,
} from './campus-cms';

type CampusI18nContextValue = {
  locale: Locale;
  strings: Record<string, string>;
  ready: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const CampusI18nContext = createContext<CampusI18nContextValue | null>(null);

async function fetchStringMap(locale: Locale): Promise<Record<string, string>> {
  const fallback = campusUiFallbackMap(locale);
  try {
    const url = new URL('/cms-proxy/strings', window.location.origin);
    url.searchParams.set('locale', locale);
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { strings?: Record<string, string> };
    if (!data.strings || Object.keys(data.strings).length === 0) return fallback;
    return { ...fallback, ...data.strings };
  } catch {
    return fallback;
  }
}

export function CampusI18nProvider({
  children,
  initialLocale,
  initialStrings,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  initialStrings?: Record<string, string>;
}) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    normalizeCampusLocale(initialLocale ?? DEFAULT_LOCALE),
  );
  const [strings, setStrings] = useState<Record<string, string>>(
    () => initialStrings ?? campusUiFallbackMap(locale),
  );
  const [ready, setReady] = useState(Boolean(initialStrings));

  useEffect(() => {
    if (initialLocale) setLocaleState(normalizeCampusLocale(initialLocale));
  }, [initialLocale]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void fetchStringMap(locale).then((map) => {
      if (cancelled) return;
      setStrings(map);
      setReady(true);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(normalizeCampusLocale(next));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => tFromMap(strings, key, vars),
    [strings],
  );

  const value = useMemo(
    () => ({ locale, strings, ready, setLocale, t }),
    [locale, ready, setLocale, strings, t],
  );

  return <CampusI18nContext.Provider value={value}>{children}</CampusI18nContext.Provider>;
}

export function useCampusI18n(): CampusI18nContextValue {
  const ctx = useContext(CampusI18nContext);
  if (!ctx) {
    const locale = DEFAULT_LOCALE;
    const strings = campusUiFallbackMap(locale);
    return {
      locale,
      strings,
      ready: true,
      setLocale: () => undefined,
      t: (key, vars) => formatCampusString(strings[key] ?? key, vars),
    };
  }
  return ctx;
}

export function useCampusT() {
  return useCampusI18n().t;
}
