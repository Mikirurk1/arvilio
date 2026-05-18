'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { BookOpen, CheckCircle2, Clock3, Hand, Users } from 'lucide-react';
import { DashboardLessonCard, PageHeader, SectionHeader, StatTile } from '../../components/ui';
import { canView, siteContent } from '../../mocks';
import { isTeacherAdminOrSuperKey, useActiveUser, useActiveRoleKey } from '../../lib/active-user';
import {
  formatDashboardSubtitle,
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
import {
  DashboardQuickActions,
  TeacherHomeworkPanel,
  TeacherScheduleGlancePanel,
  TeacherStudentsPanel,
  WeekLessonsList,
} from './dashboard-widgets';
import { DailyGoalsCard, StreakCalendarCard, WordOfDayCard } from './sections';
import { useStudentsStore } from '../../stores/students-store';
import styles from './page.module.scss';

const REVIEW_STATUSES = new Set(['new', 'repeated', 'mistakes_work']);

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function DashboardPage() {
  const activeUser = useActiveUser();
  const roleKey = useActiveRoleKey();
  const isStudent = roleKey === 'student';
  const isStaff = isTeacherAdminOrSuperKey(roleKey);

  const summary = useDashboardStore((s) => s.summary);
  const streak = useDashboardStore((s) => s.streak);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const vocabCards = useVocabularyStore((s) => s.cards);
  const vocabOverview = useVocabularyStore((s) => s.overview);
  const studentsList = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);

  useEffect(() => {
    void fetchDashboard(isStudent);
  }, [fetchDashboard, isStudent]);

  useEffect(() => {
    if (isStaff) void fetchStudents();
  }, [isStaff, fetchStudents]);

  if (!canView('dashboard', activeUser.role)) return null;

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
      resolveDashboardHero({
        isStudent,
        lessons: lessonRows,
        summary: liveSummary,
        overview: vocabOverview.data ?? null,
      }),
    [isStudent, lessonRows, liveSummary, vocabOverview.data],
  );

  const subtitle = formatDashboardSubtitle(streak.data);
  const heroProgressPct =
    hero.kind === 'vocabulary' ? hero.progressPct : hero.progressPct ?? null;
  const heroLabel =
    hero.kind === 'lesson' ? "Today's lesson" : hero.kind === 'vocabulary' ? 'Up next' : 'Practice';
  const heroCta =
    hero.kind === 'lesson' ? 'Open lesson →' : hero.kind === 'vocabulary' ? 'Review →' : 'Start →';

  const lessonsLoading =
    backendLessons.status === 'loading' || backendLessons.status === 'idle';

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={
          <>
            {siteContent.dashboard.greeting}, <em>{activeUser.fullName.split(' ')[0]}</em>{' '}
            <Hand size={18} style={{ verticalAlign: 'text-bottom' }} />
          </>
        }
        subtitle={subtitle}
      />

      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>{heroLabel}</div>
          <div className={styles.heroTitle}>{hero.title}</div>
          <div className={styles.heroSub}>{hero.subtitle}</div>
          {heroProgressPct !== null ? (
            <div className={styles.heroProgress}>
              <div className={styles.heroBar}>
                <div
                  className={styles.heroBarFill}
                  style={{ width: `${heroProgressPct}%` }}
                />
              </div>
              <span className={styles.heroPct}>{heroProgressPct}% mastered</span>
            </div>
          ) : null}
        </div>
        <Link href={hero.href} className={styles.heroBtn}>
          {heroCta}
        </Link>
      </div>

      <DashboardQuickActions />

      <div className={styles.statsGrid}>
        {isStudent ? (
        <>
        <StatTile
          className={styles.stat}
          icon={
            <div className={`${styles.statIcon} ${styles.amber}`}>
              <BookOpen size={16} />
            </div>
          }
          label="Vocabulary cards"
          labelClassName={styles.statLabel}
          value={liveSummary ? String(liveSummary.vocabularyCount) : '—'}
          valueClassName={styles.statValue}
          subtext={isLoading ? 'Loading…' : liveSummary ? `${liveSummary.reviewCount} to review` : '—'}
          subtextClassName={styles.statSub}
        />
        <StatTile
          className={styles.stat}
          icon={
            <div className={`${styles.statIcon} ${styles.green}`}>
              <Clock3 size={16} />
            </div>
          }
          label="Lessons today"
          labelClassName={styles.statLabel}
          value={liveSummary ? String(liveSummary.lessonsToday) : '—'}
          valueClassName={styles.statValue}
          subtext={isLoading ? 'Loading…' : liveSummary ? `${liveSummary.lessonsThisWeek} this week` : '—'}
          subtextClassName={styles.statSub}
        />
        <StatTile
          className={styles.stat}
          icon={
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <CheckCircle2 size={16} />
            </div>
          }
          label="Lessons completed"
          labelClassName={styles.statLabel}
          value={liveSummary ? String(liveSummary.lessonsCompleted) : '—'}
          valueClassName={styles.statValue}
          subtext={isError ? 'Backend offline' : 'All-time, from backend'}
          subtextClassName={styles.statSub}
        />
        </>
        ) : (
          <>
            <StatTile
              className={styles.stat}
              icon={
                <div className={`${styles.statIcon} ${styles.amber}`}>
                  <Users size={16} />
                </div>
              }
              label="Students"
              labelClassName={styles.statLabel}
              value={
                studentsList.data ? String(studentsList.data.length) : isLoading ? '…' : '—'
              }
              valueClassName={styles.statValue}
              subtext="On your roster"
              subtextClassName={styles.statSub}
            />
            <StatTile
              className={styles.stat}
              icon={
                <div className={`${styles.statIcon} ${styles.green}`}>
                  <Clock3 size={16} />
                </div>
              }
              label="Lessons today"
              labelClassName={styles.statLabel}
              value={liveSummary ? String(liveSummary.lessonsToday) : '—'}
              valueClassName={styles.statValue}
              subtext={
                isLoading ? 'Loading…' : liveSummary ? `${liveSummary.lessonsThisWeek} this week` : '—'
              }
              subtextClassName={styles.statSub}
            />
            <StatTile
              className={styles.stat}
              icon={
                <div className={`${styles.statIcon} ${styles.blue}`}>
                  <CheckCircle2 size={16} />
                </div>
              }
              label="Homework to review"
              labelClassName={styles.statLabel}
              value={String(pendingHomeworkCount)}
              valueClassName={styles.statValue}
              subtext={pendingHomeworkCount > 0 ? 'Submitted, awaiting check' : 'All caught up'}
              subtextClassName={styles.statSub}
            />
          </>
        )}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.leftCol}>
          <SectionHeader
            className={styles.sectionHead}
            titleClassName={styles.sectionTitle}
            title="Today's lessons"
            actionHref="/calendar"
            actionLabel="Calendar →"
            actionClassName={styles.seeAll}
          />
          <div className={styles.lessonList}>
            {lessonsLoading ? (
              <p className={styles.emptyHint}>Loading lessons…</p>
            ) : todayLessons.length === 0 ? (
              <p className={styles.emptyHint}>
                No lessons scheduled for today.{' '}
                <Link href="/calendar" className={styles.emptyLink}>
                  Open calendar
                </Link>
              </p>
            ) : (
              todayLessons.map((lesson, i) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`} className={styles.lessonLink}>
                  <DashboardLessonCard
                    className={styles.lessonCard}
                    lockedClassName={styles.locked}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    tagClassName={styles.tag}
                    typeLabel={statusLabel(lesson.status)}
                    title={lesson.title}
                    description={lesson.description ?? lesson.notes ?? 'Scheduled lesson'}
                    duration={lesson.duration}
                    difficulty={lesson.startTime.slice(0, 5)}
                    locked={lesson.status === 'cancelled'}
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

          <WeekLessonsList
            lessons={weekLessons}
            students={studentsList.data ?? undefined}
            showStudentNames={isStaff}
          />

          {isStudent ? (
            <>
              <SectionHeader
                className={styles.sectionHead}
                titleClassName={styles.sectionTitle}
                title="Review words"
                actionHref="/practice/vocabulary"
                actionLabel="All words →"
                actionClassName={styles.seeAll}
              />
              {reviewWords.length === 0 ? (
                <p className={styles.emptyHint}>You&apos;re all caught up — no words due for review.</p>
              ) : (
                <div className={styles.vocabRow}>
                  {reviewWords.map((card) => (
                    <div key={card.id} className={styles.vocabCard}>
                      <div className={styles.vocabWord}>{card.word.text}</div>
                      <div className={styles.vocabPos}>{card.word.partOfSpeech ?? '—'}</div>
                      <div className={styles.vocabDef}>{card.word.definition}</div>
                      <div className={styles.vocabStatus}>
                        <div
                          className={`${styles.vocabDot} ${styles[vocabStatusClass(card.status)]}`}
                        />
                        <span className={styles.vocabStatusLbl}>
                          {vocabStatusLabel(card.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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
              <StreakCalendarCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
