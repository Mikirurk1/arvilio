'use client';

import { StatTile } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export function VocabularyStatsRow({
  total,
  stats,
  onFilter,
}: {
  total: number;
  stats: {
    new: number;
    repeated: number;
    mistakesWork: number;
    learned: number;
  };
  onFilter: (value: string) => void;
}) {
  const t = useCampusT();
  return (
    <div
      className={styles.statsRow}
      role="group"
      aria-label={t('vocabulary.stat.filterAria')}
      data-tour-anchor="vocab-stats"
    >
      <StatTile
        className={styles.statChip}
        interactive
        onClick={() => onFilter('all')}
        label={t('vocabulary.stat.total')}
        labelClassName={styles.statLbl}
        value={total}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statBlue}`}
        interactive
        onClick={() => onFilter('new')}
        label={t('vocabulary.status.new')}
        labelClassName={styles.statLbl}
        value={stats.new}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statAmber}`}
        interactive
        onClick={() => onFilter('repeated')}
        label={t('vocabulary.status.repeated')}
        labelClassName={styles.statLbl}
        value={stats.repeated}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statRose}`}
        interactive
        onClick={() => onFilter('mistakes_work')}
        label={t('vocabulary.status.mistakes_work')}
        labelClassName={styles.statLbl}
        value={stats.mistakesWork}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statGreen}`}
        interactive
        onClick={() => onFilter('learned')}
        label={t('vocabulary.status.learned')}
        labelClassName={styles.statLbl}
        value={stats.learned}
        valueClassName={styles.statNum}
      />
    </div>
  );
}
