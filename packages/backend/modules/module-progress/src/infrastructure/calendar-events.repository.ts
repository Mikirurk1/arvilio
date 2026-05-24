import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

@Injectable()
export class CalendarEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findScheduledLessonsForUser(userId: string) {
    return this.prisma.scheduledLesson.findMany({
      where: { OR: [{ teacherId: userId }, { studentId: userId }] },
      include: {
        teacher: { select: { id: true, displayName: true } },
        student: { select: { id: true, displayName: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
