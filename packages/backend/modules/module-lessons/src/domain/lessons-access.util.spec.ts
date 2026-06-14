import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { assertLessonMembership } from './lessons-access.util';

describe('lessons-access.util', () => {
  const lesson = { teacherId: 'teacher-1', studentId: 'student-1' };

  it('allows teacher or student participant', () => {
    expect(() => assertLessonMembership(lesson, 'teacher-1')).not.toThrow();
    expect(() => assertLessonMembership(lesson, 'student-1')).not.toThrow();
  });

  it('forbids unrelated user', () => {
    expect(() => assertLessonMembership(lesson, 'other')).toThrow(ForbiddenException);
  });

  it('allows group participants', () => {
    const groupLesson = {
      teacherId: 'teacher-1',
      studentId: 'student-1',
      participants: [{ userId: 'student-2' }],
    };
    expect(() => assertLessonMembership(groupLesson, 'student-2')).not.toThrow();
  });

  it('throws when lesson missing', () => {
    expect(() => assertLessonMembership(null, 'teacher-1')).toThrow(NotFoundException);
  });
});
