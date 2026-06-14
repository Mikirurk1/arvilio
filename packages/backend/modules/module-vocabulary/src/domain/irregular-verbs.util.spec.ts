import {
  countIrregularVerbs,
  formatIrregularVerbRow,
  listIrregularVerbs,
  lookupIrregularVerb,
  pickIrregularVerbOfDay,
  resolveVerbForms,
  wordHasVerbSense,
} from '@pkg/types';

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

  it('listIrregularVerbs filters common tier', () => {
    const common = listIrregularVerbs('common');
    const all = listIrregularVerbs('extended');
    expect(common.length).toBeGreaterThan(50);
    expect(common.length).toBeLessThan(all.length);
    expect(common.every((entry) => entry.tier === 'common')).toBe(true);
    expect(common.some((entry) => entry.base === 'go')).toBe(true);
    expect(common.some((entry) => entry.base === 'cling')).toBe(false);
  });

  it('countIrregularVerbs matches list length', () => {
    expect(countIrregularVerbs('common')).toBe(listIrregularVerbs('common').length);
    expect(countIrregularVerbs('extended')).toBe(listIrregularVerbs('extended').length);
  });

  it('pickIrregularVerbOfDay is stable per date and changes across dates', () => {
    const dayA = pickIrregularVerbOfDay('2026-05-30');
    const dayB = pickIrregularVerbOfDay('2026-05-30');
    expect(dayA.base).toBe(dayB.base);
    expect(formatIrregularVerbRow(dayA)).toContain(dayA.pastSimple);
  });

  it('pickIrregularVerbOfDay uses common tier when available', () => {
    const entry = pickIrregularVerbOfDay('2026-01-01');
    expect(entry.tier).toBe('common');
  });
});
