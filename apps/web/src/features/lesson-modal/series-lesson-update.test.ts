import { TIME_ZONE, type ScheduledLessonDto } from '@pkg/types';
import { mockScheduledLesson } from '../../testing/fixtures';
import {
  applyLessonSeriesUpdatesLocally,
  persistLessonSeriesUpdates,
  persistSeriesScheduleChanges,
  validateLessonScheduleUpdates,
  validateSeriesTimeUpdates,
} from './series-lesson-update';

function lesson(
  id: number,
  seriesId: string,
  date: string,
  startTime = '10:00',
): ScheduledLessonDto {
  return mockScheduledLesson({
    id,
    title: `L${id}`,
    seriesId,
    date,
    startTime,
    recurrence: 'weekly',
    weeklyDays: [2],
  });
}

describe('series-lesson-update', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('validateLessonScheduleUpdates returns updates when series is valid', () => {
    const lessons = [
      lesson(1, 'series-a', '2030-06-03'),
      lesson(2, 'series-a', '2030-06-10'),
    ];
    const editing = lessons[0]!;
    const candidate = { ...editing, title: 'Updated title' };
    const result = validateLessonScheduleUpdates(lessons, editing, candidate);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.updates.length).toBeGreaterThan(0);
      expect(result.updates[0]?.title).toBe('Updated title');
    }
  });

  it('validateSeriesTimeUpdates rejects past slots', () => {
    const lessons = [lesson(1, 'series-a', '2020-01-01')];
    const result = validateSeriesTimeUpdates(lessons, lessons[0]!, {
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      timezoneId: TIME_ZONE.kyiv.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.past.length).toBeGreaterThan(0);
  });

  it('applyLessonSeriesUpdatesLocally merges by id', () => {
    const lessons = [lesson(1, 'series-a', '2030-06-03'), lesson(2, 'series-a', '2030-06-10')];
    const updates = [{ ...lessons[0]!, title: 'Changed' }];
    const merged = applyLessonSeriesUpdatesLocally(lessons, updates);
    expect(merged[0]?.title).toBe('Changed');
    expect(merged[1]?.title).toBe('L2');
  });

  it('persistLessonSeriesUpdates calls persistUpdate for each update', async () => {
    const lessons = [lesson(1, 'series-a', '2030-06-03')];
    const updates = [{ ...lessons[0]!, title: 'Persisted' }];
    const persistUpdate = jest.fn(async () => ({ ...updates[0]!, backendId: 'uuid-1' }));
    const setLessons = jest.fn();

    const primary = await persistLessonSeriesUpdates({
      updates,
      lessons,
      persistUpdate,
      setLessons,
      primaryLessonId: 1,
    });

    expect(persistUpdate).toHaveBeenCalled();
    expect(primary?.title).toBe('Persisted');
    expect(setLessons).toHaveBeenCalled();
  });

  it('validateLessonScheduleUpdates rejects schedule conflicts', () => {
    const lessons = [
      lesson(1, 'series-a', '2030-06-03'),
      lesson(2, 'series-a', '2030-06-10'),
      lesson(99, 'other', '2030-06-03', '10:00'),
    ];
    const editing = lessons[0]!;
    const candidate = { ...editing, startTime: '10:30', endTime: '11:30' };
    const result = validateLessonScheduleUpdates(lessons, editing, candidate);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.conflicts.length).toBeGreaterThan(0);
  });

  it('validateSeriesTimeUpdates returns updates when valid', () => {
    const lessons = [lesson(1, 'series-a', '2030-06-03'), lesson(2, 'series-a', '2030-06-10')];
    const result = validateSeriesTimeUpdates(lessons, lessons[0]!, {
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      timezoneId: TIME_ZONE.kyiv.id,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.updates.every((row) => row.startTime === '11:00')).toBe(true);
    }
  });

  it('persistSeriesScheduleChanges upserts each persisted row', async () => {
    const lessons = [lesson(1, 'series-a', '2030-06-03'), lesson(2, 'series-a', '2030-06-10')];
    const updates = lessons.map((row) => ({ ...row, startTime: '11:00', endTime: '12:00' }));
    const persistScheduleUpdate = jest.fn(async (candidate) => ({
      ...candidate,
      backendId: `uuid-${candidate.id}`,
    }));
    const setLessons = jest.fn();

    await persistSeriesScheduleChanges({
      updates,
      lessons,
      persistScheduleUpdate,
      setLessons,
    });

    expect(persistScheduleUpdate).toHaveBeenCalledTimes(2);
    expect(setLessons).toHaveBeenCalledTimes(2);
  });

  it('persistLessonSeriesUpdates skips missing originals', async () => {
    const lessons = [lesson(1, 'series-a', '2030-06-03')];
    const updates = [{ ...lessons[0]!, id: 999, title: 'Ghost' }];
    const persistUpdate = jest.fn();
    const primary = await persistLessonSeriesUpdates({
      updates,
      lessons,
      persistUpdate,
      setLessons: jest.fn(),
    });
    expect(primary).toBeNull();
    expect(persistUpdate).not.toHaveBeenCalled();
  });
});
