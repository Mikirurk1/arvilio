import type { ScheduledLessonDto } from '@pkg/types';
import {
  partyNumericId,
} from '../features/lesson-modal/scheduledLessonsBackendAdapter';
import { resolveStudentTeacherChatPeerId } from './student-teacher-chat';

describe('student-teacher-chat', () => {
  it('prefers assigned teacher id from profile', () => {
    expect(
      resolveStudentTeacherChatPeerId({
        assignedTeacherId: 'teacher-profile',
        lessons: [],
        studentPartyNumericId: 1,
      }),
    ).toBe('teacher-profile');
  });

  it('falls back to teacher from student lesson row', () => {
    const teacherId = 'teacher-from-lesson';
    const studentId = 'student-1';
    const teacherNum = partyNumericId(teacherId);
    const studentNum = partyNumericId(studentId);
    const lesson = {
      studentId: studentNum,
      teacherId: teacherNum,
    } as ScheduledLessonDto;

    expect(
      resolveStudentTeacherChatPeerId({
        assignedTeacherId: null,
        lessons: [lesson],
        studentPartyNumericId: studentNum,
      }),
    ).toBe(teacherId);
  });

  it('returns null when no teacher source', () => {
    expect(
      resolveStudentTeacherChatPeerId({
        assignedTeacherId: null,
        lessons: [],
        studentPartyNumericId: null,
      }),
    ).toBeNull();
  });
});
