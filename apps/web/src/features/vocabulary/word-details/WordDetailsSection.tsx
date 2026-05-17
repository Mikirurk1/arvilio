import type { ReactNode } from 'react';
import styles from '../word-details-modal.module.scss';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function WordDetailsSection({ title, subtitle, children }: Props) {
  return (
    <section className={styles.block}>
      <div className={styles.blockHeader}>
        <h3 className={styles.blockTitle}>{title}</h3>
        {subtitle ? <p className={styles.blockSubtitle}>{subtitle}</p> : null}
      </div>
      <div className={styles.blockCard}>{children}</div>
    </section>
  );
}
