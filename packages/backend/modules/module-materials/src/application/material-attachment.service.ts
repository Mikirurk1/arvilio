import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { EntitlementsService, StorageAccountingService } from '@be/billing/entitlements';
import { FILE_STORAGE_PORT, type FileStoragePort } from '@be/storage';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ReadStream } from 'node:fs';
import { MaterialFileCompressorService } from './material-file-compressor.service';
import { resolveMaterialMediaKind } from './material-file-compressor';
import {
  parseMaterialCompressLevel,
  type MaterialCompressLevel,
} from './material-compress-level';
import {
  isPdfAttachment,
  previewStorageKeyForAttachment,
  renderPdfFirstPageJpeg,
} from './material-pdf-preview';
import { LibraryFileCaptionService } from './library-file-caption.service';
import { resolveMaterialViewerMediaKind } from './material-viewer-meta.util';

export const MATERIAL_ATTACHMENT_MAX_BYTES = Number.parseInt(
  process.env['MATERIAL_ATTACHMENT_MAX_BYTES'] ?? '104857600',
  10,
);

const LIBRARY_STORAGE_PREFIX = 'library';

const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'text/',
  'application/vnd',
  'application/msword',
  'audio/',
  'video/',
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
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg',
  '.webm',
  '.mp4',
] as const;

@Injectable()
export class MaterialAttachmentService {
  private readonly logger = new Logger(MaterialAttachmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly compressor: MaterialFileCompressorService,
    @Inject(forwardRef(() => LibraryFileCaptionService))
    private readonly captions: LibraryFileCaptionService,
    private readonly entitlements: EntitlementsService,
    private readonly storage: StorageAccountingService,
    @Inject(FILE_STORAGE_PORT) private readonly fileStorage: FileStoragePort,
  ) {}

  private maybeEnqueueCaptions(attachmentId: string, mimeType: string): void {
    const mediaKind = resolveMaterialViewerMediaKind(mimeType, null);
    if (mediaKind === 'audio' || mediaKind === 'video') {
      this.captions.enqueueForAttachment(attachmentId);
    }
  }

  downloadPath(attachmentId: string): string {
    return `/materials/files/${attachmentId}`;
  }

  previewDownloadPath(attachmentId: string): string {
    return `/materials/files/${attachmentId}/preview`;
  }

  /** Relative path: `library/{materialId}/{attachmentId}{ext}` */
  newStorageKey(materialId: string, attachmentId: string, originalName: string): string {
    return this.newStorageKeyWithExt(materialId, attachmentId, path.extname(originalName));
  }

  newStorageKeyWithExt(materialId: string, attachmentId: string, extension: string): string {
    const ext = extension.startsWith('.')
      ? extension.slice(0, 17).toLowerCase()
      : `.${extension.slice(0, 16).toLowerCase()}`;
    return path.posix.join(LIBRARY_STORAGE_PREFIX, materialId, `${attachmentId}${ext}`);
  }

  materialDirKey(materialId: string): string {
    return path.posix.join(LIBRARY_STORAGE_PREFIX, materialId);
  }

  assertFileAllowed(file: {
    originalname: string;
    mimetype: string;
    size: number;
  }): { safeName: string } {
    if (file.size > MATERIAL_ATTACHMENT_MAX_BYTES) {
      throw new BadRequestException(
        `File is too large (max ${Math.round(MATERIAL_ATTACHMENT_MAX_BYTES / (1024 * 1024))} MB)`,
      );
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

  async saveToDisk(buffer: Buffer, storageKey: string, mimeType = 'application/octet-stream'): Promise<void> {
    await this.fileStorage.put(storageKey, buffer, mimeType);
  }

  async removeFromDisk(storageKey: string): Promise<void> {
    await this.fileStorage.delete(storageKey);
  }

  async removeMaterialDir(materialId: string): Promise<void> {
    await this.fileStorage.deleteByPrefix(this.materialDirKey(materialId));
  }

  async readFileBuffer(storageKey: string): Promise<Buffer> {
    return this.fileStorage.getBuffer(storageKey);
  }

  /** Returns a pre-signed URL (S3 mode) or null (local mode → use streaming endpoint). */
  async getSignedDownloadUrl(storageKey: string): Promise<string | null> {
    return this.fileStorage.getSignedUrl(storageKey);
  }

  async ensurePdfTitlePagePreview(attachmentId: string): Promise<string | null> {
    const row = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        materialId: true,
        mimeType: true,
        fileName: true,
        previewStorageKey: true,
      },
    });
    if (!row) return null;
    if (row.previewStorageKey) return row.previewStorageKey;
    if (!isPdfAttachment(row.mimeType, row.fileName)) return null;

    const source = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: { storageKey: true },
    });
    if (!source) return null;

    const pdfBuffer = await this.readFileBuffer(source.storageKey);
    const jpeg = await renderPdfFirstPageJpeg(pdfBuffer);
    if (!jpeg) return null;

    const previewKey = previewStorageKeyForAttachment(row.materialId, row.id);
    await this.saveToDisk(jpeg, previewKey, 'image/jpeg');
    await this.prisma.libraryFileAttachment.update({
      where: { id: row.id },
      data: { previewStorageKey: previewKey },
    });
    return previewKey;
  }

  async assertPreviewDownloadable(attachmentId: string): Promise<{
    previewStorageKey: string;
    fileName: string;
    materialId: string;
  }> {
    const row = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        previewStorageKey: true,
        fileName: true,
        materialId: true,
      },
    });
    if (!row?.previewStorageKey) {
      throw new NotFoundException('Preview not found');
    }
    return {
      previewStorageKey: row.previewStorageKey,
      fileName: row.fileName,
      materialId: row.materialId,
    };
  }

  async openReadStream(storageKey: string): Promise<ReadStream> {
    try {
      return await this.fileStorage.getReadStream(storageKey);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  async getFileSizeBytes(storageKey: string): Promise<number> {
    try {
      return await this.fileStorage.getSizeBytes(storageKey);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  openReadStreamRange(storageKey: string, start: number, end: number): ReadStream {
    return this.fileStorage.getReadStreamRange(storageKey, start, end);
  }

  async createAttachment(
    materialId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    compressLevel: MaterialCompressLevel = 'balanced',
  ): Promise<{
    id: string;
    fileName: string;
    downloadPath: string;
    sizeBytes: number;
    originalSizeBytes: number;
    compressionCodec: string;
  }> {
    const material = await this.prisma.libraryMaterial.findUnique({
      where: { id: materialId },
      select: { id: true, schoolId: true },
    });
    if (!material) throw new NotFoundException('Material not found');

    const { safeName } = this.assertFileAllowed(file);
    // Storage-quota gate (Phase 5): block over-quota uploads before writing.
    await this.entitlements.assertCanUpload(material.schoolId, file.size);
    const mediaKind = resolveMaterialMediaKind(file.mimetype, safeName);
    const level = parseMaterialCompressLevel(compressLevel);
    const deferPdfCompression =
      mediaKind === 'pdf' &&
      level !== 'off' &&
      process.env['MATERIAL_DEFER_PDF_COMPRESS'] !== 'false';

    if (deferPdfCompression) {
      return this.createAttachmentWithDeferredCompression(
        materialId,
        material.schoolId,
        file,
        safeName,
        level,
      );
    }

    return this.createAttachmentWithSyncCompression(
      materialId,
      material.schoolId,
      file,
      safeName,
      level,
    );
  }

  private async createAttachmentWithDeferredCompression(
    materialId: string,
    schoolId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    safeName: string,
    compressLevel: MaterialCompressLevel,
  ): Promise<{
    id: string;
    fileName: string;
    downloadPath: string;
    sizeBytes: number;
    originalSizeBytes: number;
    compressionCodec: string;
  }> {
    const attachmentId = randomUUID();
    const storageKey = this.newStorageKey(materialId, attachmentId, safeName);

    await this.saveToDisk(file.buffer, storageKey, file.mimetype || 'application/pdf');

    try {
      const row = await this.prisma.libraryFileAttachment.create({
        data: {
          id: attachmentId,
          materialId,
          fileName: safeName,
          mimeType: file.mimetype || 'application/pdf',
          sizeBytes: file.size,
          storageKey,
        },
      });

      await this.storage.add(schoolId, row.sizeBytes);

      void this.compressStoredAttachment(row.id, schoolId, compressLevel).catch((error) => {
        this.logger.warn(
          `Background PDF compression failed for ${safeName}: ${String(error)}`,
        );
      });

      this.maybeEnqueueCaptions(row.id, row.mimeType);

      return {
        id: row.id,
        fileName: row.fileName,
        downloadPath: this.downloadPath(row.id),
        sizeBytes: row.sizeBytes,
        originalSizeBytes: file.size,
        compressionCodec: 'background',
      };
    } catch (error) {
      await this.removeFromDisk(storageKey);
      throw error;
    }
  }

  private async compressStoredAttachment(
    attachmentId: string,
    schoolId: string,
    compressLevel: MaterialCompressLevel = 'balanced',
  ): Promise<void> {
    const row = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        materialId: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        storageKey: true,
      },
    });
    if (!row) return;

    const buffer = await this.readFileBuffer(row.storageKey);
    const prepared = await this.compressor.compress({
      buffer,
      mimeType: row.mimeType,
      originalName: row.fileName,
      compressLevel,
    });

    if (prepared.codec === 'none' || prepared.sizeBytes >= prepared.originalSizeBytes) {
      return;
    }

    const nextStorageKey = this.newStorageKeyWithExt(
      row.materialId,
      row.id,
      prepared.extension || path.extname(row.fileName),
    );
    await this.saveToDisk(prepared.buffer, nextStorageKey, prepared.mimeType || row.mimeType);
    if (nextStorageKey !== row.storageKey) {
      await this.removeFromDisk(row.storageKey);
    }

    await this.prisma.libraryFileAttachment.update({
      where: { id: row.id },
      data: {
        mimeType: prepared.mimeType || row.mimeType,
        sizeBytes: prepared.sizeBytes,
        storageKey: nextStorageKey,
      },
    });

    // Reconcile storage accounting by the compression delta (negative).
    await this.storage.add(schoolId, prepared.sizeBytes - row.sizeBytes);

    this.logger.log(
      `Background compressed ${row.fileName}: ${prepared.originalSizeBytes} → ${prepared.sizeBytes} bytes (${prepared.codec})`,
    );
  }

  private async createAttachmentWithSyncCompression(
    materialId: string,
    schoolId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    safeName: string,
    compressLevel: MaterialCompressLevel,
  ): Promise<{
    id: string;
    fileName: string;
    downloadPath: string;
    sizeBytes: number;
    originalSizeBytes: number;
    compressionCodec: string;
  }> {
    const attachmentId = randomUUID();
    const prepared = await this.compressor.compress({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: safeName,
      compressLevel,
    });
    const storageKey = this.newStorageKeyWithExt(
      materialId,
      attachmentId,
      prepared.extension || path.extname(safeName),
    );
    await this.saveToDisk(prepared.buffer, storageKey, prepared.mimeType || file.mimetype);
    if (prepared.codec !== 'none') {
      this.logger.log(
        `Compressed material file ${safeName}: ${prepared.originalSizeBytes} → ${prepared.sizeBytes} bytes (${prepared.codec})`,
      );
    }
    try {
      const row = await this.prisma.libraryFileAttachment.create({
        data: {
          id: attachmentId,
          materialId,
          fileName: safeName,
          mimeType: prepared.mimeType || file.mimetype || 'application/octet-stream',
          sizeBytes: prepared.sizeBytes,
          storageKey,
        },
      });
      await this.storage.add(schoolId, row.sizeBytes);
      this.maybeEnqueueCaptions(row.id, row.mimeType);
      return {
        id: row.id,
        fileName: row.fileName,
        downloadPath: this.downloadPath(row.id),
        sizeBytes: row.sizeBytes,
        originalSizeBytes: prepared.originalSizeBytes,
        compressionCodec: prepared.codec,
      };
    } catch (error) {
      await this.removeFromDisk(storageKey);
      throw error;
    }
  }

  async assertDownloadable(attachmentId: string): Promise<{
    storageKey: string;
    mimeType: string;
    fileName: string;
    materialId: string;
  }> {
    const row = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        storageKey: true,
        mimeType: true,
        fileName: true,
        materialId: true,
      },
    });
    if (!row) throw new NotFoundException('Attachment not found');
    return row;
  }
}
