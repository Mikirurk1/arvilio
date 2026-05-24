import type { LanguageDto, WordDefinitionDto, WordDetailsDto } from '@pkg/types';
import { pickNativeDefinitions } from './word-definitions';

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

export type DictionaryPayload = {
  word?: string;
  phonetic?: string;
  origin?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: DictionaryMeaning[];
};

type DictionaryApiEntry = DictionaryPayload;

export type PhoneticRow = {
  text?: string;
  audio?: string | null;
};

function mergeDictionaryEntries(entries: DictionaryApiEntry[]): DictionaryPayload {
  if (entries.length === 0) return {};
  const first = entries[0];
  return {
    word: first.word,
    phonetic: first.phonetic,
    origin: entries.find((e) => e.origin?.trim())?.origin,
    phonetics: entries.flatMap((e) => e.phonetics ?? []),
    meanings: entries.flatMap((e) => e.meanings ?? []),
  };
}

export function parsePayload(json: string | null | undefined): DictionaryPayload | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as {
      dictionary?: DictionaryApiEntry | DictionaryApiEntry[];
      dictionaryapi?: DictionaryApiEntry | DictionaryApiEntry[];
    };
    const raw =
      parsed.dictionary ??
      parsed.dictionaryapi ??
      (parsed as DictionaryApiEntry | DictionaryApiEntry[]);
    if (Array.isArray(raw)) {
      return mergeDictionaryEntries(raw);
    }
    if (raw && typeof raw === 'object' && 'meanings' in raw) {
      return raw as DictionaryPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function listPartsOfSpeechFromPayload(payload: DictionaryPayload | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const meaning of payload?.meanings ?? []) {
    const pos = meaning.partOfSpeech?.trim();
    if (!pos) continue;
    const key = pos.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pos);
  }
  return out;
}

export function resolveHeroPartsOfSpeech(
  details: WordDetailsDto,
  payload: DictionaryPayload | null,
): string[] {
  const fromPayload = listPartsOfSpeechFromPayload(payload);
  if (fromPayload.length > 0) return fromPayload;

  const fromDefinitions = new Set<string>();
  for (const row of details.definitions ?? []) {
    const pos = row.partOfSpeech?.trim();
    if (pos) fromDefinitions.add(pos);
  }
  if (fromDefinitions.size > 0) return [...fromDefinitions];

  return details.partOfSpeech ? [details.partOfSpeech] : [];
}

export function getPhonetics(
  payload: DictionaryPayload | null,
  details: WordDetailsDto,
): PhoneticRow[] {
  const rows: PhoneticRow[] = [];
  const seen = new Set<string>();

  const add = (text?: string | null, audio?: string | null) => {
    const key = `${text ?? ''}|${audio ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (text || audio) rows.push({ text: text ?? undefined, audio: audio ?? undefined });
  };

  if (payload?.phonetics?.length) {
    for (const row of payload.phonetics) {
      add(row.text, row.audio);
    }
  }

  if (payload?.phonetic) {
    add(payload.phonetic, details.audioUrl);
  }

  if (details.phonetic || details.audioUrl) {
    add(details.phonetic, details.audioUrl);
  }

  return rows;
}

export function collectSynonymsAntonyms(
  details: WordDetailsDto,
  payload: DictionaryPayload | null,
): { synonyms: string[]; antonyms: string[] } {
  const syn = new Set<string>(details.synonyms ?? []);
  const ant = new Set<string>(details.antonyms ?? []);

  for (const meaning of payload?.meanings ?? []) {
    for (const word of meaning.synonyms ?? []) syn.add(word);
    for (const word of meaning.antonyms ?? []) ant.add(word);
    for (const def of meaning.definitions ?? []) {
      for (const word of def.synonyms ?? []) syn.add(word);
      for (const word of def.antonyms ?? []) ant.add(word);
    }
  }

  return {
    synonyms: [...syn].sort((a, b) => a.localeCompare(b)),
    antonyms: [...ant].sort((a, b) => a.localeCompare(b)),
  };
}

/** All native-language glosses (one per part of speech when available). */
export function pickNativeTranslations(
  definitions: WordDefinitionDto[],
  nativeLanguageId: string | null | undefined,
  englishLanguageId: string | undefined,
): WordDefinitionDto[] {
  return pickNativeDefinitions(definitions, nativeLanguageId, englishLanguageId);
}

export function sortDefinitions(
  definitions: WordDetailsDto['definitions'],
  languages: LanguageDto[],
): WordDetailsDto['definitions'] {
  const langById = new Map(languages.map((l) => [l.id, l]));
  return [...definitions].sort((a, b) => {
    const codeA = langById.get(a.languageId)?.code ?? '';
    const codeB = langById.get(b.languageId)?.code ?? '';
    if (codeA === 'en') return -1;
    if (codeB === 'en') return 1;
    const nameA = langById.get(a.languageId)?.name ?? '';
    const nameB = langById.get(b.languageId)?.name ?? '';
    return nameA.localeCompare(nameB);
  });
}

export function resolveOrigin(
  details: WordDetailsDto,
  payload: DictionaryPayload | null,
): string | null {
  const text = (details.origin ?? payload?.origin)?.trim();
  return text || null;
}
