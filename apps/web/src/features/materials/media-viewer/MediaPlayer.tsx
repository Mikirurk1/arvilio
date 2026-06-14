'use client';

import 'plyr/dist/plyr.css';
import { useEffect, useRef, type RefObject } from 'react';
import type { MaterialViewerMediaKind } from '@pkg/types';
import { libraryMaterialFileHref } from '../../../lib/material-upload';
import styles from './media-viewer.module.scss';

type Props = {
  attachmentId: string;
  mediaKind: Extract<MaterialViewerMediaKind, 'audio' | 'video'>;
  mediaRef: RefObject<HTMLMediaElement | null>;
};

export function MediaPlayer({ attachmentId, mediaKind, mediaRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const src = libraryMaterialFileHref(`/materials/files/${attachmentId}`);

  useEffect(() => {
    let cancelled = false;
    let plyrInstance: { destroy: () => void } | null = null;

    void (async () => {
      const { default: Plyr } = await import('plyr');
      if (cancelled || !containerRef.current) return;

      const media = containerRef.current.querySelector('video, audio') as HTMLMediaElement | null;
      if (!media) return;

      if (mediaRef && 'current' in mediaRef) {
        mediaRef.current = media;
      }

      plyrInstance = new Plyr(media, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          ...(mediaKind === 'video' ? (['pip', 'airplay', 'fullscreen'] as const) : []),
        ],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      });
    })();

    return () => {
      cancelled = true;
      plyrInstance?.destroy();
      if (mediaRef && 'current' in mediaRef) {
        mediaRef.current = null;
      }
    };
  }, [attachmentId, mediaKind, mediaRef]);

  return (
    <div className={styles.playerWrap}>
      <div
        ref={containerRef}
        className={[styles.plyrWrap, mediaKind === 'video' ? styles.plyrVideo : styles.plyrAudio].join(
          ' ',
        )}
      >
        {mediaKind === 'video' ? (
          <video
            key={attachmentId}
            className={styles.mediaElement}
            playsInline
            preload="metadata"
            src={src}
          />
        ) : (
          <audio key={attachmentId} className={styles.mediaElement} preload="metadata" src={src} />
        )}
      </div>
    </div>
  );
}
