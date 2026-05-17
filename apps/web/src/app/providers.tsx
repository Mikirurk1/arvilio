'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '../lib/auth-context';
import { ConfirmDialogHost } from '../features/confirm';
import { ToastViewport } from '../features/notifications/ToastViewport';
import { useUiStore, type FontSizeMode, type ThemeMode } from '../stores/ui-store';

type ProviderProps = {
  children: ReactNode;
};

function resolveSystemTheme(): Exclude<ThemeMode, 'auto'> {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies theme/font-size from Zustand to the document. */
function AppearanceSync({ children }: ProviderProps) {
  const theme = useUiStore((state) => state.theme);
  const fontSize = useUiStore((state) => state.fontSize);

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

  return children;
}

export function AppProviders({ children }: ProviderProps) {
  return (
    <AuthProvider>
      <AppearanceSync>
        {children}
        <ToastViewport />
        <ConfirmDialogHost />
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
