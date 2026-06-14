import type { MaterialAttachmentMetaDto } from '@pkg/types';
import { apiClient } from '../../../lib/api';

export async function fetchMaterialAttachmentMeta(
  fileAttachmentId: string,
): Promise<MaterialAttachmentMetaDto> {
  return apiClient.get<MaterialAttachmentMetaDto>(
    `/materials/files/${encodeURIComponent(fileAttachmentId)}/meta`,
  );
}
