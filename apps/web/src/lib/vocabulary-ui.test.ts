import type { StudentWordCardDto } from '@pkg/types';
import { mockStudentWordCard, mockWordCard, mockWordDefinition } from '../testing/fixtures';
import {
  buildVocabularyPlayRound,
  canBuildVocabularyPlayRound,
  collectWordPartsOfSpeech,
  displayWordFromCard,
  formatPartsOfSpeech,
  formatVerbFormsLine,
  mapStudentCardsToListItems,
  toDisplayWord,
  vocabularyItemMatchesSearch,
  wordMatchesPosFilter,
} from './vocabulary-ui';

const card = (overrides: Partial<StudentWordCardDto> = {}): StudentWordCardDto =>
  mockStudentWordCard({
    id: 'c1',
    word: mockWordCard({
      id: 'w1',
      text: 'run',
      definition: 'to move quickly',
      definitions: [
        mockWordDefinition({ languageId: 'uk', text: 'бігти', partOfSpeech: 'verb' }),
        mockWordDefinition({ languageId: 'en', text: 'to run', partOfSpeech: 'verb' }),
      ],
      partOfSpeech: 'verb',
      ...overrides.word,
    }),
    ...overrides,
  });

describe('vocabulary-ui', () => {
  it('collectWordPartsOfSpeech dedupes and sorts', () => {
    const parts = collectWordPartsOfSpeech({
      partOfSpeech: 'verb',
      definitions: [
        mockWordDefinition({ languageId: 'en', text: 'noun gloss', partOfSpeech: 'noun' }),
        mockWordDefinition({ languageId: 'en', text: 'verb gloss', partOfSpeech: 'verb' }),
      ],
    });
    expect(parts).toEqual(['noun', 'verb']);
  });

  it('formatPartsOfSpeech and wordMatchesPosFilter', () => {
    expect(formatPartsOfSpeech(['verb', 'noun'])).toContain('·');
    expect(wordMatchesPosFilter(['verb'], 'All')).toBe(true);
    expect(wordMatchesPosFilter(['verb'], 'verb')).toBe(true);
    expect(wordMatchesPosFilter(['noun'], 'verb')).toBe(false);
  });

  it('toDisplayWord resolves translation and irregular verb forms', () => {
    const display = toDisplayWord(card(), 'uk', 'en');
    expect(display.word).toBe('run');
    expect(display.translation).toBe('бігти');
    expect(display.verbForms?.pastSimple).toBe('ran');
  });

  it('formatVerbFormsLine', () => {
    expect(formatVerbFormsLine({ pastSimple: 'went', pastParticiple: 'gone' })).toContain('went');
  });

  it('buildVocabularyPlayRound requires distinct answers', () => {
    const pool = [
      card({ id: 'c1', word: { ...card().word, text: 'a', definition: 'one' } }),
      card({ id: 'c2', word: { ...card().word, text: 'b', definition: 'two' } }),
    ];
    pool[0] = {
      ...pool[0],
      word: {
        ...pool[0].word,
        definitions: [mockWordDefinition({ languageId: 'uk', lemmaText: 'один' })],
      },
    };
    pool[1] = {
      ...pool[1],
      word: {
        ...pool[1].word,
        definitions: [mockWordDefinition({ languageId: 'uk', lemmaText: 'два' })],
      },
    };
    const items = pool.map((c) => ({
      card: c,
      status: c.status,
      display: toDisplayWord(c, 'uk', 'en'),
    }));
    expect(canBuildVocabularyPlayRound(items)).toBe(true);
    const round = buildVocabularyPlayRound(items);
    expect(round.length).toBeGreaterThan(0);
    expect(round[0]?.options).toContain(round[0]?.correct);
  });

  it('mapStudentCardsToListItems maps cards to list rows', () => {
    const items = mapStudentCardsToListItems([card()], 'uk', 'en');
    expect(items).toHaveLength(1);
    expect(items[0]?.display.word).toBe('run');
  });

  it('displayWordFromCard exposes word metadata', () => {
    const display = displayWordFromCard(card().word, 'uk', 'en');
    expect(display.word).toBe('run');
    expect(display.wordId).toBe('w1');
  });

  it('vocabularyItemMatchesSearch matches word and gloss', () => {
    const item = mapStudentCardsToListItems([card()], 'uk', 'en')[0]!;
    expect(vocabularyItemMatchesSearch(item, '', 'All', 'uk', 'en')).toBe(true);
    expect(vocabularyItemMatchesSearch(item, 'run', 'All', 'uk', 'en')).toBe(true);
    expect(vocabularyItemMatchesSearch(item, 'zzz', 'All', 'uk', 'en')).toBe(false);
  });
});
