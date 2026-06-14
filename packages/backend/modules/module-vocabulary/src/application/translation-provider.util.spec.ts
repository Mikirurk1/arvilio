import {
  resolveActiveTranslationProvider,
  translationProviderOrder,
} from './translation-provider.util';
import { parsePlatformIntegrationConfig } from './platform-integration/platform-integration.config.util';

describe('translation-provider.util', () => {
  it('rotates provider order with primary first', () => {
    expect(translationProviderOrder('mymemory')).toEqual([
      'mymemory',
      'libretranslate',
      'gtx',
      'deepl',
      'google',
      'microsoft',
      'reverso',
    ]);
    expect(translationProviderOrder('deepl')).toEqual([
      'deepl',
      'google',
      'microsoft',
      'reverso',
      'mymemory',
      'libretranslate',
      'gtx',
    ]);
  });

  it('resolves activeProvider from stored config', () => {
    expect(resolveActiveTranslationProvider({ activeProvider: 'google' }, false)).toBe('google');
  });

  it('migrates legacy reversoEnabled to reverso primary', () => {
    expect(resolveActiveTranslationProvider({ reversoEnabled: true }, false)).toBe('reverso');
    expect(resolveActiveTranslationProvider({}, true)).toBe('reverso');
    expect(resolveActiveTranslationProvider({ activeProvider: 'libretranslate' }, true)).toBe(
      'reverso',
    );
    expect(resolveActiveTranslationProvider({}, false)).toBe('mymemory');
  });
});

describe('platform-integration.config.util translation parse', () => {
  it('parses legacy reversoEnabled as activeProvider reverso', () => {
    const config = parsePlatformIntegrationConfig({
      translation: { reversoEnabled: true },
    });
    expect(config.translation.activeProvider).toBe('reverso');
  });

  it('defaults to mymemory when no active provider', () => {
    const config = parsePlatformIntegrationConfig({});
    expect(config.translation.activeProvider).toBe('mymemory');
  });
});
