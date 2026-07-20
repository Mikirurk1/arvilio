'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { Button } from '../../components/ui';
import { WhenPortaled } from '../../features/confirm';
import { buildLessonCandidate } from '../../features/lesson-modal/lessonPersistence';
import { getLessonBackendId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { deleteScheduledLessonSeries } from '../../features/lesson-modal/series-lesson-delete';
import { toLessonFormState } from '../../features/calendar/adapters/lessonCalendarAdapter';
import { getPlannedLessonsInSeries } from '../../lib/lesson-series';
import { lessonEndTimeInZone, lessonStartTimeInZone } from '../../lib/lessonTime';
import type { LessonFormState } from '../../features/calendar/types';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

type ConflictDialog = {
  open: boolean;
  title: string;
  message?: string;
  candidate: ScheduledLessonDto;
  excludeLessonId?: number;
} | null;

type WarningDialog = { open: boolean; title: string; message: string } | null;

type SeriesScheduleConfirm = {
  type: 'detach' | 'applyAll';
  before: ScheduledLessonDto;
  next: ScheduledLessonDto;
} | null;

type SeriesDialogText = {
  detachTitle: string;
  detachBody: string;
  applyAllTitle: string;
  applyAllBody: string;
  cancel: string;
  detachConfirm: string;
  applyAllConfirm: string;
};

interface CalendarDialogsProps {
  conflictDialog: ConflictDialog;
  setConflictDialog: (v: ConflictDialog) => void;
  getConflictingLessons: (params: { candidate: ScheduledLessonDto; excludeLessonId?: number }) => ScheduledLessonDto[];
  openEditModal: (lesson: ScheduledLessonDto) => void;
  viewerIana: string;
  warningDialog: WarningDialog;
  setWarningDialog: (v: WarningDialog) => void;
  seriesScheduleConfirm: SeriesScheduleConfirm;
  setSeriesScheduleConfirm: (v: SeriesScheduleConfirm) => void;
  seriesDialogText: SeriesDialogText;
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>;
  commitDetachAndMove: (before: ScheduledLessonDto, next: ScheduledLessonDto) => Promise<void>;
  commitApplyAllSchedule: (before: ScheduledLessonDto, next: ScheduledLessonDto) => Promise<void>;
  confirmDeleteSeriesOpen: boolean;
  setConfirmDeleteSeriesOpen: (v: boolean) => void;
  editingLesson: ScheduledLessonDto | null;
  lessons: ScheduledLessonDto[];
  overlayConfirmBusy: boolean;
  setOverlayConfirmBusy: (v: boolean) => void;
  canManage: boolean;
  deleteScheduledLesson: (backendId: string) => Promise<void>;
  persistenceErrorMessage: (error: unknown) => string;
  closeModal: () => void;
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (v: boolean) => void;
  confirmUnlinkOpen: boolean;
  setConfirmUnlinkOpen: (v: boolean) => void;
  form: LessonFormState | null;
  persistUpdate: (next: ScheduledLessonDto, before: ScheduledLessonDto, opts?: { includeLessonContent?: boolean }) => Promise<ScheduledLessonDto | null | undefined>;
  setEditingLesson: Dispatch<SetStateAction<ScheduledLessonDto | null>>;
  setForm: Dispatch<SetStateAction<LessonFormState | null>>;
}

export function CalendarDialogs({
  conflictDialog, setConflictDialog, getConflictingLessons, openEditModal, viewerIana,
  warningDialog, setWarningDialog,
  seriesScheduleConfirm, setSeriesScheduleConfirm, seriesDialogText, setLessons,
  commitDetachAndMove, commitApplyAllSchedule,
  confirmDeleteSeriesOpen, setConfirmDeleteSeriesOpen, editingLesson, lessons,
  overlayConfirmBusy, setOverlayConfirmBusy, canManage, deleteScheduledLesson,
  persistenceErrorMessage, closeModal,
  confirmDeleteOpen, setConfirmDeleteOpen,
  confirmUnlinkOpen, setConfirmUnlinkOpen, form, persistUpdate, setEditingLesson, setForm,
}: CalendarDialogsProps) {
  const t = useCampusT();
  return (
    <>
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
                  {dialog.candidate.date} · {dialog.candidate.startTime} – {dialog.candidate.endTime}
                </div>
                <div className={styles.conflictList}>
                  {getConflictingLessons({ candidate: dialog.candidate, excludeLessonId: dialog.excludeLessonId }).map((lesson) => (
                    <Button
                      key={lesson.id}
                      type="button"
                      className={styles.conflictItem}
                      onClick={() => { setConflictDialog(null); openEditModal(lesson); }}
                    >
                      <span>{lesson.title}</span>
                      <span>{lessonStartTimeInZone(lesson, viewerIana)} – {lessonEndTimeInZone(lesson, viewerIana)}</span>
                    </Button>
                  ))}
                </div>
                <div className={styles.confirmActions}>
                  <Button type="button" className={styles.confirmPrimary} onClick={() => setConflictDialog(null)}>
                    {t('calendar.dialog.close')}
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
                    {t('calendar.dialog.ok')}
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
                  {confirm.type === 'detach' ? seriesDialogText.detachTitle : seriesDialogText.applyAllTitle}
                </div>
                <div className={styles.confirmBody}>
                  {confirm.type === 'detach' ? seriesDialogText.detachBody : seriesDialogText.applyAllBody}
                </div>
                <div className={styles.confirmActions}>
                  <Button
                    type="button"
                    className={styles.confirmSecondary}
                    onClick={() => {
                      setLessons((prev) =>
                        prev.map((lesson) => lesson.id === confirm.before.id ? confirm.before : lesson),
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
                    {confirm.type === 'detach' ? seriesDialogText.detachConfirm : seriesDialogText.applyAllConfirm}
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
                <div className={styles.confirmTitle}>{t('calendar.series.deletePlannedTitle')}</div>
                <div className={styles.confirmBody}>
                  {t('calendar.series.deletePlannedBody', { count: String(plannedCount) })}
                </div>
                <div className={styles.confirmActions}>
                  <Button type="button" className={styles.confirmSecondary} disabled={overlayConfirmBusy} onClick={() => setConfirmDeleteSeriesOpen(false)}>
                    {t('calendar.series.cancel')}
                  </Button>
                  <Button
                    type="button"
                    className={styles.confirmDanger}
                    loadingLabel={t('calendar.series.deleting')}
                    onPendingChange={setOverlayConfirmBusy}
                    onClick={async () => {
                      try {
                        const { removedIds } = await deleteScheduledLessonSeries({ lessons, seriesId, canManage, deleteScheduledLesson });
                        const removed = new Set(removedIds);
                        setLessons((prev) => prev.filter((lesson) => !removed.has(lesson.id)));
                        setConfirmDeleteSeriesOpen(false);
                        closeModal();
                      } catch (error) {
                        setWarningDialog({ open: true, title: t('calendar.warning.couldNotDeleteSeries'), message: persistenceErrorMessage(error) });
                      }
                    }}
                  >
                    {t('calendar.series.deleteAll')}
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
              <div className={styles.confirmTitle}>{t('calendar.series.deleteLessonTitle')}</div>
              <div className={styles.confirmBody}>{t('calendar.series.deleteLessonBody')}</div>
              <div className={styles.confirmActions}>
                <Button type="button" className={styles.confirmSecondary} disabled={overlayConfirmBusy} onClick={() => setConfirmDeleteOpen(false)}>
                  {t('calendar.series.cancel')}
                </Button>
                <Button
                  type="button"
                  className={styles.confirmDanger}
                  loadingLabel={t('calendar.series.deleting')}
                  onPendingChange={setOverlayConfirmBusy}
                  onClick={async () => {
                    if (!editingLesson) return;
                    const backendId = getLessonBackendId(editingLesson);
                    try {
                      if (canManage && backendId) await deleteScheduledLesson(backendId);
                    } catch (error) {
                      setWarningDialog({ open: true, title: t('calendar.warning.couldNotDeleteLesson'), message: persistenceErrorMessage(error) });
                      return;
                    }
                    setLessons((prev) => prev.filter((lesson) => lesson.id !== editingLesson.id));
                    setConfirmDeleteOpen(false);
                    closeModal();
                  }}
                >
                  {t('calendar.series.delete')}
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
              <div className={styles.confirmTitle}>{t('calendar.series.unlinkTitle')}</div>
              <div className={styles.confirmBody}>{t('calendar.series.unlinkBody')}</div>
              <div className={styles.confirmActions}>
                <Button type="button" className={styles.confirmSecondary} disabled={overlayConfirmBusy} onClick={() => setConfirmUnlinkOpen(false)}>
                  {t('calendar.series.cancel')}
                </Button>
                <Button
                  type="button"
                  className={styles.confirmPrimary}
                  loadingLabel={t('calendar.series.unlinking')}
                  onPendingChange={setOverlayConfirmBusy}
                  onClick={async () => {
                    if (!editingLesson || !form) return;
                    const unlinkedCandidate = {
                      ...buildLessonCandidate({ ...form, recurrence: 'none', weeklyDays: [] }, lessons, editingLesson),
                      seriesId: undefined,
                    };
                    try {
                      if (canManage && getLessonBackendId(editingLesson)) {
                        const persisted = await persistUpdate(unlinkedCandidate, editingLesson, { includeLessonContent: false });
                        if (persisted) {
                          setLessons((prev) => prev.map((l) => l.id === editingLesson.id ? persisted : l));
                          setEditingLesson(persisted);
                          setForm(toLessonFormState(persisted));
                          setConfirmUnlinkOpen(false);
                          return;
                        }
                      }
                    } catch (error) {
                      setWarningDialog({ open: true, title: t('calendar.warning.couldNotUnlink'), message: persistenceErrorMessage(error) });
                      return;
                    }
                    setLessons((prev) =>
                      prev.map((l) => l.id === editingLesson.id ? { ...l, seriesId: undefined, recurrence: 'none', weeklyDays: [] } : l),
                    );
                    setEditingLesson((prev) => prev ? { ...prev, seriesId: undefined, recurrence: 'none', weeklyDays: [] } : prev);
                    setForm((prev) => prev ? { ...prev, recurrence: 'none', weeklyDays: [] } : prev);
                    setConfirmUnlinkOpen(false);
                  }}
                >
                  {t('calendar.series.unlinkConfirm')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </WhenPortaled>
    </>
  );
}
