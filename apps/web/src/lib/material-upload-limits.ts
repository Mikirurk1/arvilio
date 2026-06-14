/** Keep in sync with backend `MATERIAL_ATTACHMENT_MAX_BYTES` (default 100 MB). */
export const MATERIAL_ATTACHMENT_MAX_BYTES = Number.parseInt(
  process.env.NEXT_PUBLIC_MATERIAL_ATTACHMENT_MAX_BYTES ?? '104857600',
  10,
);

export const MATERIAL_ATTACHMENT_MAX_MB = Math.round(MATERIAL_ATTACHMENT_MAX_BYTES / (1024 * 1024));

export function formatMaterialMaxFileSize(): string {
  return `${MATERIAL_ATTACHMENT_MAX_MB} MB`;
}

export function materialFileTooLargeMessage(fileName: string): string {
  return `"${fileName}" is too large. Maximum file size is ${formatMaterialMaxFileSize()}.`;
}

export function isMaterialFileWithinSizeLimit(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MATERIAL_ATTACHMENT_MAX_BYTES;
}
