'use client';

import type { AuthUserDto } from '@pkg/types';
import { ReactNode, Suspense, useEffect } from 'react';
import { AuthProvider } from '../lib/auth-context';
import { AnalyticsProvider } from '../components/analytics/AnalyticsProvider';
import { ConfirmDialogHost } from '../features/confirm';
import { ToastViewport } from '../features/notifications/ToastViewport';
import { useUiStore } from '../stores/ui-store';
import {
  applyAppearanceToElement,
  prefersDarkColorScheme,
  resolveThemeMode,
} from '../lib/appearance/apply-appearance';

type ProviderProps = {
  children: ReactNode;
  initialAuthUser: AuthUserDto | null;
};

type AppearanceSyncProps = {
  children: ReactNode;
};

/** Applies theme/font-size from Zustand to the document (kept in sync with initial-appearance script). */
function AppearanceSync({ children }: AppearanceSyncProps) {
  const theme = useUiStore((state) => state.theme);
  const fontSize = useUiStore((state) => state.fontSize);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      applyAppearanceToElement(
        root,
        resolveThemeMode(theme, prefersDarkColorScheme()),
        fontSize,
      );
    };
    apply();
    if (theme !== 'auto') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => apply();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme, fontSize]);

  return children;
}

export function AppProviders({ children, initialAuthUser }: ProviderProps) {
  return (
    <AuthProvider initialUser={initialAuthUser}>
      <AppearanceSync>
        <Suspense>
          <AnalyticsProvider>
            {children}
            <ToastViewport />
            <ConfirmDialogHost />
          </AnalyticsProvider>
        </Suspense>
      </AppearanceSync>
    </AuthProvider>
  );
}

export function useAppearanceSettings() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const fontSize = useUiStore((state) => state.fontSize);
  const setFontSize = useUiStore((state) => state.setFontSize);
  return { theme, setTheme, fontSize, setFontSize };
}
