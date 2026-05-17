import type { QuizDetailDto, QuizQuestionDto } from '@soenglish/shared-types';

/** GraphQL returns `correct` as string; MCQ UI expects a numeric option index. */
export function normalizeQuizQuestions(
  questions: QuizDetailDto['questions'],
): QuizQuestionDto[] {
  return questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
    explanation: q.explanation ?? '',
    correct:
      q.type === 'multiple-choice'
        ? Number.parseInt(String(q.correct), 10) || 0
        : String(q.correct),
  }));
}
