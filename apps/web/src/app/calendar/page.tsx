'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Repeat } from 'lucide-react';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
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
import { useOptionalAuth } from '../../lib/auth-context';
import { resolveStudentTeacherChatPeerId } from '../../lib/student-teacher-chat';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import { CalendarHeaderControls, CalendarMonthNavigator, SelectedDateSidebar } from './sections';
import { readLessonDragPayload, writeLessonDragPayload } from '../../features/calendar/dnd/dragPayload';
import {
  defaultCreateLessonStartTime,
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
import { getLessonBackendId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useScheduledLessonPersistence } from '../../hooks/use-scheduled-lesson-persistence';
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
import { getPlannedLessonsInSeries, unlinkLessonFields } from '../../lib/lesson-series';
import { deleteScheduledLessonSeries } from '../../features/lesson-modal/series-lesson-delete';
import { useLessonsStore } from '../../stores/lessons-store';
import { useStudentsStore } from '../../stores/students-store';
import { partyNumericId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { isRecurrenceAllowedForStudent } from '../../lib/student-schedule-type';
import { hasTimeConflict, isPastSlot } from '../../features/calendar/rules/conflicts';
import { LessonModal } from '../../features/lesson-modal';
import { WhenPortaled } from '../../features/confirm';
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
  const router = useRouter();
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  if (!canView('calendar', activeUser.role)) return null;
  const { iana: viewerIana, timezoneId: viewerTimezoneId } = useViewerTimezone();
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
  const deleteScheduledLesson = useLessonsStore((s) => s.deleteScheduledLesson);
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
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const studentsFromApi = useStudentsStore((s) => s.list.data);
  const isStaffViewer =
    role === USER_ROLE.teacher.id ||
    role === USER_ROLE.admin.id ||
    role === USER_ROLE.superAdmin.id;

  useEffect(() => {
    if (isStaffViewer) void fetchStudents();
  }, [isStaffViewer, fetchStudents]);

  const visibleStudents = useMemo(
    () => getVisibleProfiles(role, activeUser.id),
    [role, activeUser.id],
  );
  const studentColorById = useMemo(() => {
    const m = new Map<number, string | undefined>();
    for (const row of studentsFromApi ?? []) {
      const hex = row.displayColor?.trim();
      if (hex) m.set(partyNumericId(row.id), hex);
    }
    for (const student of visibleStudents) {
      if (!m.has(student.id)) {
        const fallback = student.color?.trim();
        if (fallback) m.set(student.id, fallback);
      }
    }
    return m;
  }, [studentsFromApi, visibleStudents]);
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
  const [confirmDeleteSeriesOpen, setConfirmDeleteSeriesOpen] = useState(false);
  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);
  const [overlayConfirmBusy, setOverlayConfirmBusy] = useState(false);
  const [seriesScheduleConfirm, setSeriesScheduleConfirm] = useState<{
    type: 'detach' | 'applyAll';
    before: ScheduledLessonDto;
    next: ScheduledLessonDto;
  } | null>(null);
  const seriesDialogText = siteContent.calendar.seriesConfirm;
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
    });
  };
  const studentTeacherChatPeerId = useMemo(
    () =>
      resolveStudentTeacherChatPeerId({
        assignedTeacherId: auth?.user?.teacherId,
        lessons: visibleLessons,
        studentPartyNumericId: viewerPartyNumericId,
      }),
    [auth?.user?.teacherId, visibleLessons, viewerPartyNumericId],
  );

  const requestLesson = () => {
    if (!studentTeacherChatPeerId) {
      setWarningDialog({
        open: true,
        title: 'No teacher assigned',
        message:
          'We could not find your teacher. Ask an administrator to assign a teacher to your account, or schedule a lesson first.',
      });
      return;
    }
    router.push(`/chat?peer=${encodeURIComponent(studentTeacherChatPeerId)}`);
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

  const showScheduleConflict = (
    validation: ReturnType<typeof validateLessonScheduleUpdates>,
    inSeries: boolean,
  ) => {
    if (validation.ok) return;
    if (validation.past.length > 0) {
      setWarningDialog({
        open: true,
        title: 'Cannot schedule in the past',
        message: 'You cannot create or move a lesson to a past date or time.',
      });
      return;
    }
    const first = validation.conflicts[0];
    if (!first) return;
    setConflictDialog({
      open: true,
      title: 'Time slot is busy',
      message: inSeries
        ? 'At least one lesson in this series would overlap another lesson.'
        : conflictStrategy === 'same-teacher-overlap'
          ? 'This teacher already has a lesson in this time slot.'
          : 'You cannot create or move a lesson to this time because another lesson already exists.',
      candidate: first.occurrence,
      excludeLessonId: first.occurrence.id,
    });
  };

  const recurrenceAllowed = form
    ? isRecurrenceAllowedForStudent(form.studentId, studentOptions)
    : true;

  const applyLessonUpdate = (nextLesson: ScheduledLessonDto, sourceLesson?: ScheduledLessonDto) => {
    if (!sourceLesson) {
      if (hasTimeConflict(lessons, nextLesson, undefined, conflictStrategy)) {
        setConflictDialog({
          open: true,
          title: 'Time slot is busy',
          message:
            conflictStrategy === 'same-teacher-overlap'
              ? 'This teacher already has a lesson in this time slot.'
              : 'You cannot create or move a lesson to this time because another lesson already exists.',
          candidate: nextLesson,
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
      setLessons((prev) => [...prev, nextLesson]);
      return;
    }

    const validation = validateLessonScheduleUpdates(
      lessons,
      sourceLesson,
      nextLesson,
      conflictStrategy,
    );
    if (!validation.ok) {
      showScheduleConflict(validation, Boolean(sourceLesson.seriesId));
      return;
    }
    setLessons((prev) => applyLessonSeriesUpdatesLocally(prev, validation.updates));
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

    if (!scheduleValidation.ok) {
      showScheduleConflict(scheduleValidation, inSeries);
      return;
    }

    if (canManage) {
      setSavingLesson(true);
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
          } else {
            applyLessonUpdate(candidate, editingLesson);
          }
        } else {
          const persisted = await createRecurringLessons({
            form: activeForm,
            candidate,
            lessons,
            persistCreate,
            setLessons,
            conflictStrategy,
          });
          if (!persisted) {
            setWarningDialog({
              open: true,
              title: 'Time slot is busy',
              message: 'No open slots for this recurrence pattern.',
            });
            return;
          }
          setEditingLesson(persisted);
          setModalMode('edit');
          setForm(toLessonFormState(persisted));
          keepModalOpenAfterSave = true;
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

    if (!editingLesson && activeForm.recurrence !== 'none') {
      applyRecurringLessonsLocally({
        form: activeForm,
        candidate,
        tryApplyLesson: (lesson, source) => {
          applyLessonUpdate(lesson, source);
          return true;
        },
        editingLesson,
      });
    } else {
      applyLessonUpdate(candidate, editingLesson ?? undefined);
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

  const commitDetachAndMove = async (before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    const unlinked: ScheduledLessonDto = {
      ...next,
      ...unlinkLessonFields(before),
    };
    if (hasTimeConflict(lessonsRef.current, unlinked, before.id, conflictStrategy)) {
      setConflictDialog({
        open: true,
        title: 'Time slot is busy',
        message:
          conflictStrategy === 'same-teacher-overlap'
            ? 'This teacher already has a lesson in this time slot.'
            : 'Another lesson already exists for this time.',
        candidate: unlinked,
        excludeLessonId: before.id,
      });
      return;
    }
    if (isPastSlot(unlinked)) {
      setWarningDialog({
        open: true,
        title: 'Cannot move to past time',
        message: 'You cannot move a lesson to a past date or time.',
      });
      return;
    }
    setLessons((prev) => prev.map((lesson) => (lesson.id === before.id ? unlinked : lesson)));
    const backendId = getLessonBackendId(before);
    if (!canManage || !backendId) return;
    try {
      const persisted = await persistUpdate(unlinked, before, { includeLessonContent: false });
      if (persisted) {
        setLessons((prev) => prev.map((lesson) => (lesson.id === before.id ? persisted : lesson)));
      }
    } catch (error) {
      setLessons((prev) => prev.map((lesson) => (lesson.id === before.id ? before : lesson)));
      setWarningDialog({
        open: true,
        title: 'Could not save lesson',
        message: persistenceErrorMessage(error),
      });
    }
  };

  const commitApplyAllSchedule = async (before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    const validation = validateSeriesTimeUpdates(
      lessonsRef.current,
      before,
      {
        startTime: next.startTime,
        endTime: next.endTime,
        duration: next.duration,
        timezoneId: next.timezoneId,
      },
      conflictStrategy,
    );
    if (!validation.ok) {
      showScheduleConflict(validation, true);
      setLessons((prev) =>
        prev.map((lesson) => (lesson.id === before.id ? before : lesson)),
      );
      return;
    }
    setLessons((prev) => applyLessonSeriesUpdatesLocally(prev, validation.updates));
    if (!canManage) return;
    try {
      await persistSeriesScheduleChanges({
        updates: validation.updates,
        lessons: lessonsRef.current,
        persistScheduleUpdate,
        setLessons,
      });
    } catch (error) {
      setLessons((prev) =>
        prev.map((lesson) => {
          const original = lessonsRef.current.find((row) => row.id === lesson.id);
          return original ?? lesson;
        }),
      );
      setWarningDialog({
        open: true,
        title: 'Could not save lesson time',
        message: persistenceErrorMessage(error),
      });
    }
  };

  const requestScheduleChange = (before: ScheduledLessonDto, next: ScheduledLessonDto) => {
    if (scheduleUnchanged(before, next)) return;

    if (before.seriesId) {
      if (next.date !== before.date) {
        setSeriesScheduleConfirm({ type: 'detach', before, next });
        return;
      }
      setSeriesScheduleConfirm({ type: 'applyAll', before, next });
      return;
    }

    if (hasTimeConflict(lessonsRef.current, next, before.id, conflictStrategy)) {
      setConflictDialog({
        open: true,
        title: 'Time slot is busy',
        message:
          conflictStrategy === 'same-teacher-overlap'
            ? 'This teacher already has a lesson in this time slot.'
            : 'Another lesson already exists for this time.',
        candidate: next,
        excludeLessonId: before.id,
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
    void persistScheduleChange(before.id, before, next);
  };

  const moveLesson = (lessonId: number, date: string, startTime?: string) => {
    const before = lessonsRef.current.find((lesson) => lesson.id === lessonId);
    if (!before) return;
    const next = buildMovedLesson(before, date, startTime);
    requestScheduleChange(before, next);
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
    const resizeOutcome: {
      persist: {
        lessonId: number;
        before: ScheduledLessonDto;
        next: ScheduledLessonDto;
      } | null;
    } = { persist: null };

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
            resizeOutcome.persist = { lessonId: lesson.id, before: snapshot, next };
          }
          return next;
        }),
      );
    }

    const resizePersist = resizeOutcome.persist;
    if (resizePersist) {
      const { lessonId, before, next } = resizePersist;
      if (before.seriesId) {
        setSeriesScheduleConfirm({ type: 'applyAll', before, next });
      } else {
        void persistScheduleChange(lessonId, before, next);
      }
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
                          {lesson.seriesId ? (
                            <Repeat size={11} className={styles.seriesBadge} aria-hidden />
                          ) : null}
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
                        onDoubleClick={() => {
                          if (!canManage) return;
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
                              <div className={styles.weekEvtTitle}>
                                {lesson.seriesId ? (
                                  <Repeat size={12} className={styles.seriesBadge} aria-hidden />
                                ) : null}
                                <span>{lesson.title}</span>
                              </div>
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
          recurrenceAllowed={recurrenceAllowed}
          canUnlinkSeries={modalMode === 'edit' && canManage && Boolean(editingLesson?.seriesId)}
          onUnlinkSeries={() => setConfirmUnlinkOpen(true)}
          canDeleteSeries={modalMode === 'edit' && canManage && Boolean(editingLesson?.seriesId)}
          onDeleteSeries={() => {
            if (!editingLesson?.seriesId) return;
            const plannedCount = getPlannedLessonsInSeries(lessons, editingLesson.seriesId).length;
            if (plannedCount === 0) {
              setWarningDialog({
                open: true,
                title: 'No planned lessons',
                message: 'Completed or cancelled lessons in this series are kept.',
              });
              return;
            }
            setConfirmDeleteSeriesOpen(true);
          }}
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
      <WhenPortaled when={Boolean(conflictDialog?.open)}>
        {() => {
          const dialog = conflictDialog;
          if (!dialog?.open) return null;
          return (
        <div className={styles.confirmOverlay} onClick={() => setConflictDialog(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>{dialog.title}</div>
            {dialog.message ? <div className={styles.confirmBody}>{dialog.message}</div> : null}
            <div className={styles.confirmSubtitle}>
              {dialog.candidate.date} · {dialog.candidate.startTime} –{' '}
              {dialog.candidate.endTime}
            </div>
            <div className={styles.conflictList}>
              {getConflictingLessons({
                candidate: dialog.candidate,
                excludeLessonId: dialog.excludeLessonId,
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
          );
        }}
      </WhenPortaled>
      <WhenPortaled when={Boolean(warningDialog?.open)}>
        {() => {
          const dialog = warningDialog;
          if (!dialog?.open) return null;
          return (
        <div className={styles.confirmOverlay} onClick={() => setWarningDialog(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>{dialog.title}</div>
            <div className={styles.confirmBody}>{dialog.message}</div>
            <div className={styles.confirmActions}>
              <Button type="button" className={styles.confirmPrimary} onClick={() => setWarningDialog(null)}>
                OK
              </Button>
            </div>
          </div>
        </div>
          );
        }}
      </WhenPortaled>
      <WhenPortaled when={Boolean(seriesScheduleConfirm)}>
        {() => {
          const confirm = seriesScheduleConfirm;
          if (!confirm) return null;
          return (
        <div className={styles.confirmOverlay} onClick={() => setSeriesScheduleConfirm(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>
              {confirm.type === 'detach'
                ? seriesDialogText.detachTitle
                : seriesDialogText.applyAllTitle}
            </div>
            <div className={styles.confirmBody}>
              {confirm.type === 'detach'
                ? seriesDialogText.detachBody
                : seriesDialogText.applyAllBody}
            </div>
            <div className={styles.confirmActions}>
              <Button
                type="button"
                className={styles.confirmSecondary}
                onClick={() => {
                  setLessons((prev) =>
                    prev.map((lesson) =>
                      lesson.id === confirm.before.id ? confirm.before : lesson,
                    ),
                  );
                  setSeriesScheduleConfirm(null);
                }}
              >
                {seriesDialogText.cancel}
              </Button>
              <Button
                type="button"
                className={styles.confirmPrimary}
                onClick={() => {
                  if (confirm.type === 'detach') {
                    void commitDetachAndMove(confirm.before, confirm.next);
                  } else {
                    void commitApplyAllSchedule(confirm.before, confirm.next);
                  }
                  setSeriesScheduleConfirm(null);
                }}
              >
                {confirm.type === 'detach'
                  ? seriesDialogText.detachConfirm
                  : seriesDialogText.applyAllConfirm}
              </Button>
            </div>
          </div>
        </div>
          );
        }}
      </WhenPortaled>
      <WhenPortaled when={Boolean(confirmDeleteSeriesOpen && editingLesson?.seriesId)}>
        {() => {
          const seriesId = editingLesson?.seriesId;
          if (!seriesId) return null;
          const plannedCount = getPlannedLessonsInSeries(lessons, seriesId).length;
          return (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteSeriesOpen(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Delete planned lessons in series?</div>
            <div className={styles.confirmBody}>
              This will permanently delete{' '}
              {plannedCount} planned lesson
              {plannedCount === 1 ? '' : 's'}
              . Completed and cancelled lessons stay.
            </div>
            <div className={styles.confirmActions}>
              <Button
                type="button"
                className={styles.confirmSecondary}
                disabled={overlayConfirmBusy}
                onClick={() => setConfirmDeleteSeriesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.confirmDanger}
                loadingLabel="Deleting…"
                onPendingChange={setOverlayConfirmBusy}
                onClick={async () => {
                  try {
                    const { removedIds } = await deleteScheduledLessonSeries({
                      lessons,
                      seriesId,
                      canManage,
                      deleteScheduledLesson,
                    });
                    const removed = new Set(removedIds);
                    setLessons((prev) => prev.filter((lesson) => !removed.has(lesson.id)));
                    setConfirmDeleteSeriesOpen(false);
                    closeModal();
                  } catch (error) {
                    setWarningDialog({
                      open: true,
                      title: 'Could not delete series',
                      message: persistenceErrorMessage(error),
                    });
                  }
                }}
              >
                Delete all
              </Button>
            </div>
          </div>
        </div>
          );
        }}
      </WhenPortaled>
      <WhenPortaled when={confirmDeleteOpen}>
        {() => (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteOpen(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Delete lesson?</div>
            <div className={styles.confirmBody}>Are you sure you want to delete this lesson? This action cannot be undone.</div>
            <div className={styles.confirmActions}>
              <Button
                type="button"
                className={styles.confirmSecondary}
                disabled={overlayConfirmBusy}
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.confirmDanger}
                loadingLabel="Deleting…"
                onPendingChange={setOverlayConfirmBusy}
                onClick={async () => {
                  if (!editingLesson) return;
                  const backendId = getLessonBackendId(editingLesson);
                  try {
                    if (canManage && backendId) {
                      await deleteScheduledLesson(backendId);
                    }
                  } catch (error) {
                    setWarningDialog({
                      open: true,
                      title: 'Could not delete lesson',
                      message: persistenceErrorMessage(error),
                    });
                    return;
                  }
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
        )}
      </WhenPortaled>
      <WhenPortaled when={confirmUnlinkOpen}>
        {() => (
        <div className={styles.confirmOverlay} onClick={() => setConfirmUnlinkOpen(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Unlink this lesson from series?</div>
            <div className={styles.confirmBody}>Only this lesson will be detached. Other lessons in series will remain unchanged.</div>
            <div className={styles.confirmActions}>
              <Button
                type="button"
                className={styles.confirmSecondary}
                disabled={overlayConfirmBusy}
                onClick={() => setConfirmUnlinkOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.confirmPrimary}
                loadingLabel="Unlinking…"
                onPendingChange={setOverlayConfirmBusy}
                onClick={async () => {
                    if (!editingLesson || !form) return;
                    const unlinkedCandidate = {
                      ...buildLessonCandidate(
                        {
                          ...form,
                          recurrence: 'none',
                          weeklyDays: [],
                        },
                        lessons,
                        editingLesson,
                      ),
                      seriesId: undefined,
                    };
                    try {
                      if (canManage && getLessonBackendId(editingLesson)) {
                        const persisted = await persistUpdate(unlinkedCandidate, editingLesson, {
                          includeLessonContent: false,
                        });
                        if (persisted) {
                          setLessons((prev) =>
                            prev.map((lesson) =>
                              lesson.id === editingLesson.id ? persisted : lesson,
                            ),
                          );
                          setEditingLesson(persisted);
                          setForm(toLessonFormState(persisted));
                          setConfirmUnlinkOpen(false);
                          return;
                        }
                      }
                    } catch (error) {
                      setWarningDialog({
                        open: true,
                        title: 'Could not unlink lesson',
                        message: persistenceErrorMessage(error),
                      });
                      return;
                    }
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
        )}
      </WhenPortaled>
    </div>
  );
}
