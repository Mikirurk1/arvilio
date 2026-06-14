'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { MaterialAnnotationDocument, MaterialAnnotationTool } from '@pkg/types';
import { libraryMaterialFileHref } from '../../../lib/material-upload';
import { Button } from '../../../components/ui';
import { AnnotationLayer } from './AnnotationLayer';
import { AnnotationToolbar } from './AnnotationToolbar';
import { BookViewerLoadingOverlay } from './BookViewerLoadingOverlay';
import { PageNavigator } from './PageNavigator';
import type { PdfLoadingProgress } from './pdf-client';
import { useBookAnnotations } from './useBookAnnotations';
import styles from './book-viewer.module.scss';

const PdfPageCanvas = dynamic(
  () => import('./PdfPageCanvas').then((mod) => mod.PdfPageCanvas),
  { ssr: false },
);

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;
const MAX_PAGE_WIDTH_PX = 920;

type Props = {
  attachmentId: string;
  subjectUserId?: string | null;
  returnTo?: string | null;
};

function saveStatusLabel(status: string, error: string | null, canEdit: boolean): string {
  if (!canEdit && status !== 'loading') return 'View only';
  if (status === 'loading') return 'Loading notes…';
  if (status === 'saving') return 'Saving…';
  if (status === 'saved') return 'Saved';
  if (status === 'error') return error ?? 'Save failed';
  return 'Editing';
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || target.isContentEditable;
}

export function BookViewerPage({ attachmentId, subjectUserId, returnTo }: Props) {
  const {
    document,
    editableDocument,
    readOnly,
    canEditOverlay,
    canClearOverlay,
    fileName,
    subjectDisplayName,
    status,
    error,
    updateDocument,
    clearOverlay,
  } = useBookAnnotations({ fileAttachmentId: attachmentId, subjectUserId });

  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [fitScale, setFitScale] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<MaterialAnnotationTool>('pen');
  const [color, setColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [undoCount, setUndoCount] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfProgress, setPdfProgress] = useState<PdfLoadingProgress | null>({ loaded: 0, total: 0, percent: 0 });
  const [pdfError, setPdfError] = useState<string | null>(null);
  const undoStackRef = useRef<MaterialAnnotationDocument[]>([]);

  const pdfUrl = useMemo(
    () => libraryMaterialFileHref(`/materials/files/${attachmentId}`),
    [attachmentId],
  );
  const downloadHref = pdfUrl;
  const canEdit = !readOnly || canEditOverlay;
  const effectiveScale = (fitScale ?? 1) * zoom;
  const showLoadingOverlay = !pdfError && pdfLoading;
  const canShowAnnotations = !pdfLoading && pageSize.width > 0;

  const handlePageSize = useCallback((size: { width: number; height: number }) => {
    setPageSize(size);
    setPdfError(null);
  }, []);

  const handleNaturalPageSize = useCallback((size: { width: number; height: number }) => {
    setFitScale((current) => {
      if (current != null) return current;
      const containerWidth = canvasWrapRef.current?.clientWidth ?? 800;
      const maxWidth = Math.min(MAX_PAGE_WIDTH_PX, Math.max(280, containerWidth - 48));
      return Math.min(1, maxWidth / size.width);
    });
  }, []);

  const handlePageCount = useCallback((count: number) => {
    setPageCount(Math.max(1, count));
    setPageIndex((prev) => Math.min(prev, Math.max(0, count - 1)));
  }, []);

  const handlePdfLoadingChange = useCallback((loading: boolean) => {
    setPdfLoading(loading);
  }, []);

  const handlePdfError = useCallback((message: string) => {
    setPdfError(message);
  }, []);

  const handlePageIndexChange = useCallback((next: number) => {
    setPageIndex(next);
  }, []);

  const pushUndo = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current.slice(-19), editableDocument];
    setUndoCount(undoStackRef.current.length);
  }, [editableDocument]);

  const handleUndo = useCallback(() => {
    const previous = undoStackRef.current.pop();
    setUndoCount(undoStackRef.current.length);
    if (!previous) return;
    updateDocument(() => previous);
  }, [updateDocument]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        if (canEdit && undoStackRef.current.length > 0) {
          event.preventDefault();
          handleUndo();
        }
        return;
      }

      if (event.key === 'PageDown' || (event.key === 'ArrowDown' && event.altKey)) {
        event.preventDefault();
        setPageIndex((current) => Math.min(pageCount - 1, current + 1));
        return;
      }

      if (event.key === 'PageUp' || (event.key === 'ArrowUp' && event.altKey)) {
        event.preventDefault();
        setPageIndex((current) => Math.max(0, current - 1));
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setPageIndex(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setPageIndex(pageCount - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canEdit, handleUndo, pageCount]);

  const backHref = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';

  return (
    <div className={styles.viewerRoot}>
      <header className={styles.viewerHeader}>
        <div className={styles.viewerHeaderStart}>
          <Link href={backHref} className={styles.backLink}>
            <ChevronLeft size={16} aria-hidden />
            Back
          </Link>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{fileName || 'Book'}</h1>
            {canEditOverlay && subjectDisplayName ? (
              <p className={styles.reviewBanner}>
                {subjectDisplayName}&apos;s book — your marks are saved separately
              </p>
            ) : null}
          </div>
        </div>
        <div className={styles.pageControls}>
          <Button
            type="button"
            variant="ghost"
            className={styles.pageBtn}
            disabled={pageIndex <= 0 || pdfLoading}
            aria-label="Previous page"
            onClick={() => handlePageIndexChange(Math.max(0, pageIndex - 1))}
          >
            <ChevronLeft size={16} aria-hidden />
          </Button>
          <PageNavigator
            pageIndex={pageIndex}
            pageCount={pageCount}
            disabled={pdfLoading}
            onChange={handlePageIndexChange}
          />
          <Button
            type="button"
            variant="ghost"
            className={styles.pageBtn}
            disabled={pageIndex >= pageCount - 1 || pdfLoading}
            aria-label="Next page"
            onClick={() => handlePageIndexChange(Math.min(pageCount - 1, pageIndex + 1))}
          >
            <ChevronRight size={16} aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={styles.pageBtn}
            aria-label="Zoom out"
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(2))))}
          >
            <ZoomOut size={16} aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={styles.pageBtn}
            aria-label="Zoom in"
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(2))))}
          >
            <ZoomIn size={16} aria-hidden />
          </Button>
        </div>
      </header>

      <AnnotationToolbar
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        canEdit={canEdit}
        canClearOverlay={canClearOverlay}
        canUndo={undoCount > 0}
        downloadHref={downloadHref}
        saveLabel={saveStatusLabel(status, error, canEdit)}
        onToolChange={setTool}
        onColorChange={setColor}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onClearOverlay={() => void clearOverlay()}
      />

      <div ref={canvasWrapRef} className={styles.canvasWrap}>
        <BookViewerLoadingOverlay
          visible={showLoadingOverlay}
          label={pdfError ? 'Could not load book' : 'Loading book…'}
          progress={pdfLoading ? pdfProgress : null}
          error={pdfError}
          annotationsLoading={status === 'loading'}
        />
        <div
          className={styles.pageStack}
          style={{ width: pageSize.width || undefined, height: pageSize.height || undefined }}
        >
          <PdfPageCanvas
            pdfUrl={pdfUrl}
            pageIndex={pageIndex}
            scale={effectiveScale}
            onPageSize={handlePageSize}
            onNaturalPageSize={handleNaturalPageSize}
            onPageCount={handlePageCount}
            onLoadingChange={handlePdfLoadingChange}
            onProgress={setPdfProgress}
            onError={handlePdfError}
          />
          {canShowAnnotations ? (
            <AnnotationLayer
              pageIndex={pageIndex}
              pageSize={pageSize}
              baseDocument={canEditOverlay ? document : { version: 1, pages: {} }}
              editableDocument={editableDocument}
              readOnly={!canEdit}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              onDocumentChange={updateDocument}
              onUndoStackPush={pushUndo}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
