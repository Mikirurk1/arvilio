import type {
  DashboardSummaryDto,
  LearningStreakDto,
  ScheduledLessonBackendDto,
  VocabularyOverviewDto,
} from '@pkg/types';

export type DashboardHero =
  | {
      kind: 'lesson';
      lessonId: string;
      title: string;
      subtitle: string;
      href: string;
      progressPct: number | null;
    }
  | {
      kind: 'vocabulary';
      title: string;
      subtitle: string;
      href: string;
      progressPct: number;
    }
  | {
      kind: 'practice';
      title: string;
      subtitle: string;
      href: string;
      progressPct: null;
    };

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function todayDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDashboardSubtitle(streak: LearningStreakDto | null, now = new Date()): string {
  const dateStr = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
  if (!streak || streak.streakDays === 0) return dateStr;
  return `${dateStr} · You're on a ${streak.streakDays}-day streak — keep it up!`;
}

function formatLessonTime(startTime: string): string {
  const [h, m] = startTime.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return startTime;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function statusLabel(status: ScheduledLessonBackendDto['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function pickTodayLessons(
  lessons: ScheduledLessonBackendDto[],
  today = todayDateKey(),
): ScheduledLessonBackendDto[] {
  return lessons
    .filter((l) => l.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayDateKey(dt);
}

/** Lessons after today through the next 7 days (excludes today and cancelled). */
export function pickUpcomingWeekLessons(
  lessons: ScheduledLessonBackendDto[],
  today = todayDateKey(),
  limit = 5,
): ScheduledLessonBackendDto[] {
  const end = addDaysToDateKey(today, 7);
  return lessons
    .filter((l) => l.status !== 'cancelled' && l.date > today && l.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, limit);
}

export function pickPendingHomeworkLessons(
  lessons: ScheduledLessonBackendDto[],
  limit = 5,
): ScheduledLessonBackendDto[] {
  return lessons
    .filter(
      (l) =>
        l.status !== 'cancelled' &&
        l.studentResponse?.status === 'submitted' &&
        !l.studentResponse.homeworkChecked,
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
    .slice(0, limit);
}

export function lessonCountByDate(
  lessons: ScheduledLessonBackendDto[],
  year: number,
  monthIndex0: number,
): Record<number, number> {
  const month = String(monthIndex0 + 1).padStart(2, '0');
  const prefix = `${year}-${month}-`;
  const counts: Record<number, number> = {};
  for (const lesson of lessons) {
    if (!lesson.date.startsWith(prefix) || lesson.status === 'cancelled') continue;
    const day = Number(lesson.date.slice(8, 10));
    if (!Number.isFinite(day)) continue;
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return counts;
}

export function formatLessonTime12h(startTime: string): string {
  return formatLessonTime(startTime);
}

export function formatShortWeekdayDate(dateKey: string, now = new Date()): string {
  const today = todayDateKey(now);
  if (dateKey === today) return 'Today';
  const tomorrow = addDaysToDateKey(today, 1);
  if (dateKey === tomorrow) return 'Tomorrow';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(
    dt,
  );
}

export function resolveDashboardHero(
  input: {
    isStudent: boolean;
    lessons: ScheduledLessonBackendDto[];
    summary: DashboardSummaryDto | null;
    overview: VocabularyOverviewDto | null;
    today?: string;
  },
): DashboardHero {
  const today = input.today ?? todayDateKey();
  const todayLessons = pickTodayLessons(input.lessons, today);
  const nextPlanned = todayLessons.find((l) => l.status === 'planned') ?? todayLessons[0];

  if (nextPlanned) {
    return {
      kind: 'lesson',
      lessonId: nextPlanned.id,
      title: nextPlanned.title,
      subtitle: `${formatLessonTime(nextPlanned.startTime)} · ${statusLabel(nextPlanned.status)}`,
      href: `/lessons/${nextPlanned.id}`,
      progressPct: null,
    };
  }

  const reviewCount = input.summary?.reviewCount ?? 0;
  if (input.isStudent && reviewCount > 0) {
    const total = input.overview?.totalWords ?? 0;
    const mastered = input.overview?.masteredWords ?? 0;
    const progressPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return {
      kind: 'vocabulary',
      title: 'Vocabulary review',
      subtitle: `${reviewCount} word${reviewCount === 1 ? '' : 's'} due`,
      href: '/practice/vocabulary',
      progressPct,
    };
  }

  return {
    kind: 'practice',
    title: input.isStudent ? 'Keep practicing' : 'Your teaching day',
    subtitle: input.isStudent ? 'Build your streak with a quick session' : 'Open practice tools and resources',
    href: '/practice',
    progressPct: null,
  };
}

export function monthCalendarMeta(streak: LearningStreakDto | null, now = new Date()) {
  if (!streak) {
    const year = now.getFullYear();
    const monthIndex = now.getMonth() + 1;
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    const leadingBlanks = (new Date(year, monthIndex - 1, 1).getDay() + 6) % 7;
    return {
      title: `${MONTH_NAMES[monthIndex - 1]} ${year}`,
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      leadingBlanks,
      today: now.getDate(),
      streakDays: 0,
      activeDays: [] as number[],
    };
  }

  const monthIndex = MONTH_NAMES.indexOf(streak.month) + 1;
  const daysInMonth = new Date(streak.year, monthIndex, 0).getDate();
  const leadingBlanks = (new Date(streak.year, monthIndex - 1, 1).getDay() + 6) % 7;
  const isCurrentMonth =
    streak.year === now.getFullYear() && monthIndex === now.getMonth() + 1;

  return {
    title: `${streak.month} ${streak.year}`,
    days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    leadingBlanks,
    today: isCurrentMonth ? now.getDate() : -1,
    streakDays: streak.streakDays,
    activeDays: streak.activeDays,
  };
}

export function vocabStatusClass(status: string): string {
  if (status === 'new') return 'new';
  if (status === 'learned') return 'known';
  return 'learning';
}

export function vocabStatusLabel(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
