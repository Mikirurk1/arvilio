import type { WordDictionaryProviderId } from '@pkg/types';

/** Fixed fallback order; Wiktionary is always last unless it is the active provider. */
export const DICTIONARY_PROVIDER_ORDER: readonly WordDictionaryProviderId[] = [
  'dictionary_api_dev',
  'reverso',
  'wiktionary',
] as const;

/** Rotate so `primary` is tried first; remaining providers keep fixed order with Wiktionary last. */
export function dictionaryProviderOrder(primary: WordDictionaryProviderId): WordDictionaryProviderId[] {
  const rest = DICTIONARY_PROVIDER_ORDER.filter((id) => id !== primary);
  const beforeWiktionary = rest.filter((id) => id !== 'wiktionary');
  const order: WordDictionaryProviderId[] = [primary, ...beforeWiktionary];
  if (primary !== 'wiktionary') {
    order.push('wiktionary');
  }
  return order;
}
