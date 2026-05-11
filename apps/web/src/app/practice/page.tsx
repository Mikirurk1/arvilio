import { PageHeader } from '../../components/ui';
import {
  activeMockUser,
  activeRole,
  canView,
  getPracticeSummaryForPresetRange,
  mockPracticeActivities,
  siteContent,
} from '../../mocks';
import { PracticeActivitiesGrid, type PracticeActivity } from './sections';
import styles from './page.module.scss';

export default function PracticePage() {
  if (!canView('practice', activeRole)) return null;
  const computedSummary = getPracticeSummaryForPresetRange(activeMockUser.id, 'week');
  const metrics = computedSummary.metrics;
  const summaryTitle = 'Practice this week';

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={siteContent.practice.title}
        subtitle={siteContent.practice.subtitle}
      />

      <PracticeActivitiesGrid activities={mockPracticeActivities as ReadonlyArray<PracticeActivity>} />

      <section className={styles.summaryBlock} aria-label={summaryTitle}>
        <h2 className={styles.summaryTitle}>{summaryTitle}</h2>
        <div className={styles.summaryGrid}>
          {metrics.map((metric) => (
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
