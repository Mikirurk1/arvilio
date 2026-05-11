'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { LESSON_STATUS } from '@soenglish/shared-types';
import {
  activeMockUser,
  canSchedule,
  getVisibleProfiles,
  isAdminOrSuper,
  mockUsers,
  syncLessonVocabularyToProfile,
  USER_ROLE,
} from '../../mocks';
import {
  fromLessonFormState,
  nextLessonEntityId,
  toLessonFormState,
} from '../calendar/adapters/lessonCalendarAdapter';
import { hasTimeConflict, isPastSlot } from '../calendar/rules/conflicts';
import type { LessonFormState, LessonModalMode } from './types';
import { useScheduledLessons } from './ScheduledLessonsProvider';

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export type UseLessonEditorOptions = {
  /** Called after a lesson is deleted (modal closes after delete). */
  onAfterDelete?: (deletedId: number) => void;
  /** Called when a new lesson is appended (create flow). */
  onLessonCreated?: (lesson: ScheduledLessonDto) => void;
};

export function useLessonEditor(options: UseLessonEditorOptions = {}) {
  const { onAfterDelete, onLessonCreated } = options;
  const role = activeMockUser.role;
  const { lessons, setLessons } = useScheduledLessons();
  const canManageLessons = canSchedule('lessons', role);

  const visibleStudents = useMemo(() => getVisibleProfiles(role, activeMockUser.id), [role]);
  const assignableTeachers = useMemo(
    () =>
      mockUsers
        .filter((user) => user.role !== USER_ROLE.student.id)
        .map((user) => ({ id: user.id, fullName: user.fullName })),
    [],
  );

  const [modalMode, setModalMode] = useState<LessonModalMode>('create');
  const [editingLesson, setEditingLesson] = useState<ScheduledLessonDto | null>(null);
  const [form, setForm] = useState<LessonFormState | null>(null);

  const openCreateModal = useCallback(
    (date: string, startTime = '10:00') => {
      const defaultStudent = visibleStudents[0];
      const defaultTeacher =
        isAdminOrSuper(role)
          ? assignableTeachers[0]
          : { id: activeMockUser.id, fullName: activeMockUser.fullName };
      setModalMode('create');
      setEditingLesson(null);
      setForm({
        title: 'New lesson',
        date,
        startTime,
        duration: 55,
        teacherId: defaultTeacher?.id ?? activeMockUser.id,
        teacherName: defaultTeacher?.fullName ?? activeMockUser.fullName,
        studentId: role === USER_ROLE.student.id ? activeMockUser.id : (defaultStudent?.id ?? activeMockUser.id),
        studentName:
          role === USER_ROLE.student.id ? activeMockUser.fullName : (defaultStudent?.fullName ?? activeMockUser.fullName),
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
        linkedVocabularyIds: [],
        statusId: LESSON_STATUS.planned.id,
        credited: false,
        recurrence: 'none',
        weeklyDays: [],
        applyToSeries: false,
        timezoneId: activeMockUser.timezoneId,
      });
    },
    [role, visibleStudents, assignableTeachers],
  );

  const openEditModal = useCallback((lesson: ScheduledLessonDto) => {
    setModalMode('edit');
    setEditingLesson(lesson);
    setForm(toLessonFormState(lesson));
  }, []);

  const closeModal = useCallback(() => {
    setForm(null);
    setEditingLesson(null);
  }, []);

  const tryApplyLesson = useCallback(
    (nextLesson: ScheduledLessonDto, sourceLesson?: ScheduledLessonDto): boolean => {
      if (hasTimeConflict(lessons, nextLesson, sourceLesson?.id, 'any-overlap')) {
        window.alert('This time slot is already booked.');
        return false;
      }
      if (isPastSlot(nextLesson)) {
        window.alert('You cannot schedule a lesson in the past.');
        return false;
      }
      if (!sourceLesson) {
        setLessons((prev) => [...prev, nextLesson]);
        onLessonCreated?.(nextLesson);
      } else {
        setLessons((prev) => prev.map((lesson) => (lesson.id === sourceLesson.id ? nextLesson : lesson)));
      }
      return true;
    },
    [lessons, setLessons, onLessonCreated],
  );

  const submitModal = useCallback(() => {
    if (!form) return;
    const seq = nextLessonEntityId(lessons);
    const candidate = fromLessonFormState(form, editingLesson ?? undefined, editingLesson ? undefined : seq);
    if (!canManageLessons) candidate.statusId = LESSON_STATUS.planned.id;
    if (!tryApplyLesson(candidate, editingLesson ?? undefined)) return;
    syncLessonVocabularyToProfile(candidate);
    if (!editingLesson && form.recurrence === 'weekly' && form.weeklyDays.length > 0) {
      const baseDate = new Date(form.date);
      let cloneOffset = 1;
      form.weeklyDays.forEach((weekday, index) => {
        if (index === 0) return;
        const delta = (weekday - (baseDate.getDay() === 0 ? 7 : baseDate.getDay()) + 7) % 7;
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + delta);
        tryApplyLesson(
          {
            ...candidate,
            id: seq + cloneOffset,
            date: toDateString(nextDate),
          },
          undefined,
        );
        cloneOffset += 1;
      });
    }
    closeModal();
  }, [form, editingLesson, lessons, canManageLessons, tryApplyLesson, closeModal]);

  const saveStudentResponse = useCallback(() => {
    if (!form || !editingLesson) return;
    const nextResponse = {
      ...(editingLesson.studentResponse ?? { text: '', files: [] }),
      text: form.studentResponseText,
      files: form.studentResponseFiles,
      status: form.studentResponseStatus,
      homeworkChecked: form.homeworkChecked,
      teacherHomeworkFeedback: form.teacherHomeworkFeedback,
    };
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === editingLesson.id
          ? {
              ...lesson,
              studentResponse: nextResponse,
            }
          : lesson,
      ),
    );
    setEditingLesson((prev) =>
      prev ? { ...prev, studentResponse: nextResponse } : prev,
    );
  }, [form, editingLesson, setLessons]);

  const handleUnlinkSeries = useCallback(() => {
    if (!editingLesson?.seriesId) return;
    if (
      !window.confirm(
        'Unlink this lesson from the series? Only this lesson will be detached; other series lessons stay as they are.',
      )
    ) {
      return;
    }
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === editingLesson.id
          ? { ...lesson, seriesId: undefined, recurrence: 'none', weeklyDays: [] }
          : lesson,
      ),
    );
    setEditingLesson((prev) =>
      prev ? { ...prev, seriesId: undefined, recurrence: 'none', weeklyDays: [] } : prev,
    );
    setForm((prev) =>
      prev ? { ...prev, recurrence: 'none', weeklyDays: [], applyToSeries: false } : prev,
    );
  }, [editingLesson, setLessons]);

  const handleDeleteLesson = useCallback(() => {
    if (!editingLesson) return;
    if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
    const id = editingLesson.id;
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
    onAfterDelete?.(id);
    closeModal();
  }, [editingLesson, setLessons, onAfterDelete, closeModal]);

  return {
    role,
    canManageLessons,
    canCreateLesson: canManageLessons,
    lessons,
    visibleStudents,
    assignableTeachers,
    modalMode,
    editingLesson,
    form,
    setForm,
    openCreateModal,
    openEditModal,
    closeModal,
    submitModal,
    saveStudentResponse,
    handleUnlinkSeries,
    handleDeleteLesson,
  };
}
