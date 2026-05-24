import type { LessonPartyOption } from '../hooks/use-lesson-party-options';

export function isRecurrenceAllowedForStudent(
  studentId: number,
  students: Array<Pick<LessonPartyOption, 'id' | 'scheduleType'>>,
): boolean {
  const student = students.find((row) => row.id === studentId);
  return student?.scheduleType !== false;
}
