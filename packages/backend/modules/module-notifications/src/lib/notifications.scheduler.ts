import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessonReminderJob } from './lesson-reminder.job';
import { NewVocabJob } from './new-vocab.job';
import { StreakAlertJob } from './streak-alert.job';
import { WeeklyReportJob } from './weekly-report.job';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly lessonReminders: LessonReminderJob,
    private readonly streakAlerts: StreakAlertJob,
    private readonly weeklyReport: WeeklyReportJob,
    private readonly newVocab: NewVocabJob,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleLessonReminders(): Promise<void> {
    try {
      await this.lessonReminders.run();
    } catch (err) {
      this.logger.error('Lesson reminder job failed', err instanceof Error ? err.stack : String(err));
    }
  }

  /** Daily 20:00 UTC — streak at-risk nudge */
  @Cron('0 20 * * *')
  async handleStreakAlerts(): Promise<void> {
    try {
      await this.streakAlerts.run();
    } catch (err) {
      this.logger.error('Streak alert job failed', err instanceof Error ? err.stack : String(err));
    }
  }

  /** Monday 09:00 UTC */
  @Cron('0 9 * * 1')
  async handleWeeklyReports(): Promise<void> {
    try {
      await this.weeklyReport.run();
    } catch (err) {
      this.logger.error('Weekly report job failed', err instanceof Error ? err.stack : String(err));
    }
  }

  /** Daily 08:00 UTC */
  @Cron('0 8 * * *')
  async handleNewVocab(): Promise<void> {
    try {
      await this.newVocab.run();
    } catch (err) {
      this.logger.error('New vocab job failed', err instanceof Error ? err.stack : String(err));
    }
  }
}
