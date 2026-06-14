import type { FontSizeMode, ResolvedThemeMode, ThemeMode } from './initial-appearance';

/** Resolve persisted/auto setting to the attribute value on `<html>`. */
export function resolveThemeMode(
  theme: ThemeMode,
  prefersDark: boolean,
): ResolvedThemeMode {
  if (theme === 'auto') return prefersDark ? 'dark' : 'light';
  return theme;
}

/** Apply shared theme + font size to a root element (usually `document.documentElement`). */
export function applyAppearanceToElement(
  root: HTMLElement,
  resolvedTheme: ResolvedThemeMode,
  fontSize: FontSizeMode,
): void {
  root.setAttribute('data-theme', resolvedTheme);
  root.style.colorScheme = resolvedTheme;
  root.setAttribute('data-font-size', fontSize);
}

export function prefersDarkColorScheme(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
