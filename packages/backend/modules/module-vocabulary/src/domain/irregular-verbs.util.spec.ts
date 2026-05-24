import { lookupIrregularVerb, resolveVerbForms, wordHasVerbSense } from '@pkg/types';

describe('irregular-verbs (@pkg/types)', () => {
  it('lookupIrregularVerb is case-insensitive', () => {
    expect(lookupIrregularVerb('Go')?.pastSimple).toBe('went');
  });

  it('wordHasVerbSense detects verb POS', () => {
    expect(wordHasVerbSense('verb')).toBe(true);
    expect(wordHasVerbSense('noun', [{ partOfSpeech: 'verb' }])).toBe(true);
    expect(wordHasVerbSense('noun')).toBe(false);
  });

  it('resolveVerbForms returns forms for irregular verb', () => {
    expect(resolveVerbForms('go', 'verb')).toEqual({
      pastSimple: 'went',
      pastParticiple: 'gone',
    });
  });

  it('resolveVerbForms returns null for non-verb or unknown lemma', () => {
    expect(resolveVerbForms('go', 'noun')).toBeNull();
    expect(resolveVerbForms('walk', 'verb')).toBeNull();
  });
});
