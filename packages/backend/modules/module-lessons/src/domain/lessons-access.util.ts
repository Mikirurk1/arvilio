import { ForbiddenException, NotFoundException } from '@nestjs/common';

export type LessonMembershipRow = {
  teacherId: string;
  studentId: string;
  participants?: Array<{ userId: string }>;
};

export function isLessonMember(lesson: LessonMembershipRow, userId: string): boolean {
  if (lesson.teacherId === userId || lesson.studentId === userId) return true;
  return lesson.participants?.some((row) => row.userId === userId) ?? false;
}

export function assertLessonMembership(
  lesson: LessonMembershipRow | null | undefined,
  userId: string,
): asserts lesson is LessonMembershipRow {
  if (!lesson) throw new NotFoundException('Lesson not found');
  if (!isLessonMember(lesson, userId)) {
    throw new ForbiddenException('Not allowed to access this lesson');
  }
}

export function lessonMembershipWhere(userId: string) {
  return {
    OR: [
      { teacherId: userId },
      { studentId: userId },
      { participants: { some: { userId } } },
    ],
  };
}
