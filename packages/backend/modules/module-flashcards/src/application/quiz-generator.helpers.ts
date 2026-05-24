import { BadRequestException } from '@nestjs/common';
import type { GenerateQuizRequestDto, QuizDetailDto } from '@pkg/types';
import { listIrregularVerbs, resolveVerbForms } from '@pkg/types';
import { decodeQuizCursor, dedupeById, maskWordInExample, shuffle } from '../domain/quiz-generator.logic';
import type { CardWithWord, WordRow } from './quiz-generator.types';

export function parseQuizCursor(cursor: string): { createdAt: Date; id: string } {
  try {
    return decodeQuizCursor(cursor);
  } catch {
    throw new BadRequestException('Invalid quiz cursor');
  }
}

export function difficultyFromDto(
  difficulty: 'easy' | 'medium' | 'hard',
): 'EASY' | 'MEDIUM' | 'HARD' {
  return difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD';
}

export function sourceFromDto(
  source: 'vocabulary' | 'lesson' | 'mixed' | 'manual',
): 'VOCABULARY' | 'LESSON' | 'MIXED' | 'MANUAL' {
  return source.toUpperCase() as 'VOCABULARY' | 'LESSON' | 'MIXED' | 'MANUAL';
}

export function statusWeight(status: CardWithWord['status']): number {
  switch (status) {
    case 'MISTAKES_WORK':
      return 4;
    case 'NEW':
      return 3;
    case 'REPEATED':
      return 2;
    default:
      return 1;
  }
}

export function pickTranslation(
  definitions: CardWithWord['word']['definitions'],
  nativeLanguageId: string | null,
): string | null {
  if (!nativeLanguageId) return null;
  const native = definitions.find((row) => row.languageId === nativeLanguageId);
  const lemma = native?.lemmaText?.trim();
  if (lemma) return lemma;
  const gloss = native?.text?.trim();
  return gloss || null;
}

export function wordRowFromCard(card: CardWithWord, nativeLanguageId: string | null): WordRow {
  const glossRows = card.word.definitions.map((row) => ({
    partOfSpeech: row.partOfSpeech,
  }));
  const partOfSpeech =
    card.word.partOfSpeech?.trim() ||
    card.word.definitions.find((row) => row.partOfSpeech.trim())?.partOfSpeech ||
    null;
  const translation = pickTranslation(card.word.definitions, nativeLanguageId);
  const definition =
    card.word.definition?.trim() ||
    card.word.definitions.find((row) => row.text.trim())?.text.trim() ||
    '—';

  return {
    id: card.word.id,
    text: card.word.text,
    definition,
    example: card.word.example,
    partOfSpeech,
    category: card.word.category,
    translation,
    verbForms: resolveVerbForms(card.word.text, partOfSpeech, glossRows),
    vocabularyWeight: statusWeight(card.status),
  };
}

export function wordsFromCards(cards: CardWithWord[], nativeLanguageId: string | null): WordRow[] {
  const byId = new Map<string, WordRow>();
  for (const card of cards) {
    const row = wordRowFromCard(card, nativeLanguageId);
    const existing = byId.get(row.id);
    if (!existing || row.vocabularyWeight > existing.vocabularyWeight) {
      byId.set(row.id, row);
    }
  }
  return [...byId.values()];
}

export function weightedShuffleWords(items: WordRow[]): WordRow[] {
  const pool = [...items];
  const out: WordRow[] = [];
  while (pool.length > 0) {
    const total = pool.reduce((sum, item) => sum + item.vocabularyWeight, 0);
    let roll = Math.random() * total;
    let picked = 0;
    for (let i = 0; i < pool.length; i += 1) {
      roll -= pool[i].vocabularyWeight;
      if (roll <= 0) {
        picked = i;
        break;
      }
    }
    out.push(pool[picked]);
    pool.splice(picked, 1);
  }
  return out;
}

export function defaultTitle(body: GenerateQuizRequestDto, poolSize: number): string {
  if (body.lessonId) return `Lesson quiz (${poolSize} words)`;
  if (body.source === 'vocabulary') return `Vocabulary quiz (${poolSize} words)`;
  return 'Generated quiz';
}

export function toDetail(quiz: {
  id: string;
  title: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  source: 'MANUAL' | 'VOCABULARY' | 'LESSON' | 'MIXED';
  lessonId: string | null;
  createdAt: Date;
  questions: Array<{
    id: string;
    type: 'MULTIPLE_CHOICE' | 'FILL_IN';
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
    wordId: string | null;
  }>;
}): QuizDetailDto {
  return {
    id: quiz.id,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty.toLowerCase() as QuizDetailDto['difficulty'],
    source: quiz.source.toLowerCase() as QuizDetailDto['source'],
    lessonId: quiz.lessonId,
    questionCount: quiz.questions.length,
    createdAt: quiz.createdAt.toISOString(),
    questions: quiz.questions.map((question) => ({
      id: question.id,
      type: question.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'fill-in',
      question: question.prompt,
      options: question.options,
      correct: question.type === 'MULTIPLE_CHOICE'
        ? Number.parseInt(question.correctAnswer, 10) || 0
        : question.correctAnswer,
      explanation: question.explanation ?? '',
      wordId: question.wordId,
    })),
  };
}

type GeneratedQuestion = {
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  correct: number | string;
  explanation: string;
  wordId: string;
};

type BuildQuestionOptions = {
  includeIrregularVerbDrills: boolean;
};

export function buildQuestions(
  pool: WordRow[],
  distractorPool: WordRow[],
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  options: BuildQuestionOptions,
): GeneratedQuestion[] {
  const ordered = pool.slice(0, count);
  const out: GeneratedQuestion[] = [];

  ordered.forEach((word, index) => {
    const question = buildQuestionWithFallback(word, index, difficulty, distractorPool, options);
    if (question) out.push(question);
  });

  if (out.length === 0) {
    for (const word of ordered) {
      const fallback = buildSingle('definitionMcq', word, distractorPool, options);
      if (fallback) {
        out.push(fallback);
        break;
      }
    }
  }
  return out;
}

type QuestionTemplate =
  | 'definitionMcq'
  | 'reverseMcq'
  | 'cloze'
  | 'translationMcq'
  | 'pastSimpleMcq'
  | 'pastParticipleMcq';

export function templateCycle(
  index: number,
  difficulty: 'easy' | 'medium' | 'hard',
  hasExample: boolean,
  word: WordRow,
  options: BuildQuestionOptions,
): QuestionTemplate[] {
  const irregular = options.includeIrregularVerbDrills && Boolean(word.verbForms);
  if (difficulty === 'easy') {
    if (irregular && index % 3 === 1) return ['pastSimpleMcq', 'definitionMcq'];
    return ['definitionMcq'];
  }
  if (difficulty === 'hard') {
    const cycle: QuestionTemplate[] = hasExample
      ? ['cloze', 'reverseMcq', 'definitionMcq']
      : ['reverseMcq', 'definitionMcq'];
    if (irregular) cycle.unshift('pastParticipleMcq', 'pastSimpleMcq');
    if (word.translation) cycle.unshift('translationMcq');
    return [cycle[index % cycle.length], 'definitionMcq', 'reverseMcq'];
  }
  const cycle: QuestionTemplate[] = hasExample
    ? ['definitionMcq', 'reverseMcq', 'cloze']
    : ['definitionMcq', 'reverseMcq'];
  if (irregular) cycle.push('pastSimpleMcq', 'pastParticipleMcq');
  if (word.translation) cycle.splice(1, 0, 'translationMcq');
  return [cycle[index % cycle.length], 'definitionMcq', 'reverseMcq'];
}

export function buildQuestionWithFallback(
  word: WordRow,
  index: number,
  difficulty: 'easy' | 'medium' | 'hard',
  pool: WordRow[],
  options: BuildQuestionOptions,
): GeneratedQuestion | null {
  const chain = templateCycle(index, difficulty, Boolean(word.example), word, options);
  const seen = new Set<QuestionTemplate>();
  for (const template of chain) {
    if (seen.has(template)) continue;
    seen.add(template);
    const question = buildSingle(template, word, pool, options);
    if (question) return question;
  }
  return buildSingle('definitionMcq', word, pool, options);
}

export function buildSingle(
  template: QuestionTemplate,
  word: WordRow,
  pool: WordRow[],
  _options: BuildQuestionOptions,
): GeneratedQuestion | null {
  if (template === 'definitionMcq') {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.definition).slice(0, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([word.definition, ...distractors.map((row) => row.definition)]);
    return {
      type: 'multiple-choice',
      question: `Choose the correct definition for "${word.text}":`,
      options,
      correct: options.indexOf(word.definition),
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
    };
  }
  if (template === 'reverseMcq') {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.text).slice(0, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([word.text, ...distractors.map((row) => row.text)]);
    return {
      type: 'multiple-choice',
      question: `Which word matches: "${word.definition}"?`,
      options,
      correct: options.indexOf(word.text),
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
    };
  }
  if (template === 'cloze' && word.example) {
    const masked = maskWordInExample(word.example, word.text);
    if (!masked) return null;
    return {
      type: 'fill-in',
      question: `Fill in the blank: ${masked}`,
      correct: word.text,
      explanation: `Original sentence: "${word.example}"`,
      wordId: word.id,
    };
  }
  if (template === 'translationMcq' && word.translation) {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.translation ?? '')
      .filter((candidate) => candidate.translation)
      .slice(0, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([
      word.translation,
      ...distractors.map((row) => row.translation as string),
    ]);
    return {
      type: 'multiple-choice',
      question: `Which word matches the translation "${word.translation}"?`,
      options,
      correct: options.indexOf(word.translation),
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
    };
  }
  if (template === 'pastSimpleMcq' && word.verbForms) {
    const correct = word.verbForms.pastSimple;
    const distractors = pickIrregularFormDistractors(pool, word, 'pastSimple');
    if (distractors.length < 3) return null;
    const options = shuffle([correct, ...distractors]);
    return {
      type: 'multiple-choice',
      question: `What is the past tense of "${word.text}"?`,
      options,
      correct: options.indexOf(correct),
      explanation: `Past participle: ${word.verbForms.pastParticiple}`,
      wordId: word.id,
    };
  }
  if (template === 'pastParticipleMcq' && word.verbForms) {
    const correct = word.verbForms.pastParticiple;
    const distractors = pickIrregularFormDistractors(pool, word, 'pastParticiple');
    if (distractors.length < 3) return null;
    const options = shuffle([correct, ...distractors]);
    return {
      type: 'multiple-choice',
      question: `What is the past participle of "${word.text}"?`,
      options,
      correct: options.indexOf(correct),
      explanation: `Past tense: ${word.verbForms.pastSimple}`,
      wordId: word.id,
    };
  }
  return null;
}

export function pickIrregularFormDistractors(
  pool: WordRow[],
  word: WordRow,
  form: 'pastSimple' | 'pastParticiple',
): string[] {
  const correct = word.verbForms?.[form];
  if (!correct) return [];
  const fromPool = pool
    .filter((candidate) => candidate.verbForms && candidate.id !== word.id)
    .map((candidate) => candidate.verbForms![form]);
  const fromGlobal = listIrregularVerbs().map((entry) =>
    form === 'pastSimple' ? entry.pastSimple : entry.pastParticiple,
  );
  const unique = [...new Set([...fromPool, ...fromGlobal])].filter(
    (value) => value && value !== correct,
  );
  return shuffle(unique).slice(0, 3);
}

export function pickDistractors(
  pool: WordRow[],
  word: WordRow,
  selector: (row: WordRow) => string,
): WordRow[] {
  const sameCategory = pool.filter(
    (candidate) =>
      candidate.id !== word.id &&
      selector(candidate).trim().length > 0 &&
      candidate.category === word.category,
  );
  const samePos = pool.filter(
    (candidate) =>
      candidate.id !== word.id &&
      selector(candidate).trim().length > 0 &&
      candidate.partOfSpeech === word.partOfSpeech,
  );
  const fallback = pool.filter(
    (candidate) => candidate.id !== word.id && selector(candidate).trim().length > 0,
  );
  const merged = dedupeWordRows([...sameCategory, ...samePos, ...fallback]);
  return shuffle(merged);
}

export function dedupeWordRows(items: WordRow[]): WordRow[] {
  return dedupeById(items);
}

