import type { ScheduledLessonBackendDto, ScheduledLessonDto } from '@pkg/types';
import {
  fromBackendLessons,
  hydrateLessonPartyNames,
} from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { lessonStartUtc } from './lessonTime';

export function buildStudentLessonList(
  lessons: ScheduledLessonBackendDto[],
  nameByNumericId: Map<number, string>,
): ScheduledLessonDto[] {
  const hydrated = hydrateLessonPartyNames(fromBackendLessons(lessons), nameByNumericId);
  return [...hydrated].sort(
    (a, b) => lessonStartUtc(a).getTime() - lessonStartUtc(b).getTime(),
  );
}
