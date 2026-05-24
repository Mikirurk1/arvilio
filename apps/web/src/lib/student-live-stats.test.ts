import type { ScheduledLessonBackendDto, StudentWordCardDto } from '@pkg/types';
import {
  buildStudentDashboardSummary,
  buildStudentVocabularyOverview,
  filterLessonsForStudent,
} from './student-live-stats';

const lesson = (overrides: Partial<ScheduledLessonBackendDto>): ScheduledLessonBackendDto =>
  ({
    id: 'l1',
    title: 'Lesson',
    date: '2026-05-20',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezone: 'UTC',
    teacherId: 't1',
    teacherName: 'T',
    studentId: 's1',
    studentName: 'S',
    status: 'planned',
    ...overrides,
  }) as ScheduledLessonBackendDto;

const card = (status: StudentWordCardDto['status']): StudentWordCardDto =>
  ({
    id: 'c1',
    status,
    masteryLevel: 0,
    word: { id: 'w1', text: 'run', definition: 'x' },
  }) as StudentWordCardDto;

describe('student-live-stats', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 20, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('filterLessonsForStudent keeps only matching studentId', () => {
    const rows = filterLessonsForStudent(
      [lesson({ studentId: 's1' }), lesson({ id: 'l2', studentId: 's2' })],
      's1',
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.studentId).toBe('s1');
  });

  it('buildStudentVocabularyOverview counts mastered and due', () => {
    const overview = buildStudentVocabularyOverview([
      card('learned'),
      card('new'),
      card('mistakes_work'),
    ]);
    expect(overview).toEqual({ totalWords: 3, masteredWords: 1, dueToday: 2 });
  });

  it('buildStudentDashboardSummary aggregates lesson and card metrics', () => {
    const summary = buildStudentDashboardSummary(
      [
        lesson({ status: 'completed', date: '2026-05-20' }),
        lesson({ id: 'l2', status: 'planned', date: '2026-05-19' }),
      ],
      [card('new'), card('learned')],
    );
    expect(summary.role).toBe('student');
    expect(summary.lessonsToday).toBe(1);
    expect(summary.lessonsCompleted).toBe(1);
    expect(summary.vocabularyCount).toBe(2);
    expect(summary.reviewCount).toBe(1);
  });
});
