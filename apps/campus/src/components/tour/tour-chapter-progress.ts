import type { TourChapterStatus, TourTrackId } from './tracks/types';

export type ChapterProgressMap = Record<string, 'done' | 'skipped'>;

function storageKey(track: TourTrackId, userId: string): string {
  return `arvilio.tour.chapters.${userId}.${track}`;
}

export function readChapterProgress(
  track: TourTrackId,
  userId: string,
): ChapterProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey(track, userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ChapterProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeChapterProgress(
  track: TourTrackId,
  userId: string,
  progress: ChapterProgressMap,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(track, userId), JSON.stringify(progress));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearChapterProgress(track: TourTrackId, userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey(track, userId));
  } catch {
    /* ignore */
  }
}

export function chapterStatus(
  progress: ChapterProgressMap,
  chapterId: string,
): TourChapterStatus {
  const v = progress[chapterId];
  if (v === 'done' || v === 'skipped') return v;
  return 'todo';
}

export function setChapterStatus(
  track: TourTrackId,
  userId: string,
  chapterId: string,
  status: 'done' | 'skipped',
): ChapterProgressMap {
  const next = { ...readChapterProgress(track, userId), [chapterId]: status };
  writeChapterProgress(track, userId, next);
  return next;
}

/** Clear one chapter so it can be replayed from the hub (Tour v3.1). */
export function clearChapterStatus(
  track: TourTrackId,
  userId: string,
  chapterId: string,
): ChapterProgressMap {
  const next = { ...readChapterProgress(track, userId) };
  delete next[chapterId];
  writeChapterProgress(track, userId, next);
  return next;
}

export function allChaptersResolved(
  chapterIds: string[],
  progress: ChapterProgressMap,
): boolean {
  if (chapterIds.length === 0) return true;
  return chapterIds.every((id) => {
    const s = progress[id];
    return s === 'done' || s === 'skipped';
  });
}
