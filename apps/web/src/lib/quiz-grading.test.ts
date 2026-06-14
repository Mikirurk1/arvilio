import { isFillInAnswerCorrect, normalizeQuizFillAnswer } from './quiz-grading';

describe('quiz-grading', () => {
  it('normalizeQuizFillAnswer matches backend rules', () => {
    expect(normalizeQuizFillAnswer('  Touch Base. ')).toBe('touch base');
  });

  it('isFillInAnswerCorrect accepts normalized variants', () => {
    expect(isFillInAnswerCorrect('Touch  Base', 'touch base')).toBe(true);
  });
});
