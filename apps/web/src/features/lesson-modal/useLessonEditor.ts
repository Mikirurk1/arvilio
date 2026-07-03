'use client';

import { useCallback, useState } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { canSchedule, isAdminOrSuper, USER_ROLE } from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { useScheduledLessonPersistence } from '../../hooks/use-scheduled-lesson-persistence';
import { isRecurrenceAllowedForStudent } from '../../lib/student-schedule-type';
import { toLessonFormState } from '../calendar/adapters/lessonCalendarAdapter';
import {
  buildLessonCandidate,
  isGoogleCalendarRequiredError,
  resolvePartyBackendId,
} from './lessonPersistence';
import { syncLessonFormChange } from './lesson-form-sync';
import { confirmDialog } from '../confirm';
import { toast } from '../notifications';
import {
  getLessonBackendId,
  upsertScheduledLesson,
} from './scheduledLessonsBackendAdapter';
import { hasTimeConflict, isPastSlot } from '../calendar/rules/conflicts';
import { defaultCreateLessonStartTime } from '../../lib/lessonTime';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import type { LessonFormState, LessonModalMode } from './types';
import { useScheduledLessons } from './ScheduledLessonsProvider';
import {
  applyRecurringLessonsLocally,
  createRecurringLessons,
} from './recurring-lesson-create';
import {
  applyLessonSeriesUpdatesLocally,
  persistLessonSeriesUpdates,
  validateLessonScheduleUpdates,
} from './series-lesson-update';
import { deleteScheduledLessonSeries } from './series-lesson-delete';
import { getPlannedLessonsInSeries } from '../../lib/lesson-series';
import { useLessonsStore } from '../../stores/lessons-store';

export type UseLessonEditorOptions = {
  /** Called after a lesson is deleted (modal closes after delete). */
  onAfterDelete?: (deletedId: number) => void;
  /** Called when a new lesson is appended (create flow). */
  onLessonCreated?: (lesson: ScheduledLessonDto) => void;
};

export function useLessonEditor(options: UseLessonEditorOptions = {}) {
  const { onAfterDelete, onLessonCreated } = options;
  const activeUser = useActiveUser();
  const { timezoneId: viewerTimezoneId, iana: viewerIana } = useViewerTimezone();
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
  const deleteScheduledLesson = useLessonsStore((s) => s.deleteScheduledLesson);

  const [modalMode, setModalMode] = useState<LessonModalMode>('create');
  const [saving, setSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ScheduledLessonDto | null>(null);
  const [form, setForm] = useState<LessonFormState | null>(null);

  const openCreateModal = useCallback(
    (date: string) => {
      const { startTime } = defaultCreateLessonStartTime(viewerIana, date);
      const teacher =
        isAdminOrSuper(role)
          ? defaultTeacher
          : defaultTeacher ?? {
              id: currentUserNumericId ?? activeUser.id,
              fullName: activeUser.fullName,
              backendId: '',
              timezoneIana: viewerIana,
              scheduleType: true,
            };
      const student =
        role === USER_ROLE.student.id
          ? {
              id: currentUserNumericId ?? activeUser.id,
              fullName: activeUser.fullName,
              backendId: '',
              timezoneIana: viewerIana,
              scheduleType: true,
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
        timezoneId: viewerTimezoneId,
        kind: 'individual',
        participantIds: [student?.id ?? activeUser.id],
        groupBillingMode: 'per_member',
        groupPriceMinor: 0,
        groupCurrency: 'UAH',
        groupSplitMode: 'equal_split',
        groupPayerUserId: student?.id ?? activeUser.id,
        studentGroupId: null,
      });
    },
    [
      role,
      defaultStudent,
      defaultTeacher,
      currentUserNumericId,
      activeUser.id,
      activeUser.fullName,
      viewerIana,
      viewerTimezoneId,
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

  const updateForm = useCallback(
    (next: LessonFormState) => {
      syncLessonFormChange(next, editingLesson, setForm, setLessons, setEditingLesson);
    },
    [editingLesson, setLessons],
  );

  const tryApplyLesson = useCallback(
    (nextLesson: ScheduledLessonDto, sourceLesson?: ScheduledLessonDto): boolean => {
      if (!sourceLesson) {
        if (hasTimeConflict(lessons, nextLesson, undefined, 'any-overlap')) {
          toast.warning('Time slot unavailable', 'This time slot is already booked.');
          return false;
        }
        if (isPastSlot(nextLesson)) {
          toast.warning('Invalid time', 'You cannot schedule a lesson in the past.');
          return false;
        }
        setLessons((prev) => upsertScheduledLesson(prev, nextLesson));
        onLessonCreated?.(nextLesson);
        return true;
      }

      const inSeries = Boolean(sourceLesson.seriesId);
      const validation = validateLessonScheduleUpdates(
        lessons,
        sourceLesson,
        nextLesson,
        'any-overlap',
      );
      if (!validation.ok) {
        if (validation.past.length > 0) {
          toast.warning('Invalid time', 'You cannot schedule a lesson in the past.');
        } else {
          toast.warning(
            'Time slot unavailable',
            inSeries
              ? 'At least one lesson in this series would overlap another lesson.'
              : 'This time slot is already booked.',
          );
        }
        return false;
      }
      setLessons((prev) => applyLessonSeriesUpdatesLocally(prev, validation.updates));
      return true;
    },
    [lessons, setLessons, onLessonCreated],
  );

  const submitModal = useCallback(async (formOverride?: LessonFormState) => {
    const activeForm = formOverride ?? form;
    if (!activeForm || saving) return;
    const candidate = buildLessonCandidate(activeForm, lessons, editingLesson);
    if (!canManageLessons) candidate.statusId = LESSON_STATUS.planned.id;

    const inSeries = Boolean(editingLesson?.seriesId);
    const scheduleValidation = editingLesson
      ? validateLessonScheduleUpdates(lessons, editingLesson, candidate, 'any-overlap')
      : validateLessonScheduleUpdates(lessons, null, candidate, 'any-overlap');

    if (!scheduleValidation.ok) {
      if (scheduleValidation.past.length > 0) {
        toast.warning('Invalid time', 'You cannot schedule a lesson in the past.');
      } else {
        toast.warning(
          'Time slot unavailable',
          inSeries
            ? 'At least one lesson in this series would overlap another lesson.'
            : 'This time slot is already booked.',
        );
      }
      return;
    }

    if (canManageLessons) {
      setSaving(true);
      let keepModalOpenAfterSave = false;
      try {
        if (editingLesson) {
          const persisted = await persistLessonSeriesUpdates({
            updates: scheduleValidation.updates,
            lessons,
            persistUpdate,
            setLessons,
            primaryLessonId: editingLesson.id,
          });
          if (persisted) {
            setEditingLesson(persisted);
            setForm(toLessonFormState(persisted));
          } else if (!tryApplyLesson(candidate, editingLesson)) {
            return;
          }
        } else {
          const persisted = await createRecurringLessons({
            form: activeForm,
            candidate,
            lessons,
            persistCreate,
            setLessons,
            onLessonCreated,
          });
          if (!persisted) {
            toast.warning('Time slot unavailable', 'No open slots for this recurrence pattern.');
            return;
          }
          setEditingLesson(persisted);
          setModalMode('edit');
          setForm(toLessonFormState(persisted));
          keepModalOpenAfterSave = true;
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

    if (!editingLesson && activeForm.recurrence !== 'none') {
      applyRecurringLessonsLocally({
        form: activeForm,
        candidate,
        tryApplyLesson,
        editingLesson,
      });
    } else if (!tryApplyLesson(candidate, editingLesson ?? undefined)) {
      return;
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
    if (!editingLesson?.seriesId || !form) return;
    await confirmDialog({
      title: 'Unlink from series?',
      message:
        'Only this lesson will be detached; other lessons in the series stay linked.',
      confirmLabel: 'Unlink',
      loadingLabel: 'Unlinking…',
      onConfirm: async () => {
        const unlinkedCandidate = {
          ...buildLessonCandidate(
            { ...form, recurrence: 'none', weeklyDays: [] },
            lessons,
            editingLesson,
          ),
          seriesId: undefined,
        };

        try {
          if (canManageLessons && getLessonBackendId(editingLesson)) {
            const persisted = await persistUpdate(unlinkedCandidate, editingLesson, {
              includeLessonContent: false,
            });
            if (persisted) {
              setLessons((prev) =>
                prev.map((lesson) => (lesson.id === editingLesson.id ? persisted : lesson)),
              );
              setEditingLesson(persisted);
              setForm(toLessonFormState(persisted));
              return;
            }
          }
        } catch (error) {
          toast.error('Could not unlink lesson', persistenceErrorMessage(error));
          throw error;
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
          prev ? { ...prev, recurrence: 'none', weeklyDays: [] } : prev,
        );
      },
    });
  }, [canManageLessons, editingLesson, form, lessons, persistUpdate, persistenceErrorMessage, setLessons]);

  const handleDeleteSeries = useCallback(async () => {
    if (!editingLesson?.seriesId) return;
    const plannedInSeries = getPlannedLessonsInSeries(lessons, editingLesson.seriesId);
    if (plannedInSeries.length === 0) {
      toast.info('No planned lessons', 'Completed or cancelled lessons in this series are kept.');
      return;
    }
    await confirmDialog({
      title: 'Delete planned lessons in series?',
      message: `This will permanently delete ${plannedInSeries.length} planned lesson${plannedInSeries.length === 1 ? '' : 's'}. Completed and cancelled lessons stay.`,
      confirmLabel: 'Delete all',
      loadingLabel: 'Deleting…',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { removedIds } = await deleteScheduledLessonSeries({
            lessons,
            seriesId: editingLesson.seriesId!,
            canManage: canManageLessons,
            deleteScheduledLesson,
          });
          const removed = new Set(removedIds);
          setLessons((prev) => prev.filter((lesson) => !removed.has(lesson.id)));
          closeModal();
        } catch (error) {
          toast.error('Could not delete series', persistenceErrorMessage(error));
          throw error;
        }
      },
    });
  }, [
    canManageLessons,
    closeModal,
    deleteScheduledLesson,
    editingLesson,
    lessons,
    persistenceErrorMessage,
    setLessons,
  ]);

  const handleDeleteLesson = useCallback(async () => {
    if (!editingLesson) return;
    const id = editingLesson.id;
    await confirmDialog({
      title: 'Delete lesson?',
      message: 'This lesson will be permanently deleted.',
      confirmLabel: 'Delete',
      loadingLabel: 'Deleting…',
      variant: 'danger',
      onConfirm: async () => {
        const backendId = getLessonBackendId(editingLesson);
        try {
          if (canManageLessons && backendId) {
            await deleteScheduledLesson(backendId);
          }
        } catch (error) {
          toast.error('Could not delete lesson', persistenceErrorMessage(error));
          throw error;
        }
        setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
        onAfterDelete?.(id);
        closeModal();
      },
    });
  }, [
    canManageLessons,
    deleteScheduledLesson,
    editingLesson,
    persistenceErrorMessage,
    setLessons,
    onAfterDelete,
    closeModal,
  ]);

  const lessonBackendId = editingLesson ? getLessonBackendId(editingLesson) ?? null : null;
  const persistedLessonId = editingLesson?.id ?? null;
  const studentBackendId = form
    ? resolvePartyBackendId(form.studentId, studentOptions, teacherOptions) ?? null
    : null;
  const recurrenceAllowed = form
    ? isRecurrenceAllowedForStudent(form.studentId, studentOptions)
    : true;

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
    setForm: updateForm,
    openCreateModal,
    openEditModal,
    closeModal,
    submitModal,
    saveStudentResponse,
    handleUnlinkSeries,
    handleDeleteSeries,
    handleDeleteLesson,
    recurrenceAllowed,
    saving,
  };
}
