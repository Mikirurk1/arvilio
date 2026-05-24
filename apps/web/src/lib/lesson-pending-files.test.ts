import {
  movePendingLessonFiles,
  pendingLessonFileKey,
  registerPendingLessonFile,
  takePendingLessonFile,
} from './lesson-pending-files';

describe('lesson-pending-files', () => {
  it('register, take, and move pending files between scopes', () => {
    const file = new File(['x'], 'notes.pdf', { type: 'application/pdf' });
    const fromKey = pendingLessonFileKey('draft', 'lesson-1', 'notes.pdf');
    registerPendingLessonFile(fromKey, file);

    expect(takePendingLessonFile(fromKey)).toBe(file);
    expect(takePendingLessonFile(fromKey)).toBeUndefined();

    registerPendingLessonFile(fromKey, file);
    movePendingLessonFiles('draft', 'lesson-1', 'edit', 'lesson-2', ['notes.pdf']);
    const toKey = pendingLessonFileKey('edit', 'lesson-2', 'notes.pdf');
    expect(takePendingLessonFile(toKey)?.name).toBe('notes.pdf');
    expect(takePendingLessonFile(fromKey)).toBeUndefined();
  });
});
