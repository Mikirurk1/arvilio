import { promises as fs } from 'node:fs';
import os from 'node:os';
import * as path from 'node:path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import {
  isLessonFileAttachmentRef,
  LESSON_FILE_ATT_PREFIX,
  lessonFileAttachmentId,
  LessonAttachmentService,
} from '../shared/lesson-attachment-ref.util';
import { LessonAttachmentService } from '../application/lesson-attachment.service';

describe('lesson attachment refs', () => {
  it('parses attachment id from ref', () => {
    expect(LESSON_FILE_ATT_PREFIX).toBe('att:');
    expect(isLessonFileAttachmentRef('att:abc')).toBe(true);
    expect(lessonFileAttachmentId('att:abc')).toBe('abc');
    expect(lessonFileAttachmentId('url')).toBeNull();
  });
});

describe('LessonAttachmentService', () => {
  let service: LessonAttachmentService;
  const prisma = {
    lessonFileAttachment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [LessonAttachmentService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(LessonAttachmentService);
  });

  it('assertFileAllowed accepts pdf', () => {
    expect(
      service.assertFileAllowed({
        originalname: 'notes.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      }).safeName,
    ).toBe('notes.pdf');
  });

  it('assertFileAllowed rejects oversize file', () => {
    expect(() =>
      service.assertFileAllowed({
        originalname: 'big.zip',
        mimetype: 'application/zip',
        size: 6 * 1024 * 1024,
      }),
    ).toThrow(BadRequestException);
  });

  it('downloadPath uses attachment id', () => {
    expect(service.downloadPath('file-1')).toBe('/lessons/files/file-1');
  });

  it('newStorageKey keeps extension', () => {
    expect(service.newStorageKey('doc.pdf')).toMatch(/\.pdf$/);
  });

  it('assertFileAllowed rejects disallowed type', () => {
    expect(() =>
      service.assertFileAllowed({
        originalname: 'archive.zip',
        mimetype: 'application/zip',
        size: 100,
      }),
    ).toThrow(BadRequestException);
  });

  it('assertFileAllowed rejects empty safe name', () => {
    expect(() =>
      service.assertFileAllowed({
        originalname: '',
        mimetype: 'application/pdf',
        size: 100,
      }),
    ).toThrow(BadRequestException);
  });

  it('getUploadDir uses LESSON_UPLOAD_DIR when set', () => {
    process.env.LESSON_UPLOAD_DIR = '/tmp/lesson-uploads';
    expect(service.getUploadDir()).toBe('/tmp/lesson-uploads');
    delete process.env.LESSON_UPLOAD_DIR;
  });

  it('saveToDisk and openReadStream round-trip', async () => {
    const dir = path.join(os.tmpdir(), `lesson-upload-${Date.now()}`);
    process.env.LESSON_UPLOAD_DIR = dir;
    const key = service.newStorageKey('notes.txt');
    await service.saveToDisk(Buffer.from('lesson-file'), key);
    const stream = await service.openReadStream(key);
    stream.destroy();
    await expect(fs.readFile(path.join(dir, key), 'utf8')).resolves.toBe('lesson-file');
    await fs.rm(dir, { recursive: true, force: true });
    delete process.env.LESSON_UPLOAD_DIR;
  });

  it('openReadStream throws when file missing', async () => {
    process.env.LESSON_UPLOAD_DIR = path.join(os.tmpdir(), 'lesson-missing');
    await expect(service.openReadStream('missing.bin')).rejects.toBeInstanceOf(NotFoundException);
    delete process.env.LESSON_UPLOAD_DIR;
  });

  it('createAttachment persists row and returns download path', async () => {
    const dir = path.join(os.tmpdir(), `lesson-create-${Date.now()}`);
    process.env.LESSON_UPLOAD_DIR = dir;
    prisma.lessonFileAttachment.create.mockResolvedValue({
      id: 'att-1',
      fileName: 'notes.pdf',
    });
    const result = await service.createAttachment('lesson-1', {
      buffer: Buffer.from('pdf'),
      mimetype: 'application/pdf',
      size: 3,
      originalname: 'notes.pdf',
    });
    expect(result).toEqual({
      id: 'att-1',
      fileName: 'notes.pdf',
      downloadPath: '/lessons/files/att-1',
    });
    await fs.rm(dir, { recursive: true, force: true });
    delete process.env.LESSON_UPLOAD_DIR;
  });

  it('createAttachment removes file when prisma create fails', async () => {
    const dir = path.join(os.tmpdir(), `lesson-rollback-${Date.now()}`);
    process.env.LESSON_UPLOAD_DIR = dir;
    prisma.lessonFileAttachment.create.mockRejectedValue(new Error('db down'));
    await expect(
      service.createAttachment('lesson-1', {
        buffer: Buffer.from('x'),
        mimetype: 'text/plain',
        size: 1,
        originalname: 'a.txt',
      }),
    ).rejects.toThrow('db down');
    const files = await fs.readdir(dir);
    expect(files).toHaveLength(0);
    await fs.rm(dir, { recursive: true, force: true });
    delete process.env.LESSON_UPLOAD_DIR;
  });

  it('findLessonIdForAttachment returns lesson id', async () => {
    prisma.lessonFileAttachment.findUnique.mockResolvedValue({ lessonId: 'l1' });
    await expect(service.findLessonIdForAttachment('att-1')).resolves.toBe('l1');
  });

  it('assertDownloadable returns row for matching lesson', async () => {
    prisma.lessonFileAttachment.findFirst.mockResolvedValue({
      fileName: 'f.pdf',
      mimeType: 'application/pdf',
      storageKey: 'key',
    });
    await expect(service.assertDownloadable('att-1', 'l1')).resolves.toMatchObject({
      fileName: 'f.pdf',
      storageKey: 'key',
    });
  });

  it('assertDownloadable throws when not found', async () => {
    prisma.lessonFileAttachment.findFirst.mockResolvedValue(null);
    await expect(service.assertDownloadable('att-1', 'l1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
