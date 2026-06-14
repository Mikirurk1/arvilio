import type { LibraryMaterialAssetDto } from '@pkg/types';

const ANNOTATABLE_BOOK_ROLES = new Set<LibraryMaterialAssetDto['role']>([
  'student_book',
  'teacher_book',
  'workbook',
]);

export function isAnnotatableBookAsset(asset: Pick<
  LibraryMaterialAssetDto,
  'role' | 'deliveryKind' | 'fileAttachmentId' | 'downloadPath'
>): boolean {
  if (asset.deliveryKind !== 'file') return false;
  if (!asset.fileAttachmentId || !asset.downloadPath) return false;
  return ANNOTATABLE_BOOK_ROLES.has(asset.role);
}

export function isStudentFacingBookAsset(asset: Pick<LibraryMaterialAssetDto, 'role'>): boolean {
  return asset.role === 'student_book' || asset.role === 'workbook';
}
