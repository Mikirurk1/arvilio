'use client';

import type { ScheduledLessonDto } from '@pkg/types';
import { useRouter } from 'next/navigation';
import { LESSON_STATUS } from '@pkg/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, CalendarEventCard, Field, SegmentedControl, SurfaceCard } from '../../components/ui';
import { USER_ROLE, type UserRoleId } from '@pkg/types';
import { lessonEndTimeInZone, lessonStartTimeInZone } from '../../lib/lessonTime';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import { formatLessonStudentLabel } from '../../lib/lesson-display';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

function statusLabelKey(statusId: number): string {
  if (statusId === LESSON_STATUS.completed.id) return 'dashboard.lessonStatus.completed';
  if (statusId === LESSON_STATUS.cancelled.id) return 'dashboard.lessonStatus.cancelled';
  return 'dashboard.lessonStatus.planned';
}

export function CalendarHeaderControls({
  view,
  setView,
  showAudienceToggle,
  audience,
  setAudience,
  teacherFilter,
  setTeacherFilter,
  teacherOptions,
  role,
  onRequestLesson,
}: {
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  showAudienceToggle: boolean;
  audience: 'all' | 'my-students';
  setAudience: (audience: 'all' | 'my-students') => void;
  teacherFilter: string;
  setTeacherFilter: (teacherId: string) => void;
  teacherOptions: Array<{ id: number; name: string }>;
  role: UserRoleId;
  onRequestLesson: () => void;
}) {
  const t = useCampusT();
  const isStudent = role === USER_ROLE.student.id;
  return (
    <div className={styles.headerRight} data-tour-anchor="calendar-toolbar">
      <SegmentedControl
        value={view}
        onValueChange={setView}
        ariaLabel={t('calendar.view.aria')}
        className={styles.viewToggle}
        optionClassName={styles.viewBtn}
        activeOptionClassName={styles.viewActive}
        options={[
          { value: 'month', label: t('calendar.view.month') },
          { value: 'week', label: t('calendar.view.week') },
        ]}
      />
      {showAudienceToggle ? (
        <SegmentedControl
          value={audience}
          onValueChange={(value) => setAudience(value as 'all' | 'my-students')}
          ariaLabel={t('calendar.audience.aria')}
          className={styles.roleToggle}
          optionClassName={styles.roleBtn}
          activeOptionClassName={styles.roleActive}
          options={[
            { value: 'all', label: t('calendar.audience.all') },
            { value: 'my-students', label: t('calendar.audience.myStudents') },
          ]}
        />
      ) : null}
      {showAudienceToggle && audience === 'all' ? (
        <div className={styles.teacherFilterWrap}>
          <Field as="select"
            className={styles.teacherFilter}
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            aria-label={t('calendar.teacherFilter.aria')}
          >
            <option value="all-teachers">{t('calendar.teacherFilter.all')}</option>
            {teacherOptions.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Field>
        </div>
      ) : null}
      {isStudent ? (
        <Button
          type="button"
          className={styles.createLessonBtn}
          onClick={onRequestLesson}
          data-tour-anchor="calendar-request-lesson"
        >
          {t('calendar.requestLesson')}
        </Button>
      ) : null}
    </div>
  );
}

export function SelectedDateSidebar({
  selectedDate,
  selectedLessons,
  getLessonColor,
}: {
  selectedDate: string | null;
  selectedLessons: ScheduledLessonDto[];
  role?: UserRoleId;
  getLessonColor: (lesson: ScheduledLessonDto) => 'Blue' | 'Green' | 'Amber' | 'Purple';
}) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const router = useRouter();
  const { iana: viewerIana } = useViewerTimezone();
  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-GB';
  return (
    <div className={styles.calSidebar}>
      <SurfaceCard className={styles.sidePanel}>
        <div className={styles.sidePanelTitle}>
          {selectedDate
            ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString(dateLocale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            : t('calendar.selectDate')}
        </div>
        {selectedLessons.length === 0 && selectedDate ? (
          <div className={styles.noEvents}>{t('calendar.noLessons')}</div>
        ) : null}
        {selectedLessons.map((lesson) => (
          <CalendarEventCard
            key={lesson.id}
            className={`${styles.eventCard} ${styles[`evt${getLessonColor(lesson)}`]}`}
            headerClassName={styles.evtHeader}
            typeClassName={styles.evtType}
            statusClassName={`${styles.evtStatus} ${lesson.statusId === LESSON_STATUS.completed.id ? styles.statusConfirmed : styles.statusPending}`}
            titleClassName={styles.evtTitle}
            metaClassName={styles.evtMeta}
            teacherClassName={styles.evtTeacher}
            actionsClassName={styles.evtActions}
            actionButtonClassName={styles.rescheduleBtn}
            typeLabel={
              groupLessonsEnabled && lesson.kind === 'group'
                ? `${formatLessonStudentLabel(lesson)} · ${t('lessons.kind.group')}`
                : lesson.studentName
            }
            typeVariant={
              getLessonColor(lesson) === 'Green'
                ? 'green'
                : getLessonColor(lesson) === 'Amber'
                  ? 'amber'
                  : 'blue'
            }
            statusLabel={t(statusLabelKey(lesson.statusId))}
            statusVariant={lesson.statusId === LESSON_STATUS.completed.id ? 'green' : 'amber'}
            title={lesson.title}
            time={`${lessonStartTimeInZone(lesson, viewerIana)}–${lessonEndTimeInZone(lesson, viewerIana)}`}
            durationLabel={t('lessons.durationMin', { duration: lesson.duration })}
            teacherName={lesson.teacherName}
            actionLabel={t('calendar.openLesson')}
            onAction={() => router.push(`/lessons/${lesson.id}`)}
          />
        ))}
      </SurfaceCard>
    </div>
  );
}

export function CalendarMonthNavigator({
  monthLabel,
  onPrev,
  onNext,
}: {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useCampusT();
  return (
    <div className={styles.calNav}>
      <Button type="button" className={styles.navBtn} aria-label={t('calendar.nav.prevAria')} onClick={onPrev}><ChevronLeft size={16} strokeWidth={2} /></Button>
      <h2 className={styles.calMonthTitle}>{monthLabel}</h2>
      <Button type="button" className={styles.navBtn} aria-label={t('calendar.nav.nextAria')} onClick={onNext}><ChevronRight size={16} strokeWidth={2} /></Button>
    </div>
  );
}
