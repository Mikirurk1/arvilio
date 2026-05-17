'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSizeMode = 'small' | 'medium' | 'large';

type UiState = {
  theme: ThemeMode;
  fontSize: FontSizeMode;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (fontSize: FontSizeMode) => void;
};

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'auto',
        fontSize: 'medium',
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),
        setFontSize: (fontSize) => set({ fontSize }, false, 'ui/setFontSize'),
      }),
      {
        name: 'soenglish.ui',
        partialize: (state) => ({ theme: state.theme, fontSize: state.fontSize }),
      },
    ),
    { name: 'soenglish/ui' },
  ),
);
