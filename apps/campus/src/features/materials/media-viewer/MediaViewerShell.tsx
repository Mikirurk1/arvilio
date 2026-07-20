'use client';

import { useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { MaterialAttachmentMetaDto } from '@pkg/types';
import { Button, UpgradePrompt, isFeatureBlockedError } from '../../../components/ui';
import { MediaPlayer } from './MediaPlayer';
import { SessionNotesPanel } from './SessionNotesPanel';
import type { SessionNote } from './useSessionNotes';
import { triggerMaterialCaptionGeneration } from './material-captions-api';
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
  const [captionGenerating, setCaptionGenerating] = useState(false);
  const [captionFeedback, setCaptionFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [captionUpgrade, setCaptionUpgrade] = useState(false);

  const handleGenerateCaptions = useCallback(async () => {
    setCaptionGenerating(true);
    setCaptionFeedback(null);
    setCaptionUpgrade(false);
    try {
      await triggerMaterialCaptionGeneration(meta.fileAttachmentId);
      setCaptionFeedback({ ok: true, msg: 'Captions generation started — refresh in a moment.' });
    } catch (e) {
      if (isFeatureBlockedError(e)) {
        setCaptionUpgrade(true);
      } else {
        setCaptionFeedback({ ok: false, msg: e instanceof Error ? e.message : 'Failed to start caption generation.' });
      }
    } finally {
      setCaptionGenerating(false);
    }
  }, [meta.fileAttachmentId]);

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
        <Button
          variant="bare"
          type="button"
          className={styles.modalCloseBtn}
          aria-label="Close player"
          onClick={() => void onClose()}
        >
          <X size={18} aria-hidden />
        </Button>
      </header>
      <div className={styles.modalBody}>
        <div className={styles.playerColumn}>
          <MediaPlayer
            attachmentId={meta.fileAttachmentId}
            mediaKind={mediaKind}
            mediaRef={mediaRef}
          />
          <div className={styles.captionsRow}>
            <Button
              variant="default"
              loading={captionGenerating}
              loadingLabel="Starting…"
              disabled={captionGenerating}
              onClick={() => void handleGenerateCaptions()}
            >
              Generate captions
            </Button>
            {captionFeedback && (
              <span className={captionFeedback.ok ? styles.captionOk : styles.captionErr}>
                {captionFeedback.msg}
              </span>
            )}
            {captionUpgrade && (
              <UpgradePrompt message="AI-assisted captions require the Pro plan." />
            )}
          </div>
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
