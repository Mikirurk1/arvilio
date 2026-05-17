import type { QuizCardDto, StudentQuizCardDto } from '@soenglish/shared-types';

/** Assigned quizzes the student has not finished yet. */
export function countIncompleteAssignedQuizzes(
  assigned: StudentQuizCardDto[] | null | undefined,
): number {
  return (assigned ?? []).filter((quiz) => !quiz.attempt?.finishedAt).length;
}

/**
 * Staff-owned quizzes in list (no per-quiz attempt on list query).
 * Treats each accessible quiz as pending until removed or student flow is used.
 */
export function countIncompleteQuizzesFromList(
  available: QuizCardDto[] | null | undefined,
): number {
  return available?.length ?? 0;
}
