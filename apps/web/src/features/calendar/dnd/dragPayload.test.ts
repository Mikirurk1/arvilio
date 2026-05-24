import { readLessonDragPayload, writeLessonDragPayload } from './dragPayload';

describe('dragPayload', () => {
  it('writeLessonDragPayload and readLessonDragPayload round-trip', () => {
    const store = new Map<string, string>();
    const dataTransfer = {
      effectAllowed: 'none',
      setData(type: string, value: string) {
        store.set(type, value);
      },
      getData(type: string) {
        return store.get(type) ?? '';
      },
    } as unknown as DataTransfer;

    writeLessonDragPayload(dataTransfer, { lessonId: 42 });
    expect(readLessonDragPayload(dataTransfer)).toEqual({ lessonId: 42 });
    expect(dataTransfer.effectAllowed).toBe('move');
  });

  it('readLessonDragPayload returns null for invalid json', () => {
    const dataTransfer = {
      getData: () => 'not-json',
    } as unknown as DataTransfer;
    expect(readLessonDragPayload(dataTransfer)).toBeNull();
  });
});
