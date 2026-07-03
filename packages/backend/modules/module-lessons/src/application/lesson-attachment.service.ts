import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { EntitlementsService, StorageAccountingService } from '@be/billing/entitlements';
import { FILE_STORAGE_PORT, type FileStoragePort } from '@be/storage';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ReadStream } from 'node:fs';

import {
  LESSON_ATTACHMENT_MAX_BYTES,
  LESSON_FILE_ATT_PREFIX,
  isLessonFileAttachmentRef,
  lessonFileAttachmentId,
} from '../shared/lesson-attachment-ref.util';

export {
  LESSON_ATTACHMENT_MAX_BYTES,
  LESSON_FILE_ATT_PREFIX,
  isLessonFileAttachmentRef,
  lessonFileAttachmentId,
};

const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'text/',
  'application/vnd',
  'application/msword',
] as const;

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
  '.svg',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
] as const;

@Injectable()
export class LessonAttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
    private readonly storage: StorageAccountingService,
    @Inject(FILE_STORAGE_PORT) private readonly fileStorage: FileStoragePort,
  ) {}

  downloadPath(attachmentId: string): string {
    return `/lessons/files/${attachmentId}`;
  }

  assertFileAllowed(file: {
    originalname: string;
    mimetype: string;
    size: number;
  }): { safeName: string } {
    if (file.size > LESSON_ATTACHMENT_MAX_BYTES) {
      throw new BadRequestException('File is too large (max 5 MB)');
    }
    const lower = file.originalname.toLowerCase();
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    const hasAllowedMime = ALLOWED_MIME_PREFIXES.some((prefix) =>
      file.mimetype.startsWith(prefix),
    );
    if (!hasAllowedExt && !hasAllowedMime) {
      throw new BadRequestException('File type is not allowed');
    }
    const safeName = file.originalname.replace(/[^\w.\-()\s]/g, '_').slice(0, 200);
    if (!safeName) throw new BadRequestException('Invalid file name');
    return { safeName };
  }

  /** Key convention: `schools/{schoolId}/lessons/{uuid}{ext}` */
  newStorageKey(schoolId: string, originalName: string): string {
    const ext = path.extname(originalName).slice(0, 16);
    return `schools/${schoolId}/lessons/${randomUUID()}${ext}`;
  }

  async saveToDisk(buffer: Buffer, storageKey: string, mimeType = 'application/octet-stream'): Promise<void> {
    await this.fileStorage.put(storageKey, buffer, mimeType);
  }

  async removeFromDisk(storageKey: string): Promise<void> {
    await this.fileStorage.delete(storageKey);
  }

  async openReadStream(storageKey: string): Promise<ReadStream> {
    try {
      return await this.fileStorage.getReadStream(storageKey);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  async getSignedDownloadUrl(storageKey: string): Promise<string | null> {
    return this.fileStorage.getSignedUrl(storageKey);
  }

  async createAttachment(
    lessonId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ): Promise<{ id: string; fileName: string; downloadPath: string }> {
    const { safeName } = this.assertFileAllowed(file);
    const lesson = await this.prisma.scheduledLesson.findUnique({
      where: { id: lessonId },
      select: { schoolId: true },
    });
    // Storage-quota gate (Phase 5): block over-quota uploads before writing.
    if (lesson) await this.entitlements.assertCanUpload(lesson.schoolId, file.size);
    const storageKey = this.newStorageKey(lesson?.schoolId ?? 'unknown', safeName);
    await this.saveToDisk(file.buffer, storageKey, file.mimetype || 'application/octet-stream');
    try {
      const row = await this.prisma.lessonFileAttachment.create({
        data: {
          lessonId,
          fileName: safeName,
          mimeType: file.mimetype || 'application/octet-stream',
          sizeBytes: file.size,
          storageKey,
        },
      });
      if (lesson) await this.storage.add(lesson.schoolId, row.sizeBytes);
      return {
        id: row.id,
        fileName: row.fileName,
        downloadPath: this.downloadPath(row.id),
      };
    } catch (error) {
      await this.removeFromDisk(storageKey);
      throw error;
    }
  }

  async findLessonIdForAttachment(attachmentId: string): Promise<string | null> {
    const row = await this.prisma.lessonFileAttachment.findUnique({
      where: { id: attachmentId },
      select: { lessonId: true },
    });
    return row?.lessonId ?? null;
  }

  async assertDownloadable(
    attachmentId: string,
    lessonId: string,
  ): Promise<{ fileName: string; mimeType: string; storageKey: string }> {
    const row = await this.prisma.lessonFileAttachment.findFirst({
      where: { id: attachmentId, lessonId },
    });
    if (!row) throw new NotFoundException('Attachment not found');
    return row;
  }
}
