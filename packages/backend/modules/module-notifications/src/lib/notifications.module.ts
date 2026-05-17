import { Module } from '@nestjs/common';
import { AuthModule } from '@soenglish/module-auth';
import { MailModule } from '@soenglish/module-mail';
import { PrismaModule } from '@soenglish/data-access-prisma';
import { LessonReminderJob } from './lesson-reminder.job';
import { NewVocabJob } from './new-vocab.job';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationPrefsService } from './notification-prefs.service';
import { NotificationsMailService } from './notifications-mail.service';
import { TelegramDeliveryService } from './telegram-delivery.service';
import { NotificationsScheduler } from './notifications.scheduler';
import { StreakAlertJob } from './streak-alert.job';
import { StreakService } from './streak.service';
import { TeacherMessagesService } from './teacher-messages.service';
import { WeeklyReportJob } from './weekly-report.job';

@Module({
  imports: [PrismaModule, MailModule, AuthModule],
  providers: [
    NotificationDeliveryService,
    NotificationDispatchService,
    NotificationPrefsService,
    NotificationsMailService,
    TelegramDeliveryService,
    StreakService,
    LessonReminderJob,
    StreakAlertJob,
    WeeklyReportJob,
    NewVocabJob,
    TeacherMessagesService,
    NotificationsScheduler,
  ],
  exports: [TeacherMessagesService, NotificationPrefsService, StreakService],
})
export class NotificationsModule {}
