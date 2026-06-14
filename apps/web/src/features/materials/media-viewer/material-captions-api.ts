import type { LibraryFileCaptionsResponseDto } from '@pkg/types';
import { apiClient, browserApiPath } from '../../../lib/api';

export async function fetchMaterialCaptions(
  fileAttachmentId: string,
): Promise<LibraryFileCaptionsResponseDto> {
  return apiClient.get<LibraryFileCaptionsResponseDto>(
    `/materials/files/${encodeURIComponent(fileAttachmentId)}/captions`,
  );
}

export function materialCaptionVttHref(fileAttachmentId: string, language: string): string {
  return browserApiPath(
    `/materials/files/${encodeURIComponent(fileAttachmentId)}/captions/${encodeURIComponent(language)}/vtt`,
  );
}

export async function triggerMaterialCaptionGeneration(
  fileAttachmentId: string,
): Promise<LibraryFileCaptionsResponseDto> {
  return apiClient.post<LibraryFileCaptionsResponseDto>(
    `/materials/files/${encodeURIComponent(fileAttachmentId)}/captions/generate`,
    {},
  );
}
