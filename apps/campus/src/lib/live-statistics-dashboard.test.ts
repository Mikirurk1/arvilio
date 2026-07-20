import type { ScheduledLessonBackendDto, StudentWordCardDto } from '@pkg/types';
import { USER_ROLE } from '@pkg/types';
import {
  buildLiveStatisticsDashboard,
  filterLessonsForViewer,
} from './live-statistics-dashboard';

const lesson = (overrides: Partial<ScheduledLessonBackendDto>): ScheduledLessonBackendDto =>
  ({
    id: 'l1',
    title: 'Lesson',
    date: '2026-05-20',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezone: 'UTC',
    teacherId: 'teacher-1',
    teacherName: 'T',
    studentId: 'student-1',
    studentName: 'S',
    status: 'completed',
    credited: false,
    ...overrides,
  }) as ScheduledLessonBackendDto;

describe('live-statistics-dashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('filterLessonsForViewer scopes by student or teacher backend id', () => {
    const rows = [
      lesson({ id: 'a', studentId: 's1', teacherId: 't1' }),
      lesson({ id: 'b', studentId: 's2', teacherId: 't1' }),
    ];
    expect(filterLessonsForViewer(rows, USER_ROLE.student.id, 's1')).toHaveLength(1);
    expect(filterLessonsForViewer(rows, USER_ROLE.teacher.id, 't1')).toHaveLength(2);
    expect(filterLessonsForViewer(rows, USER_ROLE.admin.id, 't1')).toHaveLength(2);
  });

  it('buildLiveStatisticsDashboard aggregates lesson KPIs for student role', () => {
    const cards = [
      {
        id: 'c1',
        firstSeenAt: '2026-05-20T08:00:00.000Z',
        knownAt: null,
      } as StudentWordCardDto,
    ];
    const dashboard = buildLiveStatisticsDashboard({
      roleId: USER_ROLE.student.id,
      rangePreset: 'week',
      lessons: [
        lesson({ status: 'completed', duration: 60 }),
        lesson({ id: 'l2', status: 'cancelled', credited: true }),
      ],
      cards,
      title: 'Student stats',
      now: new Date('2026-05-20T12:00:00.000Z'),
    });

    expect(dashboard.title).toBe('Student stats');
    expect(dashboard.kpis.find((k) => k.label === 'Completed lessons')?.value).toBe('1');
    expect(dashboard.kpis.find((k) => k.label === 'New words added')?.value).toBe('1');
    expect(dashboard.goals.currentMinutes).toBe(60);
  });
});
