import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { lessonEndUtc, lessonStartUtc } from '../../../lib/lessonTime';

type ConflictStrategy = 'any-overlap' | 'same-teacher-overlap';

export function hasTimeConflict(
  lessons: ScheduledLessonDto[],
  candidate: ScheduledLessonDto,
  ignoreLessonId?: number,
  strategy: ConflictStrategy = 'any-overlap',
): boolean {
  const c0 = lessonStartUtc(candidate).getTime();
  const c1 = lessonEndUtc(candidate).getTime();
  return lessons
    .filter((lesson) => lesson.id !== ignoreLessonId)
    .filter((lesson) =>
      strategy === 'same-teacher-overlap' ? lesson.teacherId === candidate.teacherId : true,
    )
    .some((lesson) => {
      const l0 = lessonStartUtc(lesson).getTime();
      const l1 = lessonEndUtc(lesson).getTime();
      return c0 < l1 && c1 > l0;
    });
}

export function isPastSlot(lesson: Pick<ScheduledLessonDto, 'date' | 'startTime' | 'timezoneId'>): boolean {
  return lessonStartUtc(lesson as ScheduledLessonDto).getTime() < Date.now();
}

