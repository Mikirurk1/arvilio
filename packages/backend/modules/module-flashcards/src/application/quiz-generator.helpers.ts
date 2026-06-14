import { BadRequestException } from '@nestjs/common';
import type { GenerateQuizRequestDto, QuizDetailDto } from '@pkg/types';
import { listIrregularVerbs, resolveVerbForms } from '@pkg/types';
import { decodeQuizCursor, dedupeById, maskWordInExample, shuffle } from '../domain/quiz-generator.logic';
import { validateGeneratedQuestion } from '../domain/quiz-question-validator';
import { isEnglishLemmaForQuiz } from '../shared/english-lemma.util';
import { normalizeMcqAnswerText } from '../shared/mcq.util';
import type { CardWithWord, WordRow } from './quiz-generator.types';

export { normalizeMcqAnswerText } from '../shared/mcq.util';

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

function normalizePosKey(pos?: string | null): string {
  return pos?.trim().toLowerCase() ?? '';
}

function isUsableGloss(text?: string | null): boolean {
  const t = text?.trim();
  return Boolean(t && t !== '—' && t !== '-');
}

export function pickTranslation(
  definitions: CardWithWord['word']['definitions'],
  nativeLanguageId: string | null,
  partOfSpeech?: string | null,
): string | null {
  if (!nativeLanguageId) return null;
  const posKey = normalizePosKey(partOfSpeech);
  let nativeRows = definitions.filter((row) => row.languageId === nativeLanguageId);
  if (posKey) {
    const matching = nativeRows.filter((row) => normalizePosKey(row.partOfSpeech) === posKey);
    if (matching.length > 0) nativeRows = matching;
  }
  for (const row of nativeRows) {
    if (isUsableGloss(row.lemmaText)) return row.lemmaText!.trim();
    if (isUsableGloss(row.text)) return row.text.trim();
  }
  return null;
}

function pickScopedEnglishDefinition(
  word: CardWithWord['word'],
  partOfSpeech: string | null,
): string {
  const fallback = word.definition?.trim() || '—';
  const posKey = normalizePosKey(partOfSpeech);
  const rows = word.definitions.filter((row) => isUsableGloss(row.text));
  if (posKey) {
    const matching = rows.filter((row) => normalizePosKey(row.partOfSpeech) === posKey);
    if (matching.length > 0) return matching[0]!.text.trim();
  }
  return rows[0]?.text.trim() || fallback;
}

export function buildMcqOptions(
  correct: string,
  distractorTexts: string[],
): { options: string[]; correctIndex: number } | null {
  const correctTrimmed = correct.trim();
  if (!correctTrimmed) return null;
  const correctNorm = normalizeMcqAnswerText(correctTrimmed);
  const uniqueDistractors: string[] = [];
  const seen = new Set<string>([correctNorm]);
  for (const distractor of distractorTexts) {
    const trimmed = distractor.trim();
    if (!trimmed || trimmed === '—') continue;
    const norm = normalizeMcqAnswerText(trimmed);
    if (seen.has(norm)) continue;
    seen.add(norm);
    uniqueDistractors.push(trimmed);
    if (uniqueDistractors.length >= 3) break;
  }
  if (uniqueDistractors.length < 3) return null;
  const options = shuffle([correctTrimmed, ...uniqueDistractors.slice(0, 3)]);
  const correctIndex = options.findIndex((opt) => normalizeMcqAnswerText(opt) === correctNorm);
  if (correctIndex < 0) return null;
  return { options, correctIndex };
}

export function wordRowFromCard(card: CardWithWord, nativeLanguageId: string | null): WordRow {
  const glossRows = card.word.definitions.map((row) => ({
    partOfSpeech: row.partOfSpeech,
  }));
  const partOfSpeech =
    card.word.partOfSpeech?.trim() ||
    card.word.definitions.find((row) => row.partOfSpeech.trim())?.partOfSpeech ||
    null;
  const translation = pickTranslation(card.word.definitions, nativeLanguageId, partOfSpeech);
  const definition = pickScopedEnglishDefinition(card.word, partOfSpeech);

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
  if (body.source === 'lesson' || body.source === 'mixed') {
    return `Lesson quiz (${poolSize} words)`;
  }
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

type QuestionTemplate =
  | 'definitionMcq'
  | 'reverseMcq'
  | 'cloze'
  | 'translationMcq'
  | 'pastSimpleMcq'
  | 'pastParticipleMcq';

export type GeneratedQuestion = {
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  correct: number | string;
  explanation: string;
  wordId: string;
  template?: QuestionTemplate;
};

type BuildQuestionOptions = {
  includeIrregularVerbDrills: boolean;
  relaxedDistractors?: boolean;
  synonymHintsByWordId?: Map<string, WordRow[]>;
};

export const MIN_QUIZ_QUESTION_RATIO = 0.8;

export function buildQuestions(
  pool: WordRow[],
  distractorPool: WordRow[],
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  options: BuildQuestionOptions,
): GeneratedQuestion[] {
  const ordered = pool.slice(0, count);
  let out = buildQuestionsPass(ordered, distractorPool, difficulty, options, false);
  if (out.length < count) {
    out = buildQuestionsPass(ordered, distractorPool, difficulty, options, true);
  }
  return out;
}

function buildQuestionsPass(
  ordered: WordRow[],
  distractorPool: WordRow[],
  difficulty: 'easy' | 'medium' | 'hard',
  options: BuildQuestionOptions,
  relaxedDistractors: boolean,
): GeneratedQuestion[] {
  const passOptions: BuildQuestionOptions = { ...options, relaxedDistractors };
  const out: GeneratedQuestion[] = [];
  ordered.forEach((word, index) => {
    const question = buildQuestionWithFallback(
      word,
      index,
      difficulty,
      distractorPool,
      passOptions,
    );
    if (question) out.push(question);
  });
  if (out.length === 0) {
    for (const word of ordered) {
      const fallback = buildSingle('definitionMcq', word, distractorPool, passOptions);
      if (fallback && isValidGeneratedQuestion(fallback)) {
        out.push(fallback);
        break;
      }
    }
  }
  return out;
}

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
    if (question && isValidGeneratedQuestion(question)) return question;
  }
  const fallback = buildSingle('definitionMcq', word, pool, options);
  return fallback && isValidGeneratedQuestion(fallback) ? fallback : null;
}

function isValidGeneratedQuestion(question: GeneratedQuestion): boolean {
  return validateGeneratedQuestion({
    type: question.type,
    question: question.question,
    options: question.options,
    correct: question.correct,
    template: question.template,
  });
}

export function buildSingle(
  template: QuestionTemplate,
  word: WordRow,
  pool: WordRow[],
  options: BuildQuestionOptions,
): GeneratedQuestion | null {
  if (template === 'definitionMcq') {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.definition, {
      relaxed: options.relaxedDistractors,
      excludeAnswer: word.definition,
    });
    const built = buildMcqOptions(
      word.definition,
      distractors.map((row) => row.definition),
    );
    if (!built) return null;
    return {
      type: 'multiple-choice',
      question: `Choose the correct definition for "${word.text}":`,
      options: built.options,
      correct: built.correctIndex,
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
      template: 'definitionMcq',
    };
  }
  if (template === 'reverseMcq') {
    const distractors = pickDistractors(pool, word, (candidate) => candidate.text, {
      relaxed: options.relaxedDistractors,
      excludeAnswer: word.text,
    });
    const built = buildMcqOptions(
      word.text,
      distractors.map((row) => row.text),
    );
    if (!built) return null;
    return {
      type: 'multiple-choice',
      question: `Which word matches: "${word.definition}"?`,
      options: built.options,
      correct: built.correctIndex,
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
      template: 'reverseMcq',
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
      template: 'cloze',
    };
  }
  if (template === 'translationMcq' && word.translation) {
    if (!isEnglishLemmaForQuiz(word.text)) return null;
    if (normalizeMcqAnswerText(word.text) === normalizeMcqAnswerText(word.translation)) {
      return null;
    }
    const englishPool = pool.filter((candidate) => isEnglishLemmaForQuiz(candidate.text));
    const synonymHints =
      options.synonymHintsByWordId?.get(word.id)?.filter((row) => isEnglishLemmaForQuiz(row.text)) ??
      [];
    const distractors = pickDistractors(englishPool, word, (candidate) => candidate.text, {
      relaxed: options.relaxedDistractors,
      excludeAnswer: word.text,
      preferred: synonymHints,
    });
    const built = buildMcqOptions(
      word.text,
      distractors.map((row) => row.text),
    );
    if (!built) return null;
    return {
      type: 'multiple-choice',
      question: `Which word matches the translation "${word.translation}"?`,
      options: built.options,
      correct: built.correctIndex,
      explanation: word.example ? `Example: ${word.example}` : `Definition: ${word.definition}`,
      wordId: word.id,
      template: 'translationMcq',
    };
  }
  if (template === 'pastSimpleMcq' && word.verbForms) {
    const correct = word.verbForms.pastSimple;
    const distractors = pickIrregularFormDistractors(pool, word, 'pastSimple');
    const built = buildMcqOptions(correct, distractors);
    if (!built) return null;
    return {
      type: 'multiple-choice',
      question: `What is the past tense of "${word.text}"?`,
      options: built.options,
      correct: built.correctIndex,
      explanation: `Past participle: ${word.verbForms.pastParticiple}`,
      wordId: word.id,
      template: 'pastSimpleMcq',
    };
  }
  if (template === 'pastParticipleMcq' && word.verbForms) {
    const correct = word.verbForms.pastParticiple;
    const distractors = pickIrregularFormDistractors(pool, word, 'pastParticiple');
    const built = buildMcqOptions(correct, distractors);
    if (!built) return null;
    return {
      type: 'multiple-choice',
      question: `What is the past participle of "${word.text}"?`,
      options: built.options,
      correct: built.correctIndex,
      explanation: `Past tense: ${word.verbForms.pastSimple}`,
      wordId: word.id,
      template: 'pastParticipleMcq',
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

type PickDistractorOptions = {
  relaxed?: boolean;
  excludeAnswer?: string;
  preferred?: WordRow[];
};

export function pickDistractors(
  pool: WordRow[],
  word: WordRow,
  selector: (row: WordRow) => string,
  pickOptions?: PickDistractorOptions,
): WordRow[] {
  const excludeNorm = pickOptions?.excludeAnswer
    ? normalizeMcqAnswerText(pickOptions.excludeAnswer)
    : null;
  const isCandidate = (candidate: WordRow) => {
    if (candidate.id === word.id) return false;
    const text = selector(candidate).trim();
    if (!text || text === '—') return false;
    if (excludeNorm && normalizeMcqAnswerText(text) === excludeNorm) return false;
    return true;
  };
  const preferred = (pickOptions?.preferred ?? []).filter(isCandidate);
  const samePos = pool.filter(
    (candidate) => isCandidate(candidate) && candidate.partOfSpeech === word.partOfSpeech,
  );
  const fallback = pool.filter((candidate) => isCandidate(candidate));
  if (pickOptions?.relaxed) {
    return shuffle(dedupeWordRows([...preferred, ...samePos, ...fallback]));
  }
  const sameCategory = pool.filter(
    (candidate) =>
      isCandidate(candidate) &&
      word.category &&
      candidate.category === word.category,
  );
  const merged = dedupeWordRows([...preferred, ...sameCategory, ...samePos, ...fallback]);
  return shuffle(merged);
}

export function dedupeWordRows(items: WordRow[]): WordRow[] {
  return dedupeById(items);
}

