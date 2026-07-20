'use client';

import type { ReactNode } from 'react';
import styles from './StatisticsDashboard.module.scss';

export type StatisticsSectionProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export function StatisticsSection({
  icon,
  title,
  description,
  aside,
  children,
  className,
  fullWidth = false,
}: StatisticsSectionProps) {
  return (
    <section
      className={[
        styles.statsSection,
        fullWidth ? styles.statsSectionFull : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className={styles.statsSectionHeader}>
        <span className={styles.statsSectionIcon} aria-hidden>
          {icon}
        </span>
        <div className={styles.statsSectionHeadCopy}>
          <h4 className={styles.statsSectionTitle}>{title}</h4>
          {description ? <p className={styles.statsSectionText}>{description}</p> : null}
        </div>
        {aside ? <div className={styles.statsSectionAside}>{aside}</div> : null}
      </header>
      <div className={styles.statsSectionBody}>{children}</div>
    </section>
  );
}
