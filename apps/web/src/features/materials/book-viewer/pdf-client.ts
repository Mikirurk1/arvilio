'use client';

type PdfJsModule = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfJsModule> | null = null;

export async function loadPdfJs(): Promise<PdfJsModule> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only load in the browser');
  }
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export type PdfLoadingProgress = {
  loaded: number;
  total: number;
  percent: number | null;
};

export function pdfProgressFromEvent(loaded: number, total: number): PdfLoadingProgress {
  return {
    loaded,
    total,
    percent: total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null,
  };
}

export async function fetchPdfArrayBuffer(
  pdfUrl: string,
  onProgress?: (progress: PdfLoadingProgress) => void,
): Promise<ArrayBuffer> {
  const response = await fetch(pdfUrl, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to download PDF (${response.status})`);
  }

  const total = Number(response.headers.get('content-length') || 0);
  if (!response.body || !total) {
    onProgress?.({ loaded: 0, total: 0, percent: null });
    const data = await response.arrayBuffer();
    onProgress?.({ loaded: data.byteLength, total: data.byteLength, percent: 100 });
    return data;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.length;
      onProgress?.(pdfProgressFromEvent(loaded, total));
    }
  }

  const merged = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  onProgress?.({ loaded, total, percent: 100 });
  return merged.buffer;
}
