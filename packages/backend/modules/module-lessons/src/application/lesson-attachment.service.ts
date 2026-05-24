import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { createReadStream, promises as fs } from 'node:fs';
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
  constructor(private readonly prisma: PrismaService) {}

  getUploadDir(): string {
    return process.env['LESSON_UPLOAD_DIR'] ?? path.join(process.cwd(), 'data', 'lesson-uploads');
  }

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

  newStorageKey(originalName: string): string {
    const ext = path.extname(originalName).slice(0, 16);
    return `${randomUUID()}${ext}`;
  }

  async saveToDisk(buffer: Buffer, storageKey: string): Promise<void> {
    const dir = this.getUploadDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, storageKey), buffer);
  }

  async removeFromDisk(storageKey: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.getUploadDir(), storageKey));
    } catch {
      // file may already be gone
    }
  }

  async openReadStream(storageKey: string): Promise<ReadStream> {
    const fullPath = path.join(this.getUploadDir(), storageKey);
    try {
      await fs.access(fullPath);
    } catch {
      throw new NotFoundException('File not found');
    }
    return createReadStream(fullPath);
  }

  async createAttachment(
    lessonId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ): Promise<{ id: string; fileName: string; downloadPath: string }> {
    const { safeName } = this.assertFileAllowed(file);
    const storageKey = this.newStorageKey(safeName);
    await this.saveToDisk(file.buffer, storageKey);
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
