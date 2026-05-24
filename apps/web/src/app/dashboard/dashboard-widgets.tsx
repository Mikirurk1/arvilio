'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  CalendarPlus,
  ClipboardCheck,
  MessageSquare,
  Users,
} from 'lucide-react';
import type { ScheduledLessonBackendDto, StudentSummaryBackendDto } from '@pkg/types';
import { SectionHeader, SurfaceCard } from '../../components/ui';
import { isTeacherAdminOrSuperKey, useActiveRoleKey } from '../../lib/active-user';
import {
  formatShortWeekdayDate,
  lessonCountByDate,
  monthCalendarMeta,
  pickPendingHomeworkLessons,
} from '../../lib/dashboard-hero';
import { fromBackendLesson } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import {
  lessonDateKeyInZone,
  lessonEndTimeInZone,
  lessonStartTimeInZone,
} from '../../lib/lessonTime';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import { useChatNavBadge } from '../../hooks/use-chat-nav-badge';
import { usePracticeNavBadge } from '../../hooks/use-practice-nav-badge';
import { useStudentsStore } from '../../stores/students-store';
import styles from './page.module.scss';

type QuickAction = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export function DashboardQuickActions() {
  const role = useActiveRoleKey();
  const chatUnread = useChatNavBadge();
  const practicePendingTotal = usePracticeNavBadge();
  const isStaff = isTeacherAdminOrSuperKey(role);

  const actions: QuickAction[] = [
    {
      href: '/calendar',
      label: 'Calendar',
      icon: <Calendar size={18} aria-hidden />,
    },
    {
      href: '/practice',
      label: 'Practice',
      icon: <BookOpen size={18} aria-hidden />,
      badge: practicePendingTotal > 0 ? practicePendingTotal : undefined,
    },
    {
      href: '/vocabulary',
      label: 'Vocabulary',
      icon: <ClipboardCheck size={18} aria-hidden />,
    },
    {
      href: '/chat',
      label: 'Chat',
      icon: <MessageSquare size={18} aria-hidden />,
      badge: chatUnread > 0 ? chatUnread : undefined,
    },
    ...(isStaff
      ? [
          {
            href: '/students',
            label: 'Students',
            icon: <Users size={18} aria-hidden />,
          },
          {
            href: '/lessons?create=1',
            label: 'New lesson',
            icon: <CalendarPlus size={18} aria-hidden />,
          },
        ]
      : [
          {
            href: '/quiz',
            label: 'Quizzes',
            icon: <ClipboardCheck size={18} aria-hidden />,
          },
        ]),
  ];

  return (
    <div className={styles.quickActions}>
      {actions.map((action) => (
        <Link key={action.href} href={action.href} className={styles.quickAction}>
          <span className={styles.quickActionIcon}>{action.icon}</span>
          <span className={styles.quickActionLabel}>{action.label}</span>
          {action.badge !== undefined ? (
            <span className={styles.quickActionBadge}>{action.badge > 99 ? '99+' : action.badge}</span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function studentDisplayName(
  students: StudentSummaryBackendDto[] | undefined,
  studentId: string,
): string {
  return students?.find((row) => row.id === studentId)?.displayName ?? 'Student';
}

export function TeacherHomeworkPanel({
  lessons,
  students,
}: {
  lessons: ScheduledLessonBackendDto[];
  students: StudentSummaryBackendDto[] | undefined;
}) {
  const pending = useMemo(() => pickPendingHomeworkLessons(lessons), [lessons]);

  return (
    <SurfaceCard className={styles.panel}>
      <SectionHeader
        className={styles.panelHead}
        titleClassName={styles.sectionTitle}
        title="Homework to review"
        actionHref="/lessons"
        actionLabel="All lessons →"
        actionClassName={styles.seeAll}
      />
      {pending.length === 0 ? (
        <p className={styles.panelHint}>No submitted homework waiting for review.</p>
      ) : (
        <ul className={styles.compactList}>
          {pending.map((lesson) => (
            <li key={lesson.id}>
              <Link href={`/lessons/${lesson.id}`} className={styles.compactRow}>
                <span className={styles.compactTitle}>{lesson.title}</span>
                <span className={styles.compactMeta}>
                  {studentDisplayName(students, lesson.studentId)} · {formatShortWeekdayDate(lesson.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}

export function TeacherStudentsPanel() {
  const list = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const rows = (list.data ?? []).slice(0, 5);
  const loading = list.status === 'loading' || list.status === 'idle';

  return (
    <SurfaceCard className={styles.panel}>
      <SectionHeader
        className={styles.panelHead}
        titleClassName={styles.sectionTitle}
        title="My students"
        actionHref="/students"
        actionLabel="All →"
        actionClassName={styles.seeAll}
      />
      {loading ? (
        <p className={styles.panelHint}>Loading…</p>
      ) : rows.length === 0 ? (
        <p className={styles.panelHint}>No students assigned yet.</p>
      ) : (
        <>
          <p className={styles.panelHint}>{list.data?.length ?? 0} students total</p>
          <ul className={styles.compactList}>
            {rows.map((student) => (
              <li key={student.id}>
                <Link href={`/students/${student.id}`} className={styles.compactRow}>
                  <span className={styles.compactTitle}>{student.displayName}</span>
                  <span className={styles.compactMeta}>
                    {student.proficiencyLevel ?? '—'} · {student.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </SurfaceCard>
  );
}

export function TeacherScheduleGlancePanel({ lessons }: { lessons: ScheduledLessonBackendDto[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const lessonCounts = useMemo(
    () => lessonCountByDate(lessons, year, monthIndex),
    [lessons, year, monthIndex],
  );
  const meta = monthCalendarMeta(null, now);
  const total = Object.values(lessonCounts).reduce((sum, n) => sum + n, 0);

  return (
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitle}>Lessons this month</div>
      <p className={styles.calSub}>{total} lesson{total === 1 ? '' : 's'} on your calendar</p>
      <div className={styles.calGrid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className={styles.calDayName}>
            {day}
          </div>
        ))}
        {Array.from({ length: meta.leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} className={styles.calEmpty} />
        ))}
        {meta.days.map((day) => {
          const count = lessonCounts[day] ?? 0;
          return (
            <div
              key={day}
              className={`${styles.calDay} ${count > 0 ? styles.calLessonDay : ''} ${day === meta.today ? styles.calToday : ''}`}
              title={count > 0 ? `${count} lesson${count === 1 ? '' : 's'}` : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
      <Link href="/calendar" className={styles.calLink}>
        Open calendar →
      </Link>
    </SurfaceCard>
  );
}

export function WeekLessonsList({
  lessons,
  students,
  showStudentNames,
}: {
  lessons: ScheduledLessonBackendDto[];
  students?: StudentSummaryBackendDto[];
  showStudentNames: boolean;
}) {
  const { iana: viewerIana } = useViewerTimezone();
  if (lessons.length === 0) return null;

  return (
    <>
      <SectionHeader
        className={styles.sectionHead}
        titleClassName={styles.sectionTitle}
        title="Coming up this week"
        actionHref="/calendar"
        actionLabel="Calendar →"
        actionClassName={styles.seeAll}
      />
      <ul className={styles.weekList}>
        {lessons.map((lesson) => {
          const dto = fromBackendLesson(lesson);
          const viewerDate = lessonDateKeyInZone(dto, viewerIana);
          return (
          <li key={lesson.id}>
            <Link href={`/lessons/${lesson.id}`} className={styles.weekRow}>
              <span className={styles.weekDate}>{formatShortWeekdayDate(viewerDate)}</span>
              <span className={styles.weekMain}>
                <span className={styles.weekTitle}>{lesson.title}</span>
                <span className={styles.weekMeta}>
                  {lessonStartTimeInZone(dto, viewerIana)}–{lessonEndTimeInZone(dto, viewerIana)} · {lesson.duration} min
                  {showStudentNames
                    ? ` · ${studentDisplayName(students, lesson.studentId)}`
                    : ''}
                </span>
              </span>
              <span className={styles.weekStatus}>{lesson.status}</span>
            </Link>
          </li>
          );
        })}
      </ul>
    </>
  );
}
