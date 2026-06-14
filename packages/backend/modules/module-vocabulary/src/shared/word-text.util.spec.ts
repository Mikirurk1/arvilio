import { BadRequestException } from '@nestjs/common';
import { assertEnglishLemma, isEnglishLemma } from './word-text.util';

describe('word-text.util', () => {
  it('accepts simple English lemmas', () => {
    expect(isEnglishLemma('hello')).toBe(true);
    expect(isEnglishLemma("don't")).toBe(true);
    expect(isEnglishLemma('well-known')).toBe(true);
  });

  it('accepts short English phrases', () => {
    expect(isEnglishLemma('touch base')).toBe(true);
    expect(isEnglishLemma('  circle   back  ')).toBe(true);
  });

  it('rejects empty and non-English', () => {
    expect(isEnglishLemma('')).toBe(false);
    expect(isEnglishLemma('привіт')).toBe(false);
    expect(isEnglishLemma('hello123')).toBe(false);
    expect(isEnglishLemma('touch base!')).toBe(false);
  });

  it('assertEnglishLemma throws BadRequestException', () => {
    expect(() => assertEnglishLemma('')).toThrow(BadRequestException);
    expect(() => assertEnglishLemma('café')).toThrow(BadRequestException);
  });
});
