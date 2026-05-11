import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock3, Hand } from 'lucide-react';
import { DashboardLessonCard, PageHeader, SectionHeader, StatTile, SurfaceCard } from '../../components/ui';
import { activeMockUser, canView, mockLessons, mockProfileGoals, mockReviewWords, siteContent } from '../../mocks';
import { StreakCalendarCard, WordOfDayCard } from './sections';
import styles from './page.module.scss';

export default async function DashboardPage() {
  if (!canView('dashboard', activeMockUser.role)) return null;
  const lessons = mockLessons.filter((lesson) => lesson.visibilityByRole.includes(activeMockUser.role)).slice(0, 4);
  const vocabWords = mockReviewWords;
  const goals = mockProfileGoals;

  const calDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const doneDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={
          <>
            {siteContent.dashboard.greeting}, <em>{activeMockUser.fullName.split(' ')[0]}</em>{' '}
            <Hand size={18} style={{ verticalAlign: 'text-bottom' }} />
          </>
        }
        subtitle={`${siteContent.dashboard.subtitle} · ${activeMockUser.role}`}
      />

      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>{siteContent.dashboard.hero.label}</div>
          <div className={styles.heroTitle}>{siteContent.dashboard.hero.title}</div>
          <div className={styles.heroSub}>{siteContent.dashboard.hero.subtitle}</div>
          <div className={styles.heroProgress}>
            <div className={styles.heroBar}>
              <div className={styles.heroBarFill} />
            </div>
            <span className={styles.heroPct}>{siteContent.dashboard.hero.progressLabel}</span>
          </div>
        </div>
        <Link href="/practice/vocabulary" className={styles.heroBtn}>
          Continue →
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <StatTile
          className={styles.stat}
          icon={<div className={`${styles.statIcon} ${styles.amber}`}><BookOpen size={16} /></div>}
          label="Words learned"
          labelClassName={styles.statLabel}
          value="847"
          valueClassName={styles.statValue}
          subtext="+12 this week"
          subtextClassName={styles.statSub}
        />
        <StatTile
          className={styles.stat}
          icon={<div className={`${styles.statIcon} ${styles.green}`}><Clock3 size={16} /></div>}
          label="Study time this week"
          labelClassName={styles.statLabel}
          value="3.2h"
          valueClassName={styles.statValue}
          subtext="+31 min vs last week"
          subtextClassName={styles.statSub}
        />
        <StatTile
          className={styles.stat}
          icon={<div className={`${styles.statIcon} ${styles.blue}`}><CheckCircle2 size={16} /></div>}
          label="Lessons completed"
          labelClassName={styles.statLabel}
          value="38"
          valueClassName={styles.statValue}
          subtext="5 this week"
          subtextClassName={styles.statSub}
        />
      </div>

      <div className={styles.twoCol}>
        <div className={styles.leftCol}>
          <SectionHeader
            className={styles.sectionHead}
            titleClassName={styles.sectionTitle}
            title="Today's lessons"
            actionHref="/practice/quiz"
            actionLabel="See all →"
            actionClassName={styles.seeAll}
          />
          <div className={styles.lessonList}>
            {lessons.map((lesson, i) => (
              <DashboardLessonCard
                key={lesson.id}
                className={styles.lessonCard}
                lockedClassName={styles.locked}
                style={{ animationDelay: `${i * 0.06}s` }}
                tagClassName={styles.tag}
                title={lesson.title}
                description={lesson.description}
                duration={lesson.duration}
                difficulty={lesson.difficulty}
                locked={lesson.locked}
                titleClassName={styles.lcTitle}
                descClassName={styles.lcDesc}
                footerClassName={styles.lcFooter}
                metaClassName={styles.lcMeta}
                metaItemClassName={styles.lcMetaItem}
                lockOverlayClassName={styles.lockOverlay}
              />
            ))}
          </div>

          <SectionHeader
            className={styles.sectionHead}
            titleClassName={styles.sectionTitle}
            title="Review words"
            actionHref="/practice/vocabulary"
            actionLabel="All words →"
            actionClassName={styles.seeAll}
          />
          <div className={styles.vocabRow}>
            {vocabWords.map((word) => (
              <div key={word.word} className={styles.vocabCard}>
                <div className={styles.vocabWord}>{word.word}</div>
                <div className={styles.vocabPos}>{word.pos}</div>
                <div className={styles.vocabDef}>{word.def}</div>
                <div className={styles.vocabStatus}>
                  <div className={`${styles.vocabDot} ${styles[word.status]}`} />
                  <span className={styles.vocabStatusLbl}>
                    {word.status.charAt(0).toUpperCase() + word.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightCol}>
          <SurfaceCard className={styles.panel}>
            <div className={styles.sectionTitle}>Daily goals</div>
            <div className={styles.goalsSubtitle}>2 of 4 completed</div>
            {goals.map((goal, i) => (
              <div key={i} className={styles.goalItem}>
                <div className={`${styles.goalCheck} ${goal.done ? styles.done : ''}`}>
                  {goal.done && <div className={styles.checkmark} />}
                </div>
                <span className={`${styles.goalText} ${goal.done ? styles.goalDone : ''}`}>{goal.text}</span>
              </div>
            ))}
          </SurfaceCard>

          <WordOfDayCard />
          <StreakCalendarCard calDays={calDays} doneDays={doneDays} />
        </div>
      </div>
    </div>
  );
}
