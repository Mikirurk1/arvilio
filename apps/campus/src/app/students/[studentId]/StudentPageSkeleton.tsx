'use client';

import { useCampusT } from '../../../lib/cms';
import styles from './loading.module.scss';

export function StudentPageSkeleton() {
  const t = useCampusT();

  return (
    <div className={styles.wrap} aria-busy="true" aria-label={t('students.detail.loadingPage')}>
      <div className={styles.heroRow}>
        <div className={styles.avatar} />
        <div className={styles.heroText}>
          <div className={styles.title} />
          <div className={styles.subtitle} />
        </div>
      </div>
      <div className={styles.tabs} />
    </div>
  );
}
