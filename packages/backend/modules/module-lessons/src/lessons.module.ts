import { Module } from '@nestjs/common';
import { BillingModule } from '@be/billing';
import { PrismaModule } from '@be/prisma';
import { FeatureGuard } from '@be/auth';
import { LessonsService } from './application/lessons.service';
import { LessonAttachmentService } from './application/lesson-attachment.service';
import { GoogleCalendarService } from './infrastructure/google-calendar.service';
import { ZoomService } from './infrastructure/zoom.service';
import { LiveKitService } from './infrastructure/livekit.service';
import { GoogleMeetProvider } from './infrastructure/video-providers/google-meet.provider';
import { ZoomProvider } from './infrastructure/video-providers/zoom.provider';
import { LiveKitProvider } from './infrastructure/video-providers/livekit.provider';
import { VideoMeetingProviderResolver } from './infrastructure/video-providers/video-meeting-provider.resolver';
import { LessonFilesController } from './presentation/rest/lesson-files.controller';
import { LessonsResolver } from './presentation/graphql/lessons.resolver';
import { StudentGroupsResolver } from './presentation/graphql/student-groups.resolver';
import { StudentGroupsService } from './application/student-groups.service';
import { ScheduledLessonsController } from './presentation/rest/scheduled-lessons.controller';
import { ZoomOAuthController } from './presentation/rest/zoom-oauth.controller';
import { ZoomWebhookController } from './presentation/rest/zoom-webhook.controller';
import { LiveKitWebhookController } from './presentation/rest/livekit-webhook.controller';

@Module({
  imports: [PrismaModule, BillingModule],
  controllers: [
    ScheduledLessonsController,
    LessonFilesController,
    ZoomOAuthController,
    ZoomWebhookController,
    LiveKitWebhookController,
  ],
  providers: [
    FeatureGuard,
    LessonsService,
    StudentGroupsService,
    GoogleCalendarService,
    ZoomService,
    LiveKitService,
    GoogleMeetProvider,
    ZoomProvider,
    LiveKitProvider,
    VideoMeetingProviderResolver,
    LessonAttachmentService,
    LessonsResolver,
    StudentGroupsResolver,
  ],
  exports: [
    LessonsService,
    StudentGroupsService,
    GoogleCalendarService,
    ZoomService,
    LiveKitService,
    VideoMeetingProviderResolver,
    LessonAttachmentService,
    LessonsResolver,
    StudentGroupsResolver,
  ],
})
export class LessonsModule {}
