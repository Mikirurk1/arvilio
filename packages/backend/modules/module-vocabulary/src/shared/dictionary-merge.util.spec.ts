import {
  dedupeStrings,
  mergeDictionaryLookups,
  mergePayloadPhonetics,
} from './dictionary-merge.util';
import type { DictionaryLookup } from './dictionary-lookup.types';

const lookup = (overrides: Partial<DictionaryLookup> = {}): DictionaryLookup => ({
  text: 'run',
  definition: 'move fast',
  example: null,
  phonetic: null,
  partOfSpeech: 'verb',
  origin: null,
  audioUrl: null,
  synonyms: [],
  antonyms: [],
  source: 'wiktionary',
  payload: [],
  ...overrides,
});

describe('dictionary-merge.util', () => {
  it('dedupeStrings is case-insensitive', () => {
    expect(dedupeStrings(['Run', 'run', '  '])).toEqual(['Run']);
  });

  it('mergeDictionaryLookups fills phonetic and synonyms from supplemental', () => {
    const merged = mergeDictionaryLookups(
      lookup({ synonyms: ['jog'] }),
      lookup({ source: 'dictionary-api', phonetic: '/rʌn/', synonyms: ['jog', 'sprint'] }),
    );
    expect(merged.phonetic).toBe('/rʌn/');
    expect(merged.synonyms).toEqual(['jog', 'sprint']);
    expect(merged.source).toContain('wiktionary');
    expect(merged.source).toContain('dictionary-api');
  });

  it('mergePayloadPhonetics merges first entry phonetics', () => {
    const merged = mergePayloadPhonetics(
      [{ word: 'run', meanings: [], phonetic: '/rʌn/' }],
      [{ word: 'run', meanings: [], phonetics: [{ text: '/ɹʌn/', audio: 'a.mp3' }] }],
    );
    expect(merged[0]?.phonetics?.length).toBe(1);
  });
});
