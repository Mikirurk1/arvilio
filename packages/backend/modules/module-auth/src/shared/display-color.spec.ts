import { normalizeDisplayColor, randomDisplayColor } from './display-color';

describe('display-color', () => {
  describe('normalizeDisplayColor', () => {
    it('lowercases valid hex', () => {
      expect(normalizeDisplayColor('#AABBCC')).toBe('#aabbcc');
    });

    it('returns null for empty string', () => {
      expect(normalizeDisplayColor('')).toBeNull();
    });

    it('passes through null and undefined', () => {
      expect(normalizeDisplayColor(null)).toBeNull();
      expect(normalizeDisplayColor(undefined)).toBeUndefined();
    });

    it('throws for invalid hex', () => {
      expect(() => normalizeDisplayColor('#abc')).toThrow('INVALID_DISPLAY_COLOR');
    });
  });

  describe('randomDisplayColor', () => {
    it('returns #RRGGBB format', () => {
      expect(randomDisplayColor()).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
