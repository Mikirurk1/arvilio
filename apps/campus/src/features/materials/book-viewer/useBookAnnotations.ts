'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  emptyMaterialAnnotationDocument,
  type MaterialAnnotationDocument,
} from '@pkg/types';
import {
  clearLibraryFileOverlay,
  fetchLibraryFileAnnotations,
  saveLibraryFileAnnotations,
} from './material-annotations-api';

export type AnnotationSaveStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

type Options = {
  fileAttachmentId: string;
  subjectUserId?: string | null;
};

export function useBookAnnotations({ fileAttachmentId, subjectUserId }: Options) {
  const [document, setDocument] = useState<MaterialAnnotationDocument>(
    emptyMaterialAnnotationDocument(),
  );
  const [overlayDocument, setOverlayDocument] = useState<MaterialAnnotationDocument>(
    emptyMaterialAnnotationDocument(),
  );
  const [readOnly, setReadOnly] = useState(false);
  const [canEditOverlay, setCanEditOverlay] = useState(false);
  const [canClearOverlay, setCanClearOverlay] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileRevision, setFileRevision] = useState<string | null>(null);
  const [subjectDisplayName, setSubjectDisplayName] = useState<string | null>(null);
  const [resolvedSubjectUserId, setResolvedSubjectUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnnotationSaveStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDocumentRef = useRef(document);
  const latestOverlayRef = useRef(overlayDocument);
  const readOnlyRef = useRef(readOnly);
  const canEditOverlayRef = useRef(canEditOverlay);
  const fileRevisionRef = useRef(fileRevision);
  const contextUserIdRef = useRef('');

  latestDocumentRef.current = document;
  latestOverlayRef.current = overlayDocument;
  readOnlyRef.current = readOnly;
  canEditOverlayRef.current = canEditOverlay;
  fileRevisionRef.current = fileRevision;

  const applyResponse = useCallback((response: Awaited<ReturnType<typeof fetchLibraryFileAnnotations>>) => {
    setDocument(response.document);
    setOverlayDocument(response.overlayDocument);
    setReadOnly(response.readOnly);
    setCanEditOverlay(response.canEditOverlay);
    setCanClearOverlay(response.canClearOverlay);
    setFileName(response.fileName);
    setFileRevision(response.fileRevision);
    setSubjectDisplayName(response.subjectDisplayName);
    setResolvedSubjectUserId(response.subjectUserId);
    contextUserIdRef.current =
      response.canEditOverlay && response.subjectUserId ? response.subjectUserId : '';
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchLibraryFileAnnotations(fileAttachmentId, subjectUserId)
      .then((response) => {
        if (cancelled) return;
        applyResponse(response);
        setStatus('idle');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load annotations');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [applyResponse, fileAttachmentId, subjectUserId]);

  const flushSave = useCallback(async () => {
    const savingOverlay = canEditOverlayRef.current;
    if (readOnlyRef.current && !savingOverlay) return;

    setStatus('saving');
    setError(null);
    try {
      const response = await saveLibraryFileAnnotations(fileAttachmentId, {
        document: savingOverlay ? latestOverlayRef.current : latestDocumentRef.current,
        fileRevision: fileRevisionRef.current,
        contextUserId: savingOverlay ? contextUserIdRef.current : '',
      });
      applyResponse(response);
      setStatus('saved');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save annotations');
      setStatus('error');
    }
  }, [applyResponse, fileAttachmentId]);

  const scheduleSave = useCallback(() => {
    if (readOnlyRef.current && !canEditOverlayRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void flushSave();
    }, 1500);
  }, [flushSave]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const updateDocument = useCallback(
    (updater: (prev: MaterialAnnotationDocument) => MaterialAnnotationDocument) => {
      if (readOnlyRef.current && !canEditOverlayRef.current) return;
      if (canEditOverlayRef.current) {
        setOverlayDocument((prev) => {
          const next = updater(prev);
          latestOverlayRef.current = next;
          return next;
        });
      } else {
        setDocument((prev) => {
          const next = updater(prev);
          latestDocumentRef.current = next;
          return next;
        });
      }
      setCanClearOverlay(true);
      setStatus('idle');
      scheduleSave();
    },
    [scheduleSave],
  );

  const clearOverlay = useCallback(async () => {
    const contextUserId = contextUserIdRef.current;
    if (!contextUserId) return;
    setStatus('saving');
    setError(null);
    try {
      const response = await clearLibraryFileOverlay(fileAttachmentId, contextUserId);
      applyResponse(response);
      setStatus('saved');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clear overlay');
      setStatus('error');
    }
  }, [applyResponse, fileAttachmentId]);

  const editableDocument = canEditOverlay ? overlayDocument : document;

  return {
    document,
    overlayDocument,
    editableDocument,
    readOnly: readOnly && !canEditOverlay,
    canEditOverlay,
    canClearOverlay,
    fileName,
    fileRevision,
    subjectDisplayName,
    resolvedSubjectUserId,
    status,
    error,
    updateDocument,
    clearOverlay,
    flushSave,
  };
}
