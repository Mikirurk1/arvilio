'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  DEFAULT_FONT_SIZE_MODE,
  DEFAULT_THEME_MODE,
  UI_PERSIST_STORAGE_KEY,
  type FontSizeMode,
  type ThemeMode,
} from '../lib/appearance/initial-appearance';

export type { FontSizeMode, ThemeMode };

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
        theme: DEFAULT_THEME_MODE,
        fontSize: DEFAULT_FONT_SIZE_MODE,
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),
        setFontSize: (fontSize) => set({ fontSize }, false, 'ui/setFontSize'),
      }),
      {
        name: UI_PERSIST_STORAGE_KEY,
        partialize: (state) => ({ theme: state.theme, fontSize: state.fontSize }),
      },
    ),
    { name: 'arvilio/ui' },
  ),
);
