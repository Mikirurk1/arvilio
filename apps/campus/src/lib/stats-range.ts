import type { UserRoleId } from '@pkg/types';
import type { StatsTrendDirection } from '@pkg/types';

/** Campus live-dashboard preset (excludes `custom` from API statistics). */
export type StatsRange = 'week' | 'month' | 'quarter' | 'year';

export type DateRange = {
  from: string;
  to: string;
};

export type TrendBucket = {
  id: number;
  label: string;
  value: number;
};

export type StatisticsDashboardData = {
  roleId: UserRoleId;
  currentUserId: number;
  subjectStudentId?: number;
  rangePreset: StatsRange;
  title: string;
  rangeLabel: string;
  range: DateRange;
  kpis: Array<{
    id: number;
    label: string;
    value: string;
    deltaLabel: string;
    trend: StatsTrendDirection;
  }>;
  timeTrend: TrendBucket[];
  vocabularyTrend: Array<{ id: number; label: string; added: number; known: number }>;
  statusBreakdown: Array<{ id: number; label: string; value: number }>;
  deltas: Array<{ id: number; label: string; value: string; trend: StatsTrendDirection }>;
  goals: {
    weeklyMinutes: number;
    monthlyMinutes: number;
    quarterlyMinutes: number;
    yearlyMinutes: number;
    currentMinutes: number;
  };
};

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getRangeBounds(range: StatsRange, now: Date = new Date()): DateRange {
  const end = now;
  if (range === 'week') {
    const start = startOfDay(addDays(now, -6));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (range === 'month') {
    const start = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (range === 'quarter') {
    const quarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
    const start = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth, 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const start = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)));
  return { from: start.toISOString(), to: end.toISOString() };
}
