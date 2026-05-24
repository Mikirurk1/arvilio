import type {
  DashboardSummaryDto,
  ScheduledLessonBackendDto,
  StudentWordCardDto,
  VocabularyOverviewDto,
} from '@pkg/types';

const REVIEW_STATUSES = new Set(['new', 'repeated', 'mistakes_work']);

function lessonLocalDate(lesson: ScheduledLessonBackendDto): Date {
  return new Date(`${lesson.date}T12:00:00`);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function filterLessonsForStudent(
  lessons: ScheduledLessonBackendDto[] | null | undefined,
  studentId: string,
): ScheduledLessonBackendDto[] {
  if (!lessons?.length) return [];
  return lessons.filter((lesson) => lesson.studentId === studentId);
}

export function buildStudentVocabularyOverview(
  cards: StudentWordCardDto[] | null | undefined,
): VocabularyOverviewDto {
  const rows = cards ?? [];
  const masteredWords = rows.filter((card) => card.status === 'learned').length;
  const dueToday = rows.filter((card) => REVIEW_STATUSES.has(card.status)).length;
  return {
    totalWords: rows.length,
    masteredWords,
    dueToday,
  };
}

export function buildStudentDashboardSummary(
  lessons: ScheduledLessonBackendDto[],
  cards: StudentWordCardDto[],
): DashboardSummaryDto {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const lessonsToday = lessons.filter((lesson) => isSameCalendarDay(lessonLocalDate(lesson), now)).length;
  const lessonsThisWeek = lessons.filter((lesson) => lessonLocalDate(lesson) >= weekStart).length;
  const lessonsCompleted = lessons.filter((lesson) => lesson.status === 'completed').length;
  const reviewCount = cards.filter((card) => REVIEW_STATUSES.has(card.status)).length;

  return {
    role: 'student',
    lessonsToday,
    lessonsThisWeek,
    lessonsCompleted,
    vocabularyCount: cards.length,
    reviewCount,
  };
}
