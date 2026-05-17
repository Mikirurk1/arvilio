import {
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@soenglish/data-access-prisma';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ReadStream } from 'node:fs';
import { CHAT_ATTACHMENT_TTL_MS } from './chat-attachment.constants';

@Injectable()
export class ChatAttachmentService {
  private readonly logger = new Logger(ChatAttachmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  getUploadDir(): string {
    return process.env.CHAT_UPLOAD_DIR ?? path.join(process.cwd(), 'data', 'chat-uploads');
  }

  attachmentUrl(attachmentId: string): string {
    return `/api/chat/attachments/${attachmentId}`;
  }

  expiresAtFromNow(): Date {
    return new Date(Date.now() + CHAT_ATTACHMENT_TTL_MS);
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

  newStorageKey(originalName: string): string {
    const ext = path.extname(originalName).slice(0, 16);
    return `${randomUUID()}${ext}`;
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

  isExpired(expiresAt: Date): boolean {
    return expiresAt.getTime() <= Date.now();
  }

  async purgeExpiredAttachments(): Promise<number> {
    const rows = await this.prisma.chatMessageAttachment.findMany({
      where: { expiresAt: { lte: new Date() } },
      select: { id: true, storageKey: true },
    });
    for (const row of rows) {
      await this.removeFromDisk(row.storageKey);
    }
    if (rows.length > 0) {
      await this.prisma.chatMessageAttachment.deleteMany({
        where: { id: { in: rows.map((row) => row.id) } },
      });
    }
    return rows.length;
  }

  async assertDownloadable(attachmentId: string): Promise<{
    fileName: string;
    mimeType: string;
    storageKey: string;
    expiresAt: Date;
  }> {
    const row = await this.prisma.chatMessageAttachment.findUnique({
      where: { id: attachmentId },
    });
    if (!row) throw new NotFoundException('Attachment not found');
    if (this.isExpired(row.expiresAt)) {
      await this.removeFromDisk(row.storageKey);
      await this.prisma.chatMessageAttachment.delete({ where: { id: row.id } }).catch(() => undefined);
      throw new GoneException('This file has expired and was deleted');
    }
    return row;
  }

  @Cron('0 * * * *')
  async hourlyCleanup(): Promise<void> {
    const count = await this.purgeExpiredAttachments();
    if (count > 0) {
      this.logger.log(`Purged ${count} expired chat attachment(s)`);
    }
  }
}
