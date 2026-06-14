import { BadRequestException } from '@nestjs/common';
import { LibraryFileAnnotationsService } from './library-file-annotations.service';
import { emptyMaterialAnnotationDocument } from '@pkg/types';

describe('LibraryFileAnnotationsService', () => {
  const prisma = {
    libraryFileAttachment: { findUnique: jest.fn() },
    libraryFileUserAnnotation: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: { findUnique: jest.fn() },
  };

  const access = {
    assertCanDownloadMaterial: jest.fn(),
    assertCanViewStudent: jest.fn(),
  };

  const service = new LibraryFileAnnotationsService(prisma as never, access as never);

  const attachment = {
    id: 'file-1',
    materialId: 'mat-1',
    fileName: 'book.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1000,
    storageKey: 'library/mat-1/file-1.pdf',
    assets: [{ role: 'STUDENT_BOOK' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.libraryFileAttachment.findUnique.mockResolvedValue(attachment);
    access.assertCanDownloadMaterial.mockResolvedValue(undefined);
    prisma.user.findUnique.mockResolvedValue({ id: 'student-1', displayName: 'Alex' });
    prisma.libraryFileUserAnnotation.findUnique.mockResolvedValue(null);
  });

  it('returns empty documents when none saved', async () => {
    const result = await service.get('student-1', 'file-1');
    expect(result.document).toEqual(emptyMaterialAnnotationDocument());
    expect(result.overlayDocument).toEqual(emptyMaterialAnnotationDocument());
    expect(result.readOnly).toBe(false);
    expect(result.canEditOverlay).toBe(false);
  });

  it('returns overlay for teacher reviewing student', async () => {
    const overlay = emptyMaterialAnnotationDocument();
    overlay.pages['0'] = [
      {
        id: 'a1',
        type: 'pen',
        color: '#000',
        strokeWidth: 2,
        points: [0, 0, 1, 1],
      },
    ];
    prisma.libraryFileUserAnnotation.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ document: overlay, updatedAt: new Date(), fileRevision: 'x' });

    const result = await service.get('teacher-1', 'file-1', 'student-2');
    expect(result.readOnly).toBe(true);
    expect(result.canEditOverlay).toBe(true);
    expect(result.overlayDocument.pages['0']).toHaveLength(1);
    expect(access.assertCanViewStudent).toHaveBeenCalledWith('teacher-1', 'student-2');
  });

  it('rejects non-PDF attachments', async () => {
    prisma.libraryFileAttachment.findUnique.mockResolvedValue({
      ...attachment,
      mimeType: 'audio/mpeg',
      fileName: 'audio.mp3',
      assets: [{ role: 'AUDIO' }],
    });

    await expect(service.get('student-1', 'file-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saves staff overlay with contextUserId', async () => {
    const document = emptyMaterialAnnotationDocument();
    prisma.libraryFileUserAnnotation.upsert.mockResolvedValue({});
    prisma.libraryFileUserAnnotation.findUnique.mockResolvedValue(null);

    await service.upsert('teacher-1', 'file-1', {
      document,
      contextUserId: 'student-2',
    });

    expect(prisma.libraryFileUserAnnotation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_fileAttachmentId_contextUserId: {
            userId: 'teacher-1',
            fileAttachmentId: 'file-1',
            contextUserId: 'student-2',
          },
        },
      }),
    );
  });

  it('clears overlay for teacher', async () => {
    prisma.libraryFileUserAnnotation.deleteMany.mockResolvedValue({ count: 1 });
    prisma.libraryFileUserAnnotation.findUnique.mockResolvedValue(null);

    const result = await service.clearOverlay('teacher-1', 'file-1', 'student-2');
    expect(prisma.libraryFileUserAnnotation.deleteMany).toHaveBeenCalled();
    expect(result.canClearOverlay).toBe(false);
  });
});
