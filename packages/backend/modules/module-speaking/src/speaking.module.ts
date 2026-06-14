import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { SpeakingAccessService } from './application/speaking-access.service';
import { SpeakingAudioService } from './application/speaking-audio.service';
import { SpeakingSubmissionsService } from './application/speaking-submissions.service';
import { SpeakingTopicsService } from './application/speaking-topics.service';
import { SpeakingResolver } from './presentation/graphql/speaking.resolver';
import { SpeakingAudioController } from './presentation/rest/speaking-audio.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SpeakingAudioController],
  providers: [
    SpeakingAccessService,
    SpeakingAudioService,
    SpeakingTopicsService,
    SpeakingSubmissionsService,
    SpeakingResolver,
  ],
  exports: [SpeakingResolver],
})
export class SpeakingModule {}
