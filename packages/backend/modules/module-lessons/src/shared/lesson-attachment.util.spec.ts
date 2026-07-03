import { promises as fs } from 'node:fs';
import os from 'node:os';
import * as path from 'node:path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LocalFileStorageAdapter } from '@be/storage';
import {
  isLessonFileAttachmentRef,
  LESSON_FILE_ATT_PREFIX,
  lessonFileAttachmentId,
} from '../shared/lesson-attachment-ref.util';
import { LessonAttachmentService } from '../application/lesson-attachment.service';

const prisma = {
  lessonFileAttachment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  scheduledLesson: {
    findUnique: jest.fn().mockResolvedValue({ schoolId: 'school_default' }),
  },
};
const entitlements = { assertCanUpload: jest.fn().mockResolvedValue(undefined) };
const storageAccounting = { add: jest.fn().mockResolvedValue(undefined) };

function makeService(dir: string): LessonAttachmentService {
  return new LessonAttachmentService(
    prisma as never,
    entitlements as never,
    storageAccounting as never,
    new LocalFileStorageAdapter(dir),
  );
}

describe('lesson attachment refs', () => {
  it('parses attachment id from ref', () => {
    expect(LESSON_FILE_ATT_PREFIX).toBe('att:');
    expect(isLessonFileAttachmentRef('att:abc')).toBe(true);
    expect(lessonFileAttachmentId('att:abc')).toBe('abc');
    expect(lessonFileAttachmentId('url')).toBeNull();
  });
});

describe('LessonAttachmentService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('assertFileAllowed accepts pdf', () => {
    const service = makeService('/tmp');
    expect(
      service.assertFileAllowed({ originalname: 'notes.pdf', mimetype: 'application/pdf', size: 1024 }).safeName,
    ).toBe('notes.pdf');
  });

  it('assertFileAllowed rejects oversize file', () => {
    const service = makeService('/tmp');
    expect(() =>
      service.assertFileAllowed({ originalname: 'big.zip', mimetype: 'application/zip', size: 6 * 1024 * 1024 }),
    ).toThrow(BadRequestException);
  });

  it('downloadPath uses attachment id', () => {
    expect(makeService('/tmp').downloadPath('file-1')).toBe('/lessons/files/file-1');
  });

  it('newStorageKey includes school prefix and extension', () => {
    const key = makeService('/tmp').newStorageKey('school-1', 'doc.pdf');
    expect(key).toMatch(/^schools\/school-1\/lessons\/.+\.pdf$/);
  });

  it('assertFileAllowed rejects disallowed type', () => {
    const service = makeService('/tmp');
    expect(() =>
      service.assertFileAllowed({ originalname: 'archive.zip', mimetype: 'application/zip', size: 100 }),
    ).toThrow(BadRequestException);
  });

  it('assertFileAllowed rejects empty safe name', () => {
    const service = makeService('/tmp');
    expect(() =>
      service.assertFileAllowed({ originalname: '', mimetype: 'application/pdf', size: 100 }),
    ).toThrow(BadRequestException);
  });

  it('saveToDisk and openReadStream round-trip', async () => {
    const dir = path.join(os.tmpdir(), `lesson-upload-${Date.now()}`);
    const service = makeService(dir);
    const key = service.newStorageKey('school_default', 'notes.txt');
    await service.saveToDisk(Buffer.from('lesson-file'), key, 'text/plain');
    const stream = await service.openReadStream(key);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    expect(Buffer.concat(chunks).toString()).toBe('lesson-file');
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('openReadStream throws when file missing', async () => {
    const dir = path.join(os.tmpdir(), `lesson-missing-${Date.now()}`);
    const service = makeService(dir);
    await expect(service.openReadStream('schools/x/lessons/missing.bin')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createAttachment persists row and returns download path', async () => {
    const dir = path.join(os.tmpdir(), `lesson-create-${Date.now()}`);
    const service = makeService(dir);
    prisma.lessonFileAttachment.create.mockResolvedValue({ id: 'att-1', fileName: 'notes.pdf' });
    const result = await service.createAttachment('lesson-1', {
      buffer: Buffer.from('pdf'),
      mimetype: 'application/pdf',
      size: 3,
      originalname: 'notes.pdf',
    });
    expect(result).toEqual({ id: 'att-1', fileName: 'notes.pdf', downloadPath: '/lessons/files/att-1' });
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('createAttachment removes file when prisma create fails', async () => {
    const dir = path.join(os.tmpdir(), `lesson-rollback-${Date.now()}`);
    const service = makeService(dir);
    prisma.lessonFileAttachment.create.mockRejectedValue(new Error('db down'));
    await expect(
      service.createAttachment('lesson-1', {
        buffer: Buffer.from('x'),
        mimetype: 'text/plain',
        size: 1,
        originalname: 'a.txt',
      }),
    ).rejects.toThrow('db down');
    // File should be deleted on rollback — key path doesn't exist
    const keyPattern = path.join(dir, 'schools', 'school_default', 'lessons');
    const exists = await fs.access(keyPattern).then(() => true).catch(() => false);
    if (exists) {
      const files = await fs.readdir(keyPattern);
      expect(files).toHaveLength(0);
    }
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('findLessonIdForAttachment returns lesson id', async () => {
    prisma.lessonFileAttachment.findUnique.mockResolvedValue({ lessonId: 'l1' });
    await expect(makeService('/tmp').findLessonIdForAttachment('att-1')).resolves.toBe('l1');
  });

  it('assertDownloadable returns row for matching lesson', async () => {
    prisma.lessonFileAttachment.findFirst.mockResolvedValue({
      fileName: 'f.pdf',
      mimeType: 'application/pdf',
      storageKey: 'key',
    });
    await expect(makeService('/tmp').assertDownloadable('att-1', 'l1')).resolves.toMatchObject({
      fileName: 'f.pdf',
      storageKey: 'key',
    });
  });

  it('assertDownloadable throws when not found', async () => {
    prisma.lessonFileAttachment.findFirst.mockResolvedValue(null);
    await expect(makeService('/tmp').assertDownloadable('att-1', 'l1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
