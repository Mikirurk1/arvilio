/** Daily learning goals: template bank + deterministic pick per user/day (UTC date key). */

export type GoalDifficulty = 1 | 2 | 3 | 4;

export type GoalTemplate = {
  id: string;
  text: string;
  difficulty: GoalDifficulty;
};

export const GOAL_XP_BY_DIFFICULTY: Record<GoalDifficulty, number> = {
  1: 20,
  2: 30,
  3: 40,
  4: 50,
};

export const goalTemplates: GoalTemplate[] = [
  { id: 'g1-a', difficulty: 1, text: 'Review 5 vocabulary flashcards' },
  { id: 'g1-b', difficulty: 1, text: 'Listen to one short English podcast clip (5 min)' },
  { id: 'g1-c', difficulty: 1, text: 'Write 3 sentences using words from last lesson' },
  { id: 'g1-d', difficulty: 1, text: 'Read one news headline aloud for pronunciation' },
  { id: 'g1-e', difficulty: 1, text: 'Match 6 words to pictures in the vocabulary app' },
  { id: 'g2-a', difficulty: 2, text: 'Complete one grammar exercise set (10 questions)' },
  { id: 'g2-b', difficulty: 2, text: 'Shadow a 2-minute dialogue from your course audio' },
  { id: 'g2-c', difficulty: 2, text: 'Summarize a short article in 4 bullet points in English' },
  { id: 'g2-d', difficulty: 2, text: 'Practice 15 quiz questions on mixed tenses' },
  { id: 'g2-e', difficulty: 2, text: 'Record a 1-minute intro about your week in English' },
  { id: 'g3-a', difficulty: 3, text: 'Draft an email to a colleague (120+ words)' },
  { id: 'g3-b', difficulty: 3, text: 'Participate in a 15-minute speaking session or mock interview' },
  { id: 'g3-c', difficulty: 3, text: 'Watch a talk without subtitles and note 8 keywords' },
  { id: 'g3-d', difficulty: 3, text: 'Write a short paragraph arguing one side of a debate topic' },
  { id: 'g3-e', difficulty: 3, text: 'Redo yesterday’s quiz until you score at least 80%' },
  { id: 'g4-a', difficulty: 4, text: 'Deliver a 5-minute spoken mini-presentation and self-review' },
  { id: 'g4-b', difficulty: 4, text: 'Complete a full mock exam section under timed conditions' },
  { id: 'g4-c', difficulty: 4, text: 'Peer-review and rewrite a complex text for clarity' },
  { id: 'g4-d', difficulty: 4, text: 'Research + present pros/cons of a topic in structured notes' },
  { id: 'g4-e', difficulty: 4, text: 'Transcribe a 3-minute native clip and compare your pronunciation' },
];

export type DailyGoalInstance = {
  id: string;
  templateId: string;
  text: string;
  difficulty: GoalDifficulty;
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

export function buildDailyGoalId(templateId: string, dateKey: string): string {
  return `${templateId}-${dateKey}`;
}

export function parseDailyGoalId(goalId: string): { templateId: string; dateKey: string } | null {
  const dateKey = goalId.slice(-10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const templateId = goalId.slice(0, -11);
  if (!templateId) return null;
  return { templateId, dateKey };
}

/** Four goals per day: one template per difficulty tier (1–4). */
export function getDailyGoalsForUser(
  userId: string,
  dateKey: string = defaultGoalDateKey(),
): DailyGoalInstance[] {
  const tiers = [1, 2, 3, 4] as const;
  return tiers.map((difficulty) => {
    const pool = goalTemplates.filter((t) => t.difficulty === difficulty);
    const pick =
      pool.length > 0
        ? pool[hashToUInt(`${userId}|${dateKey}|${difficulty}`) % pool.length]
        : goalTemplates[0];
    return {
      id: buildDailyGoalId(pick.id, dateKey),
      templateId: pick.id,
      text: pick.text,
      difficulty,
    };
  });
}
