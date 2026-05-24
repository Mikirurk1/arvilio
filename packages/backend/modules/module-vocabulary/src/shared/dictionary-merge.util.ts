import type { DictionaryApiEntry } from './dictionary-payload.util';
import type { DictionaryLookup } from './dictionary-lookup.types';

/** Wiktionary definitions + Dictionary API phonetics/audio/synonyms. */
export function mergeDictionaryLookups(
  primary: DictionaryLookup,
  supplemental: DictionaryLookup | null,
): DictionaryLookup {
  if (!supplemental) return primary;

  const sources = new Set<string>([primary.source, supplemental.source]);

  return {
    ...primary,
    phonetic: primary.phonetic ?? supplemental.phonetic,
    audioUrl: primary.audioUrl ?? supplemental.audioUrl,
    origin: primary.origin ?? supplemental.origin,
    synonyms: dedupeStrings([...primary.synonyms, ...supplemental.synonyms]).slice(0, 12),
    antonyms: dedupeStrings([...primary.antonyms, ...supplemental.antonyms]).slice(0, 12),
    source: [...sources].join('+'),
    payload: mergePayloadPhonetics(primary.payload, supplemental.payload),
  };
}

export function mergePayloadPhonetics(
  primary: DictionaryApiEntry[],
  supplemental: DictionaryApiEntry[],
): DictionaryApiEntry[] {
  if (supplemental.length === 0) return primary;
  const sup = supplemental[0];
  if (primary.length === 0) return supplemental;

  return primary.map((entry, i) => {
    if (i !== 0) return entry;
    const phonetics = [...(entry.phonetics ?? []), ...(sup.phonetics ?? [])];
    return {
      ...entry,
      phonetic: entry.phonetic ?? sup.phonetic,
      phonetics: phonetics.length > 0 ? phonetics : entry.phonetics,
    };
  });
}

export function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const value = item?.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
