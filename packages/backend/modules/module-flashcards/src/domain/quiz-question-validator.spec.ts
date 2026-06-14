import { validateGeneratedQuestion } from './quiz-question-validator';

describe('quiz-question-validator', () => {
  it('rejects translation MCQ when an option equals the native gloss', () => {
    expect(
      validateGeneratedQuestion({
        type: 'multiple-choice',
        template: 'translationMcq',
        question: 'Which word matches the translation "по всьому"?',
        options: ['по всьому', 'everywhere', 'nowhere', 'somewhere'],
        correct: 1,
      }),
    ).toBe(false);
  });

  it('accepts translation MCQ with English-only options', () => {
    expect(
      validateGeneratedQuestion({
        type: 'multiple-choice',
        template: 'translationMcq',
        question: 'Which word matches the translation "по всьому"?',
        options: ['everywhere', 'nowhere', 'somewhere', 'anywhere'],
        correct: 0,
      }),
    ).toBe(true);
  });

  it('rejects fill-in when correct answer is not English', () => {
    expect(
      validateGeneratedQuestion({
        type: 'fill-in',
        question: 'Fill in the blank',
        correct: 'по всьому',
      }),
    ).toBe(false);
  });

  it('rejects MCQ with duplicate normalized options', () => {
    expect(
      validateGeneratedQuestion({
        type: 'multiple-choice',
        question: 'Pick one',
        options: ['Run', 'run', 'walk', 'jump'],
        correct: 0,
      }),
    ).toBe(false);
  });
});
