import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { ProfileNotificationPrefs } from '@pkg/types';

@Injectable()
export class NotificationPrefsService {
  constructor(private readonly prisma: PrismaService) {}

  toPrefs(user: {
    notifyLessonReminder: boolean;
    notifyStreakAlert: boolean;
    notifyWeeklyReport: boolean;
    notifyNewVocab: boolean;
    notifyTeacherMessages: boolean;
  }): ProfileNotificationPrefs {
    return {
      lessonReminder: user.notifyLessonReminder,
      streakAlert: user.notifyStreakAlert,
      weeklyReport: user.notifyWeeklyReport,
      newVocab: user.notifyNewVocab,
      teacherMessages: user.notifyTeacherMessages,
    };
  }

  async getPrefs(userId: string): Promise<ProfileNotificationPrefs | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notifyLessonReminder: true,
        notifyStreakAlert: true,
        notifyWeeklyReport: true,
        notifyNewVocab: true,
        notifyTeacherMessages: true,
      },
    });
    return user ? this.toPrefs(user) : null;
  }
}
