import { API_BASE, browserApiPath } from './api';
import type { MaterialCompressLevel } from './material-compress-level';

export type MaterialUploadProgressEvent = {
  phase: 'uploading' | 'compressing';
  loaded: number;
  total: number;
};

export type MaterialUploadResult = {
  id: string;
  fileName: string;
  downloadPath: string;
  sizeBytes: number;
  originalSizeBytes: number;
  compressionCodec: string;
};

function parseUploadError(responseText: string, status: number): string {
  let message = `Upload failed: ${status}`;
  if (!responseText) return message;
  try {
    const parsed = JSON.parse(responseText) as { message?: string | string[] };
    if (parsed.message) {
      message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
    }
  } catch {
    message = responseText;
  }
  return message;
}

export async function uploadLibraryMaterialFile(
  materialId: string,
  file: File,
  options?: {
    compressLevel?: MaterialCompressLevel;
    onProgress?: (event: MaterialUploadProgressEvent) => void;
  },
): Promise<MaterialUploadResult> {
  return new Promise((resolve, reject) => {
    const compressLevel = options?.compressLevel ?? 'balanced';
    const query = new URLSearchParams({ compressLevel });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/materials/files/${materialId}?${query.toString()}`);
    xhr.withCredentials = true;

    const reportCompressing = (total: number) => {
      options?.onProgress?.({ phase: 'compressing', loaded: total, total });
    };

    xhr.upload.onprogress = (event) => {
      if (!options?.onProgress || !event.lengthComputable) return;
      options.onProgress({
        phase: 'uploading',
        loaded: event.loaded,
        total: event.total,
      });
      if (event.loaded >= event.total) {
        reportCompressing(event.total);
      }
    };

    xhr.upload.onload = () => {
      const total = file.size;
      reportCompressing(total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText) as Partial<MaterialUploadResult>;
          if (!parsed.id || !parsed.fileName || !parsed.downloadPath) {
            reject(new Error('Invalid upload response'));
            return;
          }
          resolve({
            id: parsed.id,
            fileName: parsed.fileName,
            downloadPath: parsed.downloadPath,
            sizeBytes: parsed.sizeBytes ?? file.size,
            originalSizeBytes: parsed.originalSizeBytes ?? file.size,
            compressionCodec: parsed.compressionCodec ?? 'none',
          });
        } catch {
          reject(new Error('Invalid upload response'));
        }
        return;
      }
      reject(new Error(parseUploadError(xhr.responseText, xhr.status)));
    };

    xhr.onerror = () =>
      reject(
        new Error(
          'Upload failed — connection closed. Large PDFs are saved first and compressed in the background; retry if this persists.',
        ),
      );
    xhr.onabort = () => reject(new Error('Upload cancelled'));

    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}

export function libraryMaterialFileHref(downloadPath: string): string {
  return browserApiPath(downloadPath);
}

export function libraryMaterialPreviewHref(previewDownloadPath: string): string {
  return libraryMaterialFileHref(previewDownloadPath);
}

export function formatMaterialCompressionLine(result: Pick<
  MaterialUploadResult,
  'fileName' | 'sizeBytes' | 'originalSizeBytes' | 'compressionCodec'
>): string {
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const reduced =
    result.compressionCodec !== 'none' &&
    result.compressionCodec !== 'background' &&
    result.sizeBytes < result.originalSizeBytes;

  if (result.compressionCodec === 'background') {
    return `${result.fileName}: ${formatBytes(result.sizeBytes)} saved — PDF compression running in background`;
  }

  if (reduced) {
    return `${result.fileName}: ${formatBytes(result.originalSizeBytes)} → ${formatBytes(result.sizeBytes)}`;
  }

  if (result.fileName.toLowerCase().endsWith('.pdf') && result.compressionCodec === 'none') {
    return `${result.fileName}: ${formatBytes(result.sizeBytes)} (PDF not compressed — install Ghostscript on the server)`;
  }

  return `${result.fileName}: ${formatBytes(result.sizeBytes)} (no size reduction)`;
}
