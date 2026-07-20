import { LESSON_STATUS, type ScheduledLessonDto } from '@pkg/types';
import { deleteScheduledLessonSeries } from './series-lesson-delete';

function lesson(id: number, seriesId: string, statusId: number, backendId?: string): ScheduledLessonDto {
  return {
    id,
    backendId,
    seriesId,
    statusId,
    title: `L${id}`,
    date: '2026-06-01',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
  } as ScheduledLessonDto;
}

describe('series-lesson-delete', () => {
  it('returns planned lesson ids and calls delete when canManage', async () => {
    const lessons = [
      lesson(1, 'series-1', LESSON_STATUS.planned.id, 'backend-1'),
      lesson(2, 'series-1', LESSON_STATUS.completed.id, 'backend-2'),
      lesson(3, 'series-1', LESSON_STATUS.planned.id, 'backend-3'),
    ];
    const deleteScheduledLesson = jest.fn().mockResolvedValue(undefined);

    const result = await deleteScheduledLessonSeries({
      lessons,
      seriesId: 'series-1',
      canManage: true,
      deleteScheduledLesson,
    });

    expect(result.removedIds).toEqual([1, 3]);
    expect(deleteScheduledLesson).toHaveBeenCalledTimes(2);
    expect(deleteScheduledLesson).toHaveBeenCalledWith('backend-1');
  });

  it('skips API delete when canManage is false', async () => {
    const deleteScheduledLesson = jest.fn();
    await deleteScheduledLessonSeries({
      lessons: [lesson(1, 'series-1', LESSON_STATUS.planned.id, 'backend-1')],
      seriesId: 'series-1',
      canManage: false,
      deleteScheduledLesson,
    });
    expect(deleteScheduledLesson).not.toHaveBeenCalled();
  });

  it('returns empty removedIds when series has no planned lessons', async () => {
    const deleteScheduledLesson = jest.fn();
    const result = await deleteScheduledLessonSeries({
      lessons: [lesson(1, 'series-1', LESSON_STATUS.completed.id, 'backend-1')],
      seriesId: 'series-1',
      canManage: true,
      deleteScheduledLesson,
    });
    expect(result.removedIds).toEqual([]);
    expect(deleteScheduledLesson).not.toHaveBeenCalled();
  });

  it('does not call delete for planned lessons without backend id', async () => {
    const deleteScheduledLesson = jest.fn();
    const result = await deleteScheduledLessonSeries({
      lessons: [lesson(1, 'series-1', LESSON_STATUS.planned.id)],
      seriesId: 'series-1',
      canManage: true,
      deleteScheduledLesson,
    });
    expect(result.removedIds).toEqual([1]);
    expect(deleteScheduledLesson).not.toHaveBeenCalled();
  });
});
