import type { ResolvedStaffCompensationDto } from '@pkg/types';
import {
  computeLessonAccrualMinor,
  computeSalaryAccrualMinor,
  computeTotalAccrualMinor,
} from './staff-accrual.util';

const baseCompensation = (
  patch: Partial<ResolvedStaffCompensationDto> = {},
): ResolvedStaffCompensationDto => ({
  userId: 'u1',
  mode: 'per_lesson',
  perLessonRateMinor: 50000,
  salaryMinor: 0,
  currency: 'UAH',
  payFrequency: 'monthly',
  payDayOfWeek: 5,
  payDayOfMonth: 1,
  graceDays: 3,
  ...patch,
});

describe('staff-accrual.util', () => {
  it('computes per-lesson accrual for completed lessons', () => {
    expect(computeLessonAccrualMinor('per_lesson', 50000, 4)).toBe(200000);
    expect(computeLessonAccrualMinor('mixed', 50000, 2)).toBe(100000);
    expect(computeLessonAccrualMinor('salary', 50000, 10)).toBe(0);
  });

  it('pro-rates weekly salary across a partial week', () => {
    const accrued = computeSalaryAccrualMinor(
      70000,
      'weekly',
      '2026-06-02T00:00:00.000Z',
      '2026-06-04T00:00:00.000Z',
    );
    expect(accrued).toBe(Math.round((70000 * 3) / 7));
  });

  it('pro-rates monthly salary across a partial month', () => {
    const accrued = computeSalaryAccrualMinor(
      300000,
      'monthly',
      '2026-06-01T00:00:00.000Z',
      '2026-06-15T00:00:00.000Z',
    );
    expect(accrued).toBe(Math.round((300000 * 15) / 30));
  });

  it('combines salary and per-lesson accrual in mixed mode', () => {
    const total = computeTotalAccrualMinor(
      baseCompensation({ mode: 'mixed', salaryMinor: 300000, perLessonRateMinor: 40000 }),
      { completedLessons: 3, lessonMinutes: 180 },
      '2026-06-01T00:00:00.000Z',
      '2026-06-30T00:00:00.000Z',
    );
    expect(total).toBe(300000 + 120000);
  });

  it('counts group lesson as one completed lesson via caller input', () => {
    const total = computeTotalAccrualMinor(
      baseCompensation({ mode: 'per_lesson', perLessonRateMinor: 25000 }),
      { completedLessons: 1, lessonMinutes: 60 },
      '2026-06-01T00:00:00.000Z',
      '2026-06-07T00:00:00.000Z',
    );
    expect(total).toBe(25000);
  });
});
