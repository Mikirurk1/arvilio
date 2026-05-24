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
  const cardsSlice = useVocabularyStore((s) => s.cards);
  const fetchSummary = useDashboardStore((s) => s.fetchSummary);
  const fetchOverview = useVocabularyStore((s) => s.fetchOverview);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const fetchLessons = useLessonsStore((s) => s.fetchScheduledLessons);

  useEffect(() => {
    void fetchSummary(true);
    void fetchLessons(true);
    if (roleKey === 'student') {
      void fetchOverview(true);
      void fetchCards(undefined, true);
    }
  }, [fetchCards, fetchLessons, fetchOverview, fetchSummary, roleKey]);

  const loading =
    summarySlice.status === 'loading' ||
    summarySlice.status === 'idle' ||
    lessonsSlice.status === 'loading' ||
    lessonsSlice.status === 'idle' ||
    (roleKey === 'student' &&
      (overviewSlice.status === 'loading' ||
        overviewSlice.status === 'idle' ||
        cardsSlice.status === 'loading' ||
        cardsSlice.status === 'idle'));

  const error =
    summarySlice.status === 'error'
      ? summarySlice.error
      : lessonsSlice.status === 'error'
        ? lessonsSlice.error
        : roleKey === 'student' && overviewSlice.status === 'error'
          ? overviewSlice.error
          : roleKey === 'student' && cardsSlice.status === 'error'
            ? cardsSlice.error
            : null;

  const lessonMinutes = useMemo(
    () => sumCompletedLessonMinutes(lessonsSlice.data ?? undefined),
    [lessonsSlice.data],
  );

  const profileStats = useMemo(
    () =>
      buildLiveProfileStats(
        summarySlice.data ?? undefined,
        overviewSlice.data ?? undefined,
        lessonsSlice.data ?? undefined,
      ),
    [lessonsSlice.data, overviewSlice.data, summarySlice.data],
  );

  const cards = roleKey === 'student' ? (cardsSlice.data ?? []) : [];

  return {
    loading,
    error,
    summary: summarySlice.data,
    overview: overviewSlice.data,
    lessons: lessonsSlice.data ?? [],
    cards,
    lessonHoursLabel: formatLessonHours(lessonMinutes),
    profileStats,
    isStudent: roleKey === 'student',
  };
}
