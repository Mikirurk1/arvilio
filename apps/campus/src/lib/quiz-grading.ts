/** Mirrors backend `normalizeQuizFillAnswer` for client-side answer preview. */
export function normalizeQuizFillAnswer(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[.!?]+$/, '');
}

export function isFillInAnswerCorrect(given: string, expected: string): boolean {
  return normalizeQuizFillAnswer(given) === normalizeQuizFillAnswer(expected);
}
