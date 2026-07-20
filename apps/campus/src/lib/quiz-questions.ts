import type { QuizDetailDto, QuizQuestionDto } from '@pkg/types';

export type QuizPlayQuestion = QuizQuestionDto & {
  wordId?: string | null;
};

/** GraphQL returns `correct` as string; MCQ UI expects a numeric option index. */
export function normalizeQuizQuestions(
  questions: QuizDetailDto['questions'],
): QuizPlayQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
    explanation: q.explanation ?? '',
    wordId: q.wordId ?? null,
    correct:
      q.type === 'multiple-choice'
        ? Number.parseInt(String(q.correct), 10) || 0
        : String(q.correct),
  }));
}
