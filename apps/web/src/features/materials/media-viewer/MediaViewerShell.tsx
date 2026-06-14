'use client';

import { useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import type { MaterialAttachmentMetaDto } from '@pkg/types';
import { MediaPlayer } from './MediaPlayer';
import { SessionNotesPanel } from './SessionNotesPanel';
import type { SessionNote } from './useSessionNotes';
import styles from './media-viewer.module.scss';

type Props = {
  meta: MaterialAttachmentMetaDto;
  notes: SessionNote[];
  onAddNote: () => void;
  onUpdateNote: (id: string, text: string) => void;
  onRemoveNote: (id: string) => void;
  onClose: () => void | Promise<void>;
};

export function MediaViewerShell({
  meta,
  notes,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onClose,
}: Props) {
  const mediaRef = useRef<HTMLMediaElement>(null);

  const handleAddNote = useCallback(() => {
    onAddNote();
  }, [onAddNote]);

  const handleSeek = useCallback((atSec: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = atSec;
    void media.play().catch(() => undefined);
  }, []);

  const mediaKind = meta.mediaKind === 'video' ? 'video' : 'audio';

  return (
    <>
      <header className={styles.modalHeader}>
        <h2 className={styles.modalTitle} id="media-viewer-title">
          {meta.fileName}
        </h2>
        <button
          type="button"
          className={styles.modalCloseBtn}
          aria-label="Close player"
          onClick={() => void onClose()}
        >
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className={styles.modalBody}>
        <div className={styles.playerColumn}>
          <MediaPlayer
            attachmentId={meta.fileAttachmentId}
            mediaKind={mediaKind}
            mediaRef={mediaRef}
          />
        </div>
        <SessionNotesPanel
          notes={notes}
          onAddNote={handleAddNote}
          onUpdateNote={onUpdateNote}
          onRemoveNote={onRemoveNote}
          onSeek={handleSeek}
        />
      </div>
    </>
  );
}
