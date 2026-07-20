import type { WordDefinitionDto } from '@pkg/types';
import { mockWordDefinition } from '../testing/fixtures';
import {
  filterDefinitionRowsByPos,
  glossFromDefinition,
  isUsableGloss,
  pickNativeDefinitions,
  pickWordDefinition,
  pickWordTranslation,
  translationFromDefinition,
} from './word-definitions';

const row = (overrides: Partial<WordDefinitionDto>): WordDefinitionDto =>
  mockWordDefinition({
    languageId: 'en',
    text: '',
    ...overrides,
  });

describe('word-definitions', () => {
  it('isUsableGloss rejects placeholders', () => {
    expect(isUsableGloss('—')).toBe(false);
    expect(isUsableGloss('hello')).toBe(true);
    expect(isUsableGloss(undefined, 'lemma')).toBe(true);
  });

  it('glossFromDefinition prefers definition text over lemma', () => {
    expect(glossFromDefinition(row({ text: 'run', lemmaText: 'бігти' }))).toBe(
      'run',
    );
    expect(glossFromDefinition(row({ text: '—', lemmaText: 'бігти' }))).toBe(
      'бігти',
    );
  });

  it('translationFromDefinition prefers lemma over text', () => {
    expect(
      translationFromDefinition(row({ text: 'to run', lemmaText: 'бігти' })),
    ).toBe('бігти');
  });

  it('pickWordDefinition prefers native language gloss', () => {
    const defs = [
      row({ languageId: 'uk', text: 'бігти', partOfSpeech: 'verb' }),
      row({ languageId: 'en', text: 'to run', partOfSpeech: 'verb' }),
    ];
    expect(pickWordDefinition(defs, 'uk', 'en', 'fallback')).toBe('бігти');
  });

  it('pickWordTranslation returns lemma translation', () => {
    const defs = [
      row({ languageId: 'uk', lemmaText: 'бігти', partOfSpeech: 'verb' }),
    ];
    expect(pickWordTranslation(defs, 'uk', 'en')).toBe('бігти');
  });

  it('filterDefinitionRowsByPos falls back to untagged rows', () => {
    const defs = [
      row({ languageId: 'uk', text: 'бігти', partOfSpeech: undefined }),
      row({ languageId: 'uk', text: 'інше', partOfSpeech: 'noun' }),
    ];
    const filtered = filterDefinitionRowsByPos(defs, 'verb');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.partOfSpeech).toBeUndefined();
  });

  it('pickWordDefinition respects partOfSpeech filter', () => {
    const defs = [
      row({ languageId: 'uk', text: 'бігти', partOfSpeech: 'verb' }),
      row({ languageId: 'uk', text: 'пробіг', partOfSpeech: 'noun' }),
    ];
    expect(pickWordDefinition(defs, 'uk', 'en', 'fallback', 'verb')).toBe(
      'бігти',
    );
  });

  it('pickWordDefinition falls back to english then any row', () => {
    const defs = [
      row({ languageId: 'en', text: 'to run', partOfSpeech: 'verb' }),
      row({ languageId: 'de', text: 'laufen', partOfSpeech: 'verb' }),
    ];
    expect(pickWordDefinition(defs, null, 'en', 'fallback')).toBe('to run');
    expect(
      pickWordDefinition(
        [row({ languageId: 'de', text: 'laufen' })],
        null,
        null,
        'fallback',
      ),
    ).toBe('laufen');
  });

  it('pickNativeDefinitions sorts by part of speech', () => {
    const defs = [
      row({ languageId: 'uk', text: 'прикметник', partOfSpeech: 'adjective' }),
      row({ languageId: 'uk', text: 'дієслово', partOfSpeech: 'verb' }),
      row({ languageId: 'uk', text: 'іменник', partOfSpeech: 'noun' }),
    ];
    const sorted = pickNativeDefinitions(defs, 'uk', 'en');
    expect(sorted.map(d => d.partOfSpeech)).toEqual([
      'noun',
      'verb',
      'adjective',
    ]);
  });

  it('pickNativeDefinitions returns empty when native equals english', () => {
    expect(
      pickNativeDefinitions(
        [row({ languageId: 'en', text: 'run' })],
        'en',
        'en',
      ),
    ).toEqual([]);
  });
});
