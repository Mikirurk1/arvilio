import type { LibraryMaterialAssetDto } from '@pkg/types';

const IN_APP_MEDIA_ROLES = new Set<LibraryMaterialAssetDto['role']>(['audio', 'video']);

export function isInAppMediaAsset(asset: Pick<
  LibraryMaterialAssetDto,
  'role' | 'deliveryKind' | 'fileAttachmentId' | 'downloadPath'
>): boolean {
  if (asset.deliveryKind !== 'file') return false;
  if (!asset.fileAttachmentId || !asset.downloadPath) return false;
  return IN_APP_MEDIA_ROLES.has(asset.role);
}

export function isInAppViewerAsset(asset: Pick<
  LibraryMaterialAssetDto,
  'role' | 'deliveryKind' | 'fileAttachmentId' | 'downloadPath'
>): boolean {
  return isInAppMediaAsset(asset);
}
