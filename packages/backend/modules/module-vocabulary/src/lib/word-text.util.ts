import { BadRequestException } from '@nestjs/common';

/** Single English lemma: letters with optional internal hyphen or apostrophe. */
const ENGLISH_LEMMA_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

export function isEnglishLemma(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && ENGLISH_LEMMA_PATTERN.test(trimmed);
}

export function assertEnglishLemma(text: string): void {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new BadRequestException('Word text is required');
  }
  if (!isEnglishLemma(trimmed)) {
    throw new BadRequestException(
      'Only English words are supported for now (letters, hyphen, apostrophe).',
    );
  }
}
