import type {
  AchievementIconKey,
  AchievementStatsDto,
} from '@pkg/types';
import {
  ACHIEVEMENT_DEFINITIONS,
  EMPTY_ACHIEVEMENT_STATS,
  computeUnlockedAchievementIds,
} from '@pkg/types';

export type ProfileStats = AchievementStatsDto;
export const emptyProfileStats: ProfileStats = EMPTY_ACHIEVEMENT_STATS;

export type ProfileAchievement = {
  icon: AchievementIconKey;
  label: string;
  description: string;
  unlocked: boolean;
};

export type AchievementUnlockContext = {
  profileComplete?: boolean;
};

/** Derive collected achievement ids from counters (for seeding mocks). */
export function computeUnlockedAchievementIdsFromCounters(
  counters: Omit<ProfileStats, 'unlockedAchievementIds'>,
  context?: AchievementUnlockContext,
): string[] {
  return computeUnlockedAchievementIds(counters, context);
}

export function buildProfileAchievements(
  stats: ProfileStats,
  context?: AchievementUnlockContext,
): ProfileAchievement[] {
  const unlockedIds =
    stats.unlockedAchievementIds.length > 0
      ? stats.unlockedAchievementIds
      : computeUnlockedAchievementIdsFromCounters(
          {
            wordsLearned: stats.wordsLearned,
            lessonsCompleted: stats.lessonsCompleted,
            streakDays: stats.streakDays,
            quizzesCompleted: stats.quizzesCompleted,
            perfectQuizCount: stats.perfectQuizCount,
            speakingSessions: stats.speakingSessions,
            practiceMinutesTotal: stats.practiceMinutesTotal,
            lessonMinutesTotal: stats.lessonMinutesTotal,
            weeklyGoalsCompleted: stats.weeklyGoalsCompleted,
          },
          context,
        );

  return ACHIEVEMENT_DEFINITIONS.map((rule) => ({
    icon: rule.icon,
    label: rule.label,
    description: rule.description,
    unlocked: unlockedIds.includes(rule.id),
  }));
}
