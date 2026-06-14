/** Daily learning goals: four fixed activity slots with hash-based variant per user/day (UTC). */

import {
  deepPracticeGoalVariants,
  quizGoalVariants,
  speakingGoalVariants,
  vocabularyGoalVariants,
} from './daily-goal-variant-pools';

export type GoalDifficulty = 1 | 2 | 3 | 4;

export type GoalKind = 'vocabulary' | 'quiz' | 'speaking' | 'deep_practice';

export type PartOfSpeechGoal = 'adjective' | 'noun' | 'verb' | 'adverb';

export type VocabularyCriteria =
  | { mode: 'cards'; targetCards: number }
  | { mode: 'minutes'; targetMinutes: number }
  | { mode: 'add_words'; targetWords: number }
  | { mode: 'add_from_lesson'; targetWords: number }
  | { mode: 'add_part_of_speech'; partOfSpeech: PartOfSpeechGoal; targetWords: number }
  | { mode: 'review_mistakes'; targetCards: number }
  | { mode: 'review_new'; targetCards: number }
  | { mode: 'review_learned'; targetCards: number }
  | { mode: 'mark_learned'; targetWords: number };

export type QuizCriteria =
  | { mode: 'finish_one' }
  | { mode: 'finish_count'; targetQuizzes: number }
  | { mode: 'score'; minScorePercent: number }
  | { mode: 'questions'; minQuestions: number }
  | { mode: 'perfect' };

export type SpeakingCriteria =
  | { mode: 'submission' }
  | { mode: 'submissions'; targetCount: number }
  | { mode: 'minutes'; targetMinutes: number };

export type DeepPracticeCriteria =
  | { mode: 'total_minutes'; targetMinutes: number }
  | { mode: 'lesson' }
  | { mode: 'games_minutes'; targetMinutes: number };

export type GoalCriteria =
  | VocabularyCriteria
  | QuizCriteria
  | SpeakingCriteria
  | DeepPracticeCriteria;

export type GoalVariant = {
  id: string;
  text: string;
  criteria: GoalCriteria;
  /** Overrides the slot default when the CTA should differ (e.g. add words → /vocabulary). */
  actionPath?: string;
};

export type GoalDefinition = {
  kind: GoalKind;
  difficulty: GoalDifficulty;
  actionPath: string;
  variants: GoalVariant[];
};

export const GOAL_ACTION_PATHS: Record<GoalKind, string> = {
  vocabulary: '/vocabulary/play',
  quiz: '/quiz',
  speaking: '/practice/speaking',
  deep_practice: '/practice',
};

export const GOAL_TIER_LABELS: Record<GoalDifficulty, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
  4: 'Expert',
};

export const goalDefinitions: GoalDefinition[] = [
  {
    kind: 'vocabulary',
    difficulty: 1,
    actionPath: GOAL_ACTION_PATHS.vocabulary,
    variants: vocabularyGoalVariants,
  },
  {
    kind: 'quiz',
    difficulty: 2,
    actionPath: GOAL_ACTION_PATHS.quiz,
    variants: quizGoalVariants,
  },
  {
    kind: 'speaking',
    difficulty: 3,
    actionPath: GOAL_ACTION_PATHS.speaking,
    variants: speakingGoalVariants,
  },
  {
    kind: 'deep_practice',
    difficulty: 4,
    actionPath: GOAL_ACTION_PATHS.deep_practice,
    variants: deepPracticeGoalVariants,
  },
];

export type DailyGoalInstance = {
  id: string;
  templateId: string;
  kind: GoalKind;
  text: string;
  difficulty: GoalDifficulty;
  criteria: GoalCriteria;
  actionPath: string;
};

export type DailyGoalDto = {
  id: string;
  templateId: string;
  kind: GoalKind;
  text: string;
  difficulty: GoalDifficulty;
  done: boolean;
  progressCurrent: number;
  progressTarget: number;
  progressLabel: string;
  actionPath: string;
  dateKey: string;
};

function hashToUInt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function defaultGoalDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildDailyGoalId(variantId: string, dateKey: string): string {
  return `${variantId}-${dateKey}`;
}

export function parseDailyGoalId(goalId: string): { templateId: string; dateKey: string } | null {
  const dateKey = goalId.slice(-10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const templateId = goalId.slice(0, -11);
  if (!templateId) return null;
  return { templateId, dateKey };
}

export function findGoalVariant(variantId: string): { definition: GoalDefinition; variant: GoalVariant } | null {
  for (const definition of goalDefinitions) {
    const variant = definition.variants.find((v) => v.id === variantId);
    if (variant) return { definition, variant };
  }
  return null;
}

/** Four goals per day: one variant per difficulty tier (1–4). */
export function getDailyGoalsForUser(
  userId: string,
  dateKey: string = defaultGoalDateKey(),
): DailyGoalInstance[] {
  return goalDefinitions.map((definition) => {
    const pool = definition.variants;
    const pick = pool[hashToUInt(`${userId}|${dateKey}|${definition.difficulty}`) % pool.length]!;
    return {
      id: buildDailyGoalId(pick.id, dateKey),
      templateId: pick.id,
      kind: definition.kind,
      text: pick.text,
      difficulty: definition.difficulty,
      criteria: pick.criteria,
      actionPath: pick.actionPath ?? definition.actionPath,
    };
  });
}

export function utcDayRange(dateKey: string): { from: Date; to: Date } {
  const from = new Date(`${dateKey}T00:00:00.000Z`);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);
  return { from, to };
}
