export const LESSON_FILE_ATT_PREFIX = 'att:';

export function isLessonFileAttachmentRef(file: string): boolean {
  return file.startsWith(LESSON_FILE_ATT_PREFIX);
}
