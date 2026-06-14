import { LessonFileChipImage } from '../LessonFileChipImage';
import { isImageFileName } from '../fileUtils';
import styles from '../LessonModal.module.scss';

export function fileChipClasses(preview: string | null | undefined, fileName: string): string {
  return [
    styles.fileChip,
    preview && isImageFileName(fileName) ? styles.fileChipImage : '',
    preview ? styles.fileChipClickable : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function fileChipImagePreview(preview: string | null | undefined, fileName: string) {
  if (!preview || !isImageFileName(fileName)) return null;
  return <LessonFileChipImage src={preview} alt={fileName} />;
}
