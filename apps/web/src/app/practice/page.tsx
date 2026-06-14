'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { countIrregularVerbs } from '@pkg/types';
import { PageHeader, StatTile } from '../../components/ui';
import { mockPracticeActivities, siteContent } from '../../mocks';
import { usePracticePendingCounts } from '../../hooks/use-practice-nav-badge';
import { useActiveRoleKey } from '../../lib/active-user';
import { PRACTICE_SESSION_LOGGED_EVENT } from '../../lib/practice-session-tracker';
import { usePracticeStore } from '../../stores/practice-store';
import { PracticeActivitiesGrid, type PracticeActivity, type PracticeActivityTagVariant } from './sections';
import styles from './page.module.scss';

function vocabStatLabel(count: number): string {
  if (count === 0) return 'All caught up';
  return count === 1 ? '1 to review' : `${count} to review`;
}

function quizStatLabel(count: number): string {
  if (count === 0) return 'All caught up';
  return count === 1 ? '1 quiz left' : `${count} quizzes left`;
}

function speakingStatLabel(count: number): string {
  if (count === 0) return 'All caught up';
  return count === 1 ? '1 topic due' : `${count} topics due`;
}

function irregularVerbsStatLabel(): string {
  const common = countIrregularVerbs('common');
  return `${common} common verbs`;
}

function tagVariantFromClass(tagClass: string): PracticeActivityTagVariant {
  if (tagClass === 'tagGreen') return 'green';
  if (tagClass === 'tagBlue') return 'blue';
  if (tagClass === 'tagAmber') return 'amber';
  return 'neutral';
}

export default function PracticePage() {
  const weekSummary = usePracticeStore((s) => s.weekSummary);
  const pending = usePracticePendingCounts();
  const roleKey = useActiveRoleKey();
  const isStudent = roleKey === 'student';
  const fetchWeekSummary = usePracticeStore((s) => s.fetchWeekSummary);

  const activities = useMemo((): ReadonlyArray<PracticeActivity> => {
    return mockPracticeActivities.map((activity) => {
      const base: PracticeActivity = {
        href: activity.href,
        title: activity.title,
        description: activity.description,
        icon: activity.icon,
        tag: activity.tag,
        tagVariant: tagVariantFromClass(activity.tagClass),
        accent: activity.accent,
        disabled: activity.disabled,
        stat: activity.stat,
      };
      if (activity.title === 'Vocabulary') {
        return { ...base, stat: vocabStatLabel(pending.vocabPending) };
      }
      if (activity.title === 'Quiz') {
        return { ...base, stat: quizStatLabel(pending.incompleteQuizzes) };
      }
      if (activity.title === 'Speaking') {
        return {
          ...base,
          stat: isStudent ? speakingStatLabel(pending.speakingPending) : 'Topics',
        };
      }
      if (activity.title === 'Irregular verbs') {
        return { ...base, stat: irregularVerbsStatLabel() };
      }
      return base;
    });
  }, [isStudent, pending.incompleteQuizzes, pending.speakingPending, pending.vocabPending]);

  useEffect(() => {
    void fetchWeekSummary();
  }, [fetchWeekSummary]);

  useEffect(() => {
    const onSessionLogged = () => void fetchWeekSummary(true);
    window.addEventListener(PRACTICE_SESSION_LOGGED_EVENT, onSessionLogged);
    return () => window.removeEventListener(PRACTICE_SESSION_LOGGED_EVENT, onSessionLogged);
  }, [fetchWeekSummary]);

  const metrics = weekSummary.data?.metrics ?? [];
  const weekLoading = weekSummary.status === 'loading' || weekSummary.status === 'idle';

  const practiceFocusMetrics = [
    {
      id: 'review',
      label: 'Due for review',
      value: String(pending.vocabPending),
      subtext: 'Vocabulary queue',
    },
    {
      id: 'quizzes',
      label: 'Quizzes open',
      value: String(pending.incompleteQuizzes),
      subtext: 'Ready to finish',
    },
  ];

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          title={siteContent.practice.title}
          subtitle={siteContent.practice.subtitle}
        />

        <PracticeActivitiesGrid activities={activities} />

        <section className={styles.statsSection} aria-labelledby="practice-stats-heading">
          <div className={styles.statsHead}>
            <h2 id="practice-stats-heading" className={styles.statsTitle}>Stats</h2>
            <Link href="/dashboard" className={styles.statsLink}>
              Full dashboard →
            </Link>
          </div>

          {weekSummary.status === 'error' ? (
            <p className={styles.summaryError}>Could not load practice stats.</p>
          ) : null}

          <div className={styles.statsGrid}>
            {practiceFocusMetrics.map((metric) => (
              <StatTile
                key={metric.id}
                className={styles.statTile}
                label={metric.label}
                value={metric.value}
                subtext={metric.subtext}
              />
            ))}
            {weekLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <StatTile key={`sk-${i}`} className={styles.statTile} label="Loading" value="…" />
                ))
              : metrics.map((metric) => (
                  <StatTile
                    key={metric.id}
                    className={styles.statTile}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
