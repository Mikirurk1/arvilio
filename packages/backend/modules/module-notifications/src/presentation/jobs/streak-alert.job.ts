import { Injectable, Logger } from '@nestjs/common';
import { NotificationKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { NotificationDispatchService } from '../../application/notification-dispatch.service';
import { NotificationsMailService } from '../../application/notifications-mail.service';
import { telegramStreakAlert } from '../../shared/notification-telegram.format';
import { StreakService } from '../../application/streak.service';

@Injectable()
export class StreakAlertJob {
  private readonly logger = new Logger(StreakAlertJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
    private readonly mail: NotificationsMailService,
    private readonly streak: StreakService,
  ) {}

  async run(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await this.prisma.schoolMembership.findMany({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
        school: { status: { not: 'SUSPENDED' } },
        user: { status: 'ACTIVE', notifyStreakAlert: true },
      },
      select: {
        school: { select: { name: true } },
        user: { select: { id: true, email: true, displayName: true, notifyStreakAlert: true } },
      },
    });
    // Deduplicate by userId — keep first membership (primary school association).
    const seen = new Map<string, { user: (typeof rows)[0]['user']; schoolName: string }>();
    for (const r of rows) {
      if (!seen.has(r.user.id)) seen.set(r.user.id, { user: r.user, schoolName: r.school.name });
    }
    const students = [...seen.values()];

    for (const { user: student, schoolName } of students) {
      const snapshot = await this.streak.snapshotForStudent(student.id);
      if (!snapshot.atRisk || snapshot.streakDays < 1) continue;

      const dedupeKey = `streak:${today}`;
      const appUrl = this.mail.appUrl();

      await this.dispatch.dispatch({
        schoolName,
        userId: student.id,
        email: student.email,
        displayName: student.displayName,
        kind: NotificationKind.STREAK_ALERT,
        dedupeKey,
        enabled: student.notifyStreakAlert,
        emailTemplate: 'streak-alert',
        emailVars: {
          displayName: student.displayName,
          streakDays: String(snapshot.streakDays),
          appUrl,
        },
        telegramHtml: telegramStreakAlert({
          displayName: student.displayName,
          streakDays: snapshot.streakDays,
          appUrl,
        }),
      });
    }

    this.logger.debug(`Streak alert job complete (${students.length} students)`);
  }
}
