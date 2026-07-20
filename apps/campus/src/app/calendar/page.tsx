'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ScheduledLessonDto } from '@pkg/types';
import { PageHeader } from '../../components/ui';
import { USER_ROLE } from '@pkg/types';
import { canSchedule, isAdminOrSuper } from '../../lib/roles';
import { partyNumericId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useActiveUser } from '../../lib/active-user';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import { useOptionalAuth } from '../../lib/auth-context';
import { resolveStudentTeacherChatPeerId } from '../../lib/student-teacher-chat';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import { CalendarHeaderControls, CalendarMonthNavigator, SelectedDateSidebar } from './sections';
import { lessonDateKeyInZone, lessonStartUtc, lessonEndUtc } from '../../lib/lessonTime';
import { getLessonBackendId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { getPlannedLessonsInSeries } from '../../lib/lesson-series';
import { isRecurrenceAllowedForStudent } from '../../lib/student-schedule-type';
import { LessonModal } from '../../features/lesson-modal';
import { useLessonCalendarState } from '../../features/calendar/ui/useLessonCalendarState';
import { useLessonsStore } from '../../stores/lessons-store';
import { useStudentsStore } from '../../stores/students-store';
import { useScheduledLessonPersistence } from '../../hooks/use-scheduled-lesson-persistence';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDialogs } from './CalendarDialogs';
import { useCalendarColors } from './useCalendarColors';
import { useCalendarLessonActions } from './useCalendarLessonActions';
import { useCalendarResize } from './useCalendarResize';
import { PX_PER_MINUTE, START_HOUR, toDateString } from './calendarUtils';
import styles from './page.module.scss';

export default function CalendarPage() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const searchParams = useSearchParams();
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const { iana: viewerIana, timezoneId: viewerTimezoneId } = useViewerTimezone();
  const { studentOptions, teacherOptions: assignableTeachers, defaultTeacher, defaultStudent, currentUserNumericId } = useLessonPartyOptions();
  const viewerPartyNumericId = currentUserNumericId ?? activeUser.id;
  const { lessons, setLessons, role, view, setView, selectedDate, setSelectedDate, visibleLessons } = useLessonCalendarState(activeUser.role, viewerPartyNumericId);
  const { persistCreate, persistUpdate, persistScheduleUpdate, persistenceErrorMessage } = useScheduledLessonPersistence();
  const deleteScheduledLesson = useLessonsStore((s) => s.deleteScheduledLesson);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const studentsFromApi = useStudentsStore((s) => s.list.data);
  const isStaffViewer = role === USER_ROLE.teacher.id || role === USER_ROLE.admin.id || role === USER_ROLE.superAdmin.id;

  useEffect(() => { if (isStaffViewer) void fetchStudents(); }, [isStaffViewer, fetchStudents]);

  const visibleStudents = useMemo(
    () =>
      (studentsFromApi ?? []).map((row) => ({
        id: partyNumericId(row.id),
        color: row.displayColor ?? undefined,
      })),
    [studentsFromApi],
  );
  const { colorHexFromStudentId, colorFromStudentId, getLessonColor, lessonColorStyles } = useCalendarColors(studentsFromApi, visibleStudents);

  const [audience, setAudience] = useState<'all' | 'my-students'>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all-teachers');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [nowMs, setNowMs] = useState(() => Date.now());

  const canManage = canSchedule('calendar', role);
  const showAudienceToggle = isAdminOrSuper(role);
  const conflictStrategy = showAudienceToggle && audience === 'all' ? 'same-teacher-overlap' : 'any-overlap';

  const teacherFilterOptions = useMemo(
    () => Array.from(new Map(visibleLessons.map((l) => [l.teacherId, l.teacherName])).entries()).map(([id, name]) => ({ id, name })),
    [visibleLessons],
  );

  const scopedLessons = useMemo(() => {
    if (!showAudienceToggle) return visibleLessons;
    if (audience === 'my-students') {
      if (activeUser.role === USER_ROLE.teacher.id) return visibleLessons.filter((l) => l.teacherId === viewerPartyNumericId);
      return visibleLessons;
    }
    if (teacherFilter !== 'all-teachers') return visibleLessons.filter((l) => l.teacherId === Number(teacherFilter));
    return visibleLessons;
  }, [audience, showAudienceToggle, teacherFilter, visibleLessons, activeUser.role, viewerPartyNumericId]);

  // Dialog state
  const [conflictDialog, setConflictDialog] = useState<{ open: boolean; title: string; message?: string; candidate: ScheduledLessonDto; excludeLessonId?: number } | null>(null);
  const [warningDialog, setWarningDialog] = useState<{ open: boolean; title: string; message: string } | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteSeriesOpen, setConfirmDeleteSeriesOpen] = useState(false);
  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);
  const [overlayConfirmBusy, setOverlayConfirmBusy] = useState(false);
  const [seriesScheduleConfirm, setSeriesScheduleConfirm] = useState<{ type: 'detach' | 'applyAll'; before: ScheduledLessonDto; next: ScheduledLessonDto } | null>(null);

  const studentTeacherChatPeerId = useMemo(
    () => resolveStudentTeacherChatPeerId({ assignedTeacherId: auth?.user?.teacherId, lessons: visibleLessons, studentPartyNumericId: viewerPartyNumericId }),
    [auth?.user?.teacherId, visibleLessons, viewerPartyNumericId],
  );

  const actions = useCalendarLessonActions({
    lessons, setLessons, canManage, conflictStrategy, viewerIana, viewerTimezoneId,
    currentUserNumericId, studentOptions, assignableTeachers, defaultTeacher, defaultStudent,
    persistCreate, persistUpdate, persistScheduleUpdate, persistenceErrorMessage,
    studentTeacherChatPeerId, showAudienceToggle, setAudience, setTeacherFilter,
    setConflictDialog, setWarningDialog, setSeriesScheduleConfirm,
  });

  const { resizeState, setResizeState, resizedRef, suppressDragRef } = useCalendarResize({
    canManage, conflictStrategy, viewerIana, setLessons, lessonsRef: actions.lessonsRef,
    onConflict: (candidate, excludeLessonId) => setConflictDialog({
      open: true,
      title: t('calendar.conflict.busyTitle'),
      message: conflictStrategy === 'same-teacher-overlap'
        ? t('calendar.conflict.teacherBusy')
        : t('calendar.conflict.slotBusy'),
      candidate,
      excludeLessonId,
    }),
    onPastSlot: () => setWarningDialog({
      open: true,
      title: t('calendar.conflict.pastResizeTitle'),
      message: t('calendar.conflict.pastResizeBody'),
    }),
    onSeriesScheduleConfirm: (type, before, next) => setSeriesScheduleConfirm({ type, before, next }),
    persistScheduleChange: (id, b, n) => void actions.persistScheduleChange(id, b, n),
    scheduleUnchanged: actions.scheduleUnchanged,
  });

  // DnD state
  const [draggingLessonId, setDraggingLessonId] = useState<number | null>(null);
  const [monthGhostDate, setMonthGhostDate] = useState<string | null>(null);
  const [weekGhost, setWeekGhost] = useState<{ lessonId: number; date: string; startTime: string; duration: number; title: string } | null>(null);

  // Query param focus
  const targetDateParam = searchParams.get('date');
  const targetLessonIdParam = searchParams.get('lessonId');
  const shouldFocusTargetLesson = searchParams.get('focus') === '1';
  const [focusedLessonId, setFocusedLessonId] = useState<number | null>(null);
  const appliedQueryRef = useRef<string | null>(null);
  const lastFocusedLessonRef = useRef<number | null>(null);

  // Calendar grid
  const daysCount = new Date(year, month + 1, 0).getDate();
  const firstDow = ((new Date(year, month, 1).getDay() + 6) % 7) as number;
  const today = toDateString(new Date());
  const now = new Date(nowMs);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTimeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const weekStart = (() => {
    const base = selectedDate ? new Date(selectedDate) : new Date(year, month, 1);
    const dow = base.getDay() === 0 ? 6 : base.getDay() - 1;
    const start = new Date(base);
    start.setDate(base.getDate() - dow);
    return start;
  })();
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const shiftWeek = (direction: -1 | 1) => {
    const base = selectedDate ? new Date(selectedDate) : weekStart;
    const next = new Date(base);
    next.setDate(base.getDate() + 7 * direction);
    setSelectedDate(toDateString(next)); setYear(next.getFullYear()); setMonth(next.getMonth());
  };
  const weekStartStr = toDateString(weekDays[0]);
  const weekEndStr = toDateString(weekDays[6]);
  const weekLessons = useMemo(
    () => scopedLessons.filter((l) => { const key = lessonDateKeyInZone(l, viewerIana); return key >= weekStartStr && key <= weekEndStr; }),
    [scopedLessons, weekStartStr, weekEndStr, viewerIana],
  );
  const weekIncludesToday = weekDays.some((d) => toDateString(d) === today);
  const weekNowTopPx = (nowMinutes - START_HOUR * 60) * PX_PER_MINUTE;
  const lessonsOnDate = (date: string) => scopedLessons.filter((l) => lessonDateKeyInZone(l, viewerIana) === date);
  const selectedLessons = selectedDate ? lessonsOnDate(selectedDate) : [];

  const getConflictingLessons = ({ candidate, excludeLessonId }: { candidate: ScheduledLessonDto; excludeLessonId?: number }) => {
    const c0 = lessonStartUtc(candidate).getTime(); const c1 = lessonEndUtc(candidate).getTime();
    return lessons.filter((l) => l.id !== excludeLessonId).filter((l) => conflictStrategy === 'same-teacher-overlap' ? l.teacherId === candidate.teacherId : true).filter((l) => { const l0 = lessonStartUtc(l).getTime(); const l1 = lessonEndUtc(l).getTime(); return c0 < l1 && c1 > l0; }).sort((a, b) => lessonStartUtc(a).getTime() - lessonStartUtc(b).getTime());
  };

  useEffect(() => { actions.lessonsRef.current = lessons; }, [lessons]);
  useEffect(() => { const s = window.localStorage.getItem('calendar:view'); if (s === 'week' || s === 'month') setView(s); }, [setView]);
  useEffect(() => { window.localStorage.setItem('calendar:view', view); }, [view]);
  useEffect(() => {
    if (view !== 'week') return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [view]);
  useEffect(() => {
    if (!targetDateParam || !targetLessonIdParam || !shouldFocusTargetLesson) return;
    const key = `${targetDateParam}|${targetLessonIdParam}`;
    if (appliedQueryRef.current === key) return;
    appliedQueryRef.current = key;
    setSelectedDate(targetDateParam);
    const base = new Date(`${targetDateParam}T12:00:00`);
    if (!Number.isNaN(base.getTime())) { setYear(base.getFullYear()); setMonth(base.getMonth()); }
    if (showAudienceToggle) { setAudience('all'); setTeacherFilter('all-teachers'); }
  }, [setSelectedDate, shouldFocusTargetLesson, showAudienceToggle, targetDateParam, targetLessonIdParam]);
  useEffect(() => {
    if (!targetLessonIdParam || !shouldFocusTargetLesson) return;
    const targetId = Number(targetLessonIdParam);
    if (!Number.isFinite(targetId)) return;
    if (!scopedLessons.some((l) => l.id === targetId)) return;
    if (lastFocusedLessonRef.current === targetId) return;
    const selector = view === 'week' ? `[data-week-lesson-id="${targetId}"]` : `[data-month-lesson-id="${targetId}"]`;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setFocusedLessonId(targetId);
    lastFocusedLessonRef.current = targetId;
    const timeout = window.setTimeout(() => setFocusedLessonId((c) => (c === targetId ? null : c)), 2200);
    return () => window.clearTimeout(timeout);
  }, [scopedLessons, shouldFocusTargetLesson, targetLessonIdParam, view]);

  const recurrenceAllowed = actions.form ? isRecurrenceAllowedForStudent(actions.form.studentId, studentOptions) : true;
  const studentCount = useMemo(() => new Set(lessons.map((l) => l.studentId)).size, [lessons]);
  const countStr = String(studentCount);
  const calendarSubtitle =
    role === USER_ROLE.student.id
      ? t('calendar.subtitle.student')
      : view === 'week'
        ? t('calendar.subtitle.week', { count: countStr })
        : t('calendar.subtitle.month', { count: countStr });
  const monthLabel = new Date(year, month, 1).toLocaleDateString(
    locale === 'uk' ? 'uk-UA' : 'en-US',
    { month: 'long', year: 'numeric' },
  );

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader} titleClassName={styles.pageTitle} subtitleClassName={styles.pageSub}
        title={t('calendar.title')} subtitle={calendarSubtitle}
        actions={<CalendarHeaderControls view={view} setView={setView} showAudienceToggle={showAudienceToggle} audience={audience} setAudience={setAudience} teacherFilter={teacherFilter} setTeacherFilter={setTeacherFilter} teacherOptions={teacherFilterOptions} role={role} onRequestLesson={actions.requestLesson} />}
      />
      <div className={styles.calLayout}>
        <div className={styles.calMain} data-tour-anchor="calendar-grid">
          <CalendarMonthNavigator
            monthLabel={monthLabel}
            onPrev={() => { if (view === 'week') { shiftWeek(-1); return; } if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); }}
            onNext={() => { if (view === 'week') { shiftWeek(1); return; } if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); }}
          />
          {view === 'month' && (
            <CalendarMonthView
              year={year} month={month} daysCount={daysCount} firstDow={firstDow}
              today={today} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              canManage={canManage} focusedLessonId={focusedLessonId}
              draggingLessonId={draggingLessonId} setDraggingLessonId={setDraggingLessonId}
              monthGhostDate={monthGhostDate} setMonthGhostDate={setMonthGhostDate}
              resizedRef={resizedRef} lessonsOnDate={lessonsOnDate}
              getLessonColor={getLessonColor} colorHexFromStudentId={colorHexFromStudentId}
              lessonColorStyles={lessonColorStyles} openCreateModal={actions.openCreateModal}
              openEditModal={actions.openEditModal} moveLesson={actions.moveLesson} viewerIana={viewerIana}
            />
          )}
          {view === 'week' && (
            <CalendarWeekView
              weekDays={weekDays} today={today} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              weekLessons={weekLessons} lessons={lessons} weekGhost={weekGhost} setWeekGhost={setWeekGhost}
              draggingLessonId={draggingLessonId} setDraggingLessonId={setDraggingLessonId}
              weekIncludesToday={weekIncludesToday} weekNowTopPx={weekNowTopPx} nowTimeLabel={nowTimeLabel}
              canManage={canManage} focusedLessonId={focusedLessonId}
              resizeState={resizeState} setResizeState={setResizeState}
              resizedRef={resizedRef} suppressDragRef={suppressDragRef}
              setMonthGhostDate={setMonthGhostDate} getLessonColor={getLessonColor}
              colorFromStudentId={colorFromStudentId} lessonColorStyles={lessonColorStyles}
              openCreateModal={actions.openCreateModal} openEditModal={actions.openEditModal} moveLesson={actions.moveLesson}
              viewerIana={viewerIana}
            />
          )}
        </div>
        <SelectedDateSidebar selectedDate={selectedDate} selectedLessons={selectedLessons} role={role} getLessonColor={getLessonColor} />
      </div>
      {actions.form ? (
        <LessonModal
          mode={actions.modalMode} canEdit={canManage} role={role} form={actions.form}
          onChange={actions.updateForm} onClose={actions.closeModal} recurrenceAllowed={recurrenceAllowed}
          canUnlinkSeries={actions.modalMode === 'edit' && canManage && Boolean(actions.editingLesson?.seriesId)}
          onUnlinkSeries={() => setConfirmUnlinkOpen(true)}
          canDeleteSeries={actions.modalMode === 'edit' && canManage && Boolean(actions.editingLesson?.seriesId)}
          onDeleteSeries={() => {
            if (!actions.editingLesson?.seriesId) return;
            const plannedCount = getPlannedLessonsInSeries(lessons, actions.editingLesson.seriesId).length;
            if (plannedCount === 0) { setWarningDialog({ open: true, title: 'No planned lessons', message: 'Completed or cancelled lessons in this series are kept.' }); return; }
            setConfirmDeleteSeriesOpen(true);
          }}
          canDeleteLesson={actions.modalMode === 'edit' && role !== USER_ROLE.student.id}
          onDeleteLesson={() => setConfirmDeleteOpen(true)}
          onSubmit={actions.submitModal} onSaveStudentResponse={actions.saveStudentResponse}
          students={studentOptions} teachers={assignableTeachers}
          lessonBackendId={actions.editingLesson ? getLessonBackendId(actions.editingLesson) ?? null : null}
          persistedLessonId={actions.editingLesson?.id ?? null}
          studentBackendId={actions.form ? actions.resolvePartyBackendId(actions.form.studentId) ?? null : null}
          isSaving={actions.savingLesson}
        />
      ) : null}
      <CalendarDialogs
        conflictDialog={conflictDialog} setConflictDialog={setConflictDialog}
        getConflictingLessons={getConflictingLessons} openEditModal={actions.openEditModal} viewerIana={viewerIana}
        warningDialog={warningDialog} setWarningDialog={setWarningDialog}
        seriesScheduleConfirm={seriesScheduleConfirm} setSeriesScheduleConfirm={setSeriesScheduleConfirm}
        seriesDialogText={actions.seriesDialogText} setLessons={setLessons}
        commitDetachAndMove={actions.commitDetachAndMove} commitApplyAllSchedule={actions.commitApplyAllSchedule}
        confirmDeleteSeriesOpen={confirmDeleteSeriesOpen} setConfirmDeleteSeriesOpen={setConfirmDeleteSeriesOpen}
        editingLesson={actions.editingLesson} lessons={lessons} overlayConfirmBusy={overlayConfirmBusy}
        setOverlayConfirmBusy={setOverlayConfirmBusy} canManage={canManage}
        deleteScheduledLesson={deleteScheduledLesson} persistenceErrorMessage={persistenceErrorMessage}
        closeModal={actions.closeModal} confirmDeleteOpen={confirmDeleteOpen} setConfirmDeleteOpen={setConfirmDeleteOpen}
        confirmUnlinkOpen={confirmUnlinkOpen} setConfirmUnlinkOpen={setConfirmUnlinkOpen}
        form={actions.form} persistUpdate={persistUpdate} setEditingLesson={actions.setEditingLesson} setForm={actions.setForm}
      />
    </div>
  );
}
