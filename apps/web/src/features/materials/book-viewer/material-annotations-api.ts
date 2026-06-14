import { apiClient } from '../../../lib/api';
import type {
  LibraryFileAnnotationResponseDto,
  MaterialAnnotationDocument,
  SaveLibraryFileAnnotationRequestDto,
} from '@pkg/types';

export async function fetchLibraryFileAnnotations(
  fileAttachmentId: string,
  subjectUserId?: string | null,
): Promise<LibraryFileAnnotationResponseDto> {
  const params = new URLSearchParams();
  if (subjectUserId?.trim()) params.set('subjectUserId', subjectUserId.trim());
  const query = params.toString();
  const path = query
    ? `/materials/annotations/${encodeURIComponent(fileAttachmentId)}?${query}`
    : `/materials/annotations/${encodeURIComponent(fileAttachmentId)}`;
  return apiClient.get<LibraryFileAnnotationResponseDto>(path);
}

export async function saveLibraryFileAnnotations(
  fileAttachmentId: string,
  body: SaveLibraryFileAnnotationRequestDto,
): Promise<LibraryFileAnnotationResponseDto> {
  return apiClient.put<LibraryFileAnnotationResponseDto>(
    `/materials/annotations/${encodeURIComponent(fileAttachmentId)}`,
    body,
  );
}

export async function clearLibraryFileOverlay(
  fileAttachmentId: string,
  contextUserId: string,
): Promise<LibraryFileAnnotationResponseDto> {
  const params = new URLSearchParams({ contextUserId });
  return apiClient.delete<LibraryFileAnnotationResponseDto>(
    `/materials/annotations/${encodeURIComponent(fileAttachmentId)}?${params.toString()}`,
  );
}

export type { MaterialAnnotationDocument, LibraryFileAnnotationResponseDto };
