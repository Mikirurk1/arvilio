import { TIME_ZONE, type ScheduledLessonDto } from '@pkg/types';
import { mockScheduledLesson } from '../../../testing/fixtures';
import {
  findPastSlotsInUpdates,
  findScheduleConflictsForUpdates,
  hasTimeConflict,
  isPastSlot,
} from './conflicts';

function lesson(
  id: number,
  date: string,
  startTime: string,
  duration: number,
  teacherId = 1,
  timezoneId: ScheduledLessonDto['timezoneId'] = TIME_ZONE.kyiv.id,
): ScheduledLessonDto {
  return mockScheduledLesson({
    id,
    title: 'L',
    date,
    startTime,
    endTime: '11:00',
    duration,
    timezoneId,
    teacherId,
    studentId: 2,
    seriesId: undefined,
    recurrence: 'none',
  });
}

describe('hasTimeConflict', () => {
  it('detects overlapping lessons', () => {
    const existing = [lesson(1, '2026-06-01', '10:00', 60)];
    const candidate = lesson(2, '2026-06-01', '10:30', 60);
    expect(hasTimeConflict(existing, candidate)).toBe(true);
  });

  it('ignores lesson by id', () => {
    const existing = [lesson(1, '2026-06-01', '10:00', 60)];
    const candidate = lesson(1, '2026-06-01', '10:00', 60);
    expect(hasTimeConflict(existing, candidate, 1)).toBe(false);
  });

  it('same-teacher-overlap ignores other teachers', () => {
    const existing = [lesson(1, '2030-06-01', '10:00', 60, 1)];
    const candidate = lesson(2, '2030-06-01', '10:30', 60, 2);
    expect(hasTimeConflict(existing, candidate, undefined, 'same-teacher-overlap')).toBe(false);
    expect(hasTimeConflict(existing, lesson(3, '2030-06-01', '10:30', 60, 1), undefined, 'same-teacher-overlap')).toBe(
      true,
    );
  });

  it('isPastSlot detects lessons before now', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));
    expect(isPastSlot(lesson(1, '2020-01-01', '10:00', 60))).toBe(true);
    expect(isPastSlot(lesson(1, '2030-06-01', '10:00', 60))).toBe(false);
    jest.useRealTimers();
  });

  it('findPastSlotsInUpdates filters past lessons', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));
    const updates = [lesson(1, '2020-01-01', '10:00', 60), lesson(2, '2030-06-01', '10:00', 60)];
    expect(findPastSlotsInUpdates(updates)).toHaveLength(1);
    jest.useRealTimers();
  });

  it('findScheduleConflictsForUpdates detects external overlap', () => {
    const lessons = [lesson(1, '2030-06-01', '10:00', 60)];
    const updates = [lesson(2, '2030-06-01', '10:30', 60)];
    const conflicts = findScheduleConflictsForUpdates(lessons, updates);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.conflict.id).toBe(1);
  });
});
