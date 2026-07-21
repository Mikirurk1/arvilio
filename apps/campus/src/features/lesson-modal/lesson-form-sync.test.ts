import { LESSON_STATUS, TIME_ZONE, type ScheduledLessonDto } from '@pkg/types';
import { mockScheduledLesson } from '../../testing/fixtures';
import { syncLessonFormChange } from './lesson-form-sync';
import type { LessonFormState } from './types';

const editingLesson = mockScheduledLesson({
  id: 1,
  date: '2030-06-01',
});

const form: LessonFormState = {
  title: 'Updated',
  date: '2030-06-01',
  startTime: '10:00',
  timezoneId: TIME_ZONE.kyiv.id,
  duration: 60,
  teacherId: 1,
  teacherName: 'T',
  studentId: 2,
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

describe('syncLessonFormChange', () => {
  it('updates form and upserts lesson in list when editing', () => {
    const setForm = jest.fn();
    const setLessons = jest.fn();
    const setEditingLesson = jest.fn();
    const lessons = [editingLesson];

    syncLessonFormChange(form, editingLesson, setForm, setLessons, setEditingLesson);

    expect(setForm).toHaveBeenCalledWith(form);
    expect(setLessons).toHaveBeenCalled();
    const updater = setLessons.mock.calls[0]?.[0] as (prev: ScheduledLessonDto[]) => ScheduledLessonDto[];
    const next = updater(lessons);
    expect(next[0]?.title).toBe('Updated');
    expect(setEditingLesson).toHaveBeenCalled();
  });

  it('only updates form when not editing', () => {
    const setForm = jest.fn();
    const setLessons = jest.fn();

    syncLessonFormChange(form, null, setForm, setLessons);

    expect(setForm).toHaveBeenCalledWith(form);
    expect(setLessons).not.toHaveBeenCalled();
  });

  it('updates list without setEditingLesson callback', () => {
    const setForm = jest.fn();
    const setLessons = jest.fn();
    syncLessonFormChange(form, editingLesson, setForm, setLessons);

    expect(setForm).toHaveBeenCalledWith(form);
    expect(setLessons).toHaveBeenCalled();
  });
});
