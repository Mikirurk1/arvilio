'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { LESSON_STATUS } from '@pkg/types';
import { Button } from '../ui';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import { canSchedule, isAdminOrSuper, mockScheduledLessons, USER_ROLE } from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { formatInTimeZone } from 'date-fns-tz';
import { lessonDateKeyInZone, lessonStartUtc } from '../../lib/lessonTime';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import { useShellNav } from './shell-nav-context';
import { BrandLogo } from '../brand/BrandLogo';
import { HeaderSearch } from './HeaderSearch';
import styles from './Header.module.scss';

const PAID_LESSONS_REMAINING_PLACEHOLDER = 12;

export default function Header() {
  const activeUser = useActiveUser();
  const { isMobile, isTablet } = useBreakpoint();
  const { openMobileNav } = useShellNav();
  const [avatarUrl, setAvatarUrl] = useState(activeUser.avatar.url ?? '');

  useEffect(() => {
    setAvatarUrl(activeUser.avatar.url ?? '');
  }, [activeUser.avatar.url]);

  useEffect(() => {
    const onAvatarUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: number; avatarUrl?: string }>;
      if (customEvent.detail?.userId !== activeUser.id) return;
      setAvatarUrl(customEvent.detail?.avatarUrl ?? '');
    };
    window.addEventListener('mock-user-avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('mock-user-avatar-updated', onAvatarUpdated);
  }, [activeUser.id]);

  const { iana: viewerIana } = useViewerTimezone();
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
  const myTodayCount = lessonsToday.filter((lesson) => lesson.teacherId === activeUser.id).length;
  const myRemainingCount = remainingToday.filter((lesson) => lesson.teacherId === activeUser.id).length;
  const totalTodayCount = lessonsToday.length;
  const totalRemainingCount = remainingToday.length;
  const showTotalForAdmin =
    isAdminOrSuper(activeUser.role) &&
    (myTodayCount !== totalTodayCount || myRemainingCount !== totalRemainingCount);

  const showCreateLesson = canSchedule('lessons', activeUser.role);
  const compactBadge = isMobile || isTablet;

  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        {isMobile ? (
          <Button
            type="button"
            className={styles.menuBtn}
            onClick={openMobileNav}
            aria-label="Open navigation menu"
          >
            <Menu size={22} aria-hidden />
          </Button>
        ) : null}
        <BrandLogo hideTextOnCollapse />
      </div>

      {!isMobile ? (
        <div className={styles.mid}>
          <HeaderSearch />
        </div>
      ) : null}

      <div className={styles.right}>
        {showCreateLesson && !isMobile ? (
          <Link href="/lessons?create=1" className={styles.headerCreateLesson}>
            {isTablet ? 'Create' : 'Create lesson'}
          </Link>
        ) : null}
        <div className={styles.lessonsBadge} title="Today lessons statistics">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M4 3.5h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path d="M5 6.5h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {activeUser.role === USER_ROLE.student.id ? (
            <>
              <span className={styles.lessonsNum}>{lessonsLeft}</span>
              {!compactBadge ? (
                <>
                  <span className={styles.lessonsLbl}>lessons left</span>
                  <span className={styles.lessonsPlanned}>· {plannedLessonsCount} planned</span>
                </>
              ) : null}
            </>
          ) : compactBadge ? (
            <span className={styles.lessonsNum}>{myTodayCount}</span>
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
            <Image src={avatarUrl} alt="" width={36} height={36} unoptimized />
          ) : (
            getAvatarFallbackInitials(activeUser.fullName)
          )}
        </Link>
      </div>
    </header>
  );
}
