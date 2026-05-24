import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@be/auth';
import { MailModule } from '@be/mail';
import { PrismaModule } from '@be/prisma';
import { NotificationDeliveryService } from './application/notification-delivery.service';
import { NotificationDispatchService } from './application/notification-dispatch.service';
import { NotificationPrefsService } from './application/notification-prefs.service';
import { NotificationsMailService } from './application/notifications-mail.service';
import { StreakService } from './application/streak.service';
import { TeacherMessagesService } from './application/teacher-messages.service';
import { TelegramDeliveryService } from './infrastructure/telegram-delivery.service';
import { LessonReminderJob } from './presentation/jobs/lesson-reminder.job';
import { NewVocabJob } from './presentation/jobs/new-vocab.job';
import { StreakAlertJob } from './presentation/jobs/streak-alert.job';
import { WeeklyReportJob } from './presentation/jobs/weekly-report.job';
import { NotificationsScheduler } from './presentation/notifications.scheduler';

@Module({
  imports: [PrismaModule, MailModule, forwardRef(() => AuthModule)],
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
