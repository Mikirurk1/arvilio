import type { TranslationProviderId } from '@pkg/types';

export const TRANSLATION_PROVIDER_ORDER: readonly TranslationProviderId[] = [
  'deepl',
  'google',
  'microsoft',
  'reverso',
  'mymemory',
  'libretranslate',
  'gtx',
] as const;

export function parseTranslationProviderId(value: unknown): TranslationProviderId | null {
  if (
    value === 'deepl' ||
    value === 'google' ||
    value === 'microsoft' ||
    value === 'reverso' ||
    value === 'mymemory' ||
    value === 'libretranslate' ||
    value === 'gtx'
  ) {
    return value;
  }
  return null;
}

/** Rotate fixed provider list so `primary` is tried first, then fallbacks. */
export function translationProviderOrder(primary: TranslationProviderId): TranslationProviderId[] {
  const idx = TRANSLATION_PROVIDER_ORDER.indexOf(primary);
  if (idx < 0) return [...TRANSLATION_PROVIDER_ORDER];
  return [...TRANSLATION_PROVIDER_ORDER.slice(idx), ...TRANSLATION_PROVIDER_ORDER.slice(0, idx)];
}

export function resolveActiveTranslationProvider(
  translation: {
    activeProvider?: unknown;
    reversoEnabled?: unknown;
  },
  envPrimaryReverso: boolean,
): TranslationProviderId {
  if (envPrimaryReverso) return 'reverso';
  const parsed = parseTranslationProviderId(translation.activeProvider);
  if (parsed) return parsed;
  if (translation.reversoEnabled === true) return 'reverso';
  return 'mymemory';
}
