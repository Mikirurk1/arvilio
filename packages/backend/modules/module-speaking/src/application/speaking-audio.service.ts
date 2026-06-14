import { Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, promises as fs } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ReadStream } from 'node:fs';

@Injectable()
export class SpeakingAudioService {
  getUploadDir(): string {
    return process.env['SPEAKING_UPLOAD_DIR'] ?? path.join(process.cwd(), 'data', 'speaking-uploads');
  }

  submissionAudioUrl(submissionId: string): string {
    return `/speaking/submissions/${submissionId}/audio`;
  }

  newStorageKey(originalName: string): string {
    const ext = path.extname(originalName).slice(0, 16);
    return `${randomUUID()}${ext || '.webm'}`;
  }

  async saveToDisk(buffer: Buffer, storageKey: string): Promise<void> {
    const dir = this.getUploadDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, storageKey), buffer);
  }

  async openReadStream(storageKey: string): Promise<ReadStream> {
    const fullPath = path.join(this.getUploadDir(), storageKey);
    try {
      await fs.access(fullPath);
    } catch {
      throw new NotFoundException('Audio file not found');
    }
    return createReadStream(fullPath);
  }

  /** Best-effort cleanup when a submission is replaced by a new recording. */
  async deleteFromDisk(storageKey: string): Promise<void> {
    const fullPath = path.join(this.getUploadDir(), storageKey);
    try {
      await fs.unlink(fullPath);
    } catch {
      // Missing file is fine
    }
  }
}
