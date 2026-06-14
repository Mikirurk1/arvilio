/** Anchor month for monthly pay-day picker — day-of-month only (1–28). */
export const PAY_DAY_OF_MONTH_DATE_MIN = '2000-02-01';
export const PAY_DAY_OF_MONTH_DATE_MAX = '2000-02-28';

export function clampPayDayOfMonth(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(28, Math.max(1, Math.round(day)));
}

export function payDayOfMonthToDateValue(day: number): string {
  const clamped = clampPayDayOfMonth(day);
  return `2000-02-${String(clamped).padStart(2, '0')}`;
}

export function payDayOfMonthFromDateValue(value: string): number {
  if (!value) return 1;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return 1;
  return clampPayDayOfMonth(Number.parseInt(match[3]!, 10));
}
