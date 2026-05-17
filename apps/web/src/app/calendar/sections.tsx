'use client';

import type { ScheduledLessonDto } from '@soenglish/shared-types';
import { useRouter } from 'next/navigation';
import { LESSON_STATUS } from '@soenglish/shared-types';
import { AdaptiveSelect, Button, CalendarEventCard, SegmentedControl, SurfaceCard } from '../../components/ui';
import { USER_ROLE, type UserRole } from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import {
  getIanaForTimeZoneId,
  lessonEndTimeInZone,
  lessonStartTimeInZone,
} from '../../lib/lessonTime';
import styles from './page.module.scss';

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
  role: UserRole;
  onRequestLesson: () => void;
}) {
  const isStudent = role === USER_ROLE.student.id;
  return (
    <div className={styles.headerRight}>
      <SegmentedControl
        value={view}
        onValueChange={setView}
        ariaLabel="Calendar view"
        className={styles.viewToggle}
        optionClassName={styles.viewBtn}
        activeOptionClassName={styles.viewActive}
        options={[
          { value: 'month', label: 'Month' },
          { value: 'week', label: 'Week' },
        ]}
      />
      {showAudienceToggle ? (
        <SegmentedControl
          value={audience}
          onValueChange={(value) => setAudience(value as 'all' | 'my-students')}
          ariaLabel="Calendar audience"
          className={styles.roleToggle}
          optionClassName={styles.roleBtn}
          activeOptionClassName={styles.roleActive}
          options={[
            { value: 'all', label: 'All' },
            { value: 'my-students', label: 'My students' },
          ]}
        />
      ) : null}
      {showAudienceToggle && audience === 'all' ? (
        <AdaptiveSelect
          className={styles.teacherFilter}
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          aria-label="Filter by teacher"
        >
          <option value="all-teachers">All teachers</option>
          {teacherOptions.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </AdaptiveSelect>
      ) : null}
      {isStudent ? (
        <Button type="button" className={styles.createLessonBtn} onClick={onRequestLesson}>
          Request lesson
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
  role?: UserRole;
  getLessonColor: (lesson: ScheduledLessonDto) => 'Blue' | 'Green' | 'Amber' | 'Purple';
}) {
  const router = useRouter();
  const activeUser = useActiveUser();
  const viewerIana = getIanaForTimeZoneId(activeUser.timezoneId);
  return (
    <div className={styles.calSidebar}>
      <SurfaceCard className={styles.sidePanel}>
        <div className={styles.sidePanelTitle}>
          {selectedDate
            ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            : 'Select a date'}
        </div>
        {selectedLessons.length === 0 && selectedDate ? <div className={styles.noEvents}>No lessons scheduled</div> : null}
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
            typeLabel={lesson.studentName}
            typeVariant={
              getLessonColor(lesson) === 'Green'
                ? 'green'
                : getLessonColor(lesson) === 'Amber'
                  ? 'amber'
                  : 'blue'
            }
            statusLabel={lesson.statusId === LESSON_STATUS.completed.id ? 'completed' : 'planned'}
            statusVariant={lesson.statusId === LESSON_STATUS.completed.id ? 'green' : 'amber'}
            title={lesson.title}
            time={`${lessonStartTimeInZone(lesson, viewerIana)}–${lessonEndTimeInZone(lesson, viewerIana)}`}
            teacherName={lesson.teacherName}
            actionLabel="Open lesson"
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
  return (
    <div className={styles.calNav}>
      <Button type="button" className={styles.navBtn} onClick={onPrev}>←</Button>
      <h2 className={styles.calMonthTitle}>{monthLabel}</h2>
      <Button type="button" className={styles.navBtn} onClick={onNext}>→</Button>
    </div>
  );
}
