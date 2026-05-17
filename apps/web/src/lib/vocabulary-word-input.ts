/** Single English lemma: letters with optional internal hyphen or apostrophe. */
const ENGLISH_LEMMA_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

export function validateEnglishWordInput(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'Enter a word.';
  if (!ENGLISH_LEMMA_PATTERN.test(trimmed)) {
    return 'Only English words are supported for now (letters, hyphen, apostrophe).';
  }
  return null;
}

export const VOCABULARY_WORD_NOT_FOUND =
  'No dictionary entry for this word. Check the spelling.';
