export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedThemeMode = Exclude<ThemeMode, 'auto'>;
export type FontSizeMode = 'small' | 'medium' | 'large';

export const UI_PERSIST_STORAGE_KEY = 'soenglish.ui';
export const DEFAULT_THEME_MODE: ThemeMode = 'auto';
export const DEFAULT_RESOLVED_THEME_MODE: ResolvedThemeMode = 'light';
export const DEFAULT_FONT_SIZE_MODE: FontSizeMode = 'medium';

type AppearanceStateShape = {
  theme?: unknown;
  fontSize?: unknown;
};

export function resolveInitialAppearance(
  persistedValue: unknown,
  prefersDark: boolean,
): {
  theme: ResolvedThemeMode;
  fontSize: FontSizeMode;
} {
  const state = extractAppearanceState(persistedValue);
  const themeSetting = normalizeThemeMode(state?.theme);
  const fontSize = normalizeFontSizeMode(state?.fontSize);

  return {
    theme:
      themeSetting === 'auto'
        ? prefersDark
          ? 'dark'
          : 'light'
        : themeSetting,
    fontSize,
  };
}

export function serializeInitialAppearanceScript(): string {
  return `(function(){var root=document.documentElement;var apply=function(theme,fontSize){root.setAttribute('data-theme',theme);root.style.colorScheme=theme;root.setAttribute('data-font-size',fontSize);};var normalizeTheme=function(value){return value==='light'||value==='dark'||value==='auto'?value:'${DEFAULT_THEME_MODE}';};var normalizeFontSize=function(value){return value==='small'||value==='medium'||value==='large'?value:'${DEFAULT_FONT_SIZE_MODE}';};try{var raw=window.localStorage.getItem('${UI_PERSIST_STORAGE_KEY}');var parsed=raw?JSON.parse(raw):null;var state=parsed&&typeof parsed==='object'&&parsed.state&&typeof parsed.state==='object'?parsed.state:parsed;var themeSetting=normalizeTheme(state&&state.theme);var fontSize=normalizeFontSize(state&&state.fontSize);var prefersDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);apply(themeSetting==='auto'?(prefersDark?'dark':'light'):themeSetting,fontSize);}catch(e){apply('${DEFAULT_RESOLVED_THEME_MODE}','${DEFAULT_FONT_SIZE_MODE}');}})();`;
}

function extractAppearanceState(value: unknown): AppearanceStateShape | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as { state?: unknown };
  if (candidate.state && typeof candidate.state === 'object') {
    return candidate.state as AppearanceStateShape;
  }
  return value as AppearanceStateShape;
}

function normalizeThemeMode(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'auto'
    ? value
    : DEFAULT_THEME_MODE;
}

function normalizeFontSizeMode(value: unknown): FontSizeMode {
  return value === 'small' || value === 'medium' || value === 'large'
    ? value
    : DEFAULT_FONT_SIZE_MODE;
}
