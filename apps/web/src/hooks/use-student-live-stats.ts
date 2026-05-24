'use client';

import { useEffect, useMemo } from 'react';
import {
  buildStudentDashboardSummary,
  buildStudentVocabularyOverview,
  filterLessonsForStudent,
} from '../lib/student-live-stats';
import { formatLessonHours, sumCompletedLessonMinutes } from '../lib/profile-live-stats';
import { useLessonsStore } from '../stores/lessons-store';
import { useVocabularyStore } from '../stores/vocabulary-store';

export function useStudentLiveStats(studentId: string | undefined) {
  const lessonsSlice = useLessonsStore((s) => s.backendLessons);
  const cardsSlice = useVocabularyStore((s) => s.cards);
  const fetchLessons = useLessonsStore((s) => s.fetchScheduledLessons);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);

  useEffect(() => {
    if (!studentId) return;
    void fetchLessons(true);
    void fetchCards(studentId, true);
  }, [fetchCards, fetchLessons, studentId]);

  const studentLessons = useMemo(
    () => (studentId ? filterLessonsForStudent(lessonsSlice.data, studentId) : []),
    [lessonsSlice.data, studentId],
  );

  const studentCards = useMemo(() => {
    if (!studentId) return [];
    if (cardsSlice.data && useVocabularyStore.getState().cardsStudentId === studentId) {
      return cardsSlice.data;
    }
    return [];
  }, [cardsSlice.data, studentId]);

  const loading =
    !studentId ||
    lessonsSlice.status === 'loading' ||
    lessonsSlice.status === 'idle' ||
    cardsSlice.status === 'loading' ||
    cardsSlice.status === 'idle';

  const error =
    lessonsSlice.status === 'error'
      ? lessonsSlice.error
      : cardsSlice.status === 'error'
        ? cardsSlice.error
        : null;

  const summary = useMemo(
    () => (studentId ? buildStudentDashboardSummary(studentLessons, studentCards) : null),
    [studentCards, studentId, studentLessons],
  );

  const overview = useMemo(() => buildStudentVocabularyOverview(studentCards), [studentCards]);

  const lessonMinutes = useMemo(() => sumCompletedLessonMinutes(studentLessons), [studentLessons]);

  return {
    loading,
    error,
    summary,
    overview,
    lessonHoursLabel: formatLessonHours(lessonMinutes),
    studentLessons,
    studentCards,
  };
}
