import { mockWordDefinition, mockWordDetails } from '../testing/fixtures';
import {
  collectSynonymsAntonyms,
  getPhonetics,
  listPartsOfSpeechFromPayload,
  parsePayload,
  pickNativeTranslations,
  resolveHeroPartsOfSpeech,
  resolveOrigin,
  sortDefinitions,
} from './word-details-payload';

describe('word-details-payload', () => {
  it('parsePayload merges dictionary array entries', () => {
    const json = JSON.stringify({
      dictionary: [
        { word: 'test', meanings: [{ partOfSpeech: 'noun' }] },
        { meanings: [{ partOfSpeech: 'verb' }] },
      ],
    });
    const payload = parsePayload(json);
    expect(payload?.meanings).toHaveLength(2);
  });

  it('parsePayload returns null for invalid json', () => {
    expect(parsePayload('{bad')).toBeNull();
  });

  it('listPartsOfSpeechFromPayload dedupes case-insensitively', () => {
    const parts = listPartsOfSpeechFromPayload({
      meanings: [{ partOfSpeech: 'Noun' }, { partOfSpeech: 'noun' }, { partOfSpeech: 'verb' }],
    });
    expect(parts).toEqual(['Noun', 'verb']);
  });

  it('collectSynonymsAntonyms merges payload and details', () => {
    const details = mockWordDetails({
      synonyms: ['fast'],
      antonyms: ['slow'],
      definitions: [],
    });
    const result = collectSynonymsAntonyms(details, {
      meanings: [{ synonyms: ['quick'], antonyms: ['idle'] }],
    });
    expect(result.synonyms).toEqual(expect.arrayContaining(['fast', 'quick']));
    expect(result.antonyms).toEqual(expect.arrayContaining(['slow', 'idle']));
  });

  it('sortDefinitions puts English first', () => {
    const sorted = sortDefinitions(
      [
        mockWordDefinition({ languageId: 'uk', text: 'a' }),
        mockWordDefinition({ languageId: 'en', text: 'b' }),
      ],
      [
        { id: 'uk', code: 'uk', name: 'Ukrainian' },
        { id: 'en', code: 'en', name: 'English' },
      ],
    );
    expect(sorted[0]?.languageId).toBe('en');
  });

  it('resolveOrigin prefers details then payload', () => {
    expect(resolveOrigin(mockWordDetails({ origin: '  Latin  ' }), { origin: 'Greek' })).toBe(
      'Latin',
    );
    expect(resolveOrigin(mockWordDetails(), { origin: 'Greek' })).toBe('Greek');
  });

  it('getPhonetics merges payload and details without duplicates', () => {
    const rows = getPhonetics(
      {
        phonetic: '/rʌn/',
        phonetics: [{ text: '/rʌn/', audio: 'a.mp3' }],
      },
      mockWordDetails({ phonetic: '/rʌn/', audioUrl: 'a.mp3' }),
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.audio === 'a.mp3')).toBe(true);
  });

  it('resolveHeroPartsOfSpeech falls back to details.partOfSpeech', () => {
    expect(
      resolveHeroPartsOfSpeech(mockWordDetails({ partOfSpeech: 'verb', definitions: [] }), null),
    ).toEqual(['verb']);
  });

  it('pickNativeTranslations delegates to native definitions helper', () => {
    const rows = pickNativeTranslations(
      [
        mockWordDefinition({ languageId: 'uk', text: 'бігти', partOfSpeech: 'verb' }),
        mockWordDefinition({ languageId: 'en', text: 'run', partOfSpeech: 'verb' }),
      ],
      'uk',
      'en',
    );
    expect(rows.every((row) => row.languageId === 'uk')).toBe(true);
  });

  it('parsePayload reads dictionaryapi array', () => {
    const payload = parsePayload(
      JSON.stringify({
        dictionaryapi: [{ word: 'run', meanings: [{ partOfSpeech: 'verb' }] }],
      }),
    );
    expect(payload?.word).toBe('run');
  });

  it('parsePayload accepts single dictionary object', () => {
    const payload = parsePayload(JSON.stringify({ word: 'run', meanings: [] }));
    expect(payload?.word).toBe('run');
  });

  it('parsePayload returns null for empty string', () => {
    expect(parsePayload('')).toBeNull();
  });

  it('resolveHeroPartsOfSpeech uses definition rows when payload empty', () => {
    expect(
      resolveHeroPartsOfSpeech(
        mockWordDetails({
          definitions: [
            mockWordDefinition({ languageId: 'en', text: 'run', partOfSpeech: 'verb' }),
            mockWordDefinition({ languageId: 'en', text: 'sprint', partOfSpeech: 'noun' }),
          ],
        }),
        null,
      ),
    ).toEqual(expect.arrayContaining(['verb', 'noun']));
  });

  it('resolveOrigin returns null when missing', () => {
    expect(resolveOrigin(mockWordDetails(), {})).toBeNull();
  });

  it('getPhonetics uses details when payload has no phonetics', () => {
    const rows = getPhonetics(
      null,
      mockWordDetails({ phonetic: '/test/', audioUrl: 'https://audio.example/a.mp3' }),
    );
    expect(rows).toEqual([{ text: '/test/', audio: 'https://audio.example/a.mp3' }]);
  });
});
