import {
  effectiveWeeklyDays,
  expandRecurrenceDates,
  formatLocalDateYmd,
  jsDayToWeekdayValue,
  LESSON_RECURRENCE_HORIZON,
  parseLocalDateYmd,
} from './lesson-recurrence';

describe('lesson-recurrence', () => {
  it('jsDayToWeekdayValue maps Sunday to 7', () => {
    expect(jsDayToWeekdayValue(0)).toBe(7);
    expect(jsDayToWeekdayValue(1)).toBe(1);
  });

  it('parseLocalDateYmd and formatLocalDateYmd round-trip', () => {
    const d = parseLocalDateYmd('2026-05-20');
    expect(formatLocalDateYmd(d)).toBe('2026-05-20');
  });

  it('expandRecurrenceDates none returns single date', () => {
    expect(expandRecurrenceDates('none', '2026-05-20', [])).toEqual(['2026-05-20']);
  });

  it('expandRecurrenceDates weekly includes start weekday when weeklyDays empty', () => {
    // 2026-05-20 is Wednesday (3)
    const dates = expandRecurrenceDates('weekly', '2026-05-20', []);
    expect(dates[0]).toBe('2026-05-20');
    expect(dates.length).toBeGreaterThan(1);
  });

  it('effectiveWeeklyDays uses explicit days when provided', () => {
    expect(effectiveWeeklyDays('2026-05-20', [5, 1])).toEqual([1, 5]);
  });

  it('expandRecurrenceDates daily materializes horizon days', () => {
    const dates = expandRecurrenceDates('daily', '2026-05-20', []);
    expect(dates).toHaveLength(LESSON_RECURRENCE_HORIZON.dailyDays);
    expect(dates[0]).toBe('2026-05-20');
    expect(dates[dates.length - 1]).toBe('2026-06-18');
  });

  it('expandRecurrenceDates weekly respects multiple weekdays', () => {
    const dates = expandRecurrenceDates('weekly', '2026-05-20', [1, 3]);
    expect(dates).toContain('2026-05-20');
    expect(dates).toContain('2026-05-25');
    expect(dates).toContain('2026-05-27');
    expect(new Set(dates).size).toBe(dates.length);
  });

  it('expandRecurrenceDates monthly includes same day-of-month', () => {
    const dates = expandRecurrenceDates('monthly', '2026-01-31', []);
    expect(dates[0]).toBe('2026-01-31');
    expect(dates[1]).toBe('2026-02-28');
    expect(dates).toHaveLength(LESSON_RECURRENCE_HORIZON.monthlyMonths);
  });
});
