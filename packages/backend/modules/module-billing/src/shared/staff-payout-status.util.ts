import type { StaffPayFrequencyDto, StaffPayoutStatusDto } from '@pkg/types';

export function computeNextPayDate(
  frequency: StaffPayFrequencyDto,
  payDayOfWeek: number,
  payDayOfMonth: number,
  reference: Date = new Date(),
): Date {
  const today = startOfUtcDay(reference);
  if (frequency === 'weekly') {
    const day = today.getUTCDay();
    let delta = payDayOfWeek - day;
    if (delta <= 0) delta += 7;
    return addUtcDays(today, delta);
  }

  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const day = clampPayDayOfMonth(payDayOfMonth, year, month);
  let candidate = new Date(Date.UTC(year, month, day));
  if (candidate <= today) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextDay = clampPayDayOfMonth(payDayOfMonth, nextYear, nextMonth);
    candidate = new Date(Date.UTC(nextYear, nextMonth, nextDay));
  }
  return candidate;
}

export function computePayoutStatus(
  outstandingMinor: number,
  nextPayDate: Date,
  graceDays: number,
  today: Date = new Date(),
): StaffPayoutStatusDto {
  if (outstandingMinor <= 0) return 'ok';
  const due = startOfUtcDay(nextPayDate);
  const now = startOfUtcDay(today);
  if (now < due) return 'ok';
  const overdueAfter = addUtcDays(due, graceDays);
  if (now <= overdueAfter) return 'due';
  return 'overdue';
}

function clampPayDayOfMonth(day: number, year: number, month: number): number {
  const max = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Math.min(Math.max(1, day), Math.min(28, max));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
