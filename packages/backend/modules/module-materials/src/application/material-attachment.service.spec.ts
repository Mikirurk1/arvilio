import { promises as fs } from 'node:fs';
import os from 'node:os';
import * as path from 'node:path';
import { NotFoundException } from '@nestjs/common';
import { LocalFileStorageAdapter } from '@be/storage';

jest.mock('./library-file-caption.service', () => ({
  LibraryFileCaptionService: class LibraryFileCaptionService {
    enqueueForAttachment = jest.fn();
  },
}));

import { MaterialAttachmentService } from './material-attachment.service';
import { MaterialFileCompressorService } from './material-file-compressor.service';

const passthroughCompressor: Pick<MaterialFileCompressorService, 'compress'> = {
  compress: async (file) => ({
    buffer: file.buffer,
    mimeType: file.mimeType,
    extension: path.extname(file.originalName).toLowerCase(),
    sizeBytes: file.buffer.length,
    originalSizeBytes: file.buffer.length,
    codec: 'none',
  }),
};

const captions = { enqueueForAttachment: jest.fn() };
const entitlements = { assertCanUpload: jest.fn().mockResolvedValue(undefined) };
const storage = { add: jest.fn().mockResolvedValue(undefined) };
const prisma = {
  libraryMaterial: { findUnique: jest.fn() },
  libraryFileAttachment: { create: jest.fn(), findUnique: jest.fn() },
};

/** Build service wired to a LocalFileStorageAdapter rooted at `dir`. */
function makeService(dir: string): MaterialAttachmentService {
  return new MaterialAttachmentService(
    prisma as never,
    passthroughCompressor as MaterialFileCompressorService,
    captions as never,
    entitlements as never,
    storage as never,
    new LocalFileStorageAdapter(dir),
  );
}

describe('MaterialAttachmentService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('newStorageKey nests files under library/{materialId}/', () => {
    const service = makeService('/tmp');
    const key = service.newStorageKey('mat-1', 'att-1', 'Workbook.pdf');
    expect(key).toBe('library/mat-1/att-1.pdf');
  });

  it('saveToDisk and openReadStream round-trip in nested layout', async () => {
    const dir = path.join(os.tmpdir(), `material-fs-${Date.now()}`);
    const service = makeService(dir);
    const storageKey = service.newStorageKey('mat-abc', 'att-xyz', 'notes.pdf');
    await service.saveToDisk(Buffer.from('library-file'), storageKey);
    const nestedPath = path.join(dir, 'library', 'mat-abc', 'att-xyz.pdf');
    await expect(fs.access(nestedPath)).resolves.toBeUndefined();
    const stream = await service.openReadStream(storageKey);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });
    expect(Buffer.concat(chunks).toString()).toBe('library-file');
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('removeMaterialDir deletes the material folder', async () => {
    const dir = path.join(os.tmpdir(), `material-rm-${Date.now()}`);
    const service = makeService(dir);
    const storageKey = service.newStorageKey('mat-del', 'att-1', 'a.pdf');
    await service.saveToDisk(Buffer.from('x'), storageKey);
    await service.removeMaterialDir('mat-del');
    await expect(fs.access(path.join(dir, 'library', 'mat-del'))).rejects.toThrow();
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('createAttachment stores hierarchical storageKey', async () => {
    const dir = path.join(os.tmpdir(), `material-create-${Date.now()}`);
    const service = makeService(dir);
    prisma.libraryMaterial.findUnique.mockResolvedValue({ id: 'mat-1', schoolId: 'school_default' });
    prisma.libraryFileAttachment.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.createAttachment('mat-1', {
      buffer: Buffer.from('pdf'),
      mimetype: 'application/pdf',
      size: 3,
      originalname: 'Student Book.pdf',
    });

    expect(result.fileName).toBe('Student Book.pdf');
    expect(entitlements.assertCanUpload).toHaveBeenCalledWith('school_default', 3);
    expect(storage.add).toHaveBeenCalledWith('school_default', 3);
    expect(prisma.libraryFileAttachment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          materialId: 'mat-1',
          storageKey: expect.stringMatching(/^library\/mat-1\/.+\.pdf$/),
        }),
      }),
    );
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('openReadStream throws when file missing', async () => {
    const dir = path.join(os.tmpdir(), `material-missing-${Date.now()}`);
    const service = makeService(dir);
    await expect(service.openReadStream('library/missing/file.pdf')).rejects.toThrow(
      NotFoundException,
    );
  });
});
