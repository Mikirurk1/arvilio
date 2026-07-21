import { LESSON_STATUS, TIME_ZONE } from '@pkg/types';
import { ApiError } from '../../lib/api';
import { GraphqlError } from '../../lib/graphql-client';
import { mockLessonPartyOption, mockScheduledLesson } from '../../testing/fixtures';
import {
  buildLessonCandidate,
  isGoogleCalendarRequiredError,
  lessonHasPersistableContent,
  mergeLessonDisplayNames,
  persistenceErrorMessage,
  resolvePartyBackendId,
  toCreateScheduledLessonBody,
  toUpdateScheduledLessonBody,
} from './lessonPersistence';
import type { LessonFormState } from './types';
import { partyNumericId } from './scheduledLessonsBackendAdapter';

const lesson = mockScheduledLesson({
  id: 1,
  teacherId: 100,
  studentId: 200,
});

describe('lessonPersistence', () => {
  it('lessonHasPersistableContent detects plan, materials, homework', () => {
    expect(lessonHasPersistableContent(lesson)).toBe(false);
    expect(lessonHasPersistableContent({ ...lesson, lessonPlan: 'Plan' })).toBe(true);
    expect(
      lessonHasPersistableContent({
        ...lesson,
        materials: [{ id: 'm1', kind: 'text', text: 'x', files: [] }],
      }),
    ).toBe(true);
    expect(
      lessonHasPersistableContent({
        ...lesson,
        homework: { text: '', files: ['attachment:f1'] },
      }),
    ).toBe(true);
  });

  it('resolvePartyBackendId uses party map and options', () => {
    const studentBackend = 'student-uuid';
    const studentNum = partyNumericId(studentBackend);
    expect(
      resolvePartyBackendId(
        studentNum,
        [mockLessonPartyOption({ id: studentNum, backendId: studentBackend })],
        [],
      ),
    ).toBe(studentBackend);
  });

  it('toCreateScheduledLessonBody returns null without student id', () => {
    expect(toCreateScheduledLessonBody(lesson, () => undefined)).toBeNull();
  });

  it('toCreateScheduledLessonBody builds create payload', () => {
    const studentId = 'student-uuid';
    const body = toCreateScheduledLessonBody(lesson, (id) =>
      id === lesson.studentId ? studentId : 'teacher-uuid',
    );
    expect(body?.studentId).toBe(studentId);
    expect(body?.timezone).toBe('Europe/Kyiv');
  });

  const resolveParty = (id: number) =>
    id === lesson.studentId ? 'student-uuid' : 'teacher-uuid';

  it('toUpdateScheduledLessonBody maps status and schedule fields', () => {
    const body = toUpdateScheduledLessonBody(
      {
        ...lesson,
        title: 'Updated',
        statusId: LESSON_STATUS.completed.id,
      },
      resolveParty,
    );
    expect(body.title).toBe('Updated');
    expect(body.status).toBe('completed');
  });

  it('toUpdateScheduledLessonBody can omit lesson content', () => {
    const body = toUpdateScheduledLessonBody(
      { ...lesson, lessonPlan: 'Plan', materials: [{ id: 'm1', kind: 'text', text: 'x', files: [] }] },
      resolveParty,
      { includeLessonContent: false },
    );
    expect(body.lessonPlan).toBe('Plan');
    expect(body.materials).toBeUndefined();
  });

  it('mergeLessonDisplayNames prefers source display names', () => {
    const api = { ...lesson, teacherName: 'API Teacher', studentName: 'API Student' };
    const local = { ...lesson, teacherName: 'Local Teacher', studentName: 'Local Student' };
    const merged = mergeLessonDisplayNames(api, local);
    expect(merged.teacherName).toBe('Local Teacher');
    expect(merged.studentName).toBe('Local Student');
  });

  it('buildLessonCandidate assigns new id when creating', () => {
    const form: LessonFormState = {
      title: 'New',
      date: '2030-06-01',
      startTime: '10:00',
      timezoneId: TIME_ZONE.kyiv.id,
      duration: 60,
      teacherId: 100,
      teacherName: 'T',
      studentId: 200,
      studentName: 'S',
      notes: '',
      lessonPlan: '',
      materials: [],
      homeworkText: '',
      homeworkFiles: [],
      studentResponseText: '',
      studentResponseFiles: [],
      studentResponseStatus: 'not_submitted',
      homeworkChecked: false,
      teacherHomeworkFeedback: '',
      statusId: LESSON_STATUS.planned.id,
      credited: false,
      recurrence: 'none',
      weeklyDays: [],
      linkedWordIds: [],
      kind: 'individual',
      participantIds: [],
      groupBillingMode: 'per_member',
      groupPriceMinor: 0,
      groupCurrency: 'UAH',
      groupSplitMode: 'equal_split',
      groupPayerUserId: null,
      studentGroupId: null,
    };
    const candidate = buildLessonCandidate(form, [lesson], null);
    expect(candidate.id).toBe(2);
    expect(candidate.title).toBe('New');
  });

  it('buildLessonCandidate keeps id when editing', () => {
    const form: LessonFormState = {
      title: 'Edited',
      date: lesson.date,
      startTime: lesson.startTime,
      timezoneId: lesson.timezoneId,
      duration: lesson.duration,
      teacherId: lesson.teacherId,
      teacherName: lesson.teacherName ?? 'T',
      studentId: lesson.studentId,
      studentName: lesson.studentName ?? 'S',
      notes: '',
      lessonPlan: '',
      materials: [],
      homeworkText: '',
      homeworkFiles: [],
      studentResponseText: '',
      studentResponseFiles: [],
      studentResponseStatus: 'not_submitted',
      homeworkChecked: false,
      teacherHomeworkFeedback: '',
      statusId: lesson.statusId,
      credited: false,
      recurrence: 'none',
      weeklyDays: [],
      linkedWordIds: [],
      kind: 'individual',
      participantIds: [],
      groupBillingMode: 'per_member',
      groupPriceMinor: 0,
      groupCurrency: 'UAH',
      groupSplitMode: 'equal_split',
      groupPayerUserId: null,
      studentGroupId: null,
    };
    const candidate = buildLessonCandidate(form, [lesson], lesson);
    expect(candidate.id).toBe(lesson.id);
    expect(candidate.title).toBe('Edited');
  });

  it('toCreateScheduledLessonBody omits content when lesson has none', () => {
    const body = toCreateScheduledLessonBody(lesson, (id) =>
      id === lesson.studentId ? 'student-uuid' : 'teacher-uuid',
    );
    expect(body?.materials).toBeUndefined();
    expect(body?.homework).toBeUndefined();
  });

  it('persistenceErrorMessage maps ApiError, GraphqlError, and fallback', () => {
    expect(persistenceErrorMessage(new ApiError(400, 'Bad request'))).toBe('Bad request');
    expect(
      persistenceErrorMessage(new GraphqlError('GraphQL failed', [{ message: 'Field invalid' }])),
    ).toBe('Field invalid');
    expect(persistenceErrorMessage(new Error('network'))).toBe('network');
    expect(persistenceErrorMessage(null)).toBe('Failed to save lesson');
  });

  it('isGoogleCalendarRequiredError detects calendar OAuth message', () => {
    expect(
      isGoogleCalendarRequiredError(
        new ApiError(400, 'Please sign in with Google and connect Calendar'),
      ),
    ).toBe(true);
    expect(isGoogleCalendarRequiredError(new ApiError(400, 'Other error'))).toBe(false);
  });
});
