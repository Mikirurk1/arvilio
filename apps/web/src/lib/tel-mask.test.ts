import {
  formatTelFromStorage,
  formatTelMask,
  normalizeTelForStorage,
  parseTelDigits,
} from './tel-mask';

describe('tel-mask', () => {
  it('parseTelDigits strips non-digits', () => {
    expect(parseTelDigits('+38 (050) 123-45-67')).toBe('380501234567');
  });

  it('formatTelMask groups digits', () => {
    expect(formatTelMask('380501234567')).toMatch(/^\+380/);
  });

  it('normalizeTelForStorage returns E.164', () => {
    expect(normalizeTelForStorage('050 123 45 67')).toBe('+0501234567');
  });

  it('formatTelFromStorage formats stored value', () => {
    expect(formatTelFromStorage('+380501234567')).toContain('+380');
  });
});
