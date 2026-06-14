import { BadRequestException } from '@nestjs/common';
import type {
  LibraryMaterialAssetDto,
  LibraryMaterialDto,
  LibraryMaterialKindName,
} from '@pkg/types';

function isBookTitlePageRole(role: string): boolean {
  return role === 'STUDENT_BOOK' || role === 'TEACHER_BOOK' || role === 'WORKBOOK';
}

export function encodeLibraryMaterialCursor(row: { updatedAt: Date; id: string }): string {
  return `${row.updatedAt.toISOString()}|${row.id}`;
}

export function decodeLibraryMaterialCursor(cursor: string): { updatedAt: Date; id: string } {
  const parts = cursor.split('|');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new BadRequestException('Invalid library material cursor');
  }
  const updatedAt = new Date(parts[0]);
  if (Number.isNaN(updatedAt.getTime())) {
    throw new BadRequestException('Invalid library material cursor');
  }
  return { updatedAt, id: parts[1] };
}

export function libraryMaterialKindToDto(
  kind: 'BOARD' | 'PRESENTATION' | 'BOOK' | 'OTHER',
): LibraryMaterialKindName {
  return kind.toLowerCase() as LibraryMaterialKindName;
}

export function libraryMaterialKindFromDto(
  kind: LibraryMaterialKindName,
): 'BOARD' | 'PRESENTATION' | 'BOOK' | 'OTHER' {
  return kind.toUpperCase() as 'BOARD' | 'PRESENTATION' | 'BOOK' | 'OTHER';
}

export function libraryAssetRoleToDto(
  role:
    | 'STUDENT_BOOK'
    | 'TEACHER_BOOK'
    | 'WORKBOOK'
    | 'AUDIO'
    | 'VIDEO'
    | 'SLIDES'
    | 'LINK'
    | 'OTHER',
): LibraryMaterialAssetDto['role'] {
  return role.toLowerCase() as LibraryMaterialAssetDto['role'];
}

export function libraryAssetRoleFromDto(
  role: LibraryMaterialAssetDto['role'],
):
  | 'STUDENT_BOOK'
  | 'TEACHER_BOOK'
  | 'WORKBOOK'
  | 'AUDIO'
  | 'VIDEO'
  | 'SLIDES'
  | 'LINK'
  | 'OTHER' {
  return role.toUpperCase() as
    | 'STUDENT_BOOK'
    | 'TEACHER_BOOK'
    | 'WORKBOOK'
    | 'AUDIO'
    | 'VIDEO'
    | 'SLIDES'
    | 'LINK'
    | 'OTHER';
}

export function libraryDeliveryKindToDto(
  kind: 'URL' | 'FILE',
): LibraryMaterialAssetDto['deliveryKind'] {
  return kind.toLowerCase() as LibraryMaterialAssetDto['deliveryKind'];
}

export function libraryDeliveryKindFromDto(
  kind: LibraryMaterialAssetDto['deliveryKind'],
): 'URL' | 'FILE' {
  return kind.toUpperCase() as 'URL' | 'FILE';
}

type MaterialRow = {
  id: string;
  title: string;
  description: string | null;
  kind: 'BOARD' | 'PRESENTATION' | 'BOOK' | 'OTHER';
  tags: string[];
  level: string | null;
  publisher: string | null;
  schoolId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  coverAttachment: {
    id: string;
    fileName: string;
    mimeType: string;
  } | null;
  assets: Array<{
    id: string;
    role:
      | 'STUDENT_BOOK'
      | 'TEACHER_BOOK'
      | 'WORKBOOK'
      | 'AUDIO'
      | 'VIDEO'
      | 'SLIDES'
      | 'LINK'
      | 'OTHER';
    deliveryKind: 'URL' | 'FILE';
    url: string | null;
    label: string | null;
    sortOrder: number;
    fileAttachment: {
      id: string;
      fileName: string;
      mimeType: string;
      previewStorageKey: string | null;
    } | null;
  }>;
};

type MaterialPathResolver = {
  downloadPath: (attachmentId: string) => string;
  previewDownloadPath: (attachmentId: string) => string;
};

export function mapLibraryMaterialRow(
  row: MaterialRow,
  paths: MaterialPathResolver,
): LibraryMaterialDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: libraryMaterialKindToDto(row.kind),
    tags: row.tags,
    level: row.level,
    publisher: row.publisher,
    schoolId: row.schoolId,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    coverAttachmentId: row.coverAttachment?.id ?? null,
    coverDownloadPath: row.coverAttachment ? paths.downloadPath(row.coverAttachment.id) : null,
    assets: row.assets
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((asset) => ({
        id: asset.id,
        role: libraryAssetRoleToDto(asset.role),
        deliveryKind: libraryDeliveryKindToDto(asset.deliveryKind),
        url: asset.url,
        label: asset.label,
        sortOrder: asset.sortOrder,
        fileAttachmentId: asset.fileAttachment?.id ?? null,
        fileName: asset.fileAttachment?.fileName ?? null,
        downloadPath: asset.fileAttachment ? paths.downloadPath(asset.fileAttachment.id) : null,
        previewDownloadPath:
          asset.fileAttachment &&
          isBookTitlePageRole(asset.role) &&
          asset.fileAttachment.mimeType === 'application/pdf'
            ? paths.previewDownloadPath(asset.fileAttachment.id)
            : asset.fileAttachment?.previewStorageKey
              ? paths.previewDownloadPath(asset.fileAttachment.id)
              : null,
      })),
  };
}

export function libraryKindToLessonMaterialKind(
  kind: LibraryMaterialKindName,
): 'text' | 'photo' | 'test' | 'file' | 'presentation' | 'book' | 'board' {
  switch (kind) {
    case 'board':
      return 'board';
    case 'presentation':
      return 'presentation';
    case 'book':
      return 'book';
    default:
      return 'file';
  }
}
