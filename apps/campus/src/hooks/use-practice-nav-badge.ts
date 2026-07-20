'use client';

import { stripLocalePrefix } from '@pkg/types';
import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { useActiveRoleKey } from '../lib/active-user';
import {
  countIncompleteAssignedQuizzes,
  countPendingSpeakingTopics,
} from '../lib/practice-pending';
import { useQuizzesStore } from '../stores/quizzes-store';
import { useSpeakingStore } from '../stores/speaking-store';
import { useVocabularyStore } from '../stores/vocabulary-store';

export type PracticePendingCounts = {
  total: number;
  vocabPending: number;
  incompleteQuizzes: number;
  speakingPending: number;
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
  const pathname = stripLocalePrefix(usePathname() || '/').pathname;
  const isStudent = roleKey === 'student';
  const studentQuizzes = useQuizzesStore((s) => s.studentQuizzes);
  const fetchList = useQuizzesStore((s) => s.fetchList);
  const fetchStudentQuizzes = useQuizzesStore((s) => s.fetchStudentQuizzes);
  const mySpeakingTopics = useSpeakingStore((s) => s.myTopics);
  const fetchMySpeakingTopics = useSpeakingStore((s) => s.fetchMyTopics);
  const vocabCards = useVocabularyStore((s) => s.cards);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);

  useEffect(() => {
    if (!user?.id) return;
    void fetchCards(undefined);
    refreshQuizPendingData(user.id, isStudent, fetchList, fetchStudentQuizzes);
    if (isStudent) {
      void fetchMySpeakingTopics();
    }
  }, [user?.id, isStudent, fetchCards, fetchList, fetchStudentQuizzes, fetchMySpeakingTopics]);

  // Re-fetch when opening Practice so counts reflect quizzes created elsewhere.
  useEffect(() => {
    if (!user?.id || pathname !== '/practice') return;
    refreshQuizPendingData(user.id, isStudent, fetchList, fetchStudentQuizzes);
    if (isStudent) {
      void fetchMySpeakingTopics(true);
    }
  }, [pathname, user?.id, isStudent, fetchList, fetchStudentQuizzes, fetchMySpeakingTopics]);

  return useMemo(() => {
    // Assigned quiz progress is student-scoped. Staff-owned quizzes without a teacher
    // preview attempt must not inflate "quizzes left" on the Practice hub.
    const incompleteQuizzes = isStudent
      ? countIncompleteAssignedQuizzes(studentQuizzes.data)
      : 0;

    const speakingPending = isStudent
      ? countPendingSpeakingTopics(mySpeakingTopics.data)
      : 0;

    const vocabPending = (vocabCards.data ?? []).filter(
      (card) => card.status === 'new' || card.status === 'mistakes_work',
    ).length;

    return {
      total: incompleteQuizzes + vocabPending + speakingPending,
      vocabPending,
      incompleteQuizzes,
      speakingPending,
    };
  }, [isStudent, mySpeakingTopics.data, studentQuizzes.data, vocabCards.data]);
}

/** Sidebar Practice badge total. */
export function usePracticeNavBadge(): number {
  return usePracticePendingCounts().total;
}
