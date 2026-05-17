import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import { AuthGuard, CurrentUser } from '@soenglish/module-auth';
import type { CalendarEventDto } from '@soenglish/shared-types';

@Controller('calendar')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('events')
  async getCalendarEvents(@CurrentUser() userId: string): Promise<CalendarEventDto[]> {
    const lessons = await this.prisma.scheduledLesson.findMany({
      where: { OR: [{ teacherId: userId }, { studentId: userId }] },
      include: {
        teacher: { select: { id: true, displayName: true } },
        student: { select: { id: true, displayName: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return lessons.map((lesson, index) => ({
      id: index + 1,
      title: lesson.title,
      date: lesson.date,
      time: lesson.startTime,
      duration: lesson.duration,
      teacherId: hashId(lesson.teacher.id),
      teacherName: lesson.teacher.displayName,
      studentId: hashId(lesson.student.id),
      studentName: lesson.student.displayName,
      statusId: lesson.status === 'COMPLETED' ? 2 : lesson.status === 'CANCELLED' ? 3 : 1,
    }));
  }
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

@Module({
  controllers: [ProgressController],
})
export class ProgressModule {}
