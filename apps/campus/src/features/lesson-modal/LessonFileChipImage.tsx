'use client';

import Image from 'next/image';
import styles from './LessonModal.module.scss';

/** Intrinsic dimensions for `next/image`; chip layout scales via CSS. */
const FILE_CHIP_IMAGE_WIDTH = 260;
const FILE_CHIP_IMAGE_HEIGHT = 132;

type Props = {
  src: string;
  alt: string;
};

export function LessonFileChipImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={FILE_CHIP_IMAGE_WIDTH}
      height={FILE_CHIP_IMAGE_HEIGHT}
      className={styles.fileChipPreviewImg}
      unoptimized
    />
  );
}
