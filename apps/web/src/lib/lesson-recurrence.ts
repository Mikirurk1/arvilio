import type { LessonRecurrence } from '@pkg/types';

/** How far ahead to materialize recurring lessons on create (one row per occurrence). */
export const LESSON_RECURRENCE_HORIZON = {
  dailyDays: 30,
  weeklyWeeks: 12,
  monthlyMonths: 6,
} as const;

/** JS `getDay()` (0=Sun) → UI weekday chips (1=Mon … 7=Sun). */
export function jsDayToWeekdayValue(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

export function parseLocalDateYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatLocalDateYmd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export function effectiveWeeklyDays(startDateYmd: string, weeklyDays: number[]): number[] {
  if (weeklyDays.length > 0) return [...weeklyDays].sort((a, b) => a - b);
  const base = parseLocalDateYmd(startDateYmd);
  return [jsDayToWeekdayValue(base.getDay())];
}

function startOfIsoWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isoDay = jsDayToWeekdayValue(d.getDay());
  d.setDate(d.getDate() - (isoDay - 1));
  return d;
}

function addLocalDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** All occurrence dates from `startDateYmd` forward (inclusive), sorted. */
export function expandRecurrenceDates(
  recurrence: LessonRecurrence,
  startDateYmd: string,
  weeklyDays: number[],
): string[] {
  if (recurrence === 'none') return [startDateYmd];

  const base = parseLocalDateYmd(startDateYmd);

  if (recurrence === 'daily') {
    const dates: string[] = [];
    for (let i = 0; i < LESSON_RECURRENCE_HORIZON.dailyDays; i++) {
      dates.push(formatLocalDateYmd(addLocalDays(base, i)));
    }
    return dates;
  }

  if (recurrence === 'weekly') {
    const weekdays = effectiveWeeklyDays(startDateYmd, weeklyDays);
    const weekStart = startOfIsoWeek(base);
    const dates: string[] = [];
    for (let w = 0; w < LESSON_RECURRENCE_HORIZON.weeklyWeeks; w++) {
      for (const wd of weekdays) {
        const occurrence = addLocalDays(weekStart, w * 7 + (wd - 1));
        const ymd = formatLocalDateYmd(occurrence);
        if (ymd >= startDateYmd) dates.push(ymd);
      }
    }
    return [...new Set(dates)].sort();
  }

  if (recurrence === 'monthly') {
    const dayOfMonth = base.getDate();
    const dates: string[] = [];
    for (let m = 0; m < LESSON_RECURRENCE_HORIZON.monthlyMonths; m++) {
      const monthAnchor = new Date(base.getFullYear(), base.getMonth() + m, 1);
      const lastDay = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
      const occurrence = new Date(
        monthAnchor.getFullYear(),
        monthAnchor.getMonth(),
        Math.min(dayOfMonth, lastDay),
      );
      const ymd = formatLocalDateYmd(occurrence);
      if (ymd >= startDateYmd) dates.push(ymd);
    }
    return [...new Set(dates)].sort();
  }

  return [startDateYmd];
}
