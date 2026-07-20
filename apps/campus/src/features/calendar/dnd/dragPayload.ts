export type LessonDragPayload = {
  lessonId: number;
};

const MIME = 'application/x-arvilio-lesson';

export function writeLessonDragPayload(dataTransfer: DataTransfer, payload: LessonDragPayload): void {
  dataTransfer.setData(MIME, JSON.stringify(payload));
  dataTransfer.effectAllowed = 'move';
}

export function readLessonDragPayload(dataTransfer: DataTransfer): LessonDragPayload | null {
  const raw = dataTransfer.getData(MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LessonDragPayload;
  } catch {
    return null;
  }
}

