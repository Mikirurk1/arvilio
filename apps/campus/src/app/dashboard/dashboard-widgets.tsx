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
import { Button, SectionHeader, SurfaceCard } from '../../components/ui';
import { isTeacherAdminOrSuperKey, useActiveRoleKey } from '../../lib/active-user';
import { useCampusI18n, useCampusT } from '../../lib/cms';
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
import { usePracticePendingCounts } from '../../hooks/use-practice-nav-badge';
import { useOpenCreateLesson } from '../../features/lesson-modal';
import { useStudentsStore } from '../../stores/students-store';
import styles from './page.module.scss';

function lessonStatusKey(status: string): string {
  const known = ['planned', 'completed', 'cancelled', 'in_progress'];
  return known.includes(status) ? `dashboard.lessonStatus.${status}` : status;
}

type QuickAction = {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export function DashboardQuickActions() {
  const t = useCampusT();
  const openCreateLesson = useOpenCreateLesson();
  const role = useActiveRoleKey();
  const chatUnread = useChatNavBadge();
  const { total: practicePendingTotal, vocabPending, incompleteQuizzes } =
    usePracticePendingCounts();
  const isStaff = isTeacherAdminOrSuperKey(role);

  const actions: QuickAction[] = [
    {
      href: '/calendar',
      label: t('nav.calendar'),
      icon: <Calendar size={18} aria-hidden />,
    },
    {
      href: '/practice',
      label: t('nav.practice'),
      icon: <BookOpen size={18} aria-hidden />,
      badge: practicePendingTotal > 0 ? practicePendingTotal : undefined,
    },
    {
      href: '/vocabulary',
      label: t('nav.vocabulary'),
      icon: <ClipboardCheck size={18} aria-hidden />,
      badge: vocabPending > 0 ? vocabPending : undefined,
    },
    {
      href: '/chat',
      label: t('nav.chat'),
      icon: <MessageSquare size={18} aria-hidden />,
      badge: chatUnread > 0 ? chatUnread : undefined,
    },
    ...(isStaff
      ? [
          {
            href: '/students',
            label: t('nav.students'),
            icon: <Users size={18} aria-hidden />,
          },
          {
            onClick: openCreateLesson,
            label: t('dashboard.quick.newLesson'),
            icon: <CalendarPlus size={18} aria-hidden />,
          },
        ]
      : [
          {
            href: '/quiz',
            label: t('nav.quizzes'),
            icon: <ClipboardCheck size={18} aria-hidden />,
            badge: incompleteQuizzes > 0 ? incompleteQuizzes : undefined,
          },
        ]),
  ];

  return (
    <div className={styles.quickActions} data-tour-anchor="dash-quick-actions">
      {actions.map((action) => {
        const key = action.href ?? action.label;
        if (action.onClick) {
          return (
            <Button
              key={key}
              type="button"
              variant="ghost"
              className={styles.quickAction}
              onClick={action.onClick}
              startIcon={<span className={styles.quickActionIcon}>{action.icon}</span>}
            >
              <span className={styles.quickActionLabel}>{action.label}</span>
              {action.badge !== undefined ? (
                <span className={styles.quickActionBadge}>{action.badge > 99 ? '99+' : action.badge}</span>
              ) : null}
            </Button>
          );
        }
        return (
          <Button
            key={key}
            variant="ghost"
            href={action.href!}
            className={styles.quickAction}
            startIcon={<span className={styles.quickActionIcon}>{action.icon}</span>}
          >
            <span className={styles.quickActionLabel}>{action.label}</span>
            {action.badge !== undefined ? (
              <span className={styles.quickActionBadge}>{action.badge > 99 ? '99+' : action.badge}</span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}

function studentDisplayName(
  students: StudentSummaryBackendDto[] | undefined,
  studentId: string,
  fallback: string,
): string {
  return students?.find((row) => row.id === studentId)?.displayName ?? fallback;
}

export function TeacherHomeworkPanel({
  lessons,
  students,
}: {
  lessons: ScheduledLessonBackendDto[];
  students: StudentSummaryBackendDto[] | undefined;
}) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const pending = useMemo(() => pickPendingHomeworkLessons(lessons), [lessons]);
  const dateOpts = {
    locale: locale === 'uk' ? 'uk' : 'en',
    todayLabel: t('dashboard.date.today'),
    tomorrowLabel: t('dashboard.date.tomorrow'),
  };

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-homework-review">
      <SectionHeader
        className={styles.panelHead}
        titleClassName={styles.sectionTitle}
        title={t('dashboard.homework.title')}
        actionHref="/lessons"
        actionLabel={t('dashboard.allLessonsArrow')}
        actionClassName={styles.seeAll}
      />
      {pending.length === 0 ? (
        <p className={styles.panelHint}>{t('dashboard.homework.empty')}</p>
      ) : (
        <ul className={styles.compactList}>
          {pending.map((lesson) => (
            <li key={lesson.id}>
              <Link href={`/lessons/${lesson.id}`} className={styles.compactRow}>
                <span className={styles.compactTitle}>{lesson.title}</span>
                <span className={styles.compactMeta}>
                  {studentDisplayName(students, lesson.studentId, t('dashboard.students.fallback'))} ·{' '}
                  {formatShortWeekdayDate(lesson.date, new Date(), dateOpts)}
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
  const t = useCampusT();
  const list = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const rows = (list.data ?? []).slice(0, 5);
  const loading = list.status === 'loading' || list.status === 'idle';

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-my-students">
      <SectionHeader
        className={styles.panelHead}
        titleClassName={styles.sectionTitle}
        title={t('dashboard.students.title')}
        actionHref="/students"
        actionLabel={t('dashboard.allArrow')}
        actionClassName={styles.seeAll}
      />
      {loading ? (
        <p className={styles.panelHint}>{t('common.loading')}</p>
      ) : rows.length === 0 ? (
        <p className={styles.panelHint}>{t('dashboard.students.empty')}</p>
      ) : (
        <>
          <p className={styles.panelHint}>
            {t('dashboard.students.total', { count: list.data?.length ?? 0 })}
          </p>
          <ul className={styles.compactList}>
            {rows.map((student) => (
              <li key={student.id}>
                <Link href={`/students/${student.id}`} className={styles.compactRow}>
                  <span className={styles.compactTitle}>{student.displayName}</span>
                  <span className={styles.compactMeta}>
                    {student.proficiencyLevel ?? '—'} ·{' '}
                    {t(`students.status.${student.status}`) === `students.status.${student.status}`
                      ? student.status
                      : t(`students.status.${student.status}`)}
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
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const lessonCounts = useMemo(
    () => lessonCountByDate(lessons, year, monthIndex),
    [lessons, year, monthIndex],
  );
  const meta = monthCalendarMeta(null, now, locale === 'uk' ? 'uk' : 'en');
  const total = Object.values(lessonCounts).reduce((sum, n) => sum + n, 0);
  const weekdays = [
    t('dashboard.cal.mon'),
    t('dashboard.cal.tue'),
    t('dashboard.cal.wed'),
    t('dashboard.cal.thu'),
    t('dashboard.cal.fri'),
    t('dashboard.cal.sat'),
    t('dashboard.cal.sun'),
  ];

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-lessons-month">
      <div className={styles.sectionTitle}>{t('dashboard.month.title')}</div>
      <p className={styles.calSub}>
        {total === 1
          ? t('dashboard.month.count', { count: total })
          : t('dashboard.month.countPlural', { count: total })}
      </p>
      <div className={styles.calGrid}>
        {weekdays.map((day, i) => (
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
              title={
                count > 0
                  ? count === 1
                    ? t('dashboard.lessonCount', { count })
                    : t('dashboard.lessonCountPlural', { count })
                  : undefined
              }
            >
              {day}
            </div>
          );
        })}
      </div>
      <Link href="/calendar" className={styles.calLink}>
        {t('dashboard.month.openCalendar')}
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
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const { iana: viewerIana } = useViewerTimezone();
  if (lessons.length === 0) return null;
  const dateOpts = {
    locale: locale === 'uk' ? 'uk' : 'en',
    todayLabel: t('dashboard.date.today'),
    tomorrowLabel: t('dashboard.date.tomorrow'),
  };

  return (
    <section data-tour-anchor="dash-week-lessons">
      <div data-tour-anchor="dash-upcoming">
      <SectionHeader
        className={styles.sectionHead}
        titleClassName={styles.sectionTitle}
        title={t('dashboard.week.title')}
        actionHref="/calendar"
        actionLabel={t('dashboard.calendarArrow')}
        actionClassName={styles.seeAll}
      />
      <ul className={styles.weekList}>
        {lessons.map((lesson) => {
          const dto = fromBackendLesson(lesson);
          const viewerDate = lessonDateKeyInZone(dto, viewerIana);
          return (
          <li key={lesson.id}>
            <Link href={`/lessons/${lesson.id}`} className={styles.weekRow}>
              <span className={styles.weekDate}>
                {formatShortWeekdayDate(viewerDate, new Date(), dateOpts)}
              </span>
              <span className={styles.weekMain}>
                <span className={styles.weekTitle}>{lesson.title}</span>
                <span className={styles.weekMeta}>
                  {lessonStartTimeInZone(dto, viewerIana)}–{lessonEndTimeInZone(dto, viewerIana)} ·{' '}
                  {t('dashboard.min', { n: lesson.duration })}
                  {showStudentNames
                    ? ` · ${studentDisplayName(students, lesson.studentId, t('dashboard.students.fallback'))}`
                    : ''}
                </span>
              </span>
              <span className={styles.weekStatus}>
                {t(lessonStatusKey(lesson.status))}
              </span>
            </Link>
          </li>
          );
        })}
      </ul>
      </div>
    </section>
  );
}
