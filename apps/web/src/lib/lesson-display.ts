import type { ScheduledLessonDto } from '@pkg/types';

/** Calendar/list label for lesson students (group shows +N). */
export function formatLessonStudentLabel(lesson: ScheduledLessonDto): string {
  if (lesson.kind !== 'group') return lesson.studentName;
  const names =
    lesson.participants?.map((row) => row.displayName).filter(Boolean) ??
    [lesson.studentName];
  if (names.length <= 2) return names.join(', ');
  return `${names[0]} +${names.length - 1}`;
}

export function isGroupLesson(lesson: Pick<ScheduledLessonDto, 'kind'>): boolean {
  return lesson.kind === 'group';
}
