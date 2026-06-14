'use client';

import { vocabularyStatusLabel } from '@pkg/types';
import { StatTile } from '../../components/ui';
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
  return (
    <div className={styles.statsRow} role="group" aria-label="Filter words by status">
      <StatTile
        className={styles.statChip}
        interactive
        onClick={() => onFilter('all')}
        label='Total'
        labelClassName={styles.statLbl}
        value={total}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statBlue}`}
        interactive
        onClick={() => onFilter('new')}
        label='New'
        labelClassName={styles.statLbl}
        value={stats.new}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statAmber}`}
        interactive
        onClick={() => onFilter('repeated')}
        label='Repeated'
        labelClassName={styles.statLbl}
        value={stats.repeated}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statRose}`}
        interactive
        onClick={() => onFilter('mistakes_work')}
        label={vocabularyStatusLabel('mistakes_work')}
        labelClassName={styles.statLbl}
        value={stats.mistakesWork}
        valueClassName={styles.statNum}
      />
      <StatTile
        className={`${styles.statChip} ${styles.statGreen}`}
        interactive
        onClick={() => onFilter('learned')}
        label='Learned'
        labelClassName={styles.statLbl}
        value={stats.learned}
        valueClassName={styles.statNum}
      />
    </div>
  );
}
