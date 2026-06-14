import { BadRequestException } from '@nestjs/common';

/** One English token: letters with optional internal hyphen or apostrophe. */
const ENGLISH_TOKEN_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

/** Max words in a collocation / short phrase (e.g. "touch base"). */
export const ENGLISH_VOCABULARY_MAX_TOKENS = 8;

export function normalizeVocabularyText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function isEnglishToken(token: string): boolean {
  return ENGLISH_TOKEN_PATTERN.test(token);
}

/** Single word or short English phrase (collocation). */
export function isEnglishLemma(text: string): boolean {
  const normalized = normalizeVocabularyText(text);
  if (!normalized) return false;
  const tokens = normalized.split(' ');
  if (tokens.length > ENGLISH_VOCABULARY_MAX_TOKENS) return false;
  return tokens.every(isEnglishToken);
}

export function assertEnglishLemma(text: string): void {
  const normalized = normalizeVocabularyText(text);
  if (!normalized) {
    throw new BadRequestException('Word text is required');
  }
  if (!isEnglishLemma(normalized)) {
    throw new BadRequestException(
      'Only English words and short phrases are supported (letters, spaces, hyphen, apostrophe).',
    );
  }
}
