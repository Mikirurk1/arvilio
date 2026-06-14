import {
  isEnglishVocabularyInput,
  normalizeEnglishVocabularyInput,
  validateEnglishWordInput,
  VOCABULARY_WORD_NOT_FOUND,
} from './vocabulary-word-input';

describe('vocabulary-word-input', () => {
  it('validateEnglishWordInput accepts hyphenated words', () => {
    expect(validateEnglishWordInput("don't")).toBeNull();
    expect(validateEnglishWordInput('well-known')).toBeNull();
  });

  it('validateEnglishWordInput accepts short English phrases', () => {
    expect(validateEnglishWordInput('touch base')).toBeNull();
    expect(validateEnglishWordInput('  circle   back  ')).toBeNull();
    expect(isEnglishVocabularyInput(normalizeEnglishVocabularyInput('  circle   back  '))).toBe(true);
  });

  it('validateEnglishWordInput rejects empty and invalid', () => {
    expect(validateEnglishWordInput('')).toBe('Enter a word or phrase.');
    expect(validateEnglishWordInput('hello123')).toMatch(/Only English/);
    expect(validateEnglishWordInput('touch base!')).toMatch(/Only English/);
  });

  it('exports not-found message constant', () => {
    expect(VOCABULARY_WORD_NOT_FOUND).toContain('dictionary');
  });
});
