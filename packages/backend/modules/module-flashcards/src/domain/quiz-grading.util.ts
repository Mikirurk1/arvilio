export function normalizeQuizFillAnswer(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[.!?]+$/, '');
}

export function gradeQuizAnswers(
  questions: Array<{
    id: string;
    type: 'MULTIPLE_CHOICE' | 'FILL_IN';
    correctAnswer: string;
  }>,
  answers: Array<{ questionId: string; givenAnswer: string }>,
): {
  correctCount: number;
  totalCount: number;
  answerRows: Array<{ questionId: string; givenAnswer: string; isCorrect: boolean }>;
} {
  let correctCount = 0;
  const answerRows = questions.map((question) => {
    const given = answers.find((a) => a.questionId === question.id)?.givenAnswer ?? '';
    let isCorrect = false;
    if (question.type === 'MULTIPLE_CHOICE') {
      isCorrect = Number.parseInt(given, 10) === Number.parseInt(question.correctAnswer, 10);
    } else {
      isCorrect =
        normalizeQuizFillAnswer(given) === normalizeQuizFillAnswer(question.correctAnswer);
    }
    if (isCorrect) correctCount += 1;
    return { questionId: question.id, givenAnswer: given, isCorrect };
  });
  return { correctCount, totalCount: questions.length, answerRows };
}
