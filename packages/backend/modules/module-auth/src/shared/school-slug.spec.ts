import { slugifySchoolName } from './school-slug';

describe('slugifySchoolName', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifySchoolName('Acme English School')).toBe('acme-english-school');
  });

  it('collapses non-alphanumerics and trims hyphens', () => {
    expect(slugifySchoolName('  Hello,   World!! ')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(slugifySchoolName('École Française')).toBe('ecole-francaise');
  });

  it('falls back to "school" when nothing usable remains', () => {
    expect(slugifySchoolName('!!!')).toBe('school');
    expect(slugifySchoolName('—  —')).toBe('school');
  });

  it('caps length', () => {
    expect(slugifySchoolName('a'.repeat(100)).length).toBeLessThanOrEqual(40);
  });
});
