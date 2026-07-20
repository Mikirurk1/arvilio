import type { ScheduledLessonBackendDto } from '@pkg/types';
import { buildStudentLessonList } from './student-lessons';

const backendLesson = (
  overrides: Partial<ScheduledLessonBackendDto>,
): ScheduledLessonBackendDto =>
  ({
    id: 'lesson-1',
    title: 'Lesson',
    date: '2026-05-20',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezone: 'UTC',
    teacherId: 'teacher-1',
    teacherName: 'Teacher',
    studentId: 'student-1',
    studentName: 'Student',
    status: 'planned',
    materials: [],
    homework: { text: '', files: [], fileLinks: [] },
    studentResponse: { status: 'none', text: '', files: [], fileLinks: [] },
    ...overrides,
  }) as ScheduledLessonBackendDto;

describe('student-lessons', () => {
  it('buildStudentLessonList sorts by start time ascending', () => {
    const nameById = new Map<number, string>([
      [1, 'Teacher'],
      [2, 'Student'],
    ]);
    const rows = buildStudentLessonList(
      [
        backendLesson({ id: 'late', date: '2026-05-21', startTime: '14:00' }),
        backendLesson({ id: 'early', date: '2026-05-20', startTime: '09:00' }),
      ],
      nameById,
    );
    expect(rows.map((row) => row.backendId ?? String(row.id))).toEqual(['early', 'late']);
  });
});
