import { validateEnglishWordInput, VOCABULARY_WORD_NOT_FOUND } from './vocabulary-word-input';

describe('vocabulary-word-input', () => {
  it('validateEnglishWordInput accepts hyphenated words', () => {
    expect(validateEnglishWordInput("don't")).toBeNull();
    expect(validateEnglishWordInput('well-known')).toBeNull();
  });

  it('validateEnglishWordInput rejects empty and invalid', () => {
    expect(validateEnglishWordInput('')).toBe('Enter a word.');
    expect(validateEnglishWordInput('hello123')).toMatch(/Only English/);
  });

  it('exports not-found message constant', () => {
    expect(VOCABULARY_WORD_NOT_FOUND).toContain('dictionary');
  });
});
