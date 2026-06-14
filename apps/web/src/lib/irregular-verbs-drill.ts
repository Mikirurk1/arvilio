import type { IrregularVerbEntry, IrregularVerbTier } from '@pkg/types';
import { listIrregularVerbs } from '@pkg/types';

export type IrregularVerbFormFocus = 'mixed' | 'pastSimple' | 'pastParticiple';

export type IrregularVerbQuestionCount = 10 | 20 | 30 | 'all';

export type IrregularVerbFormType = 'pastSimple' | 'pastParticiple';

export type IrregularVerbDrillQuestion = {
  id: string;
  base: string;
  formType: IrregularVerbFormType;
  prompt: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
  revealLine: string;
  explanation: string;
};

export type IrregularVerbDrillReviewItem = {
  questionId: string;
  prompt: string;
  explanation: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  revealLine: string;
};

export type IrregularVerbDrillResult = {
  score: number;
  correctCount: number;
  totalCount: number;
  review: IrregularVerbDrillReviewItem[];
};

export type BuildIrregularVerbDrillOptions = {
  tier: IrregularVerbTier;
  formFocus: IrregularVerbFormFocus;
  questionCount: IrregularVerbQuestionCount;
};

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function normalizeOption(value: string): string {
  return value.trim().toLowerCase();
}

function formLabel(formType: IrregularVerbFormType): string {
  return formType === 'pastSimple' ? 'past simple' : 'past participle';
}

function correctForm(entry: IrregularVerbEntry, formType: IrregularVerbFormType): string {
  return formType === 'pastSimple' ? entry.pastSimple : entry.pastParticiple;
}

function pickFormType(focus: IrregularVerbFormFocus, seed: number): IrregularVerbFormType {
  if (focus === 'pastSimple') return 'pastSimple';
  if (focus === 'pastParticiple') return 'pastParticiple';
  return seed % 2 === 0 ? 'pastSimple' : 'pastParticiple';
}

export function pickIrregularFormDistractors(
  pool: readonly IrregularVerbEntry[],
  entry: IrregularVerbEntry,
  formType: IrregularVerbFormType,
): string[] {
  const correct = correctForm(entry, formType);
  const values = pool
    .filter((candidate) => candidate.base !== entry.base)
    .map((candidate) => correctForm(candidate, formType))
    .filter((value) => value && normalizeOption(value) !== normalizeOption(correct));

  const unique = [...new Set(values)];
  return shuffle(unique).slice(0, 3);
}

export function buildMcqOptions(correct: string, distractors: string[]): string[] | null {
  const seen = new Set<string>();
  const options: string[] = [];

  const pushUnique = (value: string) => {
    const key = normalizeOption(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push(value);
  };

  pushUnique(correct);
  for (const distractor of distractors) {
    pushUnique(distractor);
    if (options.length >= 4) break;
  }

  if (options.length < 4) return null;
  return shuffle(options.slice(0, 4));
}

export function resolveQuestionCount(
  _tier: IrregularVerbTier,
  requested: IrregularVerbQuestionCount,
  poolSize: number,
): number {
  if (requested === 'all') {
    return poolSize;
  }
  return Math.min(requested, poolSize);
}

export function availableQuestionCounts(tier: IrregularVerbTier): IrregularVerbQuestionCount[] {
  if (tier === 'common') return [10, 20, 'all'];
  return [10, 20, 30];
}

export function formatRevealLine(entry: IrregularVerbEntry): string {
  return `${entry.base} → ${entry.pastSimple} → ${entry.pastParticiple}`;
}

export function buildIrregularVerbQuestions(
  options: BuildIrregularVerbDrillOptions,
): IrregularVerbDrillQuestion[] {
  const pool = listIrregularVerbs(options.tier === 'common' ? 'common' : 'extended');
  if (pool.length < 4) return [];

  const maxUnique = pool.length * 2;
  const targetCount = resolveQuestionCount(options.tier, options.questionCount, maxUnique);
  const shuffledEntries = shuffle([...pool]);
  const slots: Array<{ entry: IrregularVerbEntry; formType: IrregularVerbFormType }> = [];

  for (let round = 0; slots.length < targetCount && round < shuffledEntries.length * 2; round += 1) {
    const entry = shuffledEntries[round % shuffledEntries.length];
    const formType = pickFormType(options.formFocus, round);
    const key = `${entry.base}:${formType}`;
    if (slots.some((slot) => `${slot.entry.base}:${slot.formType}` === key)) continue;
    slots.push({ entry, formType });
  }

  const questions: IrregularVerbDrillQuestion[] = [];

  for (const slot of slots) {
    const { entry, formType } = slot;
    const correctAnswer = correctForm(entry, formType);
    const distractors = pickIrregularFormDistractors(pool, entry, formType);
    const built = buildMcqOptions(correctAnswer, distractors);
    if (!built) continue;

    const correctIndex = built.findIndex(
      (option) => normalizeOption(option) === normalizeOption(correctAnswer),
    );
    if (correctIndex < 0) continue;

    const label = formLabel(formType);
    questions.push({
      id: `${entry.base}-${formType}-${questions.length}`,
      base: entry.base,
      formType,
      prompt: `What is the ${label} of "${entry.base}"?`,
      options: built,
      correctIndex,
      correctAnswer,
      revealLine: formatRevealLine(entry),
      explanation: `Full row: ${formatRevealLine(entry)}`,
    });

    if (questions.length >= targetCount) break;
  }

  return questions;
}

export function gradeIrregularVerbAnswer(
  question: IrregularVerbDrillQuestion,
  selectedIndex: number | null,
): boolean {
  if (selectedIndex === null) return false;
  return selectedIndex === question.correctIndex;
}

export function buildIrregularVerbDrillResult(
  questions: IrregularVerbDrillQuestion[],
  selectedByQuestionId: Record<string, number | null>,
): IrregularVerbDrillResult {
  const review: IrregularVerbDrillReviewItem[] = questions.map((question) => {
    const selectedIndex = selectedByQuestionId[question.id] ?? null;
    const isCorrect = gradeIrregularVerbAnswer(question, selectedIndex);
    const userAnswer =
      selectedIndex === null ? '—' : (question.options[selectedIndex] ?? '—');

    return {
      questionId: question.id,
      prompt: question.prompt,
      explanation: question.explanation,
      isCorrect,
      userAnswer,
      correctAnswer: question.correctAnswer,
      revealLine: question.revealLine,
    };
  });

  const correctCount = review.filter((item) => item.isCorrect).length;
  const totalCount = review.length;
  const score = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

  return { score, correctCount, totalCount, review };
}
