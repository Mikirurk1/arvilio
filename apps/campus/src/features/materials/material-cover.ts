import type { LibraryMaterialAssetDto, LibraryMaterialDto } from '@pkg/types';
import {
  libraryMaterialFileHref,
  libraryMaterialPreviewHref,
} from '../../lib/material-upload';
import { LIBRARY_ASSET_ROLE_LABELS } from './material-asset-presets';

const BOOK_COVER_ROLES: LibraryMaterialAssetDto['role'][] = [
  'student_book',
  'teacher_book',
  'workbook',
];

export function materialCoverImageHref(material: LibraryMaterialDto): string | null {
  if (material.coverDownloadPath) {
    return libraryMaterialFileHref(material.coverDownloadPath);
  }

  for (const role of BOOK_COVER_ROLES) {
    const asset = material.assets.find((item) => item.role === role);
    if (asset?.previewDownloadPath) {
      return libraryMaterialPreviewHref(asset.previewDownloadPath);
    }
  }

  const anyPreview = material.assets.find((item) => item.previewDownloadPath);
  if (anyPreview?.previewDownloadPath) {
    return libraryMaterialPreviewHref(anyPreview.previewDownloadPath);
  }

  return null;
}

export function materialAssetPreviewHref(
  asset: Pick<LibraryMaterialAssetDto, 'role' | 'previewDownloadPath'>,
): string | null {
  if (!asset.previewDownloadPath) return null;
  if (!(BOOK_COVER_ROLES as readonly string[]).includes(asset.role)) return null;
  return libraryMaterialPreviewHref(asset.previewDownloadPath);
}

export function materialAssetPreviewLabel(role: LibraryMaterialAssetDto['role']): string {
  return `${LIBRARY_ASSET_ROLE_LABELS[role]} cover`;
}
