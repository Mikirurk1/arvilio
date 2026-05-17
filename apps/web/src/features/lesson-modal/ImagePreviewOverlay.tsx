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
      <div className={styles.imagePreviewModal} onClick={(event) => event.stopPropagation()}>
        <Button
          type="button"
          className={styles.imagePreviewClose}
          aria-label={text.aria.closeImagePreview}
          onClick={onClose}
        >
          <X size={16} />
        </Button>
        <Image
          src={imagePreviewUrl}
          alt={text.imagePreviewAlt}
          width={1200}
          height={900}
          className={styles.imagePreviewImg}
          unoptimized
        />
      </div>
    </div>
  );
}
