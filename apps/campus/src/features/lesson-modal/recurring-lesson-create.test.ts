import type { ScheduledLessonDto } from '@pkg/types';
import { mockScheduledLesson } from '../../testing/fixtures';
import {
  applyRecurringLessonsLocally,
  createRecurringLessons,
} from './recurring-lesson-create';

const candidate = mockScheduledLesson({
  id: 1,
  title: 'Series lesson',
  date: '2030-06-03',
  recurrence: 'weekly',
  weeklyDays: [2],
});

describe('recurring-lesson-create', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('createRecurringLessons persists non-conflicting future slots', async () => {
    const persistCreate = jest.fn(async (lesson: ScheduledLessonDto) => ({
      ...lesson,
      backendId: `backend-${lesson.date}`,
    }));
    const setLessons = jest.fn();
    const onLessonCreated = jest.fn();

    const first = await createRecurringLessons({
      form: { recurrence: 'weekly', weeklyDays: [2], date: '2030-06-03' },
      candidate,
      lessons: [],
      persistCreate,
      setLessons,
      onLessonCreated,
    });

    expect(first?.backendId).toBeTruthy();
    expect(persistCreate.mock.calls.length).toBeGreaterThan(0);
    expect(onLessonCreated).toHaveBeenCalled();
  });

  it('applyRecurringLessonsLocally invokes tryApplyLesson per date', () => {
    const tryApplyLesson = jest.fn(() => true);
    applyRecurringLessonsLocally({
      form: { recurrence: 'weekly', weeklyDays: [2], date: '2030-06-03' },
      candidate,
      tryApplyLesson,
      editingLesson: candidate,
    });
    expect(tryApplyLesson.mock.calls.length).toBeGreaterThan(1);
  });

  it('createRecurringLessons skips conflicting slots', async () => {
    const persistCreate = jest.fn(async (lesson: ScheduledLessonDto) => lesson);
    const setLessons = jest.fn();
    const blocking = { ...candidate, id: 99, date: '2030-06-03' };

    const first = await createRecurringLessons({
      form: { recurrence: 'weekly', weeklyDays: [2], date: '2030-06-03' },
      candidate,
      lessons: [blocking],
      persistCreate,
      setLessons,
    });

    expect(first).not.toBeNull();
    expect(persistCreate.mock.calls.every(([lesson]) => lesson.date !== '2030-06-03')).toBe(true);
  });

  it('createRecurringLessons skips past slots', async () => {
    const persistCreate = jest.fn(async (lesson: ScheduledLessonDto) => lesson);
    const pastCandidate = { ...candidate, date: '2020-01-07' };

    const first = await createRecurringLessons({
      form: { recurrence: 'weekly', weeklyDays: [2], date: '2020-01-07' },
      candidate: pastCandidate,
      lessons: [],
      persistCreate,
      setLessons: jest.fn(),
    });

    expect(first).toBeNull();
    expect(persistCreate).not.toHaveBeenCalled();
  });

  it('createRecurringLessons returns null when recurrence is none', async () => {
    const persistCreate = jest.fn(async (lesson: ScheduledLessonDto) => lesson);

    const first = await createRecurringLessons({
      form: { recurrence: 'none', weeklyDays: [], date: '2030-06-03' },
      candidate,
      lessons: [],
      persistCreate,
      setLessons: jest.fn(),
    });

    expect(first?.date).toBe('2030-06-03');
    expect(persistCreate).toHaveBeenCalledTimes(1);
  });
});
