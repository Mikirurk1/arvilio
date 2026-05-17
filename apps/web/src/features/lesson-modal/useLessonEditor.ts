'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { LESSON_STATUS } from '@soenglish/shared-types';
import { canSchedule, isAdminOrSuper, USER_ROLE } from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { useScheduledLessonPersistence } from '../../hooks/use-scheduled-lesson-persistence';
import { toLessonFormState } from '../calendar/adapters/lessonCalendarAdapter';
import {
  buildLessonCandidate,
  isGoogleCalendarRequiredError,
  resolvePartyBackendId,
} from './lessonPersistence';
import { confirmDialog } from '../confirm';
import { toast } from '../notifications';
import {
  getLessonBackendId,
  upsertScheduledLesson,
} from './scheduledLessonsBackendAdapter';
import { hasTimeConflict, isPastSlot } from '../calendar/rules/conflicts';
import { defaultCreateLessonStartTime, getIanaForTimeZoneId } from '../../lib/lessonTime';
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
  const activeUser = useActiveUser();
  const role = activeUser.role;
  const { lessons, setLessons } = useScheduledLessons();
  const canManageLessons = canSchedule('lessons', role);
  const {
    studentOptions,
    teacherOptions,
    defaultTeacher,
    defaultStudent,
    currentUserNumericId,
  } = useLessonPartyOptions();
  const { persistCreate, persistUpdate, persistenceErrorMessage } = useScheduledLessonPersistence();

  const [modalMode, setModalMode] = useState<LessonModalMode>('create');
  const [saving, setSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ScheduledLessonDto | null>(null);
  const [form, setForm] = useState<LessonFormState | null>(null);

  const openCreateModal = useCallback(
    (date: string) => {
      const viewerIana = getIanaForTimeZoneId(activeUser.timezoneId);
      const { startTime } = defaultCreateLessonStartTime(viewerIana, date);
      const teacher =
        isAdminOrSuper(role)
          ? defaultTeacher
          : defaultTeacher ?? {
              id: currentUserNumericId ?? activeUser.id,
              fullName: activeUser.fullName,
              backendId: '',
            };
      const student =
        role === USER_ROLE.student.id
          ? {
              id: currentUserNumericId ?? activeUser.id,
              fullName: activeUser.fullName,
              backendId: '',
            }
          : defaultStudent;
      setModalMode('create');
      setEditingLesson(null);
      setForm({
        title: 'New lesson',
        date,
        startTime,
        duration: 55,
        teacherId: teacher?.id ?? activeUser.id,
        teacherName: teacher?.fullName ?? activeUser.fullName,
        studentId: student?.id ?? activeUser.id,
        studentName: student?.fullName ?? activeUser.fullName,
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
        linkedWordIds: [],
        statusId: LESSON_STATUS.planned.id,
        credited: false,
        recurrence: 'none',
        weeklyDays: [],
        applyToSeries: false,
        timezoneId: activeUser.timezoneId,
      });
    },
    [
      role,
      defaultStudent,
      defaultTeacher,
      currentUserNumericId,
      activeUser.id,
      activeUser.fullName,
      activeUser.timezoneId,
    ],
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
        toast.warning('Time slot unavailable', 'This time slot is already booked.');
        return false;
      }
      if (isPastSlot(nextLesson)) {
        toast.warning('Invalid time', 'You cannot schedule a lesson in the past.');
        return false;
      }
      if (!sourceLesson) {
        setLessons((prev) => upsertScheduledLesson(prev, nextLesson));
        onLessonCreated?.(nextLesson);
      } else {
        setLessons((prev) => prev.map((lesson) => (lesson.id === sourceLesson.id ? nextLesson : lesson)));
      }
      return true;
    },
    [lessons, setLessons, onLessonCreated],
  );

  const submitModal = useCallback(async () => {
    if (!form || saving) return;
    const candidate = buildLessonCandidate(form, lessons, editingLesson);
    if (!canManageLessons) candidate.statusId = LESSON_STATUS.planned.id;

    if (hasTimeConflict(lessons, candidate, editingLesson?.id, 'any-overlap')) {
      toast.warning('Time slot unavailable', 'This time slot is already booked.');
      return;
    }
    if (isPastSlot(candidate)) {
      toast.warning('Invalid time', 'You cannot schedule a lesson in the past.');
      return;
    }

    if (canManageLessons) {
      setSaving(true);
      let keepModalOpenAfterSave = false;
      try {
        if (editingLesson) {
          const persisted = await persistUpdate(candidate, editingLesson);
          if (persisted) {
            setLessons((prev) =>
              prev.map((lesson) => (lesson.id === editingLesson.id ? persisted : lesson)),
            );
            setEditingLesson(persisted);
            setForm(toLessonFormState(persisted));
          } else if (!tryApplyLesson(candidate, editingLesson)) {
            return;
          }
        } else {
          const persisted = await persistCreate(candidate);
          setLessons((prev) => upsertScheduledLesson(prev, persisted));
          setEditingLesson(persisted);
          setModalMode('edit');
          setForm(toLessonFormState(persisted));
          keepModalOpenAfterSave = true;
          onLessonCreated?.(persisted);
          if (form.recurrence === 'weekly' && form.weeklyDays.length > 0) {
            const baseDate = new Date(form.date);
            const clones = form.weeklyDays
              .map((weekday, index) => {
                if (index === 0) return null;
                const delta =
                  (weekday - (baseDate.getDay() === 0 ? 7 : baseDate.getDay()) + 7) % 7;
                const nextDate = new Date(baseDate);
                nextDate.setDate(baseDate.getDate() + delta);
                return { ...candidate, date: toDateString(nextDate) };
              })
              .filter((row): row is ScheduledLessonDto => row !== null);

            for (const clone of clones) {
              if (hasTimeConflict(lessons, clone, undefined, 'any-overlap')) continue;
              if (isPastSlot(clone)) continue;
              const clonePersisted = await persistCreate(clone);
              setLessons((prev) => upsertScheduledLesson(prev, clonePersisted));
              onLessonCreated?.(clonePersisted);
            }
          }
        }
      } catch (error) {
        const message = persistenceErrorMessage(error);
        toast.error(
          isGoogleCalendarRequiredError(error) ? 'Google Calendar required' : 'Could not save lesson',
          message,
        );
        return;
      } finally {
        setSaving(false);
      }
      if (!keepModalOpenAfterSave) closeModal();
      return;
    }

    if (!tryApplyLesson(candidate, editingLesson ?? undefined)) return;
    if (!editingLesson && form.recurrence === 'weekly' && form.weeklyDays.length > 0) {
      const baseDate = new Date(form.date);
      let cloneOffset = 1;
      const seq = candidate.id;
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
  }, [
    form,
    saving,
    editingLesson,
    lessons,
    canManageLessons,
    tryApplyLesson,
    persistCreate,
    persistUpdate,
    persistenceErrorMessage,
    setLessons,
    onLessonCreated,
    closeModal,
  ]);

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

  const handleUnlinkSeries = useCallback(async () => {
    if (!editingLesson?.seriesId) return;
    const ok = await confirmDialog({
      title: 'Unlink from series?',
      message:
        'Only this lesson will be detached; other lessons in the series stay linked.',
      confirmLabel: 'Unlink',
    });
    if (!ok) return;
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

  const handleDeleteLesson = useCallback(async () => {
    if (!editingLesson) return;
    const ok = await confirmDialog({
      title: 'Delete lesson?',
      message: 'This lesson will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    const id = editingLesson.id;
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
    onAfterDelete?.(id);
    closeModal();
  }, [editingLesson, setLessons, onAfterDelete, closeModal]);

  const lessonBackendId = editingLesson ? getLessonBackendId(editingLesson) ?? null : null;
  const persistedLessonId = editingLesson?.id ?? null;
  const studentBackendId = form
    ? resolvePartyBackendId(form.studentId, studentOptions, teacherOptions) ?? null
    : null;

  return {
    role,
    canManageLessons,
    canCreateLesson: canManageLessons,
    lessons,
    visibleStudents: studentOptions,
    assignableTeachers: teacherOptions,
    lessonBackendId,
    persistedLessonId,
    studentBackendId,
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
