import {
  defaultCustomStatsDateKeys,
  getCustomStatsRangeBounds,
  parseStatsDateKey,
} from '@pkg/types';
import { formatDateKey, formatDateLabel, formatTimeValue, parseDateKey, parseTimeValue } from './date-picker-utils';

describe('date-picker-utils', () => {
  it('formats and parses date keys', () => {
    const date = parseDateKey('2026-05-15');
    expect(date).toBeDefined();
    expect(formatDateKey(date!)).toBe('2026-05-15');
    expect(formatDateLabel('2026-05-15')).toContain('May');
  });

  it('formats time values', () => {
    expect(parseTimeValue('9:05')).toEqual({ hour: 9, minute: 5 });
    expect(formatTimeValue(9, 5)).toBe('09:05');
  });
});

describe('statistics date helpers', () => {
  it('defaultCustomStatsDateKeys returns previous month', () => {
    const { from, to } = defaultCustomStatsDateKeys(new Date('2026-06-15T12:00:00.000Z'));
    expect(from).toBe('2026-05-01');
    expect(to).toBe('2026-05-31');
  });

  it('parseStatsDateKey validates format', () => {
    expect(parseStatsDateKey('2026-01-02')).toBe('2026-01-02');
    expect(parseStatsDateKey('bad')).toBeNull();
  });

  it('getCustomStatsRangeBounds rejects future end', () => {
    expect(() =>
      getCustomStatsRangeBounds('2026-01-01', '2030-01-01', new Date('2026-06-01T12:00:00.000Z')),
    ).toThrow();
  });
});
