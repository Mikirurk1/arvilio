import type { ScheduledLessonDto } from '@pkg/types';

export function getInitialLessons(): ScheduledLessonDto[] {
  return [];
}

export function getLessonsByStudent(
  lessons: ScheduledLessonDto[],
  studentId: number,
): ScheduledLessonDto[] {
  return lessons.filter((lesson) => lesson.studentId === studentId);
}

