/** One English token: letters with optional internal hyphen or apostrophe. */
const ENGLISH_TOKEN_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

/** Max words in a collocation / short phrase (e.g. "touch base"). */
export const ENGLISH_VOCABULARY_MAX_TOKENS = 8;

export function normalizeEnglishVocabularyInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function isEnglishToken(token: string): boolean {
  return ENGLISH_TOKEN_PATTERN.test(token);
}

export function isEnglishVocabularyInput(text: string): boolean {
  const normalized = normalizeEnglishVocabularyInput(text);
  if (!normalized) return false;
  const tokens = normalized.split(' ');
  if (tokens.length > ENGLISH_VOCABULARY_MAX_TOKENS) return false;
  return tokens.every(isEnglishToken);
}

export function validateEnglishWordInput(text: string): string | null {
  const normalized = normalizeEnglishVocabularyInput(text);
  if (!normalized) return 'Enter a word or phrase.';
  if (!isEnglishVocabularyInput(normalized)) {
    return 'Only English words and short phrases are supported (letters, spaces, hyphen, apostrophe).';
  }
  return null;
}

export const VOCABULARY_WORD_NOT_FOUND =
  'No dictionary entry for this word or phrase. Check the spelling.';
