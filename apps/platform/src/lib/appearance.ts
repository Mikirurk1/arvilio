export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedThemeMode = Exclude<ThemeMode, 'auto'>;

export const PLATFORM_UI_STORAGE_KEY = 'arvilio-platform-ui';
export const DEFAULT_THEME_MODE: ThemeMode = 'auto';
export const DEFAULT_RESOLVED_THEME_MODE: ResolvedThemeMode = 'light';

export function resolveThemeMode(theme: ThemeMode, prefersDark: boolean): ResolvedThemeMode {
  if (theme === 'auto') return prefersDark ? 'dark' : 'light';
  return theme;
}

export function applyThemeToDocument(theme: ResolvedThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

export function readPersistedThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME_MODE;
  try {
    const raw = window.localStorage.getItem(PLATFORM_UI_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { theme?: unknown }) : null;
    const theme = parsed?.theme;
    return theme === 'light' || theme === 'dark' || theme === 'auto' ? theme : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

export function persistThemeMode(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLATFORM_UI_STORAGE_KEY, JSON.stringify({ theme }));
}

export function serializeInitialAppearanceScript(): string {
  return `(function(){var root=document.documentElement;var apply=function(theme){root.setAttribute('data-theme',theme);root.style.colorScheme=theme;};var normalize=function(value){return value==='light'||value==='dark'||value==='auto'?value:'${DEFAULT_THEME_MODE}';};try{var raw=window.localStorage.getItem('${PLATFORM_UI_STORAGE_KEY}');var parsed=raw?JSON.parse(raw):null;var themeSetting=normalize(parsed&&parsed.theme);var prefersDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);apply(themeSetting==='auto'?(prefersDark?'dark':'light'):themeSetting);}catch(e){apply('${DEFAULT_RESOLVED_THEME_MODE}');}})();`;
}
