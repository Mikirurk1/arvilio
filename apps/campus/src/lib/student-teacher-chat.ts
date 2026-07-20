import type { ScheduledLessonDto } from '@pkg/types';
import { partyStringId } from '../features/lesson-modal/scheduledLessonsBackendAdapter';

/** Backend user id for the student's teacher chat (`/chat?peer=`). */
export function resolveStudentTeacherChatPeerId(params: {
  assignedTeacherId?: string | null;
  lessons: ScheduledLessonDto[];
  studentPartyNumericId: number | null;
}): string | null {
  const fromProfile = params.assignedTeacherId?.trim();
  if (fromProfile) return fromProfile;

  if (params.studentPartyNumericId == null) return null;
  const myLesson = params.lessons.find(
    (lesson) => lesson.studentId === params.studentPartyNumericId,
  );
  if (!myLesson) return null;
  return partyStringId(myLesson.teacherId) ?? null;
}
