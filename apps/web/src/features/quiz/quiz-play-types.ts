export type QuizReviewItem = {
  questionId: string;
  prompt: string;
  explanation: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  wordId?: string | null;
};

export type QuizPlayResult = {
  score: number;
  correctCount: number;
  totalCount: number;
  practiceMode: boolean;
  review: QuizReviewItem[];
};
