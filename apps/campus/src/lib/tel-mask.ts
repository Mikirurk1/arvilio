/** E.164 max significant digits (excluding leading +). */
export const MAX_TEL_DIGITS = 15;

export function parseTelDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, MAX_TEL_DIGITS);
}

/** Format digits as international phone: +XXX XXX XXX … */
export function formatTelMask(value: string): string {
  const digits = parseTelDigits(value);
  if (!digits) return '';

  let formatted = '+';
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && i % 3 === 0) {
      formatted += ' ';
    }
    formatted += digits[i];
  }
  return formatted;
}

/** Store as compact E.164 (+digits only). */
export function normalizeTelForStorage(value: string): string | null {
  const digits = parseTelDigits(value);
  if (!digits) return null;
  return `+${digits}`;
}

/** Display stored E.164 value in the masked input. */
export function formatTelFromStorage(stored: string | null | undefined): string {
  if (!stored) return '';
  return formatTelMask(stored);
}
