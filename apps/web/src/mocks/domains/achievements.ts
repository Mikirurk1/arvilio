/**
 * Achievement catalog (rules + stable ids). Per-user progress stores `unlockedAchievementIds`
 * on `ProfileStats`; counters live on each `MockUser.stats` in `domains/entities.ts`.
 */
export type ProfileStats = {
  wordsLearned: number;
  lessonsCompleted: number;
  streakDays: number;
  quizzesCompleted: number;
  perfectQuizCount: number;
  speakingSessions: number;
  /** Total minutes spent in practice activities (vocabulary/quiz/speaking/etc.). */
  practiceMinutesTotal: number;
  /** Total minutes spent in lesson sessions. */
  lessonMinutesTotal: number;
  /** Completed daily/weekly goals in the current tracking window (mock). */
  weeklyGoalsCompleted: number;
  /** Achievement rule ids the user has collected. */
  unlockedAchievementIds: string[];
};

export const emptyProfileStats: ProfileStats = {
  wordsLearned: 0,
  lessonsCompleted: 0,
  streakDays: 0,
  quizzesCompleted: 0,
  perfectQuizCount: 0,
  speakingSessions: 0,
  practiceMinutesTotal: 0,
  lessonMinutesTotal: 0,
  weeklyGoalsCompleted: 0,
  unlockedAchievementIds: [],
};

export type AchievementIconKey =
  | 'sparkles'
  | 'graduation-cap'
  | 'calendar-check'
  | 'flame'
  | 'book-open'
  | 'brain'
  | 'messages-square'
  | 'mic'
  | 'target'
  | 'badge-check'
  | 'star'
  | 'rocket'
  | 'trophy'
  | 'crown'
  | 'mountain'
  | 'gem';

export type ProfileAchievement = {
  icon: AchievementIconKey;
  label: string;
  description: string;
  unlocked: boolean;
};

type AchievementRule = {
  id: string;
  icon: AchievementIconKey;
  label: string;
  description: string;
  isUnlocked: (stats: ProfileStats) => boolean;
};

const profileAchievementRules: readonly AchievementRule[] = [
  {
    id: 'ach_welcome_aboard',
    icon: 'sparkles',
    label: 'Welcome Aboard',
    description: 'Open your profile for the first time.',
    isUnlocked: () => true,
  },
  {
    id: 'ach_first_lesson',
    icon: 'graduation-cap',
    label: 'First Lesson',
    description: 'Complete your first lesson.',
    isUnlocked: (stats) => stats.lessonsCompleted >= 1,
  },
  {
    id: 'ach_10_lessons',
    icon: 'calendar-check',
    label: '10 Lessons Done',
    description: 'Complete 10 lessons.',
    isUnlocked: (stats) => stats.lessonsCompleted >= 10,
  },
  {
    id: 'ach_25_lessons',
    icon: 'calendar-check',
    label: '25 Lessons Done',
    description: 'Complete 25 lessons.',
    isUnlocked: (stats) => stats.lessonsCompleted >= 25,
  },
  {
    id: 'ach_streak_7',
    icon: 'flame',
    label: '7-Day Streak',
    description: 'Keep a 7-day learning streak.',
    isUnlocked: (stats) => stats.streakDays >= 7,
  },
  {
    id: 'ach_streak_14',
    icon: 'flame',
    label: '14-Day Streak',
    description: 'Keep a 14-day learning streak.',
    isUnlocked: (stats) => stats.streakDays >= 14,
  },
  {
    id: 'ach_streak_21',
    icon: 'mountain',
    label: '21-Day Streak',
    description: 'Keep a 21-day learning streak.',
    isUnlocked: (stats) => stats.streakDays >= 21,
  },
  {
    id: 'ach_streak_30',
    icon: 'mountain',
    label: '30-Day Streak',
    description: 'Keep a 30-day learning streak.',
    isUnlocked: (stats) => stats.streakDays >= 30,
  },
  {
    id: 'ach_words_100',
    icon: 'book-open',
    label: '100 Words',
    description: 'Learn 100 words.',
    isUnlocked: (stats) => stats.wordsLearned >= 100,
  },
  {
    id: 'ach_words_250',
    icon: 'book-open',
    label: '250 Words',
    description: 'Learn 250 words.',
    isUnlocked: (stats) => stats.wordsLearned >= 250,
  },
  {
    id: 'ach_words_500',
    icon: 'book-open',
    label: '500 Words',
    description: 'Learn 500 words.',
    isUnlocked: (stats) => stats.wordsLearned >= 500,
  },
  {
    id: 'ach_words_1000',
    icon: 'brain',
    label: '1000 Words',
    description: 'Learn 1000 words.',
    isUnlocked: (stats) => stats.wordsLearned >= 1000,
  },
  {
    id: 'ach_words_1500',
    icon: 'book-open',
    label: 'Word Collector',
    description: 'Learn 1500 words.',
    isUnlocked: (stats) => stats.wordsLearned >= 1500,
  },
  {
    id: 'ach_first_quiz',
    icon: 'target',
    label: 'First Quiz',
    description: 'Complete your first quiz.',
    isUnlocked: (stats) => stats.quizzesCompleted >= 1,
  },
  {
    id: 'ach_quizzes_5',
    icon: 'target',
    label: '5 Quizzes',
    description: 'Complete 5 quizzes.',
    isUnlocked: (stats) => stats.quizzesCompleted >= 5,
  },
  {
    id: 'ach_quizzes_10',
    icon: 'badge-check',
    label: '10 Quizzes',
    description: 'Complete 10 quizzes.',
    isUnlocked: (stats) => stats.quizzesCompleted >= 10,
  },
  {
    id: 'ach_quizzes_25',
    icon: 'target',
    label: 'Quiz Marathon',
    description: 'Complete 25 quizzes.',
    isUnlocked: (stats) => stats.quizzesCompleted >= 25,
  },
  {
    id: 'ach_perfect_quiz_1',
    icon: 'trophy',
    label: '100% Quiz',
    description: 'Get one perfect quiz score.',
    isUnlocked: (stats) => stats.perfectQuizCount >= 1,
  },
  {
    id: 'ach_perfect_quiz_3',
    icon: 'trophy',
    label: 'Perfect Trio',
    description: 'Get 3 perfect quiz scores.',
    isUnlocked: (stats) => stats.perfectQuizCount >= 3,
  },
  {
    id: 'ach_perfect_quiz_5',
    icon: 'trophy',
    label: 'Perfect 5',
    description: 'Get 5 perfect quiz scores.',
    isUnlocked: (stats) => stats.perfectQuizCount >= 5,
  },
  {
    id: 'ach_speaking_3',
    icon: 'messages-square',
    label: 'Conversation Starter',
    description: 'Complete 3 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 3,
  },
  {
    id: 'ach_speaking_5',
    icon: 'messages-square',
    label: 'Conversation Buddy',
    description: 'Complete 5 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 5,
  },
  {
    id: 'ach_speaking_10',
    icon: 'mic',
    label: 'Speaking Pro',
    description: 'Complete 10 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 10,
  },
  {
    id: 'ach_speaking_20',
    icon: 'mic',
    label: 'Speaking Star',
    description: 'Complete 20 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 20,
  },
  {
    id: 'ach_speaking_30',
    icon: 'mic',
    label: 'Speaking Master',
    description: 'Complete 30 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 30,
  },
  {
    id: 'ach_lessons_30',
    icon: 'rocket',
    label: '30 Lessons Done',
    description: 'Complete 30 lessons.',
    isUnlocked: (stats) => stats.lessonsCompleted >= 30,
  },
  {
    id: 'ach_lessons_75',
    icon: 'rocket',
    label: '75 Lessons Done',
    description: 'Complete 75 lessons.',
    isUnlocked: (stats) => stats.lessonsCompleted >= 75,
  },
  {
    id: 'ach_quizzes_40',
    icon: 'crown',
    label: 'Quiz Expert',
    description: 'Complete 40 quizzes.',
    isUnlocked: (stats) => stats.quizzesCompleted >= 40,
  },
  {
    id: 'ach_perfect_quiz_10',
    icon: 'crown',
    label: 'Perfect Streak',
    description: 'Get 10 perfect quiz scores.',
    isUnlocked: (stats) => stats.perfectQuizCount >= 10,
  },
  {
    id: 'ach_consistency_master',
    icon: 'star',
    label: 'Consistency Master',
    description: 'Complete 25 lessons and keep a 14-day streak.',
    isUnlocked: (stats) =>
      stats.lessonsCompleted >= 25 && stats.streakDays >= 14,
  },
  {
    id: 'ach_lessons_50',
    icon: 'calendar-check',
    label: '50 Lessons Done',
    description: 'Complete 50 lessons.',
    isUnlocked: (stats) => stats.lessonsCompleted >= 50,
  },
  {
    id: 'ach_elite_learner',
    icon: 'gem',
    label: 'Elite Learner',
    description: 'Learn 1000 words and complete 50 lessons.',
    isUnlocked: (stats) =>
      stats.wordsLearned >= 1000 && stats.lessonsCompleted >= 50,
  },
];

/** Derive collected achievement ids from counters (for seeding mocks). */
export function computeUnlockedAchievementIdsFromCounters(
  counters: Omit<ProfileStats, 'unlockedAchievementIds'>,
): string[] {
  const synthetic: ProfileStats = {
    ...counters,
    unlockedAchievementIds: [],
  };
  return profileAchievementRules.filter((r) => r.isUnlocked(synthetic)).map((r) => r.id);
}

export function buildProfileAchievements(stats: ProfileStats): ProfileAchievement[] {
  return profileAchievementRules.map((rule) => ({
    icon: rule.icon,
    label: rule.label,
    description: rule.description,
    unlocked: stats.unlockedAchievementIds.includes(rule.id),
  }));
}
