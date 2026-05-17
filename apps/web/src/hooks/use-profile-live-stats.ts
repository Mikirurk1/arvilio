'use client';

import { useEffect, useMemo } from 'react';
import { buildLiveProfileStats, formatLessonHours, sumCompletedLessonMinutes } from '../lib/profile-live-stats';
import { useDashboardStore } from '../stores/dashboard-store';
import { useLessonsStore } from '../stores/lessons-store';
import { useVocabularyStore } from '../stores/vocabulary-store';
import { useActiveRoleKey } from '../lib/active-user';

export function useProfileLiveStats() {
  const roleKey = useActiveRoleKey();
  const summarySlice = useDashboardStore((s) => s.summary);
  const overviewSlice = useVocabularyStore((s) => s.overview);
  const lessonsSlice = useLessonsStore((s) => s.backendLessons);
  const fetchSummary = useDashboardStore((s) => s.fetchSummary);
  const fetchOverview = useVocabularyStore((s) => s.fetchOverview);
  const fetchLessons = useLessonsStore((s) => s.fetchScheduledLessons);

  useEffect(() => {
    void fetchSummary(true);
    void fetchLessons(true);
    if (roleKey === 'student') {
      void fetchOverview(true);
    }
  }, [fetchLessons, fetchOverview, fetchSummary, roleKey]);

  const loading =
    summarySlice.status === 'loading' ||
    summarySlice.status === 'idle' ||
    lessonsSlice.status === 'loading' ||
    lessonsSlice.status === 'idle' ||
    (roleKey === 'student' &&
      (overviewSlice.status === 'loading' || overviewSlice.status === 'idle'));

  const error =
    summarySlice.status === 'error'
      ? summarySlice.error
      : lessonsSlice.status === 'error'
        ? lessonsSlice.error
        : roleKey === 'student' && overviewSlice.status === 'error'
          ? overviewSlice.error
          : null;

  const lessonMinutes = useMemo(
    () => sumCompletedLessonMinutes(lessonsSlice.data),
    [lessonsSlice.data],
  );

  const profileStats = useMemo(
    () =>
      buildLiveProfileStats(summarySlice.data, overviewSlice.data, lessonsSlice.data),
    [lessonsSlice.data, overviewSlice.data, summarySlice.data],
  );

  return {
    loading,
    error,
    summary: summarySlice.data,
    overview: overviewSlice.data,
    lessonHoursLabel: formatLessonHours(lessonMinutes),
    profileStats,
    isStudent: roleKey === 'student',
  };
}
