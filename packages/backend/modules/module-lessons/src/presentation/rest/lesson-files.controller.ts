import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TenantPrismaService } from '@be/prisma';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { AuthGuard, CurrentUser } from '@be/auth';
import {
  LESSON_ATTACHMENT_MAX_BYTES,
  LESSON_FILE_ATT_PREFIX,
  LessonAttachmentService,
} from '../../application/lesson-attachment.service';
type UploadedLessonFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Controller('lessons/files')
@UseGuards(AuthGuard)
export class LessonFilesController {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly attachments: LessonAttachmentService,
  ) {}

  private async assertLessonAccess(lessonId: string, userId: string): Promise<void> {
    // Tenant-scoped: a lesson from another school resolves to null → ForbiddenException.
    const lesson = await this.tenantPrisma.client.scheduledLesson.findUnique({
      where: { id: lessonId },
      select: { teacherId: true, studentId: true },
    });
    if (!lesson) throw new ForbiddenException();
    if (lesson.teacherId !== userId && lesson.studentId !== userId) {
      throw new ForbiddenException();
    }
  }

  @Post(':lessonId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: LESSON_ATTACHMENT_MAX_BYTES },
    }),
  )
  async upload(
    @CurrentUser() userId: string,
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: UploadedLessonFile,
  ) {
    await this.assertLessonAccess(lessonId, userId);
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    const saved = await this.attachments.createAttachment(lessonId, file);
    return {
      id: saved.id,
      fileName: saved.fileName,
      ref: `${LESSON_FILE_ATT_PREFIX}${saved.id}`,
      downloadPath: saved.downloadPath,
    };
  }

  @Get(':attachmentId')
  async download(
    @CurrentUser() userId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const lessonId = await this.attachments.findLessonIdForAttachment(attachmentId);
    if (!lessonId) {
      res.status(404).json({ message: 'Attachment not found' });
      return;
    }
    await this.assertLessonAccess(lessonId, userId);
    const meta = await this.attachments.assertDownloadable(attachmentId, lessonId);
    const signedUrl = await this.attachments.getSignedDownloadUrl(meta.storageKey);
    if (signedUrl) { res.redirect(302, signedUrl); return; }
    const stream = await this.attachments.openReadStream(meta.storageKey);
    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(meta.fileName)}"`,
    );
    stream.pipe(res);
  }
}
