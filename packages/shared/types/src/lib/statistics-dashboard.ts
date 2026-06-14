/** Statistics dashboard: period ranges, DTOs, and UTC range helpers. */

import type { StaffEarningsSectionDto } from './staff-payout';

export type StatsRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

/** Max inclusive span for custom statistics ranges (days). */
export const STATS_CUSTOM_RANGE_MAX_DAYS = 366;

export type StatsDateRange = {
  from: string;
  to: string;
};

export type StatsTrendDirection = 'up' | 'down' | 'flat';

export type StatisticsKpiCategory =
  | 'lessons'
  | 'vocabulary'
  | 'practice'
  | 'quiz'
  | 'speaking'
  | 'dailyGoals'
  | 'streak'
  | 'roster'
  | 'school'
  | 'billing';

export type StatisticsKpiDto = {
  id: string;
  category: StatisticsKpiCategory;
  label: string;
  value: string;
  deltaLabel: string;
  trend: StatsTrendDirection;
};

export type StatisticsTrendPointDto = {
  label: string;
  value: number;
};

export type StatisticsVocabularyTrendPointDto = {
  label: string;
  added: number;
  known: number;
  reviewed: number;
};

export type StatisticsPracticeTrendPointDto = {
  label: string;
  vocabularyMinutes: number;
  quizMinutes: number;
  speakingMinutes: number;
  gamesMinutes: number;
};

export type StatisticsDailyGoalsTrendPointDto = {
  label: string;
  /** 0–100 percent of the four daily slots completed that day */
  completionPercent: number;
  slotsCompleted: number;
};

export type StatisticsBreakdownSliceDto = {
  id: string;
  label: string;
  value: number;
};

export type StatisticsLessonsSectionDto = {
  planned: number;
  completed: number;
  cancelled: number;
  credited: number;
  completionRatePercent: number;
  hours: number;
  /** Completed lessons with `kind = group`. */
  groupLessonsCompleted?: number;
  trend: StatisticsTrendPointDto[];
  statusBreakdown: StatisticsBreakdownSliceDto[];
};

export type StatisticsVocabularySectionDto = {
  wordsAdded: number;
  wordsReviewed: number;
  wordsMarkedLearned: number;
  trend: StatisticsVocabularyTrendPointDto[];
  statusBreakdown: StatisticsBreakdownSliceDto[];
};

export type StatisticsPracticeSectionDto = {
  totalMinutes: number;
  vocabularyMinutes: number;
  quizMinutes: number;
  speakingMinutes: number;
  gamesMinutes: number;
  trend: StatisticsPracticeTrendPointDto[];
};

export type StatisticsQuizSectionDto = {
  attempts: number;
  perfectAttempts: number;
  bestScorePercent: number;
  questionsCorrect: number;
};

export type StatisticsSpeakingSectionDto = {
  submissions: number;
  reviewsReceived: number;
  minutes: number;
};

export type StatisticsDailyGoalsSectionDto = {
  slotsCompleted: number;
  slotsAvailable: number;
  daysWithAllGoals: number;
  daysInRange: number;
  trend: StatisticsDailyGoalsTrendPointDto[];
};

export type StatisticsDashboardLayout = 'student' | 'teacher' | 'admin' | 'super_admin';

export type StatisticsStudentScope = 'all' | 'my_students';

/** Staff profile: operations (lessons, roster, billing) vs learning activity aggregates. */
export type StatisticsDashboardFocus = 'operations' | 'learning';

export type StatisticsStaffOverviewDto = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  homeworkReviewed: number;
  speakingReviewsDone: number;
  speakingPendingReview: number;
};

export type StatisticsSchoolOverviewDto = {
  studentCount: number;
  teacherCount: number;
  lessonsInPeriod: number;
  utilizationPercent: number;
};

export type StatisticsRosterEntryDto = {
  studentId: string;
  displayName: string;
  completedLessons: number;
  plannedLessons: number;
  cancelledLessons: number;
  /** Cancelled lessons that still counted as credited (paid). */
  cancelledCredited: number;
  lessonHours: number;
  practiceMinutes: number;
  wordsAdded: number;
  wordsLearned: number;
  quizAttempts: number;
  speakingSubmissions: number;
  homeworkReviewed: number;
  streakDays: number;
  /** Resolved price per lesson (minor units); set for school-wide roster. */
  pricePerLessonMinor?: number;
  currency?: string;
  /** Successful payments in the selected period (minor units). */
  paidInPeriodMinor?: number;
  /** Lesson credits added to balance in period (purchase + manual). */
  lessonsGrantedInPeriod?: number;
  /** Completed lessons × price per lesson (minor units). */
  billableMinor?: number;
  /** Human-readable mix, e.g. `5× 1:1, 2× Group`. */
  lessonTypeLabel?: string;
  groupLessonsCompleted?: number;
  individualLessonsCompleted?: number;
};

export type StatisticsBillingOverviewDto = {
  currency: string;
  totalPaidInPeriodMinor: number;
  totalLessonsGrantedInPeriod: number;
  totalBillableMinor: number;
  groupLessonsCount?: number;
  groupRevenueMinor?: number;
};

export type StatisticsDashboardDto = {
  layout: StatisticsDashboardLayout;
  subjectRole: string;
  range: StatsRange;
  rangeLabel: string;
  rangeBounds: StatsDateRange;
  title: string;
  streakDays: number;
  kpis: StatisticsKpiDto[];
  lessons?: StatisticsLessonsSectionDto;
  vocabulary?: StatisticsVocabularySectionDto;
  practice?: StatisticsPracticeSectionDto;
  quiz?: StatisticsQuizSectionDto;
  speaking?: StatisticsSpeakingSectionDto;
  dailyGoals?: StatisticsDailyGoalsSectionDto;
  /** Echo of request scope for staff dashboards (admin/super-admin). Teachers always `my_students`. */
  studentScope?: StatisticsStudentScope;
  /** Staff KPI set: operations (default) or learning aggregates (admin all-students activity view). */
  statisticsFocus?: StatisticsDashboardFocus;
  staffOverview?: StatisticsStaffOverviewDto;
  schoolOverview?: StatisticsSchoolOverviewDto;
  roster?: StatisticsRosterEntryDto[];
  billingOverview?: StatisticsBillingOverviewDto;
  /** Staff member's own earnings for the selected period (teacher/admin/super-admin). */
  staffEarnings?: StaffEarningsSectionDto;
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Default custom range: previous UTC calendar month (1st through last day). */
export function defaultCustomStatsDateKeys(now = new Date()): { from: string; to: string } {
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const from = utcDateKey(new Date(Date.UTC(prevYear, prevMonth, 1)));
  const to = utcDateKey(new Date(Date.UTC(prevYear, prevMonth + 1, 0)));
  return { from, to };
}

/** Parse `YYYY-MM-DD` or return null. */
export function parseStatsDateKey(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return utcDateKey(parsed);
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

/** Inclusive UTC calendar range from date keys; `to` is capped at `now`. */
export function getCustomStatsRangeBounds(
  fromDateKey: string,
  toDateKey: string,
  now = new Date(),
): StatsDateRange {
  const fromKey = parseStatsDateKey(fromDateKey);
  const toKey = parseStatsDateKey(toDateKey);
  if (!fromKey || !toKey) {
    throw new Error('Invalid statistics date range');
  }
  if (fromKey > toKey) {
    throw new Error('Statistics range start must be on or before end');
  }
  const todayKey = utcDateKey(now);
  if (fromKey > todayKey || toKey > todayKey) {
    throw new Error('Statistics date range cannot be in the future');
  }
  const from = startOfUtcDay(new Date(`${fromKey}T00:00:00.000Z`));
  const toDay = startOfUtcDay(new Date(`${toKey}T00:00:00.000Z`));
  const dayCount =
    Math.floor((toDay.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  if (dayCount > STATS_CUSTOM_RANGE_MAX_DAYS) {
    throw new Error(`Statistics range cannot exceed ${STATS_CUSTOM_RANGE_MAX_DAYS} days`);
  }
  const to = new Date(Math.min(endOfUtcDay(toDay).getTime(), now.getTime()));
  return { from: from.toISOString(), to: to.toISOString() };
}

export function resolveStatsRangeBounds(
  range: StatsRange,
  now = new Date(),
  custom?: { from: string; to: string },
): StatsDateRange {
  if (range === 'custom') {
    if (!custom?.from || !custom?.to) {
      throw new Error('Custom statistics range requires from and to dates');
    }
    return getCustomStatsRangeBounds(custom.from, custom.to, now);
  }
  return getStatsRangeBounds(range, now);
}

export function getStatsRangeBounds(range: StatsRange, now = new Date()): StatsDateRange {
  if (range === 'custom') {
    throw new Error('Use resolveStatsRangeBounds for custom range');
  }
  const end = now;
  if (range === 'week') {
    const start = startOfUtcDay(addUtcDays(now, -6));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (range === 'month') {
    const start = startOfUtcDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (range === 'quarter') {
    const quarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
    const start = startOfUtcDay(new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth, 1)));
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const start = startOfUtcDay(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)));
  return { from: start.toISOString(), to: end.toISOString() };
}

export function previousStatsRangeBounds(range: StatsDateRange): StatsDateRange {
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const durationMs = to - from;
  const previousTo = new Date(from - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  return { from: previousFrom.toISOString(), to: previousTo.toISOString() };
}

export function statsRangeLabel(range: StatsRange, bounds?: StatsDateRange): string {
  if (range === 'custom' && bounds) {
    return `${bounds.from.slice(0, 10)} — ${bounds.to.slice(0, 10)}`;
  }
  if (range === 'week') return 'Current week';
  if (range === 'month') return 'Current month';
  if (range === 'quarter') return 'Current quarter';
  if (range === 'year') return 'Current year';
  return 'Custom range';
}

export function listUtcDateKeysInRange(from: Date, to: Date, maxDays = 120): string[] {
  const start = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  const keys: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && keys.length < maxDays) {
    keys.push(utcDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

export function dateKeyInBounds(dateKey: string, from: Date, to: Date): boolean {
  const ts = new Date(`${dateKey}T12:00:00.000Z`).getTime();
  return ts >= startOfUtcDay(from).getTime() && ts <= new Date(to).getTime();
}

export function isoInRange(iso: string, from: Date, to: Date): boolean {
  const ts = new Date(iso).getTime();
  return ts >= new Date(from).getTime() && ts <= new Date(to).getTime();
}
