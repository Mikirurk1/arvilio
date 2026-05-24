export const LESSON_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const LESSON_FILE_ATT_PREFIX = 'att:';

export function isLessonFileAttachmentRef(file: string): boolean {
  return file.startsWith(LESSON_FILE_ATT_PREFIX);
}

export function lessonFileAttachmentId(file: string): string | null {
  return isLessonFileAttachmentRef(file) ? file.slice(LESSON_FILE_ATT_PREFIX.length) : null;
}
