import type { FileMeta } from './tabTypes';

export const MAX_FILE_SIZE_MB = 5;

export function filterSafeFiles(
  files: FileList | null,
): { safe: FileMeta[]; rejected: string[]; maxFileSizeMb: number } {
  if (!files) return { safe: [], rejected: [], maxFileSizeMb: MAX_FILE_SIZE_MB };
  const allowedMimePrefixes = ['image/', 'application/pdf', 'text/', 'application/vnd', 'application/msword'];
  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.heic',
    '.heif',
    '.svg',
    '.pdf',
    '.txt',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
  ];

  const safe: FileMeta[] = [];
  const rejected: string[] = [];
  Array.from(files).forEach((file) => {
    const lower = file.name.toLowerCase();
    const hasAllowedExt = allowedExtensions.some((ext) => lower.endsWith(ext));
    const hasAllowedMime = allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix));
    const sizeMb = file.size / (1024 * 1024);
    if ((hasAllowedExt || hasAllowedMime) && sizeMb <= MAX_FILE_SIZE_MB) {
      safe.push({
        name: file.name.replace(/[^\w.\-()\s]/g, '_'),
        previewUrl: URL.createObjectURL(file),
        file,
      });
    } else {
      rejected.push(file.name);
    }
  });

  return { safe, rejected, maxFileSizeMb: MAX_FILE_SIZE_MB };
}

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function isImageFileName(fileName: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|heic|heif|svg)$/i.test(fileName);
}

/** Open image in overlay; other types open/download via blob URL. */
export function openLessonAttachment(
  fileName: string,
  objectUrl: string | null | undefined,
  onImagePreview: (url: string) => void,
): void {
  if (!objectUrl) return;
  if (isImageFileName(fileName)) {
    onImagePreview(objectUrl);
    return;
  }
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName.replace(/^att:[^:]+$/, 'download');
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function getFilePlaceholder(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (/\.(pdf)$/.test(lower)) return 'PDF';
  if (/\.(doc|docx|txt)$/.test(lower)) return 'DOC';
  if (/\.(ppt|pptx)$/.test(lower)) return 'PPT';
  if (/\.(xls|xlsx)$/.test(lower)) return 'XLS';
  if (/\.(jpg|jpeg|png|webp|gif|heic|heif|svg)$/.test(lower)) return 'IMG';
  return 'FILE';
}
