import {
  coerceDictionaryEntries,
  extractMeaningGroups,
  listPartsOfSpeech,
  mergeDictionaryEntries,
  normalizeAudioUrl,
  normalizeEntries,
  posRank,
  primarySenseFromEntries,
} from './dictionary-payload.util';

describe('dictionary-payload.util', () => {
  it('posRank orders noun before verb', () => {
    expect(posRank('noun')).toBeLessThan(posRank('verb'));
    expect(posRank('unknown')).toBe(50);
  });

  it('mergeDictionaryEntries flattens meanings', () => {
    const merged = mergeDictionaryEntries([
      {
        word: 'run',
        meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: 'move fast' }] }],
      },
      {
        word: 'run',
        meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'a jog' }] }],
      },
    ]);
    expect(merged.meanings).toHaveLength(2);
    expect(merged.meanings[0]?.partOfSpeech).toBe('noun');
  });

  it('mergeDictionaryEntries returns empty for no entries', () => {
    const merged = mergeDictionaryEntries([]);
    expect(merged.meanings).toHaveLength(0);
    expect(merged.phonetic).toBeNull();
  });

  it('extractMeaningGroups dedupes by POS', () => {
    const groups = extractMeaningGroups([
      {
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [{ definition: 'a', example: 'ex' }],
          },
        ],
      },
    ]);
    expect(groups[0]?.partOfSpeech).toBe('noun');
    expect(groups[0]?.definition).toBe('a');
  });

  it('listPartsOfSpeech returns unique POS labels', () => {
    expect(
      listPartsOfSpeech([
        {
          meanings: [
            { partOfSpeech: 'noun', definitions: [{ definition: 'x' }] },
            { partOfSpeech: 'verb', definitions: [{ definition: 'y' }] },
            { partOfSpeech: 'noun', definitions: [{ definition: 'z' }] },
          ],
        },
      ]),
    ).toEqual(['noun', 'verb']);
  });

  it('primarySenseFromEntries returns first group', () => {
    expect(
      primarySenseFromEntries([
        {
          meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'hello' }] }],
        },
      ]),
    ).toMatchObject({ definition: 'hello', partOfSpeech: 'noun' });
  });

  it('normalizeAudioUrl accepts https and protocol-relative', () => {
    expect(normalizeAudioUrl('https://cdn.example/a.mp3')).toBe('https://cdn.example/a.mp3');
    expect(normalizeAudioUrl('//cdn.example/a.mp3')).toBe('https://cdn.example/a.mp3');
    expect(normalizeAudioUrl('ftp://x')).toBeNull();
    expect(normalizeAudioUrl('  ')).toBeNull();
  });

  it('coerceDictionaryEntries normalizes shapes', () => {
    expect(coerceDictionaryEntries(null)).toEqual([]);
    expect(coerceDictionaryEntries([{ word: 'a', meanings: [] }])).toHaveLength(1);
    expect(coerceDictionaryEntries({ meanings: [] })).toHaveLength(1);
  });

  it('normalizeEntries strips html from definitions', () => {
    const out = normalizeEntries([
      {
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [{ definition: '<b>plain</b>', example: '<i>ex</i>' }],
          },
        ],
      },
    ]);
    expect(out[0]?.meanings?.[0]?.definitions?.[0]?.definition).toBe('plain');
  });
});
