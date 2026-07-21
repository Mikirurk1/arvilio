import type { ScheduledLessonBackendDto } from '@pkg/types';
import {
  formatDashboardSubtitle,
  formatLessonTime12h,
  formatShortWeekdayDate,
  lessonCountByDate,
  monthCalendarMeta,
  pickPendingHomeworkLessons,
  pickTodayLessons,
  pickUpcomingWeekLessons,
  resolveDashboardHero,
  todayDateKey,
  vocabStatusClass,
  vocabStatusLabel,
} from './dashboard-hero';

const lesson = (
  overrides: Partial<ScheduledLessonBackendDto>,
): ScheduledLessonBackendDto =>
  ({
    id: 'l1',
    title: 'Grammar',
    date: '2026-05-20',
    startTime: '14:30',
    endTime: '15:30',
    duration: 60,
    timezone: 'UTC',
    teacherId: 't1',
    teacherName: 'Teacher',
    studentId: 's1',
    studentName: 'Student',
    status: 'planned',
    ...overrides,
  }) as ScheduledLessonBackendDto;

describe('dashboard-hero', () => {
  it('todayDateKey formats local calendar day', () => {
    expect(todayDateKey(new Date(2026, 4, 20, 23, 0, 0))).toBe('2026-05-20');
  });

  it('pickTodayLessons filters and sorts by start time', () => {
    const rows = pickTodayLessons(
      [
        lesson({ id: 'late', startTime: '18:00' }),
        lesson({ id: 'early', startTime: '09:00' }),
        lesson({ id: 'other-day', date: '2026-05-21' }),
      ],
      '2026-05-20',
    );
    expect(rows.map((r) => r.id)).toEqual(['early', 'late']);
  });

  it('pickUpcomingWeekLessons excludes today and cancelled', () => {
    const rows = pickUpcomingWeekLessons(
      [
        lesson({ id: 'today', date: '2026-05-20' }),
        lesson({ id: 'soon', date: '2026-05-22' }),
        lesson({ id: 'cancelled', date: '2026-05-23', status: 'cancelled' }),
        lesson({ id: 'far', date: '2026-05-30' }),
      ],
      '2026-05-20',
    );
    expect(rows.map((r) => r.id)).toEqual(['soon']);
  });

  it('resolveDashboardHero prefers today lesson', () => {
    const hero = resolveDashboardHero({
      isStudent: true,
      lessons: [lesson({ id: 'l-today', title: 'Speaking' })],
      summary: null,
      overview: null,
      today: '2026-05-20',
    });
    expect(hero.kind).toBe('lesson');
    if (hero.kind === 'lesson') {
      expect(hero.lessonId).toBe('l-today');
      expect(hero.href).toBe('/lessons/l-today');
    }
  });

  it('resolveDashboardHero falls back to vocabulary when reviews due', () => {
    const hero = resolveDashboardHero({
      isStudent: true,
      lessons: [],
      summary: { reviewCount: 3 } as never,
      overview: { totalWords: 10, masteredWords: 4 } as never,
      today: '2026-05-20',
    });
    expect(hero.kind).toBe('vocabulary');
    if (hero.kind === 'vocabulary') {
      expect(hero.progressPct).toBe(40);
    }
  });

  it('formatLessonTime12h converts 24h clock', () => {
    expect(formatLessonTime12h('14:05')).toBe('2:05 PM');
    expect(formatLessonTime12h('09:00')).toBe('9:00 AM');
  });

  it('formatDashboardSubtitle includes streak when active', () => {
    const now = new Date(2026, 4, 20, 12, 0, 0);
    expect(formatDashboardSubtitle(null, now)).not.toContain('streak');
    expect(formatDashboardSubtitle({ streakDays: 5 } as never, now)).toContain('5-day streak');
  });

  it('pickPendingHomeworkLessons finds unchecked submitted homework', () => {
    const rows = pickPendingHomeworkLessons([
      lesson({
        id: 'done',
        studentResponse: { status: 'submitted', homeworkChecked: true } as never,
      }),
      lesson({
        id: 'pending',
        studentResponse: { status: 'submitted', homeworkChecked: false } as never,
      }),
    ]);
    expect(rows.map((r) => r.id)).toEqual(['pending']);
  });

  it('lessonCountByDate counts non-cancelled lessons per day', () => {
    const counts = lessonCountByDate(
      [
        lesson({ date: '2026-05-20' }),
        lesson({ id: 'l2', date: '2026-05-20', status: 'cancelled' }),
        lesson({ id: 'l3', date: '2026-05-21' }),
      ],
      2026,
      4,
    );
    expect(counts[20]).toBe(1);
    expect(counts[21]).toBe(1);
  });

  it('formatShortWeekdayDate returns Today and Tomorrow labels', () => {
    const now = new Date(2026, 4, 20, 12, 0, 0);
    expect(formatShortWeekdayDate('2026-05-20', now)).toBe('Today');
    expect(formatShortWeekdayDate('2026-05-21', now)).toBe('Tomorrow');
  });

  it('monthCalendarMeta builds calendar grid from streak', () => {
    const meta = monthCalendarMeta({
      month: 'May',
      year: 2026,
      streakDays: 3,
      activeDays: [1, 2, 3],
    } as never);
    expect(meta.title).toBe('May 2026');
    expect(meta.streakDays).toBe(3);
    expect(meta.days.length).toBeGreaterThan(27);
  });

  it('vocabStatusClass and vocabStatusLabel map card states', () => {
    expect(vocabStatusClass('new')).toBe('new');
    expect(vocabStatusClass('mistakes_work')).toBe('learning');
    expect(vocabStatusLabel('mistakes_work')).toBe('Mistakes Work');
  });

  it('resolveDashboardHero practice fallback for teacher without lessons', () => {
    const hero = resolveDashboardHero({
      isStudent: false,
      lessons: [],
      summary: null,
      overview: null,
      today: '2026-05-20',
    });
    expect(hero.kind).toBe('practice');
    if (hero.kind === 'practice') {
      expect(hero.title).toBe('dashboard.hero.teachingDay');
    }
  });
});
