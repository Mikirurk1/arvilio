import type { ReactNode } from 'react';
import styles from './ui.module.scss';

export type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardTop}>
        <div className={styles.statLabel}>{label}</div>
        {icon ? <span className={styles.statIcon}>{icon}</span> : null}
      </div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className={styles.statGrid}>{children}</div>;
}
