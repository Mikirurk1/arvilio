import type { ScheduledLessonDto } from '@pkg/types';
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

export type ScheduleConflict = {
  occurrence: ScheduledLessonDto;
  conflict: ScheduledLessonDto;
};

/** Check each proposed update against lessons outside the batch (e.g. series siblings update together). */
export function findScheduleConflictsForUpdates(
  lessons: ScheduledLessonDto[],
  updates: ScheduledLessonDto[],
  strategy: ConflictStrategy = 'any-overlap',
): ScheduleConflict[] {
  const updateIds = new Set(updates.map((lesson) => lesson.id));
  const results: ScheduleConflict[] = [];

  for (const candidate of updates) {
    const c0 = lessonStartUtc(candidate).getTime();
    const c1 = lessonEndUtc(candidate).getTime();
    for (const lesson of lessons) {
      if (updateIds.has(lesson.id)) continue;
      if (strategy === 'same-teacher-overlap' && lesson.teacherId !== candidate.teacherId) {
        continue;
      }
      const l0 = lessonStartUtc(lesson).getTime();
      const l1 = lessonEndUtc(lesson).getTime();
      if (c0 < l1 && c1 > l0) {
        results.push({ occurrence: candidate, conflict: lesson });
        break;
      }
    }
  }

  return results;
}

export function findPastSlotsInUpdates(updates: ScheduledLessonDto[]): ScheduledLessonDto[] {
  return updates.filter((lesson) => isPastSlot(lesson));
}

