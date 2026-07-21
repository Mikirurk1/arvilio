import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { isAdminOrSuper } from '../../lib/roles';
import { USER_ROLE } from '@pkg/types';
import { useActiveUser } from '../../lib/active-user';
import { buildCalendarSeriesCopy, useCampusT } from '../../lib/cms';
import { moveLessonToViewerCalendarDay, viewerSlotToLessonWall } from '../../lib/lessonTime';
import { toLessonFormState } from '../../features/calendar/adapters/lessonCalendarAdapter';
import { buildLessonCandidate, resolvePartyBackendId } from '../../features/lesson-modal/lessonPersistence';
import { syncLessonFormChange } from '../../features/lesson-modal/lesson-form-sync';
import { getLessonBackendId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import {
  applyRecurringLessonsLocally,
  createRecurringLessons,
} from '../../features/lesson-modal/recurring-lesson-create';
import {
  applyLessonSeriesUpdatesLocally,
  persistLessonSeriesUpdates,
  persistSeriesScheduleChanges,
  validateLessonScheduleUpdates,
  validateSeriesTimeUpdates,
} from '../../features/lesson-modal/series-lesson-update';
import { unlinkLessonFields } from '../../lib/lesson-series';
import { hasTimeConflict, isPastSlot } from '../../features/calendar/rules/conflicts';
import type { LessonFormState, LessonModalMode } from '../../features/calendar/types';
import type { LessonPartyOption } from '../../hooks/use-lesson-party-options';
import { defaultCreateLessonStartTime } from '../../lib/lessonTime';

interface UseCalendarLessonActionsOptions {
  lessons: ScheduledLessonDto[];
  setLessons: React.Dispatch<React.SetStateAction<ScheduledLessonDto[]>>;
  canManage: boolean;
  conflictStrategy: 'same-teacher-overlap' | 'any-overlap';
  viewerIana: string;
  viewerTimezoneId: number;
  currentUserNumericId: number | null;
  studentOptions: LessonPartyOption[];
  assignableTeachers: LessonPartyOption[];
  defaultTeacher: LessonPartyOption | null | undefined;
  defaultStudent: LessonPartyOption | null | undefined;
  persistCreate: (candidate: ScheduledLessonDto) => Promise<ScheduledLessonDto>;
  persistUpdate: (next: ScheduledLessonDto, before: ScheduledLessonDto, opts?: { includeLessonContent?: boolean }) => Promise<ScheduledLessonDto | null>;
  persistScheduleUpdate: (next: ScheduledLessonDto, before: ScheduledLessonDto) => Promise<ScheduledLessonDto | null>;
  persistenceErrorMessage: (error: unknown) => string;
  studentTeacherChatPeerId: string | null | undefined;
  showAudienceToggle: boolean;
  setAudience: (v: 'all' | 'my-students') => void;
  setTeacherFilter: (v: string) => void;
  setConflictDialog: (v: { open: boolean; title: string; message?: string; candidate: ScheduledLessonDto; excludeLessonId?: number } | null) => void;
  setWarningDialog: (v: { open: boolean; title: string; message: string } | null) => void;
  setSeriesScheduleConfirm: (v: { type: 'detach' | 'applyAll'; before: ScheduledLessonDto; next: ScheduledLessonDto } | null) => void;
}

export function useCalendarLessonActions({
  lessons, setLessons, canManage, conflictStrategy, viewerIana, viewerTimezoneId,
  currentUserNumericId, studentOptions, assignableTeachers, defaultTeacher, defaultStudent,
  persistCreate, persistUpdate, persistScheduleUpdate, persistenceErrorMessage,
  studentTeacherChatPeerId, showAudienceToggle: _showAudienceToggle, setAudience: _setAudience, setTeacherFilter: _setTeacherFilter,
  setConflictDialog, setWarningDialog, setSeriesScheduleConfirm,
}: UseCalendarLessonActionsOptions) {
  const router = useRouter();
  const activeUser = useActiveUser();
  const t = useCampusT();
  const [savingLesson, setSavingLesson] = useState(false);
  const [modalMode, setModalMode] = useState<LessonModalMode>('create');
  const [editingLesson, setEditingLesson] = useState<ScheduledLessonDto | null>(null);
  const [form, setForm] = useState<LessonFormState | null>(null);
  const lessonsRef = useRef(lessons);
  lessonsRef.current = lessons;

  const seriesDialogText = buildCalendarSeriesCopy(t);

  const conflictBusyTitle = () => t('calendar.conflict.busyTitle');
  const conflictBusyMessage = (opts?: { inSeries?: boolean; create?: boolean }) => {
    if (opts?.inSeries) return t('calendar.conflict.seriesOverlap');
    if (conflictStrategy === 'same-teacher-overlap') return t('calendar.conflict.teacherBusy');
    return opts?.create ? t('calendar.conflict.slotBusyCreate') : t('calendar.conflict.slotBusy');
  };
  const pastScheduleWarning = () => ({
    open: true as const,
    title: t('calendar.conflict.pastTitle'),
    message: t('calendar.conflict.pastBody'),
  });
  const pastMoveWarning = () => ({
    open: true as const,
    title: t('calendar.conflict.pastMoveTitle'),
    message: t('calendar.conflict.pastMoveBody'),
  });

  const updateForm = useCallback(
    (next: LessonFormState) => { syncLessonFormChange(next, editingLesson, setForm, setLessons, setEditingLesson); },
    [editingLesson, setLessons],
  );

  const scheduleUnchanged = (before: ScheduledLessonDto, after: ScheduledLessonDto) =>
    before.date === after.date && before.startTime === after.startTime && before.endTime === after.endTime && before.duration === after.duration;

  const showScheduleConflict = (validation: ReturnType<typeof validateLessonScheduleUpdates>, inSeries: boolean) => {
    if (validation.ok) return;
    if (validation.past.length > 0) {
      setWarningDialog(pastScheduleWarning());
      return;
    }
    const first = validation.conflicts[0];
    if (!first) return;
    setConflictDialog({
      open: true, title: conflictBusyTitle(),
      message: conflictBusyMessage({ inSeries, create: true }),
      candidate: first.occurrence, excludeLessonId: first.occurrence.id,
    });
  };

  const applyLessonUpdate = (nextLesson: ScheduledLessonDto, sourceLesson?: ScheduledLessonDto) => {
    if (!sourceLesson) {
      if (hasTimeConflict(lessons, nextLesson, undefined, conflictStrategy)) {
        setConflictDialog({ open: true, title: conflictBusyTitle(), message: conflictBusyMessage({ create: true }), candidate: nextLesson });
        return;
      }
      if (isPastSlot(nextLesson)) { setWarningDialog(pastScheduleWarning()); return; }
      setLessons((prev) => [...prev, nextLesson]);
      return;
    }
    const validation = validateLessonScheduleUpdates(lessons, sourceLesson, nextLesson, conflictStrategy);
    if (!validation.ok) { showScheduleConflict(validation, Boolean(sourceLesson.seriesId)); return; }
    setLessons((prev) => applyLessonSeriesUpdatesLocally(prev, validation.updates));
  };

  const persistScheduleChange = async (lessonId: number, before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    if (scheduleUnchanged(before, next)) return;
    setLessons((prev) => prev.map((l) => l.id === lessonId ? next : l));
    const backendId = getLessonBackendId(before);
    if (!canManage || !backendId) return;
    try {
      const persisted = await persistScheduleUpdate(next, before);
      if (persisted) setLessons((prev) => prev.map((l) => l.id === lessonId ? persisted : l));
    } catch (error) {
      setLessons((prev) => prev.map((l) => l.id === lessonId ? before : l));
      setWarningDialog({ open: true, title: t('calendar.warning.couldNotSaveTime'), message: persistenceErrorMessage(error) });
    }
  };

  const commitDetachAndMove = async (before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    const unlinked: ScheduledLessonDto = { ...next, ...unlinkLessonFields(before) };
    if (hasTimeConflict(lessonsRef.current, unlinked, before.id, conflictStrategy)) {
      setConflictDialog({ open: true, title: conflictBusyTitle(), message: conflictBusyMessage(), candidate: unlinked, excludeLessonId: before.id });
      return;
    }
    if (isPastSlot(unlinked)) { setWarningDialog(pastMoveWarning()); return; }
    setLessons((prev) => prev.map((l) => l.id === before.id ? unlinked : l));
    const backendId = getLessonBackendId(before);
    if (!canManage || !backendId) return;
    try {
      const persisted = await persistUpdate(unlinked, before, { includeLessonContent: false });
      if (persisted) setLessons((prev) => prev.map((l) => l.id === before.id ? persisted : l));
    } catch (error) {
      setLessons((prev) => prev.map((l) => l.id === before.id ? before : l));
      setWarningDialog({ open: true, title: t('calendar.warning.couldNotSave'), message: persistenceErrorMessage(error) });
    }
  };

  const commitApplyAllSchedule = async (before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    const validation = validateSeriesTimeUpdates(lessonsRef.current, before, { startTime: next.startTime, endTime: next.endTime, duration: next.duration, timezoneId: next.timezoneId }, conflictStrategy);
    if (!validation.ok) {
      showScheduleConflict(validation, true);
      setLessons((prev) => prev.map((l) => l.id === before.id ? before : l));
      return;
    }
    setLessons((prev) => applyLessonSeriesUpdatesLocally(prev, validation.updates));
    if (!canManage) return;
    try {
      await persistSeriesScheduleChanges({ updates: validation.updates, lessons: lessonsRef.current, persistScheduleUpdate, setLessons });
    } catch (error) {
      setLessons((prev) => prev.map((l) => { const orig = lessonsRef.current.find((r) => r.id === l.id); return orig ?? l; }));
      setWarningDialog({ open: true, title: t('calendar.warning.couldNotSaveTime'), message: persistenceErrorMessage(error) });
    }
  };

  const requestScheduleChange = (before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    if (scheduleUnchanged(before, next)) return;
    if (before.seriesId) {
      if (next.date !== before.date) { setSeriesScheduleConfirm({ type: 'detach', before, next }); return; }
      setSeriesScheduleConfirm({ type: 'applyAll', before, next });
      return;
    }
    if (hasTimeConflict(lessonsRef.current, next, before.id, conflictStrategy)) {
      setConflictDialog({ open: true, title: conflictBusyTitle(), message: conflictBusyMessage(), candidate: next, excludeLessonId: before.id });
      return;
    }
    if (isPastSlot(next)) { setWarningDialog(pastMoveWarning()); return; }
    void persistScheduleChange(before.id, before, next);
  };

  const buildMovedLesson = (lesson: ScheduledLessonDto, date: string, startTime?: string): ScheduledLessonDto => {
    const wall = startTime !== undefined
      ? viewerSlotToLessonWall(date, startTime, lesson.duration, viewerIana, lesson.timezoneId)
      : moveLessonToViewerCalendarDay(lesson, date, viewerIana);
    return { ...lesson, date: wall.date, startTime: wall.startTime, endTime: wall.endTime, statusId: canManage ? lesson.statusId : LESSON_STATUS.planned.id };
  };

  const moveLesson = (lessonId: number, date: string, startTime?: string) => {
    const before = lessonsRef.current.find((l) => l.id === lessonId);
    if (!before) return;
    requestScheduleChange(before, buildMovedLesson(before, date, startTime));
  };

  const openCreateModal = (date: string) => {
    const { startTime } = defaultCreateLessonStartTime(viewerIana, date);
    const teacher = isAdminOrSuper(activeUser.role) ? defaultTeacher : defaultTeacher ?? { id: currentUserNumericId ?? activeUser.id, fullName: activeUser.fullName, backendId: '', timezoneIana: viewerIana, scheduleType: true };
    const student = activeUser.role === USER_ROLE.student.id
      ? { id: currentUserNumericId ?? activeUser.id, fullName: activeUser.fullName, backendId: '', timezoneIana: viewerIana, scheduleType: true }
      : defaultStudent;
    setModalMode('create');
    setEditingLesson(null);
    setForm({
      title: t('calendar.defaultLessonTitle'), date, startTime, duration: 55,
      teacherId: teacher?.id ?? activeUser.id, teacherName: teacher?.fullName ?? activeUser.fullName,
      studentId: student?.id ?? activeUser.id, studentName: student?.fullName ?? activeUser.fullName,
      notes: '', lessonPlan: '', materials: [], homeworkText: '', homeworkFiles: [],
      studentResponseText: '', studentResponseFiles: [], studentResponseStatus: 'not_submitted',
      homeworkChecked: false, teacherHomeworkFeedback: '', linkedWordIds: [],
      statusId: LESSON_STATUS.planned.id, credited: false, recurrence: 'none', weeklyDays: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timezoneId: viewerTimezoneId as any, kind: 'individual',
      participantIds: [student?.id ?? activeUser.id],
      groupBillingMode: 'per_member', groupPriceMinor: 0, groupCurrency: 'UAH',
      groupSplitMode: 'equal_split', groupPayerUserId: student?.id ?? activeUser.id, studentGroupId: null,
    });
  };

  const openEditModal = (lesson: ScheduledLessonDto) => { setModalMode('edit'); setEditingLesson(lesson); setForm(toLessonFormState(lesson)); };
  const closeModal = () => { setForm(null); setEditingLesson(null); };

  const requestLesson = () => {
    if (!studentTeacherChatPeerId) {
      setWarningDialog({ open: true, title: t('calendar.warning.noTeacherTitle'), message: t('calendar.warning.noTeacherBody') });
      return;
    }
    router.push(`/chat?peer=${encodeURIComponent(studentTeacherChatPeerId)}`);
  };

  const submitModal = async (formOverride?: LessonFormState) => {
    const activeForm = formOverride ?? form;
    if (!activeForm || savingLesson) return;
    const candidate = buildLessonCandidate(activeForm, lessons, editingLesson);
    if (!canManage) candidate.statusId = LESSON_STATUS.planned.id;
    const inSeries = Boolean(editingLesson?.seriesId);
    const scheduleValidation = editingLesson
      ? validateLessonScheduleUpdates(lessons, editingLesson, candidate, conflictStrategy)
      : validateLessonScheduleUpdates(lessons, null, candidate, conflictStrategy);
    if (!scheduleValidation.ok) { showScheduleConflict(scheduleValidation, inSeries); return; }
    if (canManage) {
      setSavingLesson(true);
      let keepModalOpenAfterSave = false;
      try {
        if (editingLesson) {
          const persisted = await persistLessonSeriesUpdates({ updates: scheduleValidation.updates, lessons, persistUpdate, setLessons, primaryLessonId: editingLesson.id });
          if (persisted) { setEditingLesson(persisted); setForm(toLessonFormState(persisted)); }
          else applyLessonUpdate(candidate, editingLesson);
        } else {
          const persisted = await createRecurringLessons({ form: activeForm, candidate, lessons, persistCreate, setLessons, conflictStrategy });
          if (!persisted) { setWarningDialog({ open: true, title: conflictBusyTitle(), message: t('calendar.conflict.noRecurrenceSlots') }); return; }
          setEditingLesson(persisted); setModalMode('edit'); setForm(toLessonFormState(persisted));
          keepModalOpenAfterSave = true;
        }
      } catch (error) {
        const message = persistenceErrorMessage(error);
        const needsGoogle = message.includes('sign in with Google') && message.includes('Calendar');
        setWarningDialog({ open: true, title: needsGoogle ? t('calendar.warning.googleRequired') : t('calendar.warning.couldNotSave'), message });
        return;
      } finally { setSavingLesson(false); }
      if (!keepModalOpenAfterSave) closeModal();
      return;
    }
    if (!editingLesson && activeForm.recurrence !== 'none') {
      applyRecurringLessonsLocally({ form: activeForm, candidate, tryApplyLesson: (l, s) => { applyLessonUpdate(l, s); return true; }, editingLesson });
    } else {
      applyLessonUpdate(candidate, editingLesson ?? undefined);
    }
    closeModal();
  };

  const saveStudentResponse = () => {
    if (!form || !editingLesson) return;
    const nextResponse = { ...(editingLesson.studentResponse ?? { text: '', files: [] }), text: form.studentResponseText, files: form.studentResponseFiles, status: form.studentResponseStatus, homeworkChecked: form.homeworkChecked, teacherHomeworkFeedback: form.teacherHomeworkFeedback };
    setLessons((prev) => prev.map((l) => l.id === editingLesson.id ? { ...l, studentResponse: nextResponse } : l));
    setEditingLesson((prev) => prev ? { ...prev, studentResponse: nextResponse } : prev);
  };

  return {
    savingLesson, modalMode, editingLesson, setEditingLesson, form, setForm,
    seriesDialogText, lessonsRef,
    updateForm, scheduleUnchanged, persistScheduleChange,
    openCreateModal, openEditModal, closeModal, requestLesson,
    submitModal, saveStudentResponse,
    applyLessonUpdate, moveLesson, requestScheduleChange,
    commitDetachAndMove, commitApplyAllSchedule,
    resolvePartyBackendId: (studentId: number) => resolvePartyBackendId(studentId, studentOptions, assignableTeachers),
  };
}
