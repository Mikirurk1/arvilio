import { ForbiddenException, NotFoundException } from '@nestjs/common';

export function assertLessonMembership(
  lesson: { teacherId: string; studentId: string } | null | undefined,
  userId: string,
): asserts lesson is { teacherId: string; studentId: string } {
  if (!lesson) throw new NotFoundException('Lesson not found');
  if (lesson.teacherId !== userId && lesson.studentId !== userId) {
    throw new ForbiddenException('Not allowed to access this lesson');
  }
}
