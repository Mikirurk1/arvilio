import { LESSON_STATUS, type ScheduledLessonDto } from '@pkg/types';
import { mockScheduledLesson } from '../../../testing/fixtures';
import {
  calculateEndTime,
  fromLessonFormState,
  nextLessonEntityId,
  toLessonFormState,
} from './lessonCalendarAdapter';

const lesson = mockScheduledLesson({
  id: 5,
  backendId: 'uuid-5',
  title: 'Speaking',
});

describe('lessonCalendarAdapter', () => {
  it('nextLessonEntityId returns max id + 1', () => {
    expect(nextLessonEntityId([{ id: 3 } as ScheduledLessonDto, { id: 10 } as ScheduledLessonDto])).toBe(
      11,
    );
  });

  it('calculateEndTime adds duration to start time', () => {
    expect(calculateEndTime('10:30', 45)).toBe('11:15');
  });

  it('toLessonFormState and fromLessonFormState preserve core fields', () => {
    const form = toLessonFormState(lesson);
    expect(form.title).toBe('Speaking');
    const roundTrip = fromLessonFormState({ ...form, title: 'Updated' }, lesson);
    expect(roundTrip.title).toBe('Updated');
    expect(roundTrip.endTime).toBe(calculateEndTime(form.startTime, form.duration));
    expect(roundTrip.cancelReason).toBeUndefined();
  });

  it('fromLessonFormState sets cancelReason when cancelled', () => {
    const form = toLessonFormState({
      ...lesson,
      statusId: LESSON_STATUS.cancelled.id,
      cancelReason: 'student_absent',
    });
    const updated = fromLessonFormState(form, lesson);
    expect(updated.cancelReason).toBe('student_absent');
  });
});
