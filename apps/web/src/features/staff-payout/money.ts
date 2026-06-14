/** Minor ↔ major unit helpers for staff payout forms (school currency). */

export function minorToMajorInput(minor: number): string {
  return minor > 0 ? String(minor / 100) : '';
}

export function majorInputToMinor(value: string): number {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function majorInputToMinorPositive(value: string): number {
  const minor = majorInputToMinor(value);
  return minor > 0 ? minor : 0;
}
