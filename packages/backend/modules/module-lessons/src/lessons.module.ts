import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { LessonsService } from './application/lessons.service';
import { LessonAttachmentService } from './application/lesson-attachment.service';
import { GoogleCalendarService } from './infrastructure/google-calendar.service';
import { LessonFilesController } from './presentation/rest/lesson-files.controller';
import { LessonsResolver } from './presentation/graphql/lessons.resolver';
import { ScheduledLessonsController } from './presentation/rest/scheduled-lessons.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduledLessonsController, LessonFilesController],
  providers: [LessonsService, GoogleCalendarService, LessonAttachmentService, LessonsResolver],
  exports: [LessonsService, GoogleCalendarService, LessonAttachmentService, LessonsResolver],
})
export class LessonsModule {}
