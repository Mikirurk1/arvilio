'use client';

import { useCampusT } from '../../../lib/cms';
import styles from './tab-panel-loading.module.scss';

export type TabPanelLoadingVariant =
  | 'default'
  | 'form'
  | 'list'
  | 'chart'
  | 'grid'
  | 'billing';

type TabPanelLoadingProps = {
  variant?: TabPanelLoadingVariant;
  rows?: number;
};

export function TabPanelLoading({ variant = 'default', rows = 4 }: TabPanelLoadingProps) {
  const t = useCampusT();

  return (
    <div
      className={styles.wrap}
      aria-busy="true"
      aria-label={t('students.detail.loadingTab')}
    >
      {variant === 'form' ? (
        <div className={styles.formGrid}>
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className={styles.fieldGroup}>
              <div className={styles.labelSkeleton} />
              <div className={styles.inputSkeleton} />
            </div>
          ))}
        </div>
      ) : null}
      {variant === 'list' ? (
        <div className={styles.listStack}>
          {Array.from({ length: Math.max(3, rows) }, (_, index) => (
            <div key={index} className={styles.listRow}>
              <div className={styles.listLinePrimary} />
              <div className={styles.listLineSecondary} />
            </div>
          ))}
        </div>
      ) : null}
      {variant === 'chart' ? (
        <div className={styles.chartStack}>
          <div className={styles.chartBlock} />
          <div className={styles.chartRow}>
            <div className={styles.chartSide} />
            <div className={styles.chartMain} />
          </div>
        </div>
      ) : null}
      {variant === 'grid' ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles.gridCell} />
          ))}
        </div>
      ) : null}
      {variant === 'billing' ? (
        <div className={styles.billingStack}>
          <div className={styles.billingHero} />
          <div className={styles.billingCard} />
          <div className={styles.billingCard} />
        </div>
      ) : null}
      {variant === 'default' ? (
        <div className={styles.defaultStack}>
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className={styles.defaultLine} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
