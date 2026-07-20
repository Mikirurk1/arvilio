import type { LibraryMaterialAssetDto } from '@pkg/types';

export const TEACHER_ONLY_LIBRARY_ASSET_ROLES = ['teacher_book'] as const;

export const OPTIONAL_STUDENT_MEDIA_ROLES = ['audio', 'video'] as const;

export type LessonLibraryAssetAudience = 'student' | 'staff';

export type LessonLibraryMediaShare = {
  sharedLibraryAssetIds?: string[] | null;
  libraryMediaSelectionApplied?: boolean | null;
};

export function isTeacherOnlyLibraryAsset(role: LibraryMaterialAssetDto['role']): boolean {
  return (TEACHER_ONLY_LIBRARY_ASSET_ROLES as readonly string[]).includes(role);
}

export function isOptionalStudentMediaAsset(role: LibraryMaterialAssetDto['role']): boolean {
  return (OPTIONAL_STUDENT_MEDIA_ROLES as readonly string[]).includes(role);
}

/** New library attachments: explicit selection mode, no audio/video until checked. */
export function defaultLessonLibraryMediaShare(
  _assets: LibraryMaterialAssetDto[],
): Required<Pick<LessonLibraryMediaShare, 'sharedLibraryAssetIds' | 'libraryMediaSelectionApplied'>> {
  return {
    sharedLibraryAssetIds: [],
    libraryMediaSelectionApplied: true,
  };
}

export function isAssetSharedWithStudent(
  asset: LibraryMaterialAssetDto,
  share: LessonLibraryMediaShare,
): boolean {
  if (isTeacherOnlyLibraryAsset(asset.role)) return false;
  if (!isOptionalStudentMediaAsset(asset.role)) return true;
  if (!share.libraryMediaSelectionApplied) return true;
  return (share.sharedLibraryAssetIds ?? []).includes(asset.id);
}

export function filterLibraryAssetsForLessonViewer(
  assets: LibraryMaterialAssetDto[],
  audience: LessonLibraryAssetAudience,
  share: LessonLibraryMediaShare = {},
): LibraryMaterialAssetDto[] {
  if (audience === 'staff') return assets;
  return assets.filter((asset) => isAssetSharedWithStudent(asset, share));
}

export function splitLibraryAssetsForLessonViewer(
  assets: LibraryMaterialAssetDto[],
  audience: LessonLibraryAssetAudience,
  share: LessonLibraryMediaShare = {},
): {
  coreAssets: LibraryMaterialAssetDto[];
  optionalMediaAssets: LibraryMaterialAssetDto[];
  teacherAssets: LibraryMaterialAssetDto[];
} {
  const teacherAssets =
    audience === 'staff'
      ? assets.filter((asset) => isTeacherOnlyLibraryAsset(asset.role))
      : [];
  const studentFacing = assets.filter((asset) => !isTeacherOnlyLibraryAsset(asset.role));
  const coreAssets = studentFacing.filter((asset) => !isOptionalStudentMediaAsset(asset.role));
  const optionalMediaAssets = studentFacing.filter((asset) =>
    isOptionalStudentMediaAsset(asset.role),
  );

  if (audience === 'student') {
    return {
      coreAssets,
      optionalMediaAssets: optionalMediaAssets.filter((asset) =>
        isAssetSharedWithStudent(asset, share),
      ),
      teacherAssets,
    };
  }

  return { coreAssets, optionalMediaAssets, teacherAssets };
}

export function toggleSharedLibraryAssetId(
  sharedLibraryAssetIds: string[],
  assetId: string,
  shared: boolean,
): string[] {
  if (shared) {
    return sharedLibraryAssetIds.includes(assetId)
      ? sharedLibraryAssetIds
      : [...sharedLibraryAssetIds, assetId];
  }
  return sharedLibraryAssetIds.filter((id) => id !== assetId);
}

export function effectiveSharedLibraryAssetIds(
  optionalMediaAssets: LibraryMaterialAssetDto[],
  share: LessonLibraryMediaShare,
): string[] {
  if (!share.libraryMediaSelectionApplied) {
    return optionalMediaAssets.map((asset) => asset.id);
  }
  return share.sharedLibraryAssetIds ?? [];
}
