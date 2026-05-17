import type { DictionaryApiEntry } from './dictionary-payload.util';

export type DictionaryLookup = {
  text: string;
  definition: string | null;
  example: string | null;
  phonetic: string | null;
  partOfSpeech: string | null;
  origin: string | null;
  audioUrl: string | null;
  synonyms: string[];
  antonyms: string[];
  source: string;
  payload: DictionaryApiEntry[];
  /** Original Wiktionary REST JSON when source is wiktionary. */
  wiktionaryRaw?: unknown;
};
