'use client';

import { useEffect, useRef, useState } from 'react';
import {
  fetchPdfArrayBuffer,
  loadPdfJs,
  type PdfLoadingProgress,
} from './pdf-client';
import styles from './book-viewer.module.scss';

type PdfDocument = Awaited<
  ReturnType<Awaited<ReturnType<typeof loadPdfJs>>['getDocument']>['promise']
>;

type Props = {
  pdfUrl: string;
  pageIndex: number;
  scale: number;
  onPageSize: (size: { width: number; height: number }) => void;
  onNaturalPageSize?: (size: { width: number; height: number }) => void;
  onPageCount: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  onProgress?: (progress: PdfLoadingProgress | null) => void;
  onError?: (message: string) => void;
};

export function PdfPageCanvas({
  pdfUrl,
  pageIndex,
  scale,
  onPageSize,
  onNaturalPageSize,
  onPageCount,
  onLoadingChange,
  onProgress,
  onError,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PdfDocument | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const lastPageSizeRef = useRef<{ width: number; height: number } | null>(null);
  const naturalSizeReportedForPageRef = useRef<number | null>(null);
  const [documentReady, setDocumentReady] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onPageSizeRef = useRef(onPageSize);
  const onPageCountRef = useRef(onPageCount);
  const onLoadingChangeRef = useRef(onLoadingChange);
  const onProgressRef = useRef(onProgress);
  const onErrorRef = useRef(onError);

  const onNaturalPageSizeRef = useRef(onNaturalPageSize);

  onPageSizeRef.current = onPageSize;
  onNaturalPageSizeRef.current = onNaturalPageSize;
  onPageCountRef.current = onPageCount;
  onLoadingChangeRef.current = onLoadingChange;
  onProgressRef.current = onProgress;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      onLoadingChangeRef.current?.(true);
      onProgressRef.current?.({ loaded: 0, total: 0, percent: 0 });
      setError(null);

      try {
        if (pdfRef.current && pdfUrlRef.current === pdfUrl) {
          onPageCountRef.current(pdfRef.current.numPages);
          onProgressRef.current?.(null);
          onLoadingChangeRef.current?.(false);
          setDocumentReady((version) => version + 1);
          return;
        }

        pdfRef.current = null;
        pdfUrlRef.current = null;

        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        const data = await fetchPdfArrayBuffer(pdfUrl, (progress) => {
          if (!cancelled) onProgressRef.current?.(progress);
        });
        if (cancelled) return;

        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        pdfUrlRef.current = pdfUrl;
        onPageCountRef.current(pdf.numPages);
        onProgressRef.current?.(null);
        onLoadingChangeRef.current?.(false);
        setDocumentReady((version) => version + 1);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(message);
        onErrorRef.current?.(message);
        onProgressRef.current?.(null);
        onLoadingChangeRef.current?.(false);
      }
    };

    void loadDocument();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (documentReady === 0) return;

    let cancelled = false;
    const pdf = pdfRef.current;
    if (!pdf) return;

    const renderPage = async () => {
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      setError(null);

      try {
        const page = await pdf.getPage(pageIndex + 1);
        if (cancelled) return;

        const naturalViewport = page.getViewport({ scale: 1 });
        if (naturalSizeReportedForPageRef.current !== pageIndex) {
          naturalSizeReportedForPageRef.current = pageIndex;
          onNaturalPageSizeRef.current?.({
            width: naturalViewport.width,
            height: naturalViewport.height,
          });
        }

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const nextSize = { width: viewport.width, height: viewport.height };
        const prevSize = lastPageSizeRef.current;
        if (
          !prevSize
          || prevSize.width !== nextSize.width
          || prevSize.height !== nextSize.height
        ) {
          lastPageSizeRef.current = nextSize;
          onPageSizeRef.current(nextSize);
        }

        const renderTask = page.render({ canvasContext: context, viewport, canvas });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: unknown) {
        if (cancelled) return;
        if (
          err instanceof Error
          && (err.name === 'RenderingCancelledException'
            || /cancel/i.test(err.message))
        ) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Failed to render PDF page';
        setError(message);
        onErrorRef.current?.(message);
      } finally {
        renderTaskRef.current = null;
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [documentReady, pageIndex, scale]);

  return (
    <div className={styles.pdfLayer}>
      {error ? <p className={styles.pdfError}>{error}</p> : null}
      <canvas ref={canvasRef} className={styles.pdfCanvas} />
    </div>
  );
}
