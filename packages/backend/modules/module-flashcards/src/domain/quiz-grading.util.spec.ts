import { gradeQuizAnswers, normalizeQuizFillAnswer } from './quiz-grading.util';

describe('quiz-grading.util', () => {
  it('normalizeQuizFillAnswer trims, collapses spaces, and strips trailing punctuation', () => {
    expect(normalizeQuizFillAnswer('  Touch   Base.  ')).toBe('touch base');
  });

  it('gradeQuizAnswers compares fill-in with normalization', () => {
    const graded = gradeQuizAnswers(
      [{ id: 'q1', type: 'FILL_IN', correctAnswer: 'touch base' }],
      [{ questionId: 'q1', givenAnswer: '  Touch Base. ' }],
    );
    expect(graded.correctCount).toBe(1);
  });
});
