import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { AuthGuard, CurrentUser } from '@be/auth';
import {
  MATERIAL_ATTACHMENT_MAX_BYTES,
  MaterialAttachmentService,
} from '../../application/material-attachment.service';
import { MaterialsAccessService } from '../../application/materials-access.service';
import { parseMaterialCompressLevel } from '../../application/material-compress-level';
import { LibraryFileCaptionService } from '../../application/library-file-caption.service';
import { parseBytesRangeHeader } from '../../application/material-byte-range.util';

type UploadedMaterialFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

@Controller('materials/files')
@UseGuards(AuthGuard)
export class MaterialFilesController {
  constructor(
    private readonly access: MaterialsAccessService,
    private readonly attachments: MaterialAttachmentService,
    private readonly captions: LibraryFileCaptionService,
  ) {}

  @Post(':materialId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MATERIAL_ATTACHMENT_MAX_BYTES },
    }),
  )
  async upload(
    @CurrentUser() userId: string,
    @Param('materialId') materialId: string,
    @Query('compressLevel') compressLevel: string | undefined,
    @UploadedFile() file: UploadedMaterialFile,
  ) {
    await this.access.assertStaff(userId);
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    return this.attachments.createAttachment(
      materialId,
      file,
      parseMaterialCompressLevel(compressLevel),
    );
  }

  @Get(':attachmentId/meta')
  async attachmentMeta(@CurrentUser() userId: string, @Param('attachmentId') attachmentId: string) {
    return this.captions.getAttachmentMeta(userId, attachmentId);
  }

  @Get(':attachmentId/captions')
  async listCaptions(@CurrentUser() userId: string, @Param('attachmentId') attachmentId: string) {
    return this.captions.listCaptions(userId, attachmentId);
  }

  @Get(':attachmentId/captions/:language/vtt')
  async downloadCaptionVtt(
    @CurrentUser() userId: string,
    @Param('attachmentId') attachmentId: string,
    @Param('language') language: string,
    @Res() res: Response,
  ): Promise<void> {
    const { vtt, fileName } = await this.captions.openCaptionVtt(userId, attachmentId, language);
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    res.send(vtt);
  }

  @Post(':attachmentId/captions/generate')
  async generateCaptions(
    @CurrentUser() userId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    await this.access.assertStaff(userId);
    return this.captions.triggerGeneration(userId, attachmentId);
  }

  @Get(':attachmentId/preview')
  async downloadPreview(
    @CurrentUser() userId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    let meta = await this.attachments.assertPreviewDownloadable(attachmentId);
    try {
      await this.access.assertCanDownloadMaterial(userId, meta.materialId);
    } catch {
      throw new ForbiddenException();
    }

    try {
      const stream = await this.attachments.openReadStream(meta.previewStorageKey);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(meta.fileName.replace(/\.pdf$/i, '-cover.jpg'))}"`,
      );
      stream.pipe(res);
      return;
    } catch {
      // Preview may not exist yet — generate on demand for book PDFs.
      await this.attachments.ensurePdfTitlePagePreview(attachmentId);
      meta = await this.attachments.assertPreviewDownloadable(attachmentId);
      const stream = await this.attachments.openReadStream(meta.previewStorageKey);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(meta.fileName.replace(/\.pdf$/i, '-cover.jpg'))}"`,
      );
      stream.pipe(res);
    }
  }

  @Get(':attachmentId')
  async download(
    @CurrentUser() userId: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const meta = await this.attachments.assertDownloadable(attachmentId);
    try {
      await this.access.assertCanDownloadMaterial(userId, meta.materialId);
    } catch {
      throw new ForbiddenException();
    }

    const fileSize = await this.attachments.getFileSizeBytes(meta.storageKey);
    const range = parseBytesRangeHeader(req.headers.range, fileSize);

    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(meta.fileName)}"`,
    );
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      const { start, end } = range;
      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);
      this.attachments.openReadStreamRange(meta.storageKey, start, end).pipe(res);
      return;
    }

    res.setHeader('Content-Length', fileSize);
    (await this.attachments.openReadStream(meta.storageKey)).pipe(res);
  }
}
