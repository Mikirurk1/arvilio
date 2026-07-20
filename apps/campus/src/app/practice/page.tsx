'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { countIrregularVerbs } from '@pkg/types';
import { PageHeader, StatTile } from '../../components/ui';
import { CAMPUS_PRACTICE_ACTIVITIES } from '@pkg/types';
import { usePracticePendingCounts } from '../../hooks/use-practice-nav-badge';
import { useActiveRoleKey } from '../../lib/active-user';
import { useCampusT } from '../../lib/cms';
import { PRACTICE_SESSION_LOGGED_EVENT } from '../../lib/practice-session-tracker';
import { usePracticeStore } from '../../stores/practice-store';
import { PracticeActivitiesGrid, type PracticeActivity, type PracticeActivityTagVariant } from './sections';
import styles from './page.module.scss';

function tagVariantFromClass(tagClass: string): PracticeActivityTagVariant {
  if (tagClass === 'tagGreen') return 'green';
  if (tagClass === 'tagBlue') return 'blue';
  if (tagClass === 'tagAmber') return 'amber';
  return 'neutral';
}

export default function PracticePage() {
  const t = useCampusT();
  const weekSummary = usePracticeStore((s) => s.weekSummary);
  const pending = usePracticePendingCounts();
  const roleKey = useActiveRoleKey();
  const isStudent = roleKey === 'student';
  const fetchWeekSummary = usePracticeStore((s) => s.fetchWeekSummary);

  const activities = useMemo((): ReadonlyArray<PracticeActivity> => {
    return CAMPUS_PRACTICE_ACTIVITIES.map((activity) => {
      const key = activity.id;
      const base: PracticeActivity = {
        id: key,
        href: activity.href,
        title: t(`practice.activity.${key}.title`),
        description: t(`practice.activity.${key}.description`),
        icon: activity.icon,
        tag: t(`practice.activity.${key}.tag`),
        tagVariant: tagVariantFromClass(activity.tagClass),
        accent: activity.accent,
        disabled: 'disabled' in activity ? activity.disabled : undefined,
      };
      if (key === 'vocab') {
        const count = pending.vocabPending;
        const stat =
          count === 0
            ? t('practice.stat.allCaughtUp')
            : count === 1
              ? t('practice.stat.reviewOne')
              : t('practice.stat.reviewMany', { count });
        return { ...base, stat };
      }
      if (key === 'quiz') {
        const count = pending.incompleteQuizzes;
        const stat =
          count === 0
            ? t('practice.stat.allCaughtUp')
            : count === 1
              ? t('practice.stat.quizOne')
              : t('practice.stat.quizMany', { count });
        return { ...base, stat };
      }
      if (key === 'speaking') {
        const count = pending.speakingPending;
        const stat = isStudent
          ? count === 0
            ? t('practice.stat.allCaughtUp')
            : count === 1
              ? t('practice.stat.topicOne')
              : t('practice.stat.topicMany', { count })
          : t('practice.stat.topics');
        return { ...base, stat };
      }
      if (key === 'irregular') {
        return {
          ...base,
          stat: t('practice.stat.commonVerbs', { count: countIrregularVerbs('common') }),
        };
      }
      if (key === 'games' || key === 'challenges') {
        return { ...base, stat: t(`practice.activity.${key}.stat`) };
      }
      return base;
    });
  }, [isStudent, pending.incompleteQuizzes, pending.speakingPending, pending.vocabPending, t]);

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
      label: t('practice.focus.dueReview'),
      value: String(pending.vocabPending),
      subtext: t('practice.focus.vocabQueue'),
    },
    {
      id: 'quizzes',
      label: t('practice.focus.quizzesOpen'),
      value: String(pending.incompleteQuizzes),
      subtext: t('practice.focus.readyFinish'),
    },
  ];

  const weekMinutes = weekSummary.data?.practiceMinutes ?? 0;
  const localizedMetrics = metrics.map((metric) => {
    const labelKey =
      metric.id === '1'
        ? 'practice.metric.newWords'
        : metric.id === '2'
          ? 'practice.metric.quizzesCompleted'
          : metric.id === '3'
            ? 'practice.metric.speakingSessions'
            : metric.id === '4'
              ? 'practice.metric.timePracticing'
              : null;
    const value =
      metric.id === '4'
        ? weekMinutes >= 60
          ? t('practice.metric.hours', { h: (weekMinutes / 60).toFixed(1) })
          : weekMinutes > 0
            ? t('practice.metric.minutesShort', { m: weekMinutes })
            : t('practice.metric.hours', { h: '0' })
        : metric.value;
    return {
      ...metric,
      label: labelKey ? t(labelKey) : metric.label,
      value,
    };
  });

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          title={t('practice.title')}
          subtitle={t('practice.subtitle')}
        />

        <PracticeActivitiesGrid activities={activities} />

        <section
          className={styles.statsSection}
          aria-labelledby="practice-stats-heading"
          data-tour-anchor="practice-stats"
        >
          <div className={styles.statsHead}>
            <h2 id="practice-stats-heading" className={styles.statsTitle}>
              {t('practice.statsTitle')}
            </h2>
            <Link href="/dashboard" className={styles.statsLink}>
              {t('practice.fullDashboard')}
            </Link>
          </div>

          {weekSummary.status === 'error' ? (
            <p className={styles.summaryError}>{t('practice.loadError')}</p>
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
                  <StatTile
                    key={`sk-${i}`}
                    className={styles.statTile}
                    label={t('common.loading')}
                    value="…"
                  />
                ))
              : localizedMetrics.map((metric) => (
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
