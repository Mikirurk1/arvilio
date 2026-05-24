import type { QuizCardDto, StudentQuizCardDto } from '@pkg/types';

type QuizWithAttempt = Pick<QuizCardDto, 'attempt'>;

/** Quizzes without a finished attempt (`attempt.finishedAt`). */
export function countIncompleteQuizzes(
  quizzes: QuizWithAttempt[] | null | undefined,
): number {
  return (quizzes ?? []).filter((quiz) => !quiz.attempt?.finishedAt).length;
}

/** Assigned quizzes the student has not finished yet. */
export function countIncompleteAssignedQuizzes(
  assigned: StudentQuizCardDto[] | null | undefined,
): number {
  return countIncompleteQuizzes(assigned);
}

/** Staff / self-serve quizzes from `quizzes` list (includes `attempt` when loaded). */
export function countIncompleteQuizzesFromList(
  available: QuizCardDto[] | null | undefined,
): number {
  return countIncompleteQuizzes(available);
}
