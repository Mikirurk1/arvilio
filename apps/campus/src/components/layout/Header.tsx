'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOpenCreateLesson } from '../../features/lesson-modal';
import { useEffect, useMemo, useState } from 'react';
import { CircleHelp, Menu } from 'lucide-react';
import { LESSON_STATUS, stripLocalePrefix, USER_ROLE } from '@pkg/types';
import { Button } from '../ui';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import { canSchedule, isAdminOrSuper } from '../../lib/roles';
import { useActiveUser } from '../../lib/active-user';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { formatInTimeZone } from 'date-fns-tz';
import { lessonDateKeyInZone, lessonStartUtc } from '../../lib/lessonTime';
import { useViewerTimezone } from '../../hooks/use-viewer-timezone';
import { useShellNav } from './shell-nav-context';
import { BrandLogo } from '../brand/BrandLogo';
import { HeaderSearch } from './HeaderSearch';
import { useBillingStore } from '../../stores/billing-store';
import { useLessonsStore } from '../../stores/lessons-store';
import {
  fromBackendLessons,
  partyNumericId,
} from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useViewerPartyNumericId } from '../../hooks/use-viewer-party-numeric-id';
import { useOptionalAuth } from '../../lib/auth-context';
import { useCampusT } from '../../lib/cms';
import { TOUR_CONTEXTUAL_REPLAY_EVENT } from '../tour/ProductTour';
import {
  isLearningModeOn,
  LEARNING_MODE_EVENT,
  type LearningMode,
} from '../tour/learning-mode';
import styles from './Header.module.scss';

function badgeToneClass(balance: number): string {
  if (balance < 0 || balance <= 0) return styles.lessonsBadgeDanger;
  if (balance === 1) return styles.lessonsBadgeWarning;
  return '';
}

export default function Header() {
  const t = useCampusT();
  const pathname = usePathname() ?? '/';
  const openCreateLesson = useOpenCreateLesson();
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const viewerNumericId = useViewerPartyNumericId();
  const { isMobile, isTablet } = useBreakpoint();
  const { openMobileNav } = useShellNav();
  const [avatarUrl, setAvatarUrl] = useState(activeUser.avatar.url ?? '');
  const [learningModeOn, setLearningModeOn] = useState(true);
  const fetchMyBalance = useBillingStore((s) => s.fetchMyBalance);
  const myBalanceSlice = useBillingStore((s) => s.myBalance);
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);
  const backendLessons = useLessonsStore((s) => s.backendLessons.data);

  const isStudent = activeUser.role === USER_ROLE.student.id;
  const pathWithoutLocale = stripLocalePrefix(pathname).pathname || '/';
  const onOnboardingRoute =
    pathWithoutLocale === '/onboarding' || pathWithoutLocale.startsWith('/onboarding/');
  const showHelp =
    Boolean(auth?.user) && learningModeOn && !onOnboardingRoute;

  useEffect(() => {
    setAvatarUrl(activeUser.avatar.url ?? '');
  }, [activeUser.avatar.url]);

  useEffect(() => {
    setLearningModeOn(isLearningModeOn());
    const onLearningMode = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: LearningMode }>).detail?.mode;
      setLearningModeOn(mode === 'on' || (mode == null && isLearningModeOn()));
    };
    window.addEventListener(LEARNING_MODE_EVENT, onLearningMode);
    return () => window.removeEventListener(LEARNING_MODE_EVENT, onLearningMode);
  }, []);

  useEffect(() => {
    const onAvatarUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: number; avatarUrl?: string }>;
      if (customEvent.detail?.userId !== activeUser.id) return;
      setAvatarUrl(customEvent.detail?.avatarUrl ?? '');
    };
    window.addEventListener('mock-user-avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('mock-user-avatar-updated', onAvatarUpdated);
  }, [activeUser.id]);

  useEffect(() => {
    void fetchScheduledLessons();
  }, [fetchScheduledLessons]);

  useEffect(() => {
    if (isStudent) void fetchMyBalance();
  }, [isStudent, fetchMyBalance]);

  const { iana: viewerIana } = useViewerTimezone();
  const todayKey = formatInTimeZone(new Date(), viewerIana, 'yyyy-MM-dd');
  const nowTs = Date.now();

  const lessons = useMemo(
    () => (backendLessons ? fromBackendLessons(backendLessons) : []),
    [backendLessons],
  );

  const isActiveLesson = (statusId: (typeof lessons)[number]['statusId']) =>
    statusId !== LESSON_STATUS.cancelled.id;

  const lessonsToday = lessons.filter(
    (lesson) =>
      lessonDateKeyInZone(lesson, viewerIana) === todayKey && isActiveLesson(lesson.statusId),
  );
  const remainingToday = lessonsToday.filter((lesson) => lessonStartUtc(lesson).getTime() > nowTs);

  const studentBackendId = auth?.user?.id;
  const plannedLessonsCount = useMemo(() => {
    if (!isStudent || !studentBackendId) return 0;
    return lessons.filter(
      (lesson) =>
        lesson.statusId === LESSON_STATUS.planned.id &&
        partyNumericId(studentBackendId) === lesson.studentId,
    ).length;
  }, [isStudent, lessons, studentBackendId]);

  const lessonsLeft = myBalanceSlice.data?.balance ?? 0;
  const balanceTone = badgeToneClass(lessonsLeft);

  const myTodayCount =
    viewerNumericId != null
      ? lessonsToday.filter((lesson) => lesson.teacherId === viewerNumericId).length
      : 0;
  const myRemainingCount =
    viewerNumericId != null
      ? remainingToday.filter((lesson) => lesson.teacherId === viewerNumericId).length
      : 0;
  const totalTodayCount = lessonsToday.length;
  const totalRemainingCount = remainingToday.length;
  const showTotalForAdmin =
    isAdminOrSuper(activeUser.role) &&
    (myTodayCount !== totalTodayCount || myRemainingCount !== totalRemainingCount);

  const showCreateLesson = canSchedule('lessons', activeUser.role);
  const compactBadge = isMobile || isTablet;
  const badgeHref = isStudent ? '/payment' : '/lessons';
  const badgeTitle = isStudent ? t('header.badgeTitle.student') : t('header.badgeTitle.staff');

  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        {isMobile ? (
          <Button
            type="button"
            className={styles.menuBtn}
            onClick={openMobileNav}
            aria-label={t('header.openNav')}
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
          <Button
            type="button"
            className={styles.headerCreateLesson}
            onClick={openCreateLesson}
            data-tour-anchor="header-create-lesson"
          >
            {isTablet ? t('header.createShort') : t('header.createLesson')}
          </Button>
        ) : null}
        <Link
          href={badgeHref}
          className={`${styles.lessonsBadge} ${balanceTone}`}
          title={badgeTitle}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M4 3.5h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path d="M5 6.5h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {isStudent ? (
            <>
              <span className={styles.lessonsNum}>{lessonsLeft}</span>
              {!compactBadge ? (
                <>
                  <span className={styles.lessonsLbl}>{t('header.lessonsLeft')}</span>
                  <span className={styles.lessonsPlanned}>
                    {t('header.planned', { count: plannedLessonsCount })}
                  </span>
                </>
              ) : null}
            </>
          ) : compactBadge ? (
            <span className={styles.lessonsNum}>{myTodayCount}</span>
          ) : (
            <>
              <span className={styles.lessonsLbl}>
                {t('header.myToday', { count: myTodayCount })}
              </span>
              <span className={styles.lessonsPlanned}>
                {t('header.leftToday', { count: myRemainingCount })}
              </span>
              {showTotalForAdmin ? (
                <span className={styles.lessonsPlanned}>
                  {t('header.totalToday', {
                    today: totalTodayCount,
                    left: totalRemainingCount,
                  })}
                </span>
              ) : null}
            </>
          )}
        </Link>
        {showHelp ? (
          <Button
            type="button"
            className={styles.helpBtn}
            aria-label={t('header.help')}
            title={t('header.help')}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(TOUR_CONTEXTUAL_REPLAY_EVENT, {
                  detail: { pathname },
                }),
              )
            }
          >
            <CircleHelp size={20} aria-hidden />
          </Button>
        ) : null}
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
