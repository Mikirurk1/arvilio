'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MaterialAttachmentMetaDto } from '@pkg/types';
import { BodyPortal } from '../../../components/ui';
import { useFocusTrap } from '../../../hooks/use-focus-trap';
import { confirmDialog } from '../../../stores/confirm-dialog-store';
import { fetchMaterialAttachmentMeta } from './material-meta-api';
import { MediaViewerShell } from './MediaViewerShell';
import { shouldConfirmLeaveSessionNotes, useSessionNotes } from './useSessionNotes';
import styles from './media-viewer.module.scss';

type Props = {
  attachmentId: string;
  open: boolean;
  onClose: () => void;
};

export function MediaViewerModal({ attachmentId, open, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState<MaterialAttachmentMetaDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { notes, hasNotes, addNote, updateNoteText, removeNote, resetNotes } = useSessionNotes();

  useFocusTrap(open, modalRef);

  useEffect(() => {
    if (!open) {
      setMeta(null);
      setError(null);
      setLoading(false);
      resetNotes();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMaterialAttachmentMeta(attachmentId)
      .then((response) => {
        if (cancelled) return;
        if (response.mediaKind !== 'audio' && response.mediaKind !== 'video') {
          setError('This file cannot be played in the media viewer.');
          setMeta(null);
          return;
        }
        setMeta(response);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load media');
        setMeta(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attachmentId, open, resetNotes]);

  const handleAddNote = useCallback(() => {
    const media = modalRef.current?.querySelector('video, audio') as HTMLMediaElement | null;
    addNote(media?.currentTime ?? 0);
  }, [addNote]);

  const requestClose = useCallback(async () => {
    if (shouldConfirmLeaveSessionNotes(hasNotes)) {
      const ok = await confirmDialog({
        title: 'Discard session notes?',
        message: 'Your notes are temporary and will be lost if you close the player.',
        confirmLabel: 'Close',
        cancelLabel: 'Stay',
        variant: 'danger',
      });
      if (!ok) return;
    }
    resetNotes();
    onClose();
  }, [hasNotes, onClose, resetNotes]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        void requestClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, requestClose]);

  if (!open) return null;

  return (
    <BodyPortal>
      <div className={styles.modalOverlay} role="presentation" onClick={() => void requestClose()}>
        <div
          ref={modalRef}
          className={styles.modalDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-viewer-title"
          onClick={(event) => event.stopPropagation()}
        >
          {loading ? (
            <div className={styles.modalLoading}>
              <p>Loading player…</p>
            </div>
          ) : error ? (
            <div className={styles.modalLoading}>
              <p>{error}</p>
              <button type="button" className={styles.modalDismissBtn} onClick={() => void requestClose()}>
                Close
              </button>
            </div>
          ) : meta ? (
            <MediaViewerShell
              meta={meta}
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={updateNoteText}
              onRemoveNote={removeNote}
              onClose={requestClose}
            />
          ) : null}
        </div>
      </div>
    </BodyPortal>
  );
}
