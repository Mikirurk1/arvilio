import type {
  DashboardSummaryDto,
  ScheduledLessonBackendDto,
  VocabularyOverviewDto,
} from '@soenglish/shared-types';
import type { ProfileStats } from '../mocks/domains/achievements';

export function sumCompletedLessonMinutes(
  lessons: ScheduledLessonBackendDto[] | undefined,
): number {
  if (!lessons?.length) return 0;
  return lessons
    .filter((lesson) => lesson.status === 'completed')
    .reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
}

export function formatLessonHours(minutes: number): string {
  if (minutes <= 0) return '0h';
  const hours = minutes / 60;
  return hours < 10 ? `${hours.toFixed(1)}h` : `${Math.round(hours)}h`;
}

/** Map backend slices to achievement counters (only fields we can source truthfully). */
export function buildLiveProfileStats(
  summary: DashboardSummaryDto | undefined,
  overview: VocabularyOverviewDto | undefined,
  lessons: ScheduledLessonBackendDto[] | undefined,
): ProfileStats {
  const lessonMinutes = sumCompletedLessonMinutes(lessons);
  return {
    wordsLearned: overview?.totalWords ?? summary?.vocabularyCount ?? 0,
    lessonsCompleted: summary?.lessonsCompleted ?? 0,
    streakDays: 0,
    quizzesCompleted: 0,
    perfectQuizCount: 0,
    speakingSessions: 0,
    practiceMinutesTotal: 0,
    lessonMinutesTotal: lessonMinutes,
    weeklyGoalsCompleted: 0,
    unlockedAchievementIds: [],
  };
}
