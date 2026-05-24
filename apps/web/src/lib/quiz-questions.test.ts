import { normalizeQuizQuestions } from './quiz-questions';

describe('normalizeQuizQuestions', () => {
  it('parses multiple-choice correct as index', () => {
    const out = normalizeQuizQuestions([
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Pick',
        options: ['a', 'b'],
        correct: '1',
        explanation: '',
      },
    ]);
    expect(out[0]?.correct).toBe(1);
  });

  it('keeps fill-in correct as string', () => {
    const out = normalizeQuizQuestions([
      {
        id: 'q2',
        type: 'fill-in',
        question: 'Type',
        options: [],
        correct: 'answer',
        explanation: 'hint',
      },
    ]);
    expect(out[0]?.correct).toBe('answer');
    expect(out[0]?.explanation).toBe('hint');
  });

  it('multiple-choice invalid correct falls back to 0', () => {
    const out = normalizeQuizQuestions([
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Pick',
        options: ['a', 'b'],
        correct: 'not-a-number',
        explanation: '',
      },
    ]);
    expect(out[0]?.correct).toBe(0);
  });
});
