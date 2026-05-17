import { isUsablePlainText, stripHtml } from './strip-html.util';

/** Raw dictionaryapi.dev entry shape (one homograph / POS bundle per array item). */
export type DictionaryApiEntry = {
  word?: string;
  phonetic?: string;
  origin?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<DictionaryMeaning>;
};

export type DictionaryMeaning = {
  partOfSpeech?: string;
  definitions?: Array<{
    definition?: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  synonyms?: string[];
  antonyms?: string[];
};

export type MeaningGroup = {
  partOfSpeech: string;
  definition: string;
  example: string | null;
};

const POS_PRIORITY: Record<string, number> = {
  noun: 0,
  verb: 1,
  adjective: 2,
  adverb: 3,
  exclamation: 4,
  interjection: 4,
  pronoun: 5,
  preposition: 6,
  conjunction: 7,
};

export function posRank(partOfSpeech?: string): number {
  if (!partOfSpeech) return 99;
  return POS_PRIORITY[partOfSpeech.toLowerCase()] ?? 50;
}

/** Merge all API entries (e.g. noun + adjective homographs) into one view. */
export function mergeDictionaryEntries(entries: DictionaryApiEntry[]): {
  meanings: DictionaryMeaning[];
  phonetic: string | null;
  phonetics: DictionaryApiEntry['phonetics'];
  origin: string | null;
} {
  if (entries.length === 0) {
    return { meanings: [], phonetic: null, phonetics: [], origin: null };
  }

  const meanings = entries
    .flatMap((e) => e.meanings ?? [])
    .sort((a, b) => posRank(a.partOfSpeech) - posRank(b.partOfSpeech));

  const first = entries[0];
  const phonetics = entries.flatMap((e) => e.phonetics ?? []);
  const origin = entries.find((e) => e.origin?.trim())?.origin?.trim() ?? null;

  return {
    meanings,
    phonetic: first.phonetic?.trim() ?? null,
    phonetics: phonetics.length > 0 ? phonetics : first.phonetics,
    origin,
  };
}

/** One primary gloss per part of speech (for translations). */
export function extractMeaningGroups(entries: DictionaryApiEntry[]): MeaningGroup[] {
  const merged = mergeDictionaryEntries(entries);
  const groups: MeaningGroup[] = [];
  const seenPos = new Set<string>();

  for (const meaning of merged.meanings) {
    const pos = meaning.partOfSpeech?.trim() || 'general';
    const posKey = pos.toLowerCase();
    if (seenPos.has(posKey)) continue;

    let definition: string | null = null;
    let example: string | null = null;
    for (const row of meaning.definitions ?? []) {
      const plain = stripHtml(row.definition ?? '');
      if (isUsablePlainText(plain)) {
        definition = plain;
        example = row.example ? stripHtml(row.example) || null : null;
        break;
      }
    }
    if (definition) {
      seenPos.add(posKey);
      groups.push({ partOfSpeech: pos, definition, example });
    }
  }

  return groups;
}

export function listPartsOfSpeech(entries: DictionaryApiEntry[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const meaning of mergeDictionaryEntries(entries).meanings) {
    const pos = meaning.partOfSpeech?.trim();
    if (!pos) continue;
    const key = pos.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pos);
  }
  return out;
}

export function primarySenseFromEntries(entries: DictionaryApiEntry[]): {
  definition: string | null;
  example: string | null;
  partOfSpeech: string | null;
} {
  const groups = extractMeaningGroups(entries);
  if (groups.length === 0) return { definition: null, example: null, partOfSpeech: null };
  const first = groups[0];
  return {
    definition: first.definition,
    example: first.example,
    partOfSpeech: first.partOfSpeech,
  };
}

export function normalizeAudioUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

export function coerceDictionaryEntries(payload: unknown): DictionaryApiEntry[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return normalizeEntries(payload as DictionaryApiEntry[]);
  if (typeof payload === 'object' && payload !== null && 'meanings' in payload) {
    return normalizeEntries([payload as DictionaryApiEntry]);
  }
  return [];
}

/** Strip HTML from stored entries (legacy Wiktionary rows). */
export function normalizeEntries(entries: DictionaryApiEntry[]): DictionaryApiEntry[] {
  return entries.map((entry) => ({
    ...entry,
    meanings: (entry.meanings ?? []).map((meaning) => ({
      ...meaning,
      definitions: (meaning.definitions ?? [])
        .map((row) => {
          const definition = stripHtml(row.definition ?? '');
          if (!isUsablePlainText(definition)) return null;
          const example = row.example ? stripHtml(row.example) || null : null;
          return { ...row, definition, example };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null),
    })),
  }));
}
