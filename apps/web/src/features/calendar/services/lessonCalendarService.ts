import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { mockScheduledLessons } from '../../../mocks';

export function getInitialLessons(): ScheduledLessonDto[] {
  return [...mockScheduledLessons].sort((a, b) =>
    `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
  );
}

export function getLessonsByStudent(
  lessons: ScheduledLessonDto[],
  studentId: number,
): ScheduledLessonDto[] {
  return lessons.filter((lesson) => lesson.studentId === studentId);
}

