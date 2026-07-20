import { LESSON_STATUS, USER_ROLE, type ScheduledLessonDto } from '@pkg/types';
import {
  dedupeScheduledLessons,
  fromBackendLesson,
  getLessonBackendId,
  getLessonRouteId,
  hydrateLessonPartyNames,
  lessonIncludesViewer,
  lessonNumericId,
  lessonStringId,
  partyNumericId,
  resolveLessonBackendId,
  scheduledLessonIdentity,
  upsertScheduledLesson,
} from './scheduledLessonsBackendAdapter';

const localLesson = (overrides: Partial<ScheduledLessonDto> = {}): ScheduledLessonDto =>
  ({
    id: 1001,
    title: 'Lesson',
    date: '2026-05-20',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezoneId: 1,
    teacherId: 2001,
    teacherName: 'T',
    studentId: 2002,
    studentName: 'S',
    statusId: LESSON_STATUS.planned.id,
    materials: [],
    homework: { text: '', files: [] },
    studentResponse: { status: 'none', text: '', files: [] },
    ...overrides,
  }) as ScheduledLessonDto;

describe('scheduledLessonsBackendAdapter', () => {
  it('scheduledLessonIdentity distinguishes local vs backend', () => {
    expect(scheduledLessonIdentity({ id: 1, backendId: 'uuid-1' })).toBe('backend:uuid-1');
    expect(scheduledLessonIdentity({ id: 1 })).toBe('local:1');
  });

  it('dedupeScheduledLessons prefers row with backendId', () => {
    const local = localLesson({ id: 42, backendId: undefined });
    const remote = localLesson({ id: 42, backendId: 'backend-42', title: 'Synced' });
    const merged = dedupeScheduledLessons([local, remote]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.backendId).toBe('backend-42');
    expect(merged[0]?.title).toBe('Synced');
  });

  it('upsertScheduledLesson replaces same identity', () => {
    const first = localLesson({ id: 5, title: 'A' });
    const second = localLesson({ id: 5, title: 'B', backendId: 'uuid-5' });
    const rows = upsertScheduledLesson([first], second);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe('B');
  });

  it('resolveLessonBackendId accepts uuid string or numeric id', () => {
    const backendId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const numeric = lessonNumericId(backendId);
    expect(resolveLessonBackendId(backendId)).toBe(backendId);
    expect(resolveLessonBackendId(numeric)).toBe(backendId);
    expect(resolveLessonBackendId(String(numeric))).toBe(backendId);
  });

  it('getLessonRouteId and getLessonBackendId prefer backend uuid', () => {
    const lesson = localLesson({ id: 9, backendId: 'route-uuid' });
    expect(getLessonRouteId(lesson)).toBe('route-uuid');
    expect(getLessonBackendId(lesson)).toBe('route-uuid');
    expect(getLessonRouteId(localLesson({ id: 9 }))).toBe('9');
  });

  it('lessonIncludesViewer filters by student or teacher party id', () => {
    const lesson = localLesson({ studentId: 10, teacherId: 20 });
    expect(lessonIncludesViewer(lesson, 10, USER_ROLE.student.id)).toBe(true);
    expect(lessonIncludesViewer(lesson, 20, USER_ROLE.teacher.id)).toBe(true);
    expect(lessonIncludesViewer(lesson, 99, USER_ROLE.student.id)).toBe(false);
    expect(lessonIncludesViewer(lesson, null, USER_ROLE.admin.id)).toBe(true);
  });

  it('hydrateLessonPartyNames overlays names from map', () => {
    const lesson = localLesson({ teacherId: 2001, studentId: 2002, teacherName: '', studentName: '' });
    const names = new Map<number, string>([
      [2001, 'Teacher Name'],
      [2002, 'Student Name'],
    ]);
    const [hydrated] = hydrateLessonPartyNames([lesson], names);
    expect(hydrated?.teacherName).toBe('Teacher Name');
    expect(hydrated?.studentName).toBe('Student Name');
  });

  it('fromBackendLesson maps ids and status', () => {
    const teacherId = 'teacher-str';
    const studentId = 'student-str';
    const dto = fromBackendLesson({
      id: 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
      title: 'Speaking',
      date: '2026-05-21',
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      timezone: 'Europe/Kyiv',
      teacherId,
      teacherName: 'Teacher',
      studentId,
      studentName: 'Student',
      status: 'planned',
      materials: [],
      homework: { text: '', files: [], fileLinks: [] },
      studentResponse: { status: 'none', text: '', files: [], fileLinks: [] },
    } as never);
    expect(lessonStringId(dto.id)).toBe('bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(dto.statusId).toBe(LESSON_STATUS.planned.id);
    expect(partyNumericId(teacherId)).toBe(dto.teacherId);
  });
});
