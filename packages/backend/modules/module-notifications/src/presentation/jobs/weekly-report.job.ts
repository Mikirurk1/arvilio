import { Injectable, Logger } from '@nestjs/common';
import { NotificationKind } from '@prisma/client';
import { DashboardService } from '@be/auth';
import { PrismaService } from '@be/prisma';
import { NotificationDispatchService } from '../../application/notification-dispatch.service';
import { NotificationsMailService } from '../../application/notifications-mail.service';
import { telegramWeeklyReport } from '../../shared/notification-telegram.format';

@Injectable()
export class WeeklyReportJob {
  private readonly logger = new Logger(WeeklyReportJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardService,
    private readonly dispatch: NotificationDispatchService,
    private readonly mail: NotificationsMailService,
  ) {}

  private isoWeekKey(d: Date): string {
    const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  async run(): Promise<void> {
    const weekKey = this.isoWeekKey(new Date());
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT', status: 'ACTIVE', notifyWeeklyReport: true },
      select: { id: true, email: true, displayName: true, notifyWeeklyReport: true },
    });

    for (const student of students) {
      const dedupeKey = `week:${weekKey}`;
      const summary = await this.dashboard.summaryFor(student.id);
      const appUrl = this.mail.appUrl();

      await this.dispatch.dispatch({
        userId: student.id,
        email: student.email,
        displayName: student.displayName,
        kind: NotificationKind.WEEKLY_REPORT,
        dedupeKey,
        enabled: student.notifyWeeklyReport,
        emailTemplate: 'weekly-report',
        emailVars: {
          displayName: student.displayName,
          lessonsThisWeek: String(summary.lessonsThisWeek),
          lessonsCompleted: String(summary.lessonsCompleted),
          vocabularyCount: String(summary.vocabularyCount),
          reviewCount: String(summary.reviewCount),
          appUrl,
        },
        telegramHtml: telegramWeeklyReport({
          displayName: student.displayName,
          lessonsThisWeek: summary.lessonsThisWeek,
          lessonsCompleted: summary.lessonsCompleted,
          vocabularyCount: summary.vocabularyCount,
          reviewCount: summary.reviewCount,
          appUrl,
        }),
      });
    }

    this.logger.debug(`Weekly report job complete (${students.length} students)`);
  }
}
