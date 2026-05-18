'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { LESSON_STATUS } from '@soenglish/shared-types';
import { Button, PageHeader } from '../../components/ui';
import {
  canSchedule,
  canView,
  getProfileByUserId,
  getVisibleProfiles,
  isAdminOrSuper,
  siteContent,
  USER_ROLE,
} from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { CalendarHeaderControls, CalendarMonthNavigator, SelectedDateSidebar } from './sections';
import { readLessonDragPayload, writeLessonDragPayload } from '../../features/calendar/dnd/dragPayload';
import {
  defaultCreateLessonStartTime,
  getIanaForTimeZoneId,
  lessonDateKeyInZone,
  lessonEndUtc,
  lessonEndTimeInZone,
  lessonStartTimeInZone,
  lessonStartUtc,
  moveLessonToViewerCalendarDay,
  viewerSlotToLessonWall,
} from '../../lib/lessonTime';
import {
  calculateEndTime,
  toLessonFormState,
} from '../../features/calendar/adapters/lessonCalendarAdapter';
import { buildLessonCandidate, resolvePartyBackendId } from '../../features/lesson-modal/lessonPersistence';
import { syncLessonFormChange } from '../../features/lesson-modal/lesson-form-sync';
import {
  getLessonBackendId,
  upsertScheduledLesson,
} from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useScheduledLessonPersistence } from '../../hooks/use-scheduled-lesson-persistence';
import { hasTimeConflict, isPastSlot } from '../../features/calendar/rules/conflicts';
import { LessonModal } from '../../features/lesson-modal';
import { useLessonCalendarState } from '../../features/calendar/ui/useLessonCalendarState';
import type { LessonFormState, LessonModalMode } from '../../features/calendar/types';
import styles from './page.module.scss';
type StudentColor = 'Blue' | 'Green' | 'Amber' | 'Purple';
const STUDENT_COLOR_PALETTE: StudentColor[] = ['Blue', 'Green', 'Amber', 'Purple'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function isDateBeforeToday(dateStr: string): boolean {
  const today = toDateString(new Date());
  return dateStr < today;
}

function isLessonInPast(lesson: ScheduledLessonDto): boolean {
  return lessonStartUtc(lesson).getTime() < Date.now();
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

type WeekEventLayout = {
  columnIndex: number;
  columnsTotal: number;
};

function buildWeekEventLayout(lessons: ScheduledLessonDto[]): Record<number, WeekEventLayout> {
  const sorted = [...lessons].sort((a, b) => {
    const diff = toMinutes(a.startTime) - toMinutes(b.startTime);
    if (diff !== 0) return diff;
    return a.duration - b.duration;
  });

  const layout: Record<number, WeekEventLayout> = {};
  const groupEvents: ScheduledLessonDto[] = [];
  let groupMaxColumnCount = 0;

  const active: Array<{ lesson: ScheduledLessonDto; columnIndex: number; endMinutes: number }> = [];
  const groupAssignment = new Map<number, number>();

  sorted.forEach((lesson, index) => {
    const startMinutes = toMinutes(lesson.startTime);
    const endMinutes = startMinutes + lesson.duration;

    for (let i = active.length - 1; i >= 0; i -= 1) {
      if (active[i].endMinutes <= startMinutes) {
        active.splice(i, 1);
      }
    }

    const startsNewGroup = active.length === 0 && index > 0 && groupEvents.length > 0;
    if (startsNewGroup) {
      const columnsTotal = Math.max(1, groupMaxColumnCount);
      groupEvents.forEach((groupLesson) => {
        const columnIndex = groupAssignment.get(groupLesson.id) ?? 0;
        layout[groupLesson.id] = { columnIndex, columnsTotal };
      });
      groupEvents.length = 0;
      groupAssignment.clear();
      groupMaxColumnCount = 0;
    }

    const usedColumns = new Set(active.map((item) => item.columnIndex));
    let columnIndex = 0;
    while (usedColumns.has(columnIndex)) columnIndex += 1;

    active.push({ lesson, columnIndex, endMinutes });
    groupEvents.push(lesson);
    groupAssignment.set(lesson.id, columnIndex);
    groupMaxColumnCount = Math.max(groupMaxColumnCount, active.length);
  });

  if (groupEvents.length > 0) {
    const columnsTotal = Math.max(1, groupMaxColumnCount);
    groupEvents.forEach((groupLesson) => {
      const columnIndex = groupAssignment.get(groupLesson.id) ?? 0;
      layout[groupLesson.id] = { columnIndex, columnsTotal };
    });
  }

  return layout;
}

export default function CalendarPage() {
  const activeUser = useActiveUser();
  if (!canView('calendar', activeUser.role)) return null;
  const viewerIana = getIanaForTimeZoneId(activeUser.timezoneId);
  const {
    studentOptions,
    teacherOptions: assignableTeachers,
    defaultTeacher,
    defaultStudent,
    currentUserNumericId,
  } = useLessonPartyOptions();
  const viewerPartyNumericId = currentUserNumericId ?? activeUser.id;
  const {
    lessons,
    setLessons,
    role,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    visibleLessons,
  } = useLessonCalendarState(activeUser.role, viewerPartyNumericId);
  const { persistCreate, persistUpdate, persistScheduleUpdate, persistenceErrorMessage } =
    useScheduledLessonPersistence();
  const [savingLesson, setSavingLesson] = useState(false);
  const [audience, setAudience] = useState<'all' | 'my-students'>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all-teachers');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [modalMode, setModalMode] = useState<LessonModalMode>('create');
  const [editingLesson, setEditingLesson] = useState<ScheduledLessonDto | null>(null);
  const [form, setForm] = useState<LessonFormState | null>(null);
  const updateForm = useCallback(
    (next: LessonFormState) => {
      syncLessonFormChange(next, editingLesson, setForm, setLessons, setEditingLesson);
    },
    [editingLesson, setLessons],
  );
  const canManage = canSchedule('calendar', role);
  const showAudienceToggle = isAdminOrSuper(role);
  const conflictStrategy = showAudienceToggle && audience === 'all' ? 'same-teacher-overlap' : 'any-overlap';
  const teacherFilterOptions = useMemo(
    () =>
      Array.from(
        new Map(visibleLessons.map((lesson) => [lesson.teacherId, lesson.teacherName])).entries(),
      ).map(([id, name]) => ({ id, name })),
    [visibleLessons],
  );
  const scopedLessons = useMemo(() => {
    if (!showAudienceToggle) return visibleLessons;
    if (audience === 'my-students') {
      // Only teachers have their own teaching roster; admins are not a teacherId on lessons.
      if (activeUser.role === USER_ROLE.teacher.id) {
        return visibleLessons.filter((lesson) => lesson.teacherId === viewerPartyNumericId);
      }
      return visibleLessons;
    }
    if (teacherFilter !== 'all-teachers') {
      return visibleLessons.filter((lesson) => lesson.teacherId === Number(teacherFilter));
    }
    return visibleLessons;
  }, [audience, showAudienceToggle, teacherFilter, visibleLessons]);
  const visibleStudents = useMemo(
    () => getVisibleProfiles(role, activeUser.id),
    [role, activeUser.id],
  );
  const studentColorById = useMemo(() => {
    const m = new Map<number, string | undefined>();
    for (const student of visibleStudents) {
      m.set(student.id, student.color?.trim() || undefined);
    }
    return m;
  }, [visibleStudents]);
  const isHexColor = (value?: string) => Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));
  const colorHexFromStudentId = (studentId: number): string | null => {
    const colorHex = studentColorById.get(studentId) ?? getProfileByUserId(studentId)?.color;
    return isHexColor(colorHex) ? colorHex! : null;
  };
  const colorFromStudentId = (studentId: number): StudentColor => {
    const colorHex = colorHexFromStudentId(studentId);
    if (colorHex) {
      const hex = colorHex.toLowerCase();
      if (hex === '#16a97a') return 'Green';
      if (hex === '#f59e0b') return 'Amber';
      if (hex === '#8b5cf6') return 'Purple';
      return 'Blue';
    }
    const key = String(studentId);
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return STUDENT_COLOR_PALETTE[hash % STUDENT_COLOR_PALETTE.length];
  };
  const getLessonColor = (lesson: ScheduledLessonDto): StudentColor => colorFromStudentId(lesson.studentId);
  const lessonColorStyles = (lesson: ScheduledLessonDto) => {
    const hex = colorHexFromStudentId(lesson.studentId);
    if (!hex) return {};
    return {
      backgroundColor: `${hex}1A`,
      borderLeftColor: hex,
    };
  };
  const lessonsOnDate = (date: string) =>
    scopedLessons.filter((lesson) => lessonDateKeyInZone(lesson, viewerIana) === date);
  const selectedLessons = selectedDate ? lessonsOnDate(selectedDate) : [];
  const daysCount = new Date(year, month + 1, 0).getDate();
  const firstDow = ((new Date(year, month, 1).getDay() + 6) % 7) as number;
  const today = toDateString(new Date());
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const weekStart = (() => {
    const base = selectedDate ? new Date(selectedDate) : new Date(year, month, 1);
    const dow = base.getDay() === 0 ? 6 : base.getDay() - 1;
    const start = new Date(base);
    start.setDate(base.getDate() - dow);
    return start;
  })();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });
  const shiftWeek = (direction: -1 | 1) => {
    const base = selectedDate ? new Date(selectedDate) : weekStart;
    const next = new Date(base);
    next.setDate(base.getDate() + 7 * direction);
    setSelectedDate(toDateString(next));
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };
  const startHour = 0;
  const endHour = 24;
  const minutesPerDay = (endHour - startHour) * 60;
  const pxPerMinute = 1.2;
  const dayColumnHeight = minutesPerDay * pxPerMinute;
  const hourMarks = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

  const [resizeState, setResizeState] = useState<{
    lessonId: number;
    edge: 'top' | 'bottom';
    originY: number;
    snapshot: ScheduledLessonDto;
    initialDuration: number;
    /** Top resize: week column date + start time in the viewer’s zone. */
    viewerDate: string;
    initialViewerStartMinutes: number;
  } | null>(null);
  const lessonsRef = useRef(lessons);
  const [draggingLessonId, setDraggingLessonId] = useState<number | null>(null);
  const resizedRef = useRef(false);
  const previewResizeRef = useRef<{ lessonId: number; startTime: string; duration: number } | null>(null);
  const suppressDragRef = useRef(false);
  const [monthGhostDate, setMonthGhostDate] = useState<string | null>(null);
  const [weekGhost, setWeekGhost] = useState<{
    lessonId: number;
    date: string;
    startTime: string;
    duration: number;
    title: string;
  } | null>(null);
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    title: string;
    message?: string;
    candidate: ScheduledLessonDto;
    excludeLessonId?: number;
  } | null>(null);
  const [warningDialog, setWarningDialog] = useState<{ open: boolean; title: string; message: string } | null>(
    null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);
  useEffect(() => {
    lessonsRef.current = lessons;
  }, [lessons]);

  const getConflictingLessons = (params: {
    candidate: ScheduledLessonDto;
    excludeLessonId?: number;
  }) => {
    const c0 = lessonStartUtc(params.candidate).getTime();
    const c1 = lessonEndUtc(params.candidate).getTime();
    return lessons
      .filter((lesson) => lesson.id !== params.excludeLessonId)
      .filter((lesson) =>
        conflictStrategy === 'same-teacher-overlap'
          ? lesson.teacherId === params.candidate.teacherId
          : true,
      )
      .filter((lesson) => {
        const l0 = lessonStartUtc(lesson).getTime();
        const l1 = lessonEndUtc(lesson).getTime();
        return c0 < l1 && c1 > l0;
      })
      .sort((a, b) => lessonStartUtc(a).getTime() - lessonStartUtc(b).getTime());
  };

  const openCreateModal = (date: string) => {
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
  };
  const requestLesson = () => {
    setWarningDialog({
      open: true,
      title: 'Request lesson',
      message: 'This button will redirect to teacher chat soon. For now, lesson request chat is not connected yet.',
    });
  };

  const openEditModal = (lesson: ScheduledLessonDto) => {
    setModalMode('edit');
    setEditingLesson(lesson);
    setForm(toLessonFormState(lesson));
  };

  const closeModal = () => {
    setForm(null);
    setEditingLesson(null);
  };

  const applyLessonUpdate = (nextLesson: ScheduledLessonDto, sourceLesson?: ScheduledLessonDto) => {
    if (hasTimeConflict(lessons, nextLesson, sourceLesson?.id, conflictStrategy)) {
      setConflictDialog({
        open: true,
        title: 'Time slot is busy',
        message:
          conflictStrategy === 'same-teacher-overlap'
            ? 'This teacher already has a lesson in this time slot.'
            : 'You cannot create or move a lesson to this time because another lesson already exists.',
        candidate: nextLesson,
        excludeLessonId: sourceLesson?.id,
      });
      return;
    }
    if (isPastSlot(nextLesson)) {
      setWarningDialog({
        open: true,
        title: 'Cannot schedule in the past',
        message: 'You cannot create or move a lesson to a past date or time.',
      });
      return;
    }
    if (!sourceLesson) {
      setLessons((prev) => [...prev, nextLesson]);
      return;
    }
    if (form?.applyToSeries && sourceLesson.seriesId) {
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.seriesId === sourceLesson.seriesId
            ? {
                ...lesson,
                title: nextLesson.title,
                duration: nextLesson.duration,
                recurrence: nextLesson.recurrence,
                weeklyDays: nextLesson.weeklyDays,
                notes: nextLesson.notes,
                startTime: nextLesson.startTime,
                endTime: nextLesson.endTime,
              }
            : lesson,
        ),
      );
      return;
    }
    setLessons((prev) => prev.map((lesson) => (lesson.id === sourceLesson.id ? nextLesson : lesson)));
  };

  const submitModal = async () => {
    if (!form || savingLesson) return;
    const candidate = buildLessonCandidate(form, lessons, editingLesson);
    if (!canManage) candidate.statusId = LESSON_STATUS.planned.id;

    if (hasTimeConflict(lessons, candidate, editingLesson?.id, conflictStrategy)) {
      setConflictDialog({
        open: true,
        title: 'Time slot is busy',
        message:
          conflictStrategy === 'same-teacher-overlap'
            ? 'This teacher already has a lesson in this time slot.'
            : 'You cannot create or move a lesson to this time because another lesson already exists.',
        candidate,
        excludeLessonId: editingLesson?.id,
      });
      return;
    }
    if (isPastSlot(candidate)) {
      setWarningDialog({
        open: true,
        title: 'Cannot schedule in the past',
        message: 'You cannot create or move a lesson to a past date or time.',
      });
      return;
    }

    if (canManage) {
      setSavingLesson(true);
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
          } else {
            applyLessonUpdate(candidate, editingLesson);
          }
        } else {
          const persisted = await persistCreate(candidate);
          setLessons((prev) => upsertScheduledLesson(prev, persisted));
          setEditingLesson(persisted);
          setModalMode('edit');
          setForm(toLessonFormState(persisted));
          keepModalOpenAfterSave = true;

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

            for (const branch of clones) {
              if (hasTimeConflict(lessons, branch, undefined, conflictStrategy)) continue;
              if (isPastSlot(branch)) continue;
              const clonePersisted = await persistCreate(branch);
              setLessons((prev) => upsertScheduledLesson(prev, clonePersisted));
            }
          }
        }
      } catch (error) {
        const message = persistenceErrorMessage(error);
        const needsGoogle =
          message.includes('sign in with Google') && message.includes('Calendar');
        setWarningDialog({
          open: true,
          title: needsGoogle ? 'Google Calendar required' : 'Could not save lesson',
          message,
        });
        return;
      } finally {
        setSavingLesson(false);
      }
      if (!keepModalOpenAfterSave) closeModal();
      return;
    }

    applyLessonUpdate(candidate, editingLesson ?? undefined);
    if (!editingLesson && form.recurrence === 'weekly' && form.weeklyDays.length > 0) {
      const baseDate = new Date(form.date);
      let cloneOffset = 1;
      const seq = candidate.id;
      form.weeklyDays.forEach((weekday, index) => {
        if (index === 0) return;
        const delta = (weekday - (baseDate.getDay() === 0 ? 7 : baseDate.getDay()) + 7) % 7;
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + delta);
        const branch = {
          ...candidate,
          id: seq + cloneOffset,
          date: toDateString(nextDate),
        };
        cloneOffset += 1;
        applyLessonUpdate(branch, undefined);
      });
    }
    closeModal();
  };

  const saveStudentResponse = () => {
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
          ? { ...lesson, studentResponse: nextResponse }
          : lesson,
      ),
    );
    setEditingLesson((prev) =>
      prev ? { ...prev, studentResponse: nextResponse } : prev,
    );
  };

  const scheduleUnchanged = (before: ScheduledLessonDto, after: ScheduledLessonDto) =>
    before.date === after.date &&
    before.startTime === after.startTime &&
    before.endTime === after.endTime &&
    before.duration === after.duration;

  const buildMovedLesson = (
    lesson: ScheduledLessonDto,
    date: string,
    startTime?: string,
  ): ScheduledLessonDto => {
    const wall =
      startTime !== undefined
        ? viewerSlotToLessonWall(date, startTime, lesson.duration, viewerIana, lesson.timezoneId)
        : moveLessonToViewerCalendarDay(lesson, date, viewerIana);
    return {
      ...lesson,
      date: wall.date,
      startTime: wall.startTime,
      endTime: wall.endTime,
      statusId: canManage ? lesson.statusId : LESSON_STATUS.planned.id,
    };
  };

  const persistScheduleChange = async (
    lessonId: number,
    before: ScheduledLessonDto,
    next: ScheduledLessonDto,
  ) => {
    if (scheduleUnchanged(before, next)) return;

    setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? next : lesson)));

    const backendId = getLessonBackendId(before);
    if (!canManage || !backendId) return;

    try {
      const persisted = await persistScheduleUpdate(next, before);
      if (persisted) {
        setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? persisted : lesson)));
      }
    } catch (error) {
      setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? before : lesson)));
      setWarningDialog({
        open: true,
        title: 'Could not save lesson time',
        message: persistenceErrorMessage(error),
      });
    }
  };

  const moveLesson = (lessonId: number, date: string, startTime?: string) => {
    const before = lessonsRef.current.find((lesson) => lesson.id === lessonId);
    if (!before) return;

    const next = buildMovedLesson(before, date, startTime);
    if (scheduleUnchanged(before, next)) return;

    if (hasTimeConflict(lessonsRef.current, next, lessonId, conflictStrategy)) {
      setConflictDialog({
        open: true,
        title: 'Time slot is busy',
        message:
          conflictStrategy === 'same-teacher-overlap'
            ? 'This teacher already has a lesson in this time slot.'
            : 'Another lesson already exists for this time.',
        candidate: next,
        excludeLessonId: lessonId,
      });
      return;
    }
    if (isPastSlot(next)) {
      setWarningDialog({
        open: true,
        title: 'Cannot move to past time',
        message: 'You cannot move a lesson to a past date or time.',
      });
      return;
    }

    void persistScheduleChange(lessonId, before, next);
  };

  const weekStartStr = toDateString(weekDays[0]);
  const weekEndStr = toDateString(weekDays[6]);
  const weekLessons = useMemo(
    () =>
      scopedLessons.filter((lesson) => {
        const key = lessonDateKeyInZone(lesson, viewerIana);
        return key >= weekStartStr && key <= weekEndStr;
      }),
    [scopedLessons, weekStartStr, weekEndStr, viewerIana],
  );
  const handleResizeMove = (event: MouseEvent) => {
    if (!resizeState) return;
    const deltaMinutes = Math.round((event.clientY - resizeState.originY) / (pxPerMinute * 15)) * 15;
    resizedRef.current = true;
    setLessons((prev) =>
      prev.map((lesson) => {
        if (lesson.id !== resizeState.lessonId) return lesson;
        if (resizeState.edge === 'bottom') {
          const nextDuration = Math.max(55, resizeState.initialDuration + deltaMinutes);
          previewResizeRef.current = { lessonId: lesson.id, startTime: lesson.startTime, duration: nextDuration };
          return {
            ...lesson,
            duration: nextDuration,
            endTime: calculateEndTime(lesson.startTime, nextDuration),
          };
        }
        const gridStart = startHour * 60;
        const startMinutes = resizeState.initialViewerStartMinutes + deltaMinutes;
        const minStart = gridStart;
        const maxStart = resizeState.initialViewerStartMinutes + resizeState.initialDuration - 55;
        const bounded = Math.max(minStart, Math.min(startMinutes, maxStart));
        const newDuration = resizeState.initialViewerStartMinutes + resizeState.initialDuration - bounded;
        const newH = Math.floor(bounded / 60);
        const newM = bounded % 60;
        const nextViewerTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
        const wall = viewerSlotToLessonWall(
          resizeState.viewerDate,
          nextViewerTime,
          newDuration,
          viewerIana,
          lesson.timezoneId,
        );
        previewResizeRef.current = { lessonId: lesson.id, startTime: wall.startTime, duration: newDuration };
        return {
          ...lesson,
          date: wall.date,
          startTime: wall.startTime,
          endTime: wall.endTime,
          duration: newDuration,
        };
      }),
    );
  };

  const stopResize = () => {
    const preview = previewResizeRef.current;
    const snapshot = resizeState?.snapshot ?? null;
    let persistAfterResize: { lessonId: number; before: ScheduledLessonDto; next: ScheduledLessonDto } | null =
      null;

    if (preview && snapshot) {
      setLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.id !== preview.lessonId) return lesson;
          const next: ScheduledLessonDto = {
            ...lesson,
            statusId: canManage ? lesson.statusId : LESSON_STATUS.planned.id,
          };
          if (hasTimeConflict(prev, next, lesson.id, conflictStrategy) || isPastSlot(next)) {
            if (hasTimeConflict(prev, next, lesson.id, conflictStrategy)) {
              setConflictDialog({
                open: true,
                title: 'Time slot is busy',
                message:
                  conflictStrategy === 'same-teacher-overlap'
                    ? 'This teacher already has a lesson in this time slot.'
                    : 'Another lesson already exists for this time.',
                candidate: next,
                excludeLessonId: lesson.id,
              });
            } else {
              setWarningDialog({
                open: true,
                title: 'Cannot resize into past time',
                message: 'Lesson duration cannot be changed into a past time slot.',
              });
            }
            return snapshot;
          }
          if (!scheduleUnchanged(snapshot, next)) {
            persistAfterResize = { lessonId: lesson.id, before: snapshot, next };
          }
          return next;
        }),
      );
    }

    if (persistAfterResize) {
      void persistScheduleChange(
        persistAfterResize.lessonId,
        persistAfterResize.before,
        persistAfterResize.next,
      );
    }

    setTimeout(() => {
      resizedRef.current = false;
      suppressDragRef.current = false;
    }, 0);
    previewResizeRef.current = null;
    setResizeState(null);
  };

  useEffect(() => {
    if (!resizeState) return undefined;
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', stopResize);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [resizeState]);

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={siteContent.calendar.title}
        subtitle={
          role === USER_ROLE.student.id
            ? 'Your personal lesson schedule'
            : `Teacher view — all students (${[...new Set(lessons.map((lesson) => lesson.studentId))].length} students)`
        }
        actions={
          <CalendarHeaderControls
            view={view}
            setView={setView}
            showAudienceToggle={showAudienceToggle}
            audience={audience}
            setAudience={setAudience}
            teacherFilter={teacherFilter}
            setTeacherFilter={setTeacherFilter}
            teacherOptions={teacherFilterOptions}
            role={role}
            onRequestLesson={requestLesson}
          />
        }
      />

      <div className={styles.calLayout}>
        <div className={styles.calMain}>
          <CalendarMonthNavigator
            monthLabel={`${MONTHS[month]} ${year}`}
            onPrev={() => {
              if (view === 'week') {
                shiftWeek(-1);
                return;
              }
              if (month === 0) {
                setYear((y) => y - 1);
                setMonth(11);
              } else setMonth((m) => m - 1);
            }}
            onNext={() => {
              if (view === 'week') {
                shiftWeek(1);
                return;
              }
              if (month === 11) {
                setYear((y) => y + 1);
                setMonth(0);
              } else setMonth((m) => m + 1);
            }}
          />

          {view === 'month' && (
            <div className={styles.monthGrid}>
              {DAYS.map((day) => (
                <div key={day} className={styles.dayName}>
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`e${i}`} className={styles.emptyCell} />
              ))}
              {Array.from({ length: daysCount }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayLessons = lessonsOnDate(dateStr).sort(
                  (a, b) =>
                    lessonStartTimeInZone(a, viewerIana).localeCompare(
                      lessonStartTimeInZone(b, viewerIana),
                    ) || a.order - b.order,
                );
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === today;
                const isPastDay = isDateBeforeToday(dateStr);
                return (
                  <div
                    key={day}
                    className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : ''} ${isToday ? styles.dayCellToday : ''} ${isPastDay ? styles.dayCellPast : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                    onDoubleClick={() => {
                      if (!canManage) return;
                      openCreateModal(dateStr);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!draggingLessonId) return;
                      setMonthGhostDate(dateStr);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const payload = readLessonDragPayload(e.dataTransfer);
                      const lessonId = payload?.lessonId ?? draggingLessonId;
                      if (!lessonId) return;
                      moveLesson(lessonId, dateStr);
                      setMonthGhostDate(null);
                      setDraggingLessonId(null);
                    }}
                  >
                    <span className={styles.dayNum}>{day}</span>
                    <div className={styles.dayDots}>
                      {dayLessons.slice(0, 3).map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`${styles.dayDot} ${styles[`dot${getLessonColor(lesson)}`]}`}
                          style={colorHexFromStudentId(lesson.studentId) ? { backgroundColor: colorHexFromStudentId(lesson.studentId)! } : undefined}
                        />
                      ))}
                    </div>
                    <div className={styles.dayLessons}>
                    {dayLessons.slice(0, 3).map((lesson) => (
                      (() => {
                        const canDragLesson = canManage && !isLessonInPast(lesson);
                        return (
                      <div
                        key={lesson.id}
                        className={`${styles.dayLessonItem} ${styles[`evt${getLessonColor(lesson)}`]} ${!canDragLesson ? styles.dragDisabled : ''}`}
                        style={lessonColorStyles(lesson)}
                        draggable={canDragLesson}
                        onDragStart={(e) => {
                          if (!canDragLesson) {
                            e.preventDefault();
                            return;
                          }
                          writeLessonDragPayload(e.dataTransfer, { lessonId: lesson.id });
                          setDraggingLessonId(lesson.id);
                        }}
                        onDragEnd={() => {
                          setMonthGhostDate(null);
                          setWeekGhost(null);
                          setDraggingLessonId(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (resizedRef.current) return;
                          openEditModal(lesson);
                        }}
                      >
                        <div className={styles.dayLessonTitle}>
                          {lessonStartTimeInZone(lesson, viewerIana)} {lesson.title}
                        </div>
                      </div>
                        );
                      })()
                    ))}
                    {dayLessons.length > 3 ? <div className={styles.dayMore}>+{dayLessons.length - 3} more</div> : null}
                    {monthGhostDate === dateStr ? (
                      <div className={styles.dayGhostEvent}>Drop lesson here</div>
                    ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'week' && (
            <div className={styles.weekView}>
              <div className={styles.weekHeader}>
                <div className={styles.weekTimeCol} />
                {weekDays.map((date) => {
                  const dateStr = toDateString(date);
                  const isToday = dateStr === today;
                  const isSelected = selectedDate === dateStr;
                  const isPastDay = isDateBeforeToday(dateStr);
                  return (
                    <div
                      key={dateStr}
                      className={`${styles.weekDayHeader} ${isToday ? styles.weekDayToday : ''} ${isSelected ? styles.weekDaySelected : ''} ${isPastDay ? styles.weekDayPast : ''}`}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className={styles.weekDayName}>{DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                      <div className={styles.weekDayNum}>{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.weekBody}>
                <div className={styles.weekRow} style={{ minHeight: dayColumnHeight }}>
                  <div className={styles.weekHour}>
                    {hourMarks.map((hour) => (
                      <div key={hour} style={{ height: 72 }}>
                        {hour}:00
                      </div>
                    ))}
                  </div>
                  {weekDays.map((date) => {
                    const dateStr = toDateString(date);
                    const dayLessons = weekLessons.filter(
                      (lesson) => lessonDateKeyInZone(lesson, viewerIana) === dateStr,
                    );
                    const isPastDay = isDateBeforeToday(dateStr);
                    const passedMinutesToday = isPastDay
                      ? minutesPerDay
                      : dateStr === today
                        ? Math.max(0, Math.min(minutesPerDay, nowMinutes - startHour * 60))
                        : 0;
                    return (
                      <div
                        key={dateStr}
                        className={`${styles.weekCell} ${isPastDay ? styles.weekCellPast : ''}`}
                        style={{ position: 'relative', minHeight: dayColumnHeight }}
                        onDoubleClick={(e) => {
                          if (!canManage) return;
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const minutes = Math.max(
                            0,
                            Math.min(minutesPerDay - 55, Math.round((e.clientY - rect.top) / pxPerMinute / 15) * 15),
                          );
                          const hh = startHour + Math.floor(minutes / 60);
                          const mm = minutes % 60;
                          openCreateModal(dateStr);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (!draggingLessonId) return;
                          const source = lessons.find((lesson) => lesson.id === draggingLessonId);
                          if (!source) return;
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const minutes = Math.max(
                            0,
                            Math.min(minutesPerDay - 55, Math.round((e.clientY - rect.top) / pxPerMinute / 15) * 15),
                          );
                          const hh = startHour + Math.floor(minutes / 60);
                          const mm = minutes % 60;
                          setWeekGhost({
                            lessonId: draggingLessonId,
                            date: dateStr,
                            startTime: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
                            duration: source.duration,
                            title: source.title,
                          });
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const payload = readLessonDragPayload(e.dataTransfer);
                          const lessonId = payload?.lessonId ?? draggingLessonId;
                          if (!lessonId) return;
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const minutes = Math.max(
                            0,
                            Math.min(minutesPerDay - 55, Math.round((e.clientY - rect.top) / pxPerMinute / 15) * 15),
                          );
                          const hh = startHour + Math.floor(minutes / 60);
                          const mm = minutes % 60;
                          moveLesson(lessonId, dateStr, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
                          setWeekGhost(null);
                          setDraggingLessonId(null);
                        }}
                      >
                        {passedMinutesToday > 0 ? (
                          <div
                            className={styles.weekPastOverlay}
                            style={{ height: passedMinutesToday * pxPerMinute }}
                          />
                        ) : null}
                        {(() => {
                          const sortedDay = [...dayLessons].sort(
                            (a, b) =>
                              lessonStartTimeInZone(a, viewerIana).localeCompare(
                                lessonStartTimeInZone(b, viewerIana),
                              ) || a.duration - b.duration,
                          );
                          const dayLayout = buildWeekEventLayout(
                            sortedDay.map((l) => ({
                              ...l,
                              startTime: lessonStartTimeInZone(l, viewerIana),
                              endTime: lessonEndTimeInZone(l, viewerIana),
                            })),
                          );
                          return sortedDay.map((lesson) => {
                          const canDragLesson = canManage && !isLessonInPast(lesson);
                          const canResizeLesson = canManage && !isLessonInPast(lesson);
                          const [hh, mm] = lessonStartTimeInZone(lesson, viewerIana)
                            .split(':')
                            .map(Number);
                          const startMinutes = (hh - startHour) * 60 + mm;
                          const top = startMinutes * pxPerMinute;
                          const height = Math.max(55 * pxPerMinute, lesson.duration * pxPerMinute);
                          const layout = dayLayout[lesson.id] ?? { columnIndex: 0, columnsTotal: 1 };
                          const widthPercent = 100 / layout.columnsTotal;
                          const leftPercent = widthPercent * layout.columnIndex;
                          return (
                            <div
                              key={lesson.id}
                              className={`${styles.weekEvt} ${styles[`evt${getLessonColor(lesson)}`]} ${!canDragLesson ? styles.dragDisabled : ''}`}
                              style={{
                                position: 'absolute',
                                top,
                                height,
                                left: `calc(${leftPercent}% + 3px)`,
                                width: `calc(${widthPercent}% - 6px)`,
                                ...lessonColorStyles(lesson),
                              }}
                              draggable={canDragLesson}
                              onDragStart={(ev) => {
                                if (!canDragLesson) {
                                  ev.preventDefault();
                                  return;
                                }
                                if (suppressDragRef.current || resizeState) {
                                  ev.preventDefault();
                                  return;
                                }
                                writeLessonDragPayload(ev.dataTransfer, { lessonId: lesson.id });
                                setDraggingLessonId(lesson.id);
                              }}
                              onDragEnd={() => {
                                setMonthGhostDate(null);
                                setWeekGhost(null);
                                setDraggingLessonId(null);
                              }}
                              onClick={() => {
                                if (resizedRef.current) return;
                                openEditModal(lesson);
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: 6,
                                  cursor: canResizeLesson ? 'ns-resize' : 'default',
                                }}
                                onMouseDown={(ev) => {
                                  if (!canResizeLesson) return;
                                  ev.stopPropagation();
                                  suppressDragRef.current = true;
                                  setResizeState({
                                    lessonId: lesson.id,
                                    edge: 'top',
                                    originY: ev.clientY,
                                    snapshot: { ...lesson },
                                    initialDuration: lesson.duration,
                                    viewerDate: lessonDateKeyInZone(lesson, viewerIana),
                                    initialViewerStartMinutes: toMinutes(
                                      lessonStartTimeInZone(lesson, viewerIana),
                                    ),
                                  });
                                }}
                              />
                              <div className={styles.weekEvtTitle}>{lesson.title}</div>
                              <div className={styles.weekEvtTime}>
                                {lessonStartTimeInZone(lesson, viewerIana)} · {lesson.duration} min
                              </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: 6,
                                  cursor: canResizeLesson ? 'ns-resize' : 'default',
                                }}
                                onMouseDown={(ev) => {
                                  if (!canResizeLesson) return;
                                  ev.stopPropagation();
                                  suppressDragRef.current = true;
                                  setResizeState({
                                    lessonId: lesson.id,
                                    edge: 'bottom',
                                    originY: ev.clientY,
                                    snapshot: { ...lesson },
                                    initialDuration: lesson.duration,
                                    viewerDate: '',
                                    initialViewerStartMinutes: 0,
                                  });
                                }}
                              />
                            </div>
                          );
                        });
                        })()}
                        {weekGhost && weekGhost.date === dateStr ? (() => {
                          const [ghostH, ghostM] = weekGhost.startTime.split(':').map(Number);
                          const ghostStartMinutes = (ghostH - startHour) * 60 + ghostM;
                          const ghostTop = ghostStartMinutes * pxPerMinute;
                          const ghostHeight = Math.max(55 * pxPerMinute, weekGhost.duration * pxPerMinute);
                          return (
                            <div
                              className={`${styles.weekGhostEvent} ${styles[`evt${colorFromStudentId(lessons.find((lesson) => lesson.id === weekGhost.lessonId)?.studentId ?? 0)}`]} ${draggingLessonId ? styles.weekGhostEventDragging : ''}`}
                              style={{
                                top: ghostTop,
                                height: ghostHeight,
                                ...(() => {
                                  const lesson = lessons.find((item) => item.id === weekGhost.lessonId);
                                  return lesson ? lessonColorStyles(lesson) : {};
                                })(),
                              }}
                            >
                              <div className={styles.weekEvtTitle}>{weekGhost.title}</div>
                              <div className={styles.weekEvtTime}>{weekGhost.startTime} · {weekGhost.duration} min</div>
                            </div>
                          );
                        })() : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <SelectedDateSidebar
          selectedDate={selectedDate}
          selectedLessons={selectedLessons}
          role={role}
          getLessonColor={getLessonColor}
        />
      </div>

      {form ? (
        <LessonModal
          mode={modalMode}
          canEdit={canManage}
          role={role}
          form={form}
          onChange={updateForm}
          onClose={closeModal}
          canUnlinkSeries={modalMode === 'edit' && role === USER_ROLE.teacher.id && Boolean(editingLesson?.seriesId)}
          onUnlinkSeries={() => setConfirmUnlinkOpen(true)}
          canDeleteLesson={modalMode === 'edit' && role !== USER_ROLE.student.id}
          onDeleteLesson={() => setConfirmDeleteOpen(true)}
          onSubmit={submitModal}
          onSaveStudentResponse={saveStudentResponse}
          students={studentOptions}
          teachers={assignableTeachers}
          lessonBackendId={editingLesson ? getLessonBackendId(editingLesson) ?? null : null}
          persistedLessonId={editingLesson?.id ?? null}
          studentBackendId={
            form
              ? resolvePartyBackendId(form.studentId, studentOptions, assignableTeachers) ?? null
              : null
          }
        />
      ) : null}
      {conflictDialog?.open ? (
        <div className={styles.confirmOverlay} onClick={() => setConflictDialog(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>{conflictDialog.title}</div>
            {conflictDialog.message ? <div className={styles.confirmBody}>{conflictDialog.message}</div> : null}
            <div className={styles.confirmSubtitle}>
              {conflictDialog.candidate.date} · {conflictDialog.candidate.startTime} –{' '}
              {conflictDialog.candidate.endTime}
            </div>
            <div className={styles.conflictList}>
              {getConflictingLessons({
                candidate: conflictDialog.candidate,
                excludeLessonId: conflictDialog.excludeLessonId,
              }).map((lesson) => (
                <Button
                  key={lesson.id}
                  type="button"
                  className={styles.conflictItem}
                  onClick={() => {
                    setConflictDialog(null);
                    openEditModal(lesson);
                  }}
                >
                  <span>{lesson.title}</span>
                  <span>
                    {lessonStartTimeInZone(lesson, viewerIana)} – {lessonEndTimeInZone(lesson, viewerIana)}
                  </span>
                </Button>
              ))}
            </div>
            <div className={styles.confirmActions}>
              <Button type="button" className={styles.confirmPrimary} onClick={() => setConflictDialog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {warningDialog?.open ? (
        <div className={styles.confirmOverlay} onClick={() => setWarningDialog(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>{warningDialog.title}</div>
            <div className={styles.confirmBody}>{warningDialog.message}</div>
            <div className={styles.confirmActions}>
              <Button type="button" className={styles.confirmPrimary} onClick={() => setWarningDialog(null)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {confirmDeleteOpen ? (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteOpen(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Delete lesson?</div>
            <div className={styles.confirmBody}>Are you sure you want to delete this lesson? This action cannot be undone.</div>
            <div className={styles.confirmActions}>
              <Button type="button" className={styles.confirmSecondary} onClick={() => setConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.confirmDanger}
                onClick={() => {
                  if (!editingLesson) return;
                  setLessons((prev) => prev.filter((lesson) => lesson.id !== editingLesson.id));
                  setConfirmDeleteOpen(false);
                  closeModal();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {confirmUnlinkOpen ? (
        <div className={styles.confirmOverlay} onClick={() => setConfirmUnlinkOpen(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Unlink this lesson from series?</div>
            <div className={styles.confirmBody}>Only this lesson will be detached. Other lessons in series will remain unchanged.</div>
            <div className={styles.confirmActions}>
              <Button type="button" className={styles.confirmSecondary} onClick={() => setConfirmUnlinkOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.confirmPrimary}
                onClick={() => {
                  if (!editingLesson) return;
                  setLessons((prev) =>
                    prev.map((lesson) =>
                      lesson.id === editingLesson.id
                        ? {
                            ...lesson,
                            seriesId: undefined,
                            recurrence: 'none',
                            weeklyDays: [],
                          }
                        : lesson,
                    ),
                  );
                  setEditingLesson((prev) =>
                    prev
                      ? {
                          ...prev,
                          seriesId: undefined,
                          recurrence: 'none',
                          weeklyDays: [],
                        }
                      : prev,
                  );
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          recurrence: 'none',
                          weeklyDays: [],
                          applyToSeries: false,
                        }
                      : prev,
                  );
                  setConfirmUnlinkOpen(false);
                }}
              >
                Unlink
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
