import { mockQuizAttempt, mockQuizCard, mockStudentQuizCard } from '../testing/fixtures';
import {
  countIncompleteAssignedQuizzes,
  countIncompleteQuizzes,
  countIncompleteQuizzesFromList,
} from './practice-pending';

describe('practice-pending', () => {
  it('countIncompleteQuizzes ignores finished attempts', () => {
    const quizzes = [
      mockQuizCard({ attempt: null }),
      mockQuizCard({ attempt: mockQuizAttempt({ finishedAt: null }) }),
      mockQuizCard({ attempt: mockQuizAttempt({ finishedAt: '2026-05-20T00:00:00.000Z' }) }),
    ];
    expect(countIncompleteQuizzes(quizzes)).toBe(2);
  });

  it('countIncompleteAssignedQuizzes and countIncompleteQuizzesFromList delegate', () => {
    const incomplete = [mockStudentQuizCard({ attempt: null })];
    expect(countIncompleteAssignedQuizzes(incomplete)).toBe(1);
    expect(countIncompleteQuizzesFromList([mockQuizCard({ attempt: null })])).toBe(1);
    expect(countIncompleteQuizzes(null)).toBe(0);
  });
});
