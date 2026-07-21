import type { ScheduledLessonDto } from '@pkg/types';
import { getInitialLessons, getLessonsByStudent } from './lessonCalendarService';

const sampleLesson = (overrides: Partial<ScheduledLessonDto> = {}): ScheduledLessonDto =>
  ({
    id: 1,
    title: 'Grammar',
    date: '2026-05-20',
    startTime: '14:30',
    endTime: '15:30',
    duration: 60,
    timezone: 'UTC',
    teacherId: 1,
    teacherName: 'Teacher',
    studentId: 10,
    studentName: 'Student',
    status: 'planned',
    ...overrides,
  }) as ScheduledLessonDto;

describe('lessonCalendarService', () => {
  it('getInitialLessons returns empty (calendar is API-backed)', () => {
    expect(getInitialLessons()).toEqual([]);
  });

  it('getLessonsByStudent filters by studentId', () => {
    const lessons = [
      sampleLesson({ id: 1, studentId: 10 }),
      sampleLesson({ id: 2, studentId: 20 }),
      sampleLesson({ id: 3, studentId: 10 }),
    ];
    const filtered = getLessonsByStudent(lessons, 10);
    expect(filtered.map((row) => row.id)).toEqual([1, 3]);
    expect(filtered.every((row) => row.studentId === 10)).toBe(true);
  });
});
