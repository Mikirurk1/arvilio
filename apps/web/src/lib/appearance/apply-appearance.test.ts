import {
  applyAppearanceToElement,
  prefersDarkColorScheme,
  resolveThemeMode,
} from './apply-appearance';

describe('apply-appearance', () => {
  it('resolveThemeMode maps auto from system preference', () => {
    expect(resolveThemeMode('auto', true)).toBe('dark');
    expect(resolveThemeMode('auto', false)).toBe('light');
    expect(resolveThemeMode('dark', false)).toBe('dark');
  });

  it('applyAppearanceToElement sets data-theme, colorScheme, data-font-size', () => {
    const root = document.createElement('html');
    applyAppearanceToElement(root, 'dark', 'large');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
    expect(root.getAttribute('data-font-size')).toBe('large');
  });

  it('prefersDarkColorScheme reads matchMedia', () => {
    const matchMedia = jest.fn().mockReturnValue({ matches: true });
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia });
    expect(prefersDarkColorScheme()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});
