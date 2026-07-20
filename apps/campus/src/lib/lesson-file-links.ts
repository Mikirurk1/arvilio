import type { LessonFileLinkDto } from '@pkg/types';
import { API_BASE } from './api';
import { isLessonFileAttachmentRef } from './lesson-file-ref';

export function lessonFileDownloadUrl(downloadPath: string | null | undefined): string | null {
  if (!downloadPath?.trim()) return null;
  return downloadPath.startsWith('http') ? downloadPath : `${API_BASE}${downloadPath}`;
}

export function lessonFileLinkAt(
  fileLinks: LessonFileLinkDto[] | undefined,
  fileIndex: number,
): LessonFileLinkDto | undefined {
  return fileLinks?.[fileIndex];
}

export function lessonFileDisplayName(
  fileRef: string,
  fileLinks: LessonFileLinkDto[] | undefined,
  fileIndex: number,
): string {
  return lessonFileLinkAt(fileLinks, fileIndex)?.fileName ?? fileRef;
}

export function lessonFilePreviewUrl(
  fileRef: string,
  fileLinks: LessonFileLinkDto[] | undefined,
  fileIndex: number,
): string | null {
  const link = lessonFileLinkAt(fileLinks, fileIndex);
  if (link?.ref === fileRef) {
    return lessonFileDownloadUrl(link.downloadPath);
  }
  return null;
}

export function buildMaterialPreviewsFromLesson(
  materials: Array<{ id: string; files: string[]; fileLinks?: LessonFileLinkDto[] }> | undefined,
): Record<string, Array<string | null>> {
  const out: Record<string, Array<string | null>> = {};
  for (const material of materials ?? []) {
    out[material.id] = material.files.map((fileRef, index) =>
      lessonFilePreviewUrl(fileRef, material.fileLinks, index),
    );
  }
  return out;
}

export function buildFilePreviewsFromLinks(
  files: string[],
  fileLinks: LessonFileLinkDto[] | undefined,
): Array<string | null> {
  return files.map((fileRef, index) => lessonFilePreviewUrl(fileRef, fileLinks, index));
}

/** Prefer persisted download URLs; keep blob previews only for not-yet-uploaded filenames. */
export function resolveLessonFilePreview(
  fileRef: string,
  fileLinks: LessonFileLinkDto[] | undefined,
  fileIndex: number,
  pendingPreview: string | null | undefined,
): string | null {
  const server = lessonFilePreviewUrl(fileRef, fileLinks, fileIndex);
  if (server) return server;
  if (isLessonFileAttachmentRef(fileRef)) return null;
  return pendingPreview ?? null;
}

export function buildFilePreviewsResolvingPending(
  files: string[],
  fileLinks: LessonFileLinkDto[] | undefined,
  pendingPreviews: Array<string | null>,
): Array<string | null> {
  return files.map((fileRef, index) =>
    resolveLessonFilePreview(fileRef, fileLinks, index, pendingPreviews[index]),
  );
}
