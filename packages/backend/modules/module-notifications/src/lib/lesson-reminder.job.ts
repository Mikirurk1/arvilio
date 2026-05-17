import { Injectable, Logger } from '@nestjs/common';
import { NotificationKind } from '@prisma/client';
import { PrismaService } from '@soenglish/data-access-prisma';
import { fromZonedTime } from 'date-fns-tz';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationsMailService } from './notifications-mail.service';
import { telegramLessonReminder } from './notification-telegram.format';

@Injectable()
export class LessonReminderJob {
  private readonly logger = new Logger(LessonReminderJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
    private readonly mail: NotificationsMailService,
  ) {}

  async run(): Promise<void> {
    const now = Date.now();
    const windowStart = now + 25 * 60 * 1000;
    const windowEnd = now + 35 * 60 * 1000;

    const lessons = await this.prisma.scheduledLesson.findMany({
      where: { status: 'PLANNED' },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            displayName: true,
            notifyLessonReminder: true,
          },
        },
        teacher: {
          select: {
            id: true,
            email: true,
            displayName: true,
            notifyLessonReminder: true,
          },
        },
      },
    });

    for (const lesson of lessons) {
      const startMs = fromZonedTime(
        `${lesson.date}T${lesson.startTime}:00`,
        lesson.timezone,
      ).getTime();
      if (startMs < windowStart || startMs > windowEnd) continue;

      const meetUrl = lesson.googleMeetUrl ?? this.mail.appUrl();
      const dedupeKey = `lesson:${lesson.id}:t-30`;

      const recipients = [lesson.student, lesson.teacher];

      for (const user of recipients) {
        await this.dispatch.dispatch({
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          kind: NotificationKind.LESSON_REMINDER,
          dedupeKey,
          enabled: user.notifyLessonReminder,
          emailTemplate: 'lesson-reminder',
          emailVars: {
            displayName: user.displayName,
            lessonTitle: lesson.title,
            lessonDate: lesson.date,
            startTime: lesson.startTime,
            timezone: lesson.timezone,
            meetUrl,
          },
          telegramHtml: telegramLessonReminder({
            displayName: user.displayName,
            lessonTitle: lesson.title,
            lessonDate: lesson.date,
            startTime: lesson.startTime,
            timezone: lesson.timezone,
            meetUrl,
          }),
        });
      }
    }

    this.logger.debug(`Lesson reminder scan complete (${lessons.length} planned lessons)`);
  }
}
