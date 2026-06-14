import {
  buildMcqOptions,
  buildQuestions,
  buildSingle,
  normalizeMcqAnswerText,
  pickDistractors,
  wordRowFromCard,
} from './quiz-generator.helpers';
import type { CardWithWord, WordRow } from './quiz-generator.types';

function word(overrides: Partial<WordRow> & { id: string; text: string }): WordRow {
  return {
    definition: 'def',
    example: null,
    partOfSpeech: 'noun',
    category: 'general',
    translation: null,
    verbForms: null,
    vocabularyWeight: 1,
    ...overrides,
  };
}

describe('quiz-generator.helpers', () => {
  it('normalizeMcqAnswerText collapses whitespace and lowercases', () => {
    expect(normalizeMcqAnswerText('  Hello   World  ')).toBe('hello world');
  });

  it('buildMcqOptions returns four unique options with stable correct index', () => {
    const built = buildMcqOptions('alpha', ['beta', 'gamma', 'delta', 'alpha']);
    expect(built).not.toBeNull();
    expect(built!.options).toHaveLength(4);
    expect(new Set(built!.options.map(normalizeMcqAnswerText)).size).toBe(4);
    expect(built!.options[built!.correctIndex]).toBe('alpha');
  });

  it('buildMcqOptions rejects when fewer than three unique distractors', () => {
    expect(buildMcqOptions('same', ['same', 'same', 'other'])).toBeNull();
  });

  it('pickDistractors excludes rows with the same answer text', () => {
    const pool = [
      word({ id: '1', text: 'a', definition: 'gloss A' }),
      word({ id: '2', text: 'b', definition: 'gloss A' }),
      word({ id: '3', text: 'c', definition: 'gloss C' }),
      word({ id: '4', text: 'd', definition: 'gloss D' }),
      word({ id: '5', text: 'e', definition: 'gloss E' }),
    ];
    const picked = pickDistractors(pool, pool[0], (row) => row.definition, {
      excludeAnswer: 'gloss A',
      relaxed: true,
    });
    expect(picked.every((row) => normalizeMcqAnswerText(row.definition) !== 'gloss a')).toBe(true);
  });

  it('buildSingle definitionMcq uses unique options', () => {
    const target = word({ id: '1', text: 'run', definition: 'to move quickly' });
    const pool = [
      target,
      word({ id: '2', text: 'walk', definition: 'to move slowly' }),
      word({ id: '3', text: 'jump', definition: 'to spring' }),
      word({ id: '4', text: 'sit', definition: 'to rest' }),
      word({ id: '5', text: 'go', definition: 'to travel' }),
    ];
    const question = buildSingle('definitionMcq', target, pool, {
      includeIrregularVerbDrills: false,
    });
    expect(question).not.toBeNull();
    expect(question!.options).toHaveLength(4);
    expect(new Set(question!.options!.map(normalizeMcqAnswerText)).size).toBe(4);
  });

  it('wordRowFromCard prefers POS-scoped native translation', () => {
    const card: CardWithWord = {
      status: 'NEW',
      lessonId: null,
      word: {
        id: 'w1',
        text: 'kind',
        definition: 'generic',
        example: null,
        partOfSpeech: 'noun',
        category: 'general',
        definitions: [
          {
            languageId: 'en',
            text: 'having a friendly nature',
            lemmaText: null,
            partOfSpeech: 'adjective',
          },
          {
            languageId: 'uk',
            text: 'adj gloss',
            lemmaText: 'добрий',
            partOfSpeech: 'adjective',
          },
          {
            languageId: 'uk',
            text: 'noun gloss',
            lemmaText: 'вид',
            partOfSpeech: 'noun',
          },
        ],
      },
    };
    const row = wordRowFromCard(card, 'uk');
    expect(row.translation).toBe('вид');
  });

  it('buildSingle translationMcq uses English lemmas in options, not native gloss', () => {
    const target = word({
      id: '1',
      text: 'everywhere',
      definition: 'in all places',
      translation: 'по всьому',
    });
    const pool = [
      target,
      word({ id: '2', text: 'nowhere', definition: 'in no place', translation: 'ніде' }),
      word({ id: '3', text: 'somewhere', definition: 'in some place', translation: 'десь' }),
      word({ id: '4', text: 'anywhere', definition: 'in any place', translation: 'будь-де' }),
      word({ id: '5', text: 'here', definition: 'in this place', translation: 'тут' }),
    ];
    const question = buildSingle('translationMcq', target, pool, {
      includeIrregularVerbDrills: false,
    });
    expect(question).not.toBeNull();
    expect(question!.question).toContain('по всьому');
    expect(question!.options).toHaveLength(4);
    expect(question!.options!.every((opt) => /^[a-zA-Z]/.test(opt))).toBe(true);
    expect(question!.options!.map(normalizeMcqAnswerText)).not.toContain('по всьому');
    expect(question!.options![question!.correct as number]).toBe('everywhere');
  });

  it('buildSingle translationMcq skips when lemma equals gloss text', () => {
    const target = word({
      id: '1',
      text: 'hello',
      definition: 'greeting',
      translation: 'hello',
    });
    const pool = [
      target,
      word({ id: '2', text: 'hi', definition: 'greeting short', translation: 'привіт' }),
      word({ id: '3', text: 'hey', definition: 'informal greeting', translation: 'ей' }),
      word({ id: '4', text: 'bye', definition: 'farewell', translation: 'бувай' }),
      word({ id: '5', text: 'yo', definition: 'slang greeting', translation: 'йо' }),
    ];
    expect(
      buildSingle('translationMcq', target, pool, { includeIrregularVerbDrills: false }),
    ).toBeNull();
  });

  it('buildQuestions produces requested count for a healthy pool', () => {
    const pool = Array.from({ length: 12 }, (_, index) =>
      word({
        id: `w${index}`,
        text: `word${index}`,
        definition: `definition ${index}`,
        translation: `переклад ${index}`,
      }),
    );
    const questions = buildQuestions(pool, pool, 8, 'medium', {
      includeIrregularVerbDrills: false,
    });
    expect(questions.length).toBe(8);
  });
});
