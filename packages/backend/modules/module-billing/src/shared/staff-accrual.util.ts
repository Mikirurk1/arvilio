import type {
  ResolvedStaffCompensationDto,
  StaffCompensationModeDto,
  StaffPayFrequencyDto,
} from '@pkg/types';

export type LessonAccrualInput = {
  completedLessons: number;
  lessonMinutes: number;
};

export function computeLessonAccrualMinor(
  mode: StaffCompensationModeDto,
  perLessonRateMinor: number,
  completedLessons: number,
): number {
  if (mode === 'salary') return 0;
  return Math.max(0, completedLessons) * Math.max(0, perLessonRateMinor);
}

/** Pro-rate salary across an inclusive UTC date range. */
export function computeSalaryAccrualMinor(
  salaryMinor: number,
  frequency: StaffPayFrequencyDto,
  fromIso: string,
  toIso: string,
): number {
  if (salaryMinor <= 0) return 0;
  const from = startOfUtcDay(new Date(fromIso));
  const to = startOfUtcDay(new Date(toIso));
  if (to < from) return 0;

  if (frequency === 'weekly') {
    const days = inclusiveUtcDays(from, to);
    return Math.round((salaryMinor * days) / 7);
  }

  let total = 0;
  let cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  while (cursor <= to) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month, daysInMonth));
    const overlapStart = from > monthStart ? from : monthStart;
    const overlapEnd = to < monthEnd ? to : monthEnd;
    if (overlapEnd >= overlapStart) {
      const overlapDays = inclusiveUtcDays(overlapStart, overlapEnd);
      total += Math.round((salaryMinor * overlapDays) / daysInMonth);
    }
    cursor = new Date(Date.UTC(year, month + 1, 1));
  }
  return total;
}

export function computeTotalAccrualMinor(
  compensation: ResolvedStaffCompensationDto,
  lessons: LessonAccrualInput,
  fromIso: string,
  toIso: string,
): number {
  const lessonPart = computeLessonAccrualMinor(
    compensation.mode,
    compensation.perLessonRateMinor,
    lessons.completedLessons,
  );
  const salaryPart =
    compensation.mode === 'per_lesson'
      ? 0
      : computeSalaryAccrualMinor(
          compensation.salaryMinor,
          compensation.payFrequency,
          fromIso,
          toIso,
        );
  return lessonPart + salaryPart;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function inclusiveUtcDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}
