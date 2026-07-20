import {
  ARVI_VOCAB_FIRST_WORDS_KEY,
  getVocabFirstWordsSteps,
  isVocabFirstWordsGuideDone,
  markVocabFirstWordsGuideDone,
} from './vocab-first-words';

describe('vocab-first-words', () => {
  beforeEach(() => {
    window.localStorage.removeItem(ARVI_VOCAB_FIRST_WORDS_KEY);
  });

  it('exposes two guided steps targeting modes and add-word', () => {
    const steps = getVocabFirstWordsSteps();
    expect(steps.map((s) => s.id)).toEqual(['first-words-modes', 'first-words-add']);
    expect(steps.map((s) => s.anchorId)).toEqual(['vocab-mode-toggle', 'vocab-add-word']);
  });

  it('persists done flag in localStorage', () => {
    expect(isVocabFirstWordsGuideDone()).toBe(false);
    markVocabFirstWordsGuideDone();
    expect(isVocabFirstWordsGuideDone()).toBe(true);
  });
});
