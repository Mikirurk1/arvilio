'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Clock,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button, PageHeader, SurfaceCard } from '../../components/ui';
import { USER_ROLE, type UserRole } from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import {
  fromBackendLessons,
  getLessonRouteId,
  hydrateLessonPartyNames,
  lessonIncludesViewer,
} from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { useViewerPartyNumericId } from '../../hooks/use-viewer-party-numeric-id';
import { lessonStartUtc } from '../../lib/lessonTime';
import { LessonModal, useLessonEditor } from '../../features/lesson-modal';
import { LessonsListPanel } from '../../components/lessons/LessonsListPanel';
import { useLessonsStore } from '../../stores/lessons-store';
import styles from './page.module.scss';

function statusLabel(statusId: ScheduledLessonDto['statusId']) {
  if (statusId === LESSON_STATUS.planned.id) return 'Planned';
  if (statusId === LESSON_STATUS.completed.id) return 'Completed';
  return 'Cancelled';
}

type HomeworkHighlightVariant = 'success' | 'info' | 'warning' | 'danger';

function lessonHasHomework(lesson: ScheduledLessonDto): boolean {
  const hw = lesson.homework;
  return Boolean(hw?.text?.trim() || (hw?.files && hw.files.length > 0));
}

/**
 * Homework badge for highlight cards: do not use danger (red) when submission
 * is not available yet (e.g. planned lesson) — same rule as canStudentSubmitHomework.
 */
function homeworkHighlightStatus(lesson: ScheduledLessonDto, viewerRole: UserRole): {
  label: string;
  variant: HomeworkHighlightVariant;
  showAlertIcon: boolean;
} {
  if (lesson.statusId === LESSON_STATUS.cancelled.id) {
    return { label: '—', variant: 'info', showAlertIcon: false };
  }

  const responseStatus = lesson.studentResponse?.status ?? 'not_submitted';
  const hasHomework = lessonHasHomework(lesson);

  if (lesson.statusId !== LESSON_STATUS.completed.id) {
    if (!hasHomework) {
      return { label: 'No homework assigned', variant: 'info', showAlertIcon: false };
    }
    const label =
      viewerRole === USER_ROLE.student.id ? 'Opens after the lesson' : 'Pending (lesson not completed)';
    return { label, variant: 'info', showAlertIcon: false };
  }

  if (!hasHomework) {
    return { label: 'No homework', variant: 'info', showAlertIcon: false };
  }

  if (responseStatus === 'accepted') {
    return { label: 'Accepted', variant: 'success', showAlertIcon: false };
  }
  if (responseStatus === 'submitted') {
    return { label: 'Submitted', variant: 'info', showAlertIcon: false };
  }
  if (responseStatus === 'needs_rework') {
    return { label: 'Needs rework', variant: 'warning', showAlertIcon: true };
  }
  return { label: 'Not submitted', variant: 'danger', showAlertIcon: true };
}

function formatShortDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function toStartTimeMs(lesson: ScheduledLessonDto): number {
  return lessonStartUtc(lesson).getTime();
}

export default function LessonsPage() {
  return (
    <Suspense fallback={null}>
      <LessonsPageInner />
    </Suspense>
  );
}

function LessonsPageInner() {
  const router = useRouter();
  const activeUser = useActiveUser();
  const role = activeUser.role;
  const viewerPartyNumericId = useViewerPartyNumericId();

  const {
    lessons,
    canManageLessons,
    modalMode,
    editingLesson,
    form,
    setForm,
    openEditModal,
    closeModal,
    submitModal,
    saveStudentResponse,
    handleUnlinkSeries,
    handleDeleteSeries,
    handleDeleteLesson,
    visibleStudents,
    assignableTeachers,
    lessonBackendId,
    persistedLessonId,
    studentBackendId,
    recurrenceAllowed,
  } = useLessonEditor();

  const lessonsPage = useLessonsStore((s) => s.lessonsPage);
  const fetchLessonsPage = useLessonsStore((s) => s.fetchLessonsPage);
  const loadMoreLessonsPage = useLessonsStore((s) => s.loadMoreLessonsPage);
  const { nameByNumericId } = useLessonPartyOptions();

  useEffect(() => {
    void fetchLessonsPage(true);
  }, [fetchLessonsPage]);

  const visibleLessons = useMemo(
    () =>
      lessons
        .filter((lesson) =>
          lessonIncludesViewer(lesson, viewerPartyNumericId ?? activeUser.id, role),
        )
        .sort((a, b) => toStartTimeMs(a) - toStartTimeMs(b)),
    [lessons, role, viewerPartyNumericId, activeUser.id],
  );

  const listLessons = useMemo(() => {
    const fromPage = hydrateLessonPartyNames(
      fromBackendLessons(lessonsPage.items).filter((lesson) =>
        lessonIncludesViewer(lesson, viewerPartyNumericId ?? activeUser.id, role),
      ),
      nameByNumericId,
    ).sort((a, b) => toStartTimeMs(b) - toStartTimeMs(a));

    if (fromPage.length > 0) return fromPage;

    if (lessonsPage.status === 'loading' || lessonsPage.status === 'idle') {
      return [];
    }

    // Paginated slice empty (or failed) — fall back to full list from provider.
    return [...visibleLessons].sort((a, b) => toStartTimeMs(b) - toStartTimeMs(a));
  }, [
    lessonsPage.items,
    lessonsPage.status,
    nameByNumericId,
    role,
    viewerPartyNumericId,
    activeUser.id,
    visibleLessons,
  ]);

  const now = Date.now();
  const nextLesson = useMemo(
    () =>
      visibleLessons.find(
        (lesson) =>
          lesson.statusId === LESSON_STATUS.planned.id &&
          toStartTimeMs(lesson) >= now,
      ) ?? null,
    [visibleLessons, now],
  );
  const previousLesson = useMemo(
    () => [...visibleLessons].reverse().find((lesson) => toStartTimeMs(lesson) < now) ?? null,
    [visibleLessons, now],
  );

  const nextLessonHomework = useMemo(
    () => (nextLesson ? homeworkHighlightStatus(nextLesson, role) : null),
    [nextLesson, role],
  );
  const previousLessonHomework = useMemo(
    () => (previousLesson ? homeworkHighlightStatus(previousLesson, role) : null),
    [previousLesson, role],
  );
  const lessonStats = useMemo(() => {
    const planned = visibleLessons.filter((lesson) => lesson.statusId === LESSON_STATUS.planned.id).length;
    const completed = visibleLessons.filter((lesson) => lesson.statusId === LESSON_STATUS.completed.id).length;
    const cancelled = visibleLessons.filter((lesson) => lesson.statusId === LESSON_STATUS.cancelled.id).length;
    return { planned, completed, cancelled };
  }, [visibleLessons]);

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          title="Lessons"
          subtitle="Your course schedule — upcoming and past lessons in one place."
          actions={
            <Button variant="primary" href="/calendar" className={styles.openCalendarBtn}>
              Open calendar
            </Button>
          }
        />

        <section className={styles.scheduleSection} aria-label="Lesson highlights">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>Highlights</h2>
            <span className={styles.sectionHint}>Next and previous checkpoints</span>
          </div>
          <div className={styles.highlightsGrid}>
        <SurfaceCard
          className={`${styles.highlightCard} ${styles.highlightCardNext} ${nextLesson ? styles.highlightCardClickable : ''}`}
          role={nextLesson ? 'button' : undefined}
          tabIndex={nextLesson ? 0 : undefined}
          onClick={() => (nextLesson ? router.push(`/lessons/${getLessonRouteId(nextLesson)}`) : undefined)}
          onKeyDown={(event) => {
            if (!nextLesson) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push(`/lessons/${getLessonRouteId(nextLesson)}`);
            }
          }}
        >
          <div className={styles.highlightHead}>
            <h3 className={styles.highlightTitle}>Your next lesson</h3>
            {nextLesson ? (
              <span
                className={`${styles.statusPill} ${nextLesson.statusId === LESSON_STATUS.planned.id ? styles.statusPlanned : ''} ${nextLesson.statusId === LESSON_STATUS.completed.id ? styles.statusCompleted : ''} ${nextLesson.statusId === LESSON_STATUS.cancelled.id ? styles.statusCancelled : ''}`}
              >
                {statusLabel(nextLesson.statusId)}
              </span>
            ) : null}
          </div>
          {nextLesson ? (
            <>
              <div className={styles.highlightLessonTitle}>{nextLesson.title}</div>
              {/* V3-01: Time is the hero element — large Lora display number */}
              <div className={styles.highlightTimeHero} aria-label={`${nextLesson.startTime} to ${nextLesson.endTime}`}>
                {nextLesson.startTime}
              </div>
              <div className={styles.lessonMetaRow}>
                <span className={styles.metaItem}>
                  <Calendar size={14} aria-hidden />
                  {formatShortDate(nextLesson.date)}
                </span>
                <span className={styles.metaItem}>
                  <Clock size={14} aria-hidden />
                  –{nextLesson.endTime} · {nextLesson.duration} min
                </span>
                <span className={styles.metaItem}>
                  <Users size={14} aria-hidden />
                  {nextLesson.teacherName}
                  <span className={styles.metaSep}>·</span>
                  {nextLesson.studentName}
                </span>
              </div>
              <p className={styles.highlightDescription}>
                {nextLesson.lessonPlan || nextLesson.notes || 'No lesson notes yet.'}
              </p>
              <div className={styles.highlightFooter}>
                <div className={styles.highlightExtraRow}>
                  <span className={styles.highlightExtraIcon}><BookOpen size={13} /></span>
                  <strong>Materials:</strong> {nextLesson.materials?.length ?? 0}
                </div>
                <div className={styles.highlightExtraRow}>
                  <span className={styles.highlightExtraIcon}>
                    {nextLessonHomework?.showAlertIcon ? (
                      <CircleAlert size={13} aria-hidden />
                    ) : (
                      <CheckCircle2 size={13} aria-hidden />
                    )}
                  </span>
                  <strong>Homework status:</strong>
                  <span
                    className={`${styles.homeworkStatusBadge} ${styles[`homeworkStatus${nextLessonHomework?.variant}`]}`}
                  >
                    {nextLessonHomework?.label}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptySmall}>No upcoming lessons scheduled yet.</div>
          )}
        </SurfaceCard>

        <SurfaceCard
          className={`${styles.highlightCard} ${styles.highlightCardPrevious} ${previousLesson ? styles.highlightCardClickable : ''}`}
          role={previousLesson ? 'button' : undefined}
          tabIndex={previousLesson ? 0 : undefined}
          onClick={() =>
            previousLesson ? router.push(`/lessons/${getLessonRouteId(previousLesson)}`) : undefined
          }
          onKeyDown={(event) => {
            if (!previousLesson) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push(`/lessons/${getLessonRouteId(previousLesson)}`);
            }
          }}
        >
          <div className={styles.highlightHead}>
            <h3 className={styles.highlightTitle}>Your previous lesson</h3>
            {previousLesson ? (
              <span
                className={`${styles.statusPill} ${previousLesson.statusId === LESSON_STATUS.planned.id ? styles.statusPlanned : ''} ${previousLesson.statusId === LESSON_STATUS.completed.id ? styles.statusCompleted : ''} ${previousLesson.statusId === LESSON_STATUS.cancelled.id ? styles.statusCancelled : ''}`}
              >
                {statusLabel(previousLesson.statusId)}
              </span>
            ) : null}
          </div>
          {previousLesson ? (
            <>
              <div className={styles.highlightLessonTitle}>{previousLesson.title}</div>
              <div className={styles.lessonMetaRow}>
                <span className={styles.metaItem}>
                  <Calendar size={14} aria-hidden />
                  {formatShortDate(previousLesson.date)}
                </span>
                <span className={styles.metaItem}>
                  <Clock size={14} aria-hidden />
                  {previousLesson.startTime}–{previousLesson.endTime} · {previousLesson.duration} min
                </span>
                <span className={styles.metaItem}>
                  <Users size={14} aria-hidden />
                  {previousLesson.teacherName}
                  <span className={styles.metaSep}>·</span>
                  {previousLesson.studentName}
                </span>
              </div>
              <p className={styles.highlightDescription}>
                {previousLesson.lessonPlan || previousLesson.notes || 'No lesson notes yet.'}
              </p>
              <div className={styles.highlightFooter}>
                <div className={styles.highlightExtraRow}>
                  <span className={styles.highlightExtraIcon}><BookOpen size={13} /></span>
                  <strong>Materials:</strong> {previousLesson.materials?.length ?? 0}
                </div>
                <div className={styles.highlightExtraRow}>
                  <span className={styles.highlightExtraIcon}>
                    {previousLessonHomework?.showAlertIcon ? (
                      <CircleAlert size={13} aria-hidden />
                    ) : (
                      <CheckCircle2 size={13} aria-hidden />
                    )}
                  </span>
                  <strong>Homework status:</strong>
                  <span
                    className={`${styles.homeworkStatusBadge} ${styles[`homeworkStatus${previousLessonHomework?.variant}`]}`}
                  >
                    {previousLessonHomework?.label}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptySmall}>No previous lessons available yet.</div>
          )}
        </SurfaceCard>
          </div>
        </section>

        <section className={styles.overviewStrip} aria-label="Lesson workspace overview">
          <SurfaceCard className={styles.kpiCard}>
            <div className={styles.kpiGrid}>
              <div className={styles.kpiItem}>
                <span className={styles.kpiLabel}>Planned</span>
                <span className={styles.kpiValue}>{lessonStats.planned}</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiLabel}>Completed</span>
                <span className={styles.kpiValue}>{lessonStats.completed}</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiLabel}>Cancelled</span>
                <span className={styles.kpiValue}>{lessonStats.cancelled}</span>
              </div>
            </div>
          </SurfaceCard>
        </section>

        <section className={styles.listSection} aria-labelledby="lessons-list-heading">
          <div className={styles.listSectionHead}>
            <h2 id="lessons-list-heading" className={styles.sectionTitle}>
              All lessons
            </h2>
            <Link href="/calendar" className={styles.listSectionLink}>
              Calendar view →
            </Link>
          </div>
          <LessonsListPanel
          lessons={listLessons}
          canManageLessons={canManageLessons}
          onEditLesson={openEditModal}
          defaultStatusFilter="all"
          hasMore={lessonsPage.hasMore}
          loadingMore={lessonsPage.loadingMore}
          listLoading={lessonsPage.status === 'loading' || lessonsPage.status === 'idle'}
          onLoadMore={() => void loadMoreLessonsPage()}
          />
        </section>
      </div>

      {form ? (
        <LessonModal
          mode={modalMode}
          canEdit={canManageLessons}
          role={role}
          form={form}
          onChange={setForm}
          onClose={closeModal}
          recurrenceAllowed={recurrenceAllowed}
          canUnlinkSeries={modalMode === 'edit' && canManageLessons && Boolean(editingLesson?.seriesId)}
          onUnlinkSeries={handleUnlinkSeries}
          canDeleteSeries={modalMode === 'edit' && canManageLessons && Boolean(editingLesson?.seriesId)}
          onDeleteSeries={handleDeleteSeries}
          canDeleteLesson={modalMode === 'edit' && role !== USER_ROLE.student.id}
          onDeleteLesson={handleDeleteLesson}
          onSubmit={submitModal}
          onSaveStudentResponse={saveStudentResponse}
          students={visibleStudents}
          teachers={assignableTeachers}
          lessonBackendId={lessonBackendId}
          persistedLessonId={persistedLessonId}
          studentBackendId={studentBackendId}
        />
      ) : null}
    </div>
  );
}
