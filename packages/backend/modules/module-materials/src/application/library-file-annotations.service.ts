import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { Prisma } from '@prisma/client';
import {
  computeLibraryFileRevision,
  emptyMaterialAnnotationDocument,
  validateMaterialAnnotationDocument,
  type LibraryFileAnnotationResponseDto,
  type MaterialAnnotationDocument,
  type SaveLibraryFileAnnotationRequestDto,
} from '@pkg/types';
import { MaterialsAccessService } from './materials-access.service';

const ANNOTATABLE_BOOK_ROLES = new Set(['STUDENT_BOOK', 'TEACHER_BOOK', 'WORKBOOK']);

type AttachmentMeta = {
  id: string;
  materialId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
};

function normalizeContextUserId(value?: string | null): string {
  return value?.trim() ?? '';
}

function overlayHasContent(document: MaterialAnnotationDocument): boolean {
  return Object.values(document.pages).some((items) => items.length > 0);
}

@Injectable()
export class LibraryFileAnnotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: MaterialsAccessService,
  ) {}

  async get(
    viewerId: string,
    fileAttachmentId: string,
    subjectUserId?: string | null,
  ): Promise<LibraryFileAnnotationResponseDto> {
    const attachment = await this.loadAnnotatableAttachment(fileAttachmentId);
    await this.access.assertCanDownloadMaterial(viewerId, attachment.materialId);

    const subjectId = subjectUserId?.trim() || viewerId;
    if (subjectId !== viewerId) {
      await this.access.assertCanViewStudent(viewerId, subjectId);
    }

    const subject = await this.prisma.user.findUnique({
      where: { id: subjectId },
      select: { id: true, displayName: true },
    });
    if (!subject) throw new NotFoundException('User not found');

    const baseRow = await this.prisma.libraryFileUserAnnotation.findUnique({
      where: {
        userId_fileAttachmentId_contextUserId: {
          userId: subjectId,
          fileAttachmentId,
          contextUserId: '',
        },
      },
    });

    const isReviewingStudent = subjectId !== viewerId;
    const overlayRow = isReviewingStudent
      ? await this.prisma.libraryFileUserAnnotation.findUnique({
          where: {
            userId_fileAttachmentId_contextUserId: {
              userId: viewerId,
              fileAttachmentId,
              contextUserId: subjectId,
            },
          },
        })
      : null;

    const fileRevision = computeLibraryFileRevision(attachment.sizeBytes, attachment.storageKey);
    const baseDocument =
      (baseRow?.document as MaterialAnnotationDocument | undefined) ??
      emptyMaterialAnnotationDocument();
    const overlayDocument =
      (overlayRow?.document as MaterialAnnotationDocument | undefined) ??
      emptyMaterialAnnotationDocument();

    return {
      document: baseDocument,
      overlayDocument,
      updatedAt: baseRow?.updatedAt.toISOString() ?? null,
      overlayUpdatedAt: overlayRow?.updatedAt.toISOString() ?? null,
      readOnly: isReviewingStudent,
      canEditOverlay: isReviewingStudent,
      canClearOverlay: isReviewingStudent && overlayHasContent(overlayDocument),
      fileRevision: baseRow?.fileRevision ?? fileRevision,
      fileName: attachment.fileName,
      materialId: attachment.materialId,
      subjectUserId: subjectId,
      subjectDisplayName: subject.displayName,
    };
  }

  async upsert(
    userId: string,
    fileAttachmentId: string,
    body: SaveLibraryFileAnnotationRequestDto,
  ): Promise<LibraryFileAnnotationResponseDto> {
    if (!validateMaterialAnnotationDocument(body.document)) {
      throw new BadRequestException('Invalid annotation document');
    }

    const attachment = await this.loadAnnotatableAttachment(fileAttachmentId);
    await this.access.assertCanDownloadMaterial(userId, attachment.materialId);

    const contextUserId = normalizeContextUserId(body.contextUserId);
    if (contextUserId) {
      await this.access.assertCanViewStudent(userId, contextUserId);
    }

    const fileRevision =
      body.fileRevision?.trim() ||
      computeLibraryFileRevision(attachment.sizeBytes, attachment.storageKey);

    await this.prisma.libraryFileUserAnnotation.upsert({
      where: {
        userId_fileAttachmentId_contextUserId: {
          userId,
          fileAttachmentId,
          contextUserId,
        },
      },
      create: {
        userId,
        fileAttachmentId,
        contextUserId,
        document: body.document as unknown as Prisma.InputJsonValue,
        fileRevision,
      },
      update: {
        document: body.document as unknown as Prisma.InputJsonValue,
        fileRevision,
      },
    });

    return this.get(userId, fileAttachmentId, contextUserId || userId);
  }

  async clearOverlay(
    userId: string,
    fileAttachmentId: string,
    contextUserId: string,
  ): Promise<LibraryFileAnnotationResponseDto> {
    const subjectId = contextUserId.trim();
    if (!subjectId) {
      throw new BadRequestException('contextUserId is required');
    }
    await this.access.assertCanViewStudent(userId, subjectId);
    const attachment = await this.loadAnnotatableAttachment(fileAttachmentId);
    await this.access.assertCanDownloadMaterial(userId, attachment.materialId);

    await this.prisma.libraryFileUserAnnotation.deleteMany({
      where: {
        userId,
        fileAttachmentId,
        contextUserId: subjectId,
      },
    });

    return this.get(userId, fileAttachmentId, subjectId);
  }

  private async loadAnnotatableAttachment(fileAttachmentId: string): Promise<AttachmentMeta> {
    const attachment = await this.prisma.libraryFileAttachment.findUnique({
      where: { id: fileAttachmentId },
      select: {
        id: true,
        materialId: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        storageKey: true,
        assets: {
          select: { role: true },
          take: 1,
        },
      },
    });
    if (!attachment) throw new NotFoundException('File attachment not found');

    const isPdf =
      attachment.mimeType === 'application/pdf' ||
      attachment.fileName.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new BadRequestException('Annotations are only supported for PDF book files');
    }

    const bookAsset = attachment.assets.some((asset) => ANNOTATABLE_BOOK_ROLES.has(asset.role));
    if (!bookAsset) {
      throw new BadRequestException('Annotations are only supported for book PDF assets');
    }

    return attachment;
  }
}
