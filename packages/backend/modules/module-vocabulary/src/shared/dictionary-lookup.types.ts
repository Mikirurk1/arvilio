import type { DictionaryApiEntry } from './dictionary-payload.util';
import type { ReversoContextExample } from '../infrastructure/reverso/reverso.client';

export type ReversoDictionaryRaw = {
  targetLang: string;
  translations: string[];
  examples: ReversoContextExample[];
  detectedLanguage: string | null;
};

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
  /** Reverso translate API context when source is reverso. */
  reversoRaw?: ReversoDictionaryRaw | null;
};
