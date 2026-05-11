'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LESSON_STATUS } from '@soenglish/shared-types';
import { Field } from '../ui';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import { activeMockUser, canSchedule, isAdminOrSuper, mockScheduledLessons, USER_ROLE } from '../../mocks';
import { formatInTimeZone } from 'date-fns-tz';
import {
  getIanaForTimeZoneId,
  lessonDateKeyInZone,
  lessonStartUtc,
} from '../../lib/lessonTime';
import styles from './Header.module.scss';

const PAID_LESSONS_REMAINING_PLACEHOLDER = 12;

export default function Header() {
  const [avatarUrl, setAvatarUrl] = useState(activeMockUser.avatar.url ?? '');

  useEffect(() => {
    const onAvatarUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: number; avatarUrl?: string }>;
      if (customEvent.detail?.userId !== activeMockUser.id) return;
      setAvatarUrl(customEvent.detail?.avatarUrl ?? '');
    };
    window.addEventListener('mock-user-avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('mock-user-avatar-updated', onAvatarUpdated);
  }, []);

  const viewerIana = getIanaForTimeZoneId(activeMockUser.timezoneId);
  const todayKey = formatInTimeZone(new Date(), viewerIana, 'yyyy-MM-dd');
  const nowTs = Date.now();
  const isActiveLesson = (statusId: (typeof mockScheduledLessons)[number]['statusId']) =>
    statusId !== LESSON_STATUS.cancelled.id;
  const lessonsToday = mockScheduledLessons.filter(
    (lesson) =>
      lessonDateKeyInZone(lesson, viewerIana) === todayKey && isActiveLesson(lesson.statusId),
  );
  const remainingToday = lessonsToday.filter((lesson) => lessonStartUtc(lesson).getTime() > nowTs);

  const plannedLessonsCount = mockScheduledLessons.filter(
    (lesson) => lesson.statusId === LESSON_STATUS.planned.id,
  ).length;
  const creditedLessonsCount = mockScheduledLessons.filter((lesson) => lesson.credited).length;
  const lessonsLeft = Math.max(0, PAID_LESSONS_REMAINING_PLACEHOLDER - creditedLessonsCount);
  const myTodayCount = lessonsToday.filter((lesson) => lesson.teacherId === activeMockUser.id).length;
  const myRemainingCount = remainingToday.filter((lesson) => lesson.teacherId === activeMockUser.id).length;
  const totalTodayCount = lessonsToday.length;
  const totalRemainingCount = remainingToday.length;
  const showTotalForAdmin =
    isAdminOrSuper(activeMockUser.role) &&
    (myTodayCount !== totalTodayCount || myRemainingCount !== totalRemainingCount);

  const showCreateLesson = canSchedule('lessons', activeMockUser.role);

  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M3 4h12M3 9h8M3 14h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="14" cy="13.5" r="2.5" fill="#16a97a" />
          </svg>
        </div>
        <div className={styles.logoTextBlock}>
          <div className={styles.logoName}>SoEnglish</div>
          <div className={styles.logoTag}>English Platform</div>
        </div>
      </div>

      <div className={styles.mid}>
        <div className={styles.searchBox}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#b4b4cc" strokeWidth="1.3" />
            <path d="M10 10l3 3" stroke="#b4b4cc" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <Field type="text" placeholder="Search lessons, words, topics..." />
        </div>
      </div>

      <div className={styles.right}>
        {showCreateLesson ? (
          <Link href="/lessons?create=1" className={styles.headerCreateLesson}>
            Create lesson
          </Link>
        ) : null}
        <div
          className={styles.lessonsBadge}
          title="Today lessons statistics"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M4 3.5h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path d="M5 6.5h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {activeMockUser.role === USER_ROLE.student.id ? (
            <>
              <span className={styles.lessonsNum}>{lessonsLeft}</span>
              <span className={styles.lessonsLbl}>lessons left</span>
              <span className={styles.lessonsPlanned}>· {plannedLessonsCount} planned</span>
            </>
          ) : (
            <>
              <span className={styles.lessonsLbl}>
                My: <span className={styles.lessonsNum}>{myTodayCount}</span> today
              </span>
              <span className={styles.lessonsPlanned}>
                · <span className={styles.lessonsNum}>{myRemainingCount}</span> left
              </span>
              {showTotalForAdmin ? (
                <span className={styles.lessonsPlanned}>
                  · Total: {totalTodayCount} today / {totalRemainingCount} left
                </span>
              ) : null}
            </>
          )}
        </div>
        <Link href="/profile" className={styles.avatar}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" width={36} height={36} />
          ) : (
            getAvatarFallbackInitials(activeMockUser.fullName)
          )}
        </Link>
      </div>
    </header>
  );
}
