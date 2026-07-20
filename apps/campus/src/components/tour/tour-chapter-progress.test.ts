import {
  allChaptersResolved,
  chapterStatus,
  clearChapterProgress,
  clearChapterStatus,
  readChapterProgress,
  setChapterStatus,
  writeChapterProgress,
} from './tour-chapter-progress';

describe('tour-chapter-progress', () => {
  const track = 'teacher' as const;
  const userId = 'user-test-1';

  beforeEach(() => {
    clearChapterProgress(track, userId);
  });

  afterEach(() => {
    clearChapterProgress(track, userId);
  });

  it('reads empty progress by default', () => {
    expect(readChapterProgress(track, userId)).toEqual({});
    expect(chapterStatus({}, 'tea-ch-first-lesson')).toBe('todo');
  });

  it('persists done and skipped statuses', () => {
    setChapterStatus(track, userId, 'tea-ch-first-lesson', 'done');
    setChapterStatus(track, userId, 'tea-ch-materials', 'skipped');
    const progress = readChapterProgress(track, userId);
    expect(chapterStatus(progress, 'tea-ch-first-lesson')).toBe('done');
    expect(chapterStatus(progress, 'tea-ch-materials')).toBe('skipped');
    expect(chapterStatus(progress, 'tea-ch-chat')).toBe('todo');
  });

  it('clearChapterStatus resets one chapter for replay', () => {
    setChapterStatus(track, userId, 'tea-ch-first-lesson', 'done');
    setChapterStatus(track, userId, 'tea-ch-materials', 'skipped');
    const next = clearChapterStatus(track, userId, 'tea-ch-first-lesson');
    expect(chapterStatus(next, 'tea-ch-first-lesson')).toBe('todo');
    expect(chapterStatus(next, 'tea-ch-materials')).toBe('skipped');
    expect(readChapterProgress(track, userId)).toEqual({ 'tea-ch-materials': 'skipped' });
  });

  it('allChaptersResolved requires every id done or skipped', () => {
    const ids = ['a', 'b'];
    expect(allChaptersResolved(ids, {})).toBe(false);
    writeChapterProgress(track, userId, { a: 'done' });
    expect(allChaptersResolved(ids, readChapterProgress(track, userId))).toBe(false);
    setChapterStatus(track, userId, 'b', 'skipped');
    expect(allChaptersResolved(ids, readChapterProgress(track, userId))).toBe(true);
  });
});
