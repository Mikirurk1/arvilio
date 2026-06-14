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

export type AchievementStatsDto = {
  wordsLearned: number;
  lessonsCompleted: number;
  streakDays: number;
  quizzesCompleted: number;
  perfectQuizCount: number;
  speakingSessions: number;
  speakingSubmissions: number;
  speakingReviewsReceived: number;
  speakingMinutesTotal: number;
  gamesSessions: number;
  practiceMinutesTotal: number;
  lessonMinutesTotal: number;
  weeklyGoalsCompleted: number;
  unlockedAchievementIds: string[];
};

export type AchievementCountersDto = Omit<AchievementStatsDto, 'unlockedAchievementIds'>;

export type AchievementUnlockContextDto = {
  profileComplete?: boolean;
};

export type AchievementDefinitionDto = {
  id: string;
  icon: AchievementIconKey;
  label: string;
  description: string;
  isUnlocked: (
    stats: AchievementCountersDto,
    context?: AchievementUnlockContextDto,
  ) => boolean;
};

export const EMPTY_ACHIEVEMENT_STATS: AchievementStatsDto = {
  wordsLearned: 0,
  lessonsCompleted: 0,
  streakDays: 0,
  quizzesCompleted: 0,
  perfectQuizCount: 0,
  speakingSessions: 0,
  speakingSubmissions: 0,
  speakingReviewsReceived: 0,
  speakingMinutesTotal: 0,
  gamesSessions: 0,
  practiceMinutesTotal: 0,
  lessonMinutesTotal: 0,
  weeklyGoalsCompleted: 0,
  unlockedAchievementIds: [],
};

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinitionDto[] = [
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
    id: 'ach_speaking_1',
    icon: 'mic',
    label: 'First Voice',
    description: 'Complete your first speaking session.',
    isUnlocked: (stats) => stats.speakingSessions >= 1,
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
    id: 'ach_speaking_50',
    icon: 'messages-square',
    label: 'Speaking Champion',
    description: 'Complete 50 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 50,
  },
  {
    id: 'ach_speaking_75',
    icon: 'mic',
    label: 'Speaking Legend',
    description: 'Complete 75 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 75,
  },
  {
    id: 'ach_speaking_100',
    icon: 'crown',
    label: 'Speaking Icon',
    description: 'Complete 100 speaking sessions.',
    isUnlocked: (stats) => stats.speakingSessions >= 100,
  },
  {
    id: 'ach_speaking_record_1',
    icon: 'mic',
    label: 'First Recording',
    description: 'Submit your first speaking recording.',
    isUnlocked: (stats) => stats.speakingSubmissions >= 1,
  },
  {
    id: 'ach_speaking_record_5',
    icon: 'messages-square',
    label: 'Voice Regular',
    description: 'Submit 5 speaking recordings.',
    isUnlocked: (stats) => stats.speakingSubmissions >= 5,
  },
  {
    id: 'ach_speaking_record_10',
    icon: 'trophy',
    label: 'Voice Pro',
    description: 'Submit 10 speaking recordings.',
    isUnlocked: (stats) => stats.speakingSubmissions >= 10,
  },
  {
    id: 'ach_speaking_feedback_1',
    icon: 'star',
    label: "Teacher's Ear",
    description: 'Receive feedback on a speaking submission.',
    isUnlocked: (stats) => stats.speakingReviewsReceived >= 1,
  },
  {
    id: 'ach_speaking_feedback_5',
    icon: 'badge-check',
    label: 'Feedback Fan',
    description: 'Receive feedback on 5 speaking submissions.',
    isUnlocked: (stats) => stats.speakingReviewsReceived >= 5,
  },
  {
    id: 'ach_speaking_minutes_60',
    icon: 'star',
    label: 'Hour of Talk',
    description: 'Spend 60 minutes on speaking practice.',
    isUnlocked: (stats) => stats.speakingMinutesTotal >= 60,
  },
  {
    id: 'ach_irregular_first',
    icon: 'target',
    label: 'First Drill',
    description: 'Complete your first irregular verbs drill.',
    isUnlocked: (stats) => stats.gamesSessions >= 1,
  },
  {
    id: 'ach_irregular_drills_3',
    icon: 'target',
    label: 'Verb Starter',
    description: 'Complete 3 irregular verbs drills.',
    isUnlocked: (stats) => stats.gamesSessions >= 3,
  },
  {
    id: 'ach_irregular_drills_5',
    icon: 'target',
    label: 'Verb Buddy',
    description: 'Complete 5 irregular verbs drills.',
    isUnlocked: (stats) => stats.gamesSessions >= 5,
  },
  {
    id: 'ach_irregular_drills_10',
    icon: 'brain',
    label: 'Verb Pro',
    description: 'Complete 10 irregular verbs drills.',
    isUnlocked: (stats) => stats.gamesSessions >= 10,
  },
  {
    id: 'ach_irregular_drills_20',
    icon: 'trophy',
    label: 'Verb Star',
    description: 'Complete 20 irregular verbs drills.',
    isUnlocked: (stats) => stats.gamesSessions >= 20,
  },
  {
    id: 'ach_irregular_drills_30',
    icon: 'trophy',
    label: 'Verb Master',
    description: 'Complete 30 irregular verbs drills.',
    isUnlocked: (stats) => stats.gamesSessions >= 30,
  },
  {
    id: 'ach_irregular_drills_50',
    icon: 'crown',
    label: 'Irregular Legend',
    description: 'Complete 50 irregular verbs drills.',
    isUnlocked: (stats) => stats.gamesSessions >= 50,
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
  {
    id: 'ach_profile_complete',
    icon: 'badge-check',
    label: 'Profile Complete',
    description: 'Fill in every field on your profile, including avatar and bio.',
    isUnlocked: (_stats, context) => context?.profileComplete === true,
  },
] as const;

export function computeUnlockedAchievementIds(
  counters: AchievementCountersDto,
  context?: AchievementUnlockContextDto,
): string[] {
  return ACHIEVEMENT_DEFINITIONS.filter((rule) => rule.isUnlocked(counters, context)).map(
    (rule) => rule.id,
  );
}

