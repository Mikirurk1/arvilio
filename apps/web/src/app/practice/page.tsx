'use client';

import { useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui';
import { canView, mockPracticeActivities, siteContent } from '../../mocks';
import { mapAuthRoleToRoleId } from '../../lib/active-user';
import { useAuth } from '../../lib/auth-context';
import { usePracticePendingCounts } from '../../hooks/use-practice-nav-badge';
import { PRACTICE_SESSION_LOGGED_EVENT } from '../../lib/practice-session-tracker';
import { useDashboardStore } from '../../stores/dashboard-store';
import { usePracticeStore } from '../../stores/practice-store';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { PracticeActivitiesGrid, type PracticeActivity } from './sections';
import styles from './page.module.scss';

function vocabStatLabel(count: number): string {
  return count === 1 ? '1 · new & review' : `${count} · new & review`;
}

function quizStatLabel(count: number): string {
  return count === 1 ? '1 · not completed' : `${count} · not completed`;
}

export default function PracticePage() {
  const { user } = useAuth();
  const roleId = mapAuthRoleToRoleId(user?.role);
  const summary = useDashboardStore((s) => s.summary);
  const weekSummary = usePracticeStore((s) => s.weekSummary);
  const vocabOverview = useVocabularyStore((s) => s.overview);
  const pending = usePracticePendingCounts();
  const fetchSummary = useDashboardStore((s) => s.fetchSummary);
  const fetchWeekSummary = usePracticeStore((s) => s.fetchWeekSummary);
  const fetchOverview = useVocabularyStore((s) => s.fetchOverview);

  const activities = useMemo((): ReadonlyArray<PracticeActivity> => {
    return mockPracticeActivities.map((activity) => {
      if (activity.title === 'Vocabulary') {
        return {
          ...activity,
          stat: pending.vocabPending > 0 ? vocabStatLabel(pending.vocabPending) : undefined,
        };
      }
      if (activity.title === 'Quiz') {
        return {
          ...activity,
          stat:
            pending.incompleteQuizzes > 0
              ? quizStatLabel(pending.incompleteQuizzes)
              : undefined,
        };
      }
      return activity;
    });
  }, [pending.vocabPending, pending.incompleteQuizzes]);

  useEffect(() => {
    void fetchSummary();
    void fetchWeekSummary();
    void fetchOverview();
  }, [fetchSummary, fetchWeekSummary, fetchOverview]);

  useEffect(() => {
    const onSessionLogged = () => void fetchWeekSummary(true);
    window.addEventListener(PRACTICE_SESSION_LOGGED_EVENT, onSessionLogged);
    return () => window.removeEventListener(PRACTICE_SESSION_LOGGED_EVENT, onSessionLogged);
  }, [fetchWeekSummary]);

  if (!canView('practice', roleId)) return null;

  const summaryTitle = 'Practice this week';
  const metrics = weekSummary.data?.metrics ?? [];
  const weekLoading = weekSummary.status === 'loading' || weekSummary.status === 'idle';

  const liveMetrics = [
    {
      id: 'live-vocab',
      label: 'Vocabulary cards',
      value: vocabOverview.data
        ? String(vocabOverview.data.totalWords)
        : summary.data
          ? String(summary.data.vocabularyCount)
          : '—',
    },
    {
      id: 'live-review',
      label: 'Words to review',
      value: summary.data
        ? String(summary.data.reviewCount)
        : vocabOverview.data
          ? String(vocabOverview.data.dueToday)
          : '—',
    },
    {
      id: 'live-quizzes',
      label: 'Quizzes to complete',
      value: String(pending.incompleteQuizzes),
    },
    {
      id: 'live-lessons',
      label: 'Lessons today',
      value: summary.data ? String(summary.data.lessonsToday) : '—',
    },
  ];

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={siteContent.practice.title}
        subtitle={siteContent.practice.subtitle}
      />

      <PracticeActivitiesGrid activities={activities} />

      <section className={styles.summaryBlock} aria-label="Practice — live backend stats">
        <h2 className={styles.summaryTitle}>Live stats</h2>
        <div className={styles.summaryGrid}>
          {liveMetrics.map((metric) => (
            <article key={metric.id} className={styles.summaryTile}>
              <p className={styles.summaryValue}>{metric.value}</p>
              <p className={styles.summaryLabel}>{metric.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.summaryBlock} aria-label={summaryTitle}>
        <h2 className={styles.summaryTitle}>{summaryTitle}</h2>
        {weekSummary.status === 'error' ? (
          <p className={styles.pageSub}>Could not load practice stats.</p>
        ) : null}
        <div className={styles.summaryGrid}>
          {weekLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <article key={`sk-${i}`} className={styles.summaryTile}>
                  <p className={styles.summaryValue}>…</p>
                  <p className={styles.summaryLabel}>Loading</p>
                </article>
              ))
            : metrics.map((metric) => (
                <article key={metric.id} className={styles.summaryTile}>
                  <p className={styles.summaryValue}>{metric.value}</p>
                  <p className={styles.summaryLabel}>{metric.label}</p>
                </article>
              ))}
        </div>
      </section>
    </div>
  );
}
