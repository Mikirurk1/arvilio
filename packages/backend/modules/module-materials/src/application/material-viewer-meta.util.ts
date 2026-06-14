import type { LibraryMaterialAssetRoleName, MaterialViewerMediaKind } from '@pkg/types';

const BOOK_ROLES = new Set<LibraryMaterialAssetRoleName>([
  'student_book',
  'teacher_book',
  'workbook',
]);

export function resolveMaterialViewerMediaKind(
  mimeType: string,
  assetRole: LibraryMaterialAssetRoleName | null,
): MaterialViewerMediaKind {
  const mime = mimeType.toLowerCase();
  if (mime.startsWith('audio/') || assetRole === 'audio') return 'audio';
  if (mime.startsWith('video/') || assetRole === 'video') return 'video';
  if (mime.includes('pdf') || (assetRole && BOOK_ROLES.has(assetRole))) return 'pdf';
  return 'other';
}

export function isStreamableMediaKind(kind: MaterialViewerMediaKind): boolean {
  return kind === 'audio' || kind === 'video';
}

export function mapAssetRoleFromPrisma(
  role: string | null | undefined,
): LibraryMaterialAssetRoleName | null {
  if (!role) return null;
  const normalized = role.toLowerCase();
  const map: Record<string, LibraryMaterialAssetRoleName> = {
    student_book: 'student_book',
    teacher_book: 'teacher_book',
    workbook: 'workbook',
    audio: 'audio',
    video: 'video',
    slides: 'slides',
    link: 'link',
    other: 'other',
  };
  return map[normalized] ?? null;
}
