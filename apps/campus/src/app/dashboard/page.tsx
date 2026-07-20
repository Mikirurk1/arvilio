'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { BookOpen, CheckCircle2, Clock3, Hand, Users } from 'lucide-react';
import {
  Button,
  DashboardLessonCard,
  EmptyStateCard,
  EntitlementsWidget,
  PageHeader,
  SectionHeader,
  StatTile,
} from '../../components/ui';
import { isTeacherAdminOrSuperKey, useActiveUser, useActiveRoleKey } from '../../lib/active-user';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import {
  formatDashboardDate,
  formatLessonTime12h,
  pickPendingHomeworkLessons,
  pickTodayLessons,
  pickUpcomingWeekLessons,
  resolveDashboardHero,
  vocabStatusClass,
  vocabStatusLabel,
} from '../../lib/dashboard-hero';
import { useDashboardStore } from '../../stores/dashboard-store';
import { useLessonsStore } from '../../stores/lessons-store';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { useArvi } from '../../components/mascot/useArvi';
import {
  DashboardQuickActions,
  TeacherHomeworkPanel,
  TeacherScheduleGlancePanel,
  TeacherStudentsPanel,
  WeekLessonsList,
} from './dashboard-widgets';
import { DailyGoalsCard, IrregularVerbOfDayCard, StreakCalendarCard, WordOfDayCard } from './sections';
import { useStudentsStore } from '../../stores/students-store';
import styles from './page.module.scss';

const REVIEW_STATUSES = new Set(['new', 'repeated', 'mistakes_work']);

const LESSON_STATUS_KEYS = [
  'planned',
  'completed',
  'cancelled',
  'in_progress',
] as const;

function lessonStatusKey(status: string): string {
  return LESSON_STATUS_KEYS.includes(status as (typeof LESSON_STATUS_KEYS)[number])
    ? `dashboard.lessonStatus.${status}`
    : status;
}

function heroStatusClass(status: string): string {
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return `heroStatus${normalized.replace(/\s+/g, '')}`;
}

export default function DashboardPage() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const activeUser = useActiveUser();
  const roleKey = useActiveRoleKey();
  const isStudent = roleKey === 'student';
  const isStaff = isTeacherAdminOrSuperKey(roleKey);
  const { setPose } = useArvi();

  const greetingKey = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.greeting';
    if (hour < 18) return 'dashboard.greetingAfternoon';
    return 'dashboard.greetingEvening';
  })();

  const summary = useDashboardStore((s) => s.summary);
  const streak = useDashboardStore((s) => s.streak);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const vocabCards = useVocabularyStore((s) => s.cards);
  const vocabOverview = useVocabularyStore((s) => s.overview);
  const studentsList = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);

  useEffect(() => {
    setPose('greet');
    const t = setTimeout(() => setPose('idle'), 2_400);
    return () => clearTimeout(t);
  }, [setPose]);

  useEffect(() => {
    void fetchDashboard(isStudent);
  }, [fetchDashboard, isStudent]);

  useEffect(() => {
    if (isStaff) void fetchStudents();
  }, [isStaff, fetchStudents]);

  const liveSummary = summary.data;
  const isLoading = summary.status === 'loading' || summary.status === 'idle';
  const isError = summary.status === 'error';

  const lessonRows = backendLessons.data ?? [];

  const todayLessons = useMemo(
    () => pickTodayLessons(lessonRows).slice(0, 4),
    [lessonRows],
  );

  const weekLessons = useMemo(
    () => pickUpcomingWeekLessons(lessonRows),
    [lessonRows],
  );

  const pendingHomeworkCount = useMemo(
    () => pickPendingHomeworkLessons(lessonRows, 99).length,
    [lessonRows],
  );

  const reviewWords = useMemo(() => {
    if (!isStudent) return [];
    return (vocabCards.data ?? [])
      .filter((card) => REVIEW_STATUSES.has(card.status))
      .slice(0, 4);
  }, [isStudent, vocabCards.data]);

  const hero = useMemo(
    () =>
      resolveDashboardHero(
        {
          isStudent,
          lessons: lessonRows,
          summary: liveSummary,
          overview: vocabOverview.data ?? null,
          locale: locale === 'uk' ? 'uk' : 'en',
        },
        t,
      ),
    [isStudent, lessonRows, liveSummary, locale, vocabOverview.data, t],
  );

  const dateStr = formatDashboardDate(new Date(), locale);
  const subtitle =
    streak.data && streak.data.streakDays > 0
      ? t('dashboard.subtitle.withStreak', { date: dateStr, days: streak.data.streakDays })
      : dateStr;
  const heroProgressPct =
    hero.kind === 'vocabulary' ? hero.progressPct : hero.progressPct ?? null;
  const heroLabel = isStudent
    ? t('dashboard.hero.todayLearning')
    : hero.kind === 'lesson'
      ? t('dashboard.hero.nextSchedule')
      : hero.kind === 'vocabulary'
        ? t('dashboard.hero.vocabFocus')
        : t('dashboard.hero.quickAction');
  const heroCta =
    hero.kind === 'lesson'
      ? t('dashboard.hero.openLesson')
      : hero.kind === 'vocabulary'
        ? t('dashboard.reviewWords')
        : t('dashboard.hero.goPractice');

  const heroLesson =
    hero.kind === 'lesson' ? lessonRows.find((row) => row.id === hero.lessonId) : null;
  const heroTime = heroLesson
    ? formatLessonTime12h(heroLesson.startTime, locale === 'uk' ? 'uk' : 'en')
    : null;
  const heroStatusRaw = heroLesson?.status ?? null;
  const heroStatus = heroStatusRaw ? t(lessonStatusKey(heroStatusRaw)) : null;

  const lessonsLoading =
    backendLessons.status === 'loading' || backendLessons.status === 'idle';

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          title={
            <>
              {t(greetingKey)}, <em>{activeUser.fullName.split(' ')[0]}</em>{' '}
              <Hand size={18} aria-hidden className={styles.pageTitleIcon} />
            </>
          }
          subtitle={subtitle}
        />

        <section
          className={styles.heroBanner}
          aria-labelledby="dashboard-hero-title"
          data-tour-anchor="dash-hero"
        >
          <div className={styles.heroInner}>
            {/* Top row: eyebrow + time badge */}
            <div className={styles.heroTop}>
              <p className={styles.heroEyebrow}>{heroLabel}</p>
              {heroTime ? (
                <span className={styles.heroTimeBadge} aria-hidden="true">{heroTime}</span>
              ) : heroProgressPct !== null ? (
                <span className={styles.heroTimeBadge} aria-hidden="true">{heroProgressPct}%</span>
              ) : null}
            </div>

            {/* Big title + subtitle */}
            <div className={styles.heroBody}>
              <h2 id="dashboard-hero-title" className={styles.heroTitle}>{hero.title}</h2>
              {heroStatus && heroStatusRaw ? (
                <span
                  className={`${styles.heroStatusBadge} ${styles[heroStatusClass(heroStatusRaw)] ?? ''}`}
                >
                  {heroStatus}
                </span>
              ) : (
                <p className={styles.heroSub}>{hero.subtitle}</p>
              )}
              {heroProgressPct !== null ? (
                <div className={styles.heroProgress}>
                  <div className={styles.heroBar}>
                    <div className={styles.heroBarFill} style={{ width: `${heroProgressPct}%` }} />
                  </div>
                  <span className={styles.heroPct}>
                    {t('dashboard.hero.mastered', { pct: heroProgressPct })}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Bottom row: stats + CTA */}
            <div className={styles.heroFooter}>
              <div className={styles.heroStats}>
                {isStudent ? (
                  <>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatVal}>{liveSummary ? liveSummary.lessonsToday : todayLessons.length}</span>
                      <span className={styles.heroStatLabel}>{t('dashboard.stat.lessonsToday')}</span>
                    </div>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatVal}>{liveSummary ? liveSummary.lessonsThisWeek : weekLessons.length}</span>
                      <span className={styles.heroStatLabel}>{t('dashboard.stat.thisWeek')}</span>
                    </div>
                    {liveSummary ? (
                      <>
                        <div className={styles.heroStatDivider} />
                        <div className={styles.heroStat}>
                          <span className={styles.heroStatVal}>{liveSummary.vocabularyCount}</span>
                          <span className={styles.heroStatLabel}>{t('dashboard.stat.vocabCards')}</span>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatVal}>{todayLessons.length}</span>
                      <span className={styles.heroStatLabel}>{t('dashboard.stat.lessonsToday')}</span>
                    </div>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatVal}>{weekLessons.length}</span>
                      <span className={styles.heroStatLabel}>{t('dashboard.stat.upcoming')}</span>
                    </div>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatVal}>{studentsList.data?.length ?? '—'}</span>
                      <span className={styles.heroStatLabel}>{t('dashboard.stat.students')}</span>
                    </div>
                    {pendingHomeworkCount > 0 ? (
                      <>
                        <div className={styles.heroStatDivider} />
                        <div className={styles.heroStat}>
                          <span className={`${styles.heroStatVal} ${styles.heroStatAccent}`}>{pendingHomeworkCount}</span>
                          <span className={styles.heroStatLabel}>{t('dashboard.stat.toReview')}</span>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
                {streak.data && streak.data.streakDays > 0 ? (
                  <>
                    <div className={styles.heroStatDivider} />
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatVal}>{streak.data.streakDays} 🔥</span>
                      <span className={styles.heroStatLabel}>{t('dashboard.stat.dayStreak')}</span>
                    </div>
                  </>
                ) : null}
              </div>
              <Button variant="primary" href={hero.href} className={styles.heroCta}>
                {heroCta}
              </Button>
            </div>
          </div>
          <div className={styles.heroDecor} aria-hidden="true" />
        </section>

        <div className={styles.statsGrid} data-tour-anchor="dash-stats">
        {isStudent ? (
        <>
        <StatTile
          className={styles.stat}
          data-value={liveSummary ? String(liveSummary.vocabularyCount) : ''}
          icon={
            <div className={`${styles.statIcon} ${styles.amber}`}>
              <BookOpen size={16} />
            </div>
          }
          label={t('dashboard.tile.vocabCards')}
          labelClassName={styles.statLabel}
          value={liveSummary ? String(liveSummary.vocabularyCount) : '—'}
          valueClassName={styles.statValue}
          subtext={isLoading ? t('common.loading') : liveSummary ? t('dashboard.toReview', { count: liveSummary.reviewCount }) : '—'}
          subtextClassName={styles.statSub}
        />
        <StatTile
          className={styles.stat}
          data-value={liveSummary ? String(liveSummary.lessonsToday) : ''}
          icon={
            <div className={`${styles.statIcon} ${styles.green}`}>
              <Clock3 size={16} />
            </div>
          }
          label={t('dashboard.tile.lessonsToday')}
          labelClassName={styles.statLabel}
          value={liveSummary ? String(liveSummary.lessonsToday) : '—'}
          valueClassName={styles.statValue}
          subtext={isLoading ? t('common.loading') : liveSummary ? t('dashboard.thisWeek', { count: liveSummary.lessonsThisWeek }) : '—'}
          subtextClassName={styles.statSub}
        />
        <StatTile
          className={styles.stat}
          data-value={liveSummary ? String(liveSummary.lessonsCompleted) : ''}
          icon={
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <CheckCircle2 size={16} />
            </div>
          }
          label={t('dashboard.tile.lessonsCompleted')}
          labelClassName={styles.statLabel}
          value={liveSummary ? String(liveSummary.lessonsCompleted) : '—'}
          valueClassName={styles.statValue}
          subtext={isError ? t('dashboard.tile.backendOffline') : t('dashboard.tile.allTime')}
          subtextClassName={styles.statSub}
        />
        </>
        ) : (
          <>
            <StatTile
              className={styles.stat}
              data-value={studentsList.data ? String(studentsList.data.length) : ''}
              icon={
                <div className={`${styles.statIcon} ${styles.amber}`}>
                  <Users size={16} />
                </div>
              }
              label={t('dashboard.tile.students')}
              labelClassName={styles.statLabel}
              value={
                studentsList.data ? String(studentsList.data.length) : isLoading ? '…' : '—'
              }
              valueClassName={styles.statValue}
              subtext={t('dashboard.tile.onRoster')}
              subtextClassName={styles.statSub}
            />
            <StatTile
              className={styles.stat}
              data-value={liveSummary ? String(liveSummary.lessonsToday) : ''}
              icon={
                <div className={`${styles.statIcon} ${styles.green}`}>
                  <Clock3 size={16} />
                </div>
              }
              label={t('dashboard.tile.lessonsToday')}
              labelClassName={styles.statLabel}
              value={liveSummary ? String(liveSummary.lessonsToday) : '—'}
              valueClassName={styles.statValue}
              subtext={
                isLoading ? t('common.loading') : liveSummary ? t('dashboard.thisWeek', { count: liveSummary.lessonsThisWeek }) : '—'
              }
              subtextClassName={styles.statSub}
            />
            <StatTile
              className={styles.stat}
              data-value={String(pendingHomeworkCount)}
              icon={
                <div className={`${styles.statIcon} ${styles.blue}`}>
                  <CheckCircle2 size={16} />
                </div>
              }
              label={t('dashboard.tile.homeworkReview')}
              labelClassName={styles.statLabel}
              value={String(pendingHomeworkCount)}
              valueClassName={styles.statValue}
              subtext={
                pendingHomeworkCount > 0
                  ? t('dashboard.tile.awaitingCheck')
                  : t('dashboard.tile.allCaughtUp')
              }
              subtextClassName={styles.statSub}
            />
          </>
        )}
        </div>

        <DashboardQuickActions />

        {(roleKey === 'admin' || roleKey === 'super_admin') && (
          <EntitlementsWidget />
        )}

        <div className={styles.twoCol}>
        <div className={styles.leftCol}>
          <section data-tour-anchor="dash-today-lessons">
          <SectionHeader
            className={styles.sectionHead}
            titleClassName={styles.sectionTitle}
            title={<h2>{t('dashboard.todayLessons')}</h2>}
            actionHref="/calendar"
            actionLabel={t('dashboard.calendarArrow')}
            actionClassName={styles.seeAll}
          />
          <div className={styles.lessonList}>
            {lessonsLoading ? (
              <EmptyStateCard
                className={styles.emptyState}
                title={t('dashboard.loadingLessons')}
                description={t('dashboard.empty.fetching')}
              />
            ) : todayLessons.length === 0 ? (
              <EmptyStateCard
                className={styles.emptyState}
                showArvi
                title={t('dashboard.empty.noLessons')}
                description={t('dashboard.empty.clearToday')}
                action={
                  <Link href="/calendar" className={styles.emptyLink}>
                    {t('dashboard.openCalendar')}
                  </Link>
                }
              />
            ) : (
              todayLessons.map((lesson, i) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`} className={styles.lessonLink}>
                  <DashboardLessonCard
                    className={styles.lessonCard}
                    lockedClassName={styles.locked}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    tagClassName={styles.tag}
                    typeLabel={t(lessonStatusKey(lesson.status))}
                    title={lesson.title}
                    description={lesson.description ?? lesson.notes ?? t('dashboard.scheduledLesson')}
                    duration={t('dashboard.min', { n: lesson.duration })}
                    difficulty={lesson.startTime.slice(0, 5)}
                    locked={lesson.status === 'cancelled'}
                    lockLabel={t('dashboard.locked')}
                    titleClassName={styles.lcTitle}
                    descClassName={styles.lcDesc}
                    footerClassName={styles.lcFooter}
                    metaClassName={styles.lcMeta}
                    metaItemClassName={styles.lcMetaItem}
                    lockOverlayClassName={styles.lockOverlay}
                  />
                </Link>
              ))
            )}
          </div>
          </section>

          <WeekLessonsList
            lessons={weekLessons}
            students={studentsList.data ?? undefined}
            showStudentNames={isStaff}
          />

          {isStudent ? (
            <section data-tour-anchor="dash-review-words">
              <SectionHeader
                className={styles.sectionHead}
                titleClassName={styles.sectionTitle}
                title={<h2>{t('dashboard.reviewWords')}</h2>}
                actionHref="/practice/vocabulary"
                actionLabel={t('dashboard.allWordsArrow')}
                actionClassName={styles.seeAll}
              />
              {reviewWords.length === 0 ? (
                <EmptyStateCard
                  className={styles.emptyState}
                  title={t('practice.stat.allCaughtUp')}
                  description={t('dashboard.empty.noWordsDue')}
                  action={
                    <Link href="/practice/vocabulary" className={styles.emptyLink}>
                      {t('dashboard.openVocabulary')}
                    </Link>
                  }
                />
              ) : (
                <div className={styles.vocabRow}>
                  {reviewWords.map((card) => (
                    <Link
                      key={card.id}
                      href="/practice/vocabulary"
                      className={styles.vocabCard}
                    >
                      <div className={styles.vocabWord}>{card.word.text}</div>
                      <div className={styles.vocabPos}>{card.word.partOfSpeech ?? '—'}</div>
                      <div className={styles.vocabDef}>{card.word.definition}</div>
                      <div className={styles.vocabStatus}>
                        <div
                          className={`${styles.vocabDot} ${styles[vocabStatusClass(card.status)]}`}
                        />
                        <span className={styles.vocabStatusLbl}>
                          {vocabStatusLabel(card.status, t)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>

        <div className={styles.rightCol}>
          {isStaff ? (
            <>
              <TeacherHomeworkPanel lessons={lessonRows} students={studentsList.data ?? undefined} />
              <TeacherStudentsPanel />
              <TeacherScheduleGlancePanel lessons={lessonRows} />
            </>
          ) : (
            <>
              <DailyGoalsCard />
              <WordOfDayCard />
              <IrregularVerbOfDayCard />
              <StreakCalendarCard />
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
