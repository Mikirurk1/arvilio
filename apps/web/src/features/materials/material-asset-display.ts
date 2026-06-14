import type { LibraryMaterialAssetDto } from '@pkg/types';
import { LIBRARY_ASSET_ROLE_LABELS } from './material-asset-presets';

export function materialAssetRoleLabel(
  role: LibraryMaterialAssetDto['role'],
): string {
  return LIBRARY_ASSET_ROLE_LABELS[role];
}

/** Primary line for cards and lists — prefer stored file name. */
export function materialAssetPrimaryName(
  asset: Pick<
    LibraryMaterialAssetDto,
    'role' | 'deliveryKind' | 'url' | 'label' | 'fileName'
  >,
): string {
  if (asset.deliveryKind === 'file') {
    const fileName = asset.fileName?.trim();
    if (fileName) return fileName;
  }

  const label = asset.label?.trim();
  if (label) return label;

  if (asset.deliveryKind === 'url' && asset.url?.trim()) {
    return formatMaterialAssetUrlLabel(asset.url.trim());
  }

  return materialAssetRoleLabel(asset.role);
}

/** Secondary hint when primary is not the role name (e.g. role badge under file name). */
export function materialAssetSecondaryHint(
  asset: Pick<
    LibraryMaterialAssetDto,
    'role' | 'deliveryKind' | 'url' | 'label' | 'fileName'
  >,
): string | null {
  const role = materialAssetRoleLabel(asset.role);
  const primary = materialAssetPrimaryName(asset);

  if (asset.deliveryKind === 'file' && asset.fileName?.trim()) {
    const customLabel = asset.label?.trim();
    if (customLabel && customLabel !== asset.fileName.trim()) {
      return customLabel;
    }
    return primary !== role ? role : null;
  }

  if (asset.deliveryKind === 'url' && asset.url?.trim() && primary !== asset.url.trim()) {
    return asset.url.trim();
  }

  return primary !== role ? role : null;
}

function formatMaterialAssetUrlLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${host}${path}` || url;
  } catch {
    return url;
  }
}

/** Compact one-line summary for grid cards (avoids huge asset tables). */
export function summarizeMaterialAssets(
  assets: Array<
    Pick<LibraryMaterialAssetDto, 'role' | 'deliveryKind' | 'url' | 'label' | 'fileName'>
  >,
  maxNames = 2,
): string {
  if (assets.length === 0) return 'No files attached';

  const names = assets.map((asset) => materialAssetPrimaryName(asset));
  if (names.length <= maxNames) {
    return names.join(' · ');
  }

  const visible = names.slice(0, maxNames).join(' · ');
  return `${visible} · +${names.length - maxNames} more`;
}

export function materialAssetCountLabel(count: number): string {
  if (count === 1) return '1 file';
  return `${count} files`;
}
