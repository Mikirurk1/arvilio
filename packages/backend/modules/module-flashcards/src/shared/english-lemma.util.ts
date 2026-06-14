/** Mirrors vocabulary `word-text.util` for quiz option validation (no cross-module import). */

const ENGLISH_TOKEN_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;
const ENGLISH_VOCABULARY_MAX_TOKENS = 8;

export function isEnglishLemmaForQuiz(text: string): boolean {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return false;
  const tokens = normalized.split(' ');
  if (tokens.length > ENGLISH_VOCABULARY_MAX_TOKENS) return false;
  return tokens.every((token) => ENGLISH_TOKEN_PATTERN.test(token));
}

/** True when text contains non-Latin letters (e.g. Cyrillic). */
export function containsNonLatinScript(text: string): boolean {
  return /[^\u0000-\u024F\s.,!?'"-]/.test(text);
}
