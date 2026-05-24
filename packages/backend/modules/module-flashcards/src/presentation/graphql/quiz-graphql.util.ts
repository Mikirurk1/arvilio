import type { QuizGeneratorService } from '../../application/quiz-generator.service';
import type { QuizDetailType } from '@be/graphql';

export function mapQuizDetail(
  detail: Awaited<ReturnType<QuizGeneratorService['detailFor']>>,
): QuizDetailType {
  return {
    ...detail,
    questions: detail.questions.map((q) => ({
      ...q,
      correct: String(q.correct),
    })),
  };
}
