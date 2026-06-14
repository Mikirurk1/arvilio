import { normalizeMcqAnswerText } from '../shared/mcq.util';
import { containsNonLatinScript, isEnglishLemmaForQuiz } from '../shared/english-lemma.util';

export type ValidatableQuestion = {
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  correct: number | string;
  template?: string;
};

function extractQuotedPromptGloss(question: string): string | null {
  const match = question.match(/"([^"]+)"/);
  return match?.[1]?.trim() ?? null;
}

function isTranslationStyleMcq(question: ValidatableQuestion): boolean {
  if (question.template === 'translationMcq') return true;
  return question.question.includes('matches the translation');
}

export function validateGeneratedQuestion(question: ValidatableQuestion): boolean {
  if (question.type === 'fill-in') {
    const answer = String(question.correct);
    return isEnglishLemmaForQuiz(answer);
  }

  const options = question.options ?? [];
  if (options.length !== 4) return false;

  const normalizedOptions = options.map(normalizeMcqAnswerText);
  if (new Set(normalizedOptions).size !== 4) return false;

  const correctIndex =
    typeof question.correct === 'number'
      ? question.correct
      : Number.parseInt(String(question.correct), 10);
  if (!Number.isFinite(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    return false;
  }

  if (isTranslationStyleMcq(question)) {
    const gloss = extractQuotedPromptGloss(question.question);
    const glossNorm = gloss ? normalizeMcqAnswerText(gloss) : null;

    for (const option of options) {
      if (!isEnglishLemmaForQuiz(option)) return false;
      if (containsNonLatinScript(option)) return false;
      if (glossNorm && normalizeMcqAnswerText(option) === glossNorm) return false;
    }
    return true;
  }

  for (const option of options) {
    if (!option.trim() || option.trim() === '—') return false;
  }

  return true;
}
