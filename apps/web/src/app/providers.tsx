'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

type ThemeMode = 'light' | 'dark' | 'auto';
type FontSizeMode = 'small' | 'medium' | 'large';

type AppearanceContextValue = {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  fontSize: FontSizeMode;
  setFontSize: (next: FontSizeMode) => void;
};

const THEME_KEY = 'soenglish.theme';
const FONT_SIZE_KEY = 'soenglish.fontSize';

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function resolveSystemTheme(): Exclude<ThemeMode, 'auto'> {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function AppearanceProvider({ children }: QueryProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>('auto');
  const [fontSize, setFontSize] = useState<FontSizeMode>('medium');

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto') {
        setTheme(storedTheme);
      }
      const storedFontSize = localStorage.getItem(FONT_SIZE_KEY);
      if (storedFontSize === 'small' || storedFontSize === 'medium' || storedFontSize === 'large') {
        setFontSize(storedFontSize);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      root.setAttribute('data-theme', theme === 'auto' ? resolveSystemTheme() : theme);
    };
    applyTheme();
    if (theme !== 'auto') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_KEY, fontSize);
    } catch {
      // ignore
    }
  }, [fontSize]);

  const value = useMemo(
    () => ({ theme, setTheme, fontSize, setFontSize }),
    [theme, fontSize],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function AppProviders({ children }: QueryProviderProps) {
  return (
    <QueryProvider>
      <AppearanceProvider>{children}</AppearanceProvider>
    </QueryProvider>
  );
}

export function useAppearanceSettings() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearanceSettings must be used within AppProviders');
  }
  return context;
}
