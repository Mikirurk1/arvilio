'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { useActiveRoleKey } from '../lib/active-user';
import {
  countIncompleteAssignedQuizzes,
  countIncompleteQuizzesFromList,
} from '../lib/practice-pending';
import { useQuizzesStore } from '../stores/quizzes-store';
import { useVocabularyStore } from '../stores/vocabulary-store';

export type PracticePendingCounts = {
  total: number;
  vocabPending: number;
  incompleteQuizzes: number;
};

function refreshQuizPendingData(
  userId: string,
  isStudent: boolean,
  fetchList: (force?: boolean) => Promise<void>,
  fetchStudentQuizzes: (studentId: string, force?: boolean) => Promise<void>,
) {
  void fetchList(true);
  if (isStudent) {
    void fetchStudentQuizzes(userId, true);
  }
}

/** Pending practice items: incomplete quizzes + vocabulary (new + review). */
export function usePracticePendingCounts(): PracticePendingCounts {
  const { user } = useAuth();
  const roleKey = useActiveRoleKey();
  const pathname = usePathname();
  const isStudent = roleKey === 'student';
  const quizList = useQuizzesStore((s) => s.list);
  const studentQuizzes = useQuizzesStore((s) => s.studentQuizzes);
  const fetchList = useQuizzesStore((s) => s.fetchList);
  const fetchStudentQuizzes = useQuizzesStore((s) => s.fetchStudentQuizzes);
  const vocabCards = useVocabularyStore((s) => s.cards);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);

  useEffect(() => {
    if (!user?.id) return;
    void fetchCards(undefined);
    refreshQuizPendingData(user.id, isStudent, fetchList, fetchStudentQuizzes);
  }, [user?.id, isStudent, fetchCards, fetchList, fetchStudentQuizzes]);

  // Re-fetch when opening Practice so counts reflect quizzes created elsewhere.
  useEffect(() => {
    if (!user?.id || pathname !== '/practice') return;
    refreshQuizPendingData(user.id, isStudent, fetchList, fetchStudentQuizzes);
  }, [pathname, user?.id, isStudent, fetchList, fetchStudentQuizzes]);

  return useMemo(() => {
    const incompleteQuizzes = isStudent
      ? countIncompleteAssignedQuizzes(studentQuizzes.data)
      : countIncompleteQuizzesFromList(quizList.data);

    const vocabPending = (vocabCards.data ?? []).filter(
      (card) => card.status === 'new' || card.status === 'mistakes_work',
    ).length;

    return {
      total: incompleteQuizzes + vocabPending,
      vocabPending,
      incompleteQuizzes,
    };
  }, [isStudent, quizList.data, studentQuizzes.data, vocabCards.data]);
}

/** Sidebar Practice badge total. */
export function usePracticeNavBadge(): number {
  return usePracticePendingCounts().total;
}
