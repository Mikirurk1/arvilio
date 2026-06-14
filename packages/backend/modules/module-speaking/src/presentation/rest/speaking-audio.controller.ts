import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, CurrentUser } from '@be/auth';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import {
  SPEAKING_AUDIO_MAX_BYTES,
  SPEAKING_AUDIO_MIME_TYPES,
} from '../../shared/speaking-audio.constants';
import { SpeakingAudioService } from '../../application/speaking-audio.service';
import { SpeakingSubmissionsService } from '../../application/speaking-submissions.service';

type UploadedSpeakingFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Controller('speaking')
@UseGuards(AuthGuard)
export class SpeakingAudioController {
  constructor(
    private readonly submissions: SpeakingSubmissionsService,
    private readonly audio: SpeakingAudioService,
  ) {}

  @Post('submissions/:submissionId/audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: SPEAKING_AUDIO_MAX_BYTES },
    }),
  )
  async uploadAudio(
    @CurrentUser() userId: string,
    @Param('submissionId') submissionId: string,
    @UploadedFile() file: UploadedSpeakingFile,
  ): Promise<{ ok: true; audioUrl: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Audio file is required');
    }
    if (!SPEAKING_AUDIO_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported audio format');
    }

    await this.submissions.attachAudio(
      userId,
      submissionId,
      file.buffer,
      file.mimetype,
      file.originalname || 'recording.webm',
    );

    return { ok: true, audioUrl: this.audio.submissionAudioUrl(submissionId) };
  }

  @Get('submissions/:submissionId/audio')
  async downloadAudio(
    @CurrentUser() userId: string,
    @Param('submissionId') submissionId: string,
    @Res() res: Response,
  ): Promise<void> {
    const meta = await this.submissions.resolveAudioDownload(userId, submissionId);
    const stream = await this.audio.openReadStream(meta.storageKey);
    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader('Content-Disposition', 'inline; filename="speaking-recording.webm"');
    stream.pipe(res);
  }
}
