'use client';

import Image from 'next/image';
import styles from './LessonModal.module.scss';
import { Button } from '../../components/ui';
import type { LessonModalText } from './tabTypes';
import { X } from 'lucide-react';

type Props = {
  imagePreviewUrl: string | null;
  text: LessonModalText;
  onClose: () => void;
};

export function ImagePreviewOverlay({ imagePreviewUrl, text, onClose }: Props) {
  if (!imagePreviewUrl) return null;

  return (
    <div className={styles.imagePreviewOverlay} onClick={onClose}>
      <div
        className={styles.imagePreviewModal}
        role="dialog"
        aria-modal="true"
        aria-label={text.imagePreviewAlt}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.imagePreviewHeader}>
          <p className={styles.imagePreviewTitle}>{text.imagePreviewAlt}</p>
          <Button
            type="button"
            className={styles.imagePreviewClose}
            aria-label={text.aria.closeImagePreview}
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </header>
        <Image
          src={imagePreviewUrl}
          alt={text.imagePreviewAlt}
          width={1200}
          height={900}
          className={styles.imagePreviewImg}
          unoptimized
        />
        <p className={styles.imagePreviewHint}>Press Esc or click outside to close</p>
      </div>
    </div>
  );
}
