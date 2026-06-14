import {
  formatProficiencyLevelLabel,
  formatProficiencyLevelShort,
  normalizeProficiencyLevelCode,
} from './proficiency-level';

describe('proficiency-level', () => {
  it('normalizeProficiencyLevelCode accepts code and label', () => {
    expect(normalizeProficiencyLevelCode('b1')).toBe('B1');
    expect(normalizeProficiencyLevelCode('Intermediate')).toBe('B1');
    expect(normalizeProficiencyLevelCode('')).toBe('');
    expect(normalizeProficiencyLevelCode('random')).toBe('');
  });

  it('formatProficiencyLevelLabel renders catalog label', () => {
    expect(formatProficiencyLevelLabel('B1')).toBe('B1 — Intermediate');
    expect(formatProficiencyLevelShort('B1')).toBe('B1');
  });
});
