import { isLessonFileAttachmentRef, LESSON_FILE_ATT_PREFIX } from './lesson-file-ref';

describe('lesson-file-ref', () => {
  it('detects attachment refs by prefix', () => {
    expect(LESSON_FILE_ATT_PREFIX).toBe('att:');
    expect(isLessonFileAttachmentRef('att:file-1')).toBe(true);
    expect(isLessonFileAttachmentRef('https://example.com/x')).toBe(false);
  });
});
