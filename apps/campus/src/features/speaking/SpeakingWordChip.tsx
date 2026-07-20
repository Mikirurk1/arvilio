'use client';

import type { KeyboardEvent } from 'react';
import { Info } from 'lucide-react';
import { Button } from '../../components/ui';
import { WordCardAudioButton } from '../vocabulary/WordCardAudioButton';
import styles from './SpeakingWordChip.module.scss';

type Props = {
  word: string;
  pos?: string | null;
  gloss?: string | null;
  audioUrl?: string | null;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onInfo?: () => void;
  className?: string;
};

export function SpeakingWordChip({
  word,
  pos,
  gloss,
  audioUrl,
  selected = false,
  onClick,
  onRemove,
  onInfo,
  className,
}: Props) {
  const selectable = Boolean(onClick);
  const hasNestedControls = Boolean(audioUrl || onRemove || onInfo);
  const useNativeButton = selectable && !hasNestedControls;

  const classNameStr = [
    styles.chip,
    selected ? styles.chipSelected : '',
    selectable ? styles.chipInteractive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectable || !onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const content = (
    <>
      <div className={styles.chipTop}>
        <span className={styles.word}>{word}</span>
        {audioUrl ? (
          <WordCardAudioButton audioUrl={audioUrl} iconSize={14} className={styles.audioBtn} />
        ) : null}
        {onInfo ? (
          <Button
            variant="bare"
            type="button"
            className={styles.infoBtn}
            aria-label={`Word info: ${word}`}
            onClick={(event) => {
              event.stopPropagation();
              onInfo();
            }}
          >
            <Info size={12} aria-hidden />
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            variant="bare"
            type="button"
            className={styles.removeBtn}
            aria-label={`Remove ${word}`}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          >
            ×
          </Button>
        ) : null}
      </div>
      {pos ? <div className={styles.pos}>{pos}</div> : null}
      {gloss ? <div className={styles.gloss}>{gloss}</div> : null}
    </>
  );

  if (useNativeButton) {
    return (
      <Button variant="bare" type="button" className={classNameStr} onClick={onClick}>
        {content}
      </Button>
    );
  }

  return (
    <div
      className={classNameStr}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? onClick : undefined}
      onKeyDown={selectable ? onKeyDown : undefined}
    >
      {content}
    </div>
  );
}
