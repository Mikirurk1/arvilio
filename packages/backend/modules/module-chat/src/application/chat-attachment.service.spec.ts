import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { GoneException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { CHAT_ATTACHMENT_TTL_MS } from '../shared/chat-attachment.constants';
import { ChatAttachmentService } from './chat-attachment.service';

describe('ChatAttachmentService', () => {
  let service: ChatAttachmentService;
  const prisma = {
    chatMessageAttachment: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ChatAttachmentService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ChatAttachmentService);
  });

  it('attachmentUrl builds API path', () => {
    expect(service.attachmentUrl('att-1')).toBe('/chat/attachments/att-1');
  });

  it('expiresAtFromNow is in the future', () => {
    const before = Date.now();
    const expires = service.expiresAtFromNow().getTime();
    expect(expires).toBeGreaterThanOrEqual(before + CHAT_ATTACHMENT_TTL_MS - 1000);
  });

  it('isExpired compares to now', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00Z'));
    expect(service.isExpired(new Date('2026-05-20T11:00:00Z'))).toBe(true);
    expect(service.isExpired(new Date('2026-05-20T13:00:00Z'))).toBe(false);
    jest.useRealTimers();
  });

  it('assertDownloadable throws when missing', async () => {
    prisma.chatMessageAttachment.findUnique.mockResolvedValue(null);
    await expect(service.assertDownloadable('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('assertDownloadable throws GoneException when expired', async () => {
    prisma.chatMessageAttachment.findUnique.mockResolvedValue({
      id: 'a1',
      fileName: 'f.pdf',
      mimeType: 'application/pdf',
      storageKey: 'key',
      expiresAt: new Date('2020-01-01'),
    });
    prisma.chatMessageAttachment.delete.mockResolvedValue({});
    await expect(service.assertDownloadable('a1')).rejects.toBeInstanceOf(GoneException);
  });

  it('newStorageKey keeps file extension', () => {
    expect(service.newStorageKey('notes.pdf')).toMatch(/\.pdf$/);
  });

  it('getUploadDir uses CHAT_UPLOAD_DIR when set', () => {
    process.env.CHAT_UPLOAD_DIR = '/tmp/chat-uploads';
    expect(service.getUploadDir()).toBe('/tmp/chat-uploads');
    delete process.env.CHAT_UPLOAD_DIR;
  });

  it('assertDownloadable returns row when valid', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    prisma.chatMessageAttachment.findUnique.mockResolvedValue({
      id: 'a1',
      fileName: 'f.pdf',
      mimeType: 'application/pdf',
      storageKey: 'key',
      expiresAt,
    });
    await expect(service.assertDownloadable('a1')).resolves.toMatchObject({
      fileName: 'f.pdf',
      storageKey: 'key',
    });
  });

  it('purgeExpiredAttachments deletes expired rows', async () => {
    prisma.chatMessageAttachment.findMany.mockResolvedValue([
      { id: 'a1', storageKey: 'key-1' },
    ]);
    prisma.chatMessageAttachment.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.purgeExpiredAttachments()).resolves.toBe(1);
    expect(prisma.chatMessageAttachment.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['a1'] } },
    });
  });

  it('purgeExpiredAttachments returns zero when nothing expired', async () => {
    prisma.chatMessageAttachment.findMany.mockResolvedValue([]);
    await expect(service.purgeExpiredAttachments()).resolves.toBe(0);
    expect(prisma.chatMessageAttachment.deleteMany).not.toHaveBeenCalled();
  });

  it('saveToDisk and openReadStream round-trip', async () => {
    const dir = path.join(os.tmpdir(), `chat-upload-${Date.now()}`);
    process.env.CHAT_UPLOAD_DIR = dir;
    const key = service.newStorageKey('notes.txt');
    await service.saveToDisk(Buffer.from('hello'), key);
    const stream = await service.openReadStream(key);
    stream.destroy();
    await expect(fs.readFile(path.join(dir, key), 'utf8')).resolves.toBe('hello');
    await fs.rm(dir, { recursive: true, force: true });
    delete process.env.CHAT_UPLOAD_DIR;
  });

  it('openReadStream throws when file missing on disk', async () => {
    process.env.CHAT_UPLOAD_DIR = path.join(os.tmpdir(), 'chat-missing-test');
    await expect(service.openReadStream('missing.bin')).rejects.toBeInstanceOf(NotFoundException);
    delete process.env.CHAT_UPLOAD_DIR;
  });

  it('removeFromDisk ignores missing files', async () => {
    process.env.CHAT_UPLOAD_DIR = path.join(os.tmpdir(), 'chat-remove-test');
    await expect(service.removeFromDisk('does-not-exist')).resolves.toBeUndefined();
    delete process.env.CHAT_UPLOAD_DIR;
  });

  it('hourlyCleanup logs when attachments purged', async () => {
    const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    prisma.chatMessageAttachment.findMany.mockResolvedValue([{ id: 'a1', storageKey: 'k1' }]);
    prisma.chatMessageAttachment.deleteMany.mockResolvedValue({ count: 1 });
    await service.hourlyCleanup();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Purged 1'));
    logSpy.mockRestore();
  });

  it('hourlyCleanup stays quiet when nothing to purge', async () => {
    const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    prisma.chatMessageAttachment.findMany.mockResolvedValue([]);
    await service.hourlyCleanup();
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
