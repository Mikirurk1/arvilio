import type { ReactNode } from 'react';
import styles from './ui.module.scss';

export type PanelProps = {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  /** Decorative icon next to the title. */
  icon?: ReactNode;
  /** Right-aligned control in the title row (e.g. “View all”). */
  actions?: ReactNode;
  /**
   * `default` — full width card.
   * `narrow` — ~36rem reading/form column.
   * `flush` — full width, no extra max-width (same as default; kept for clarity).
   */
  variant?: 'default' | 'narrow' | 'flush';
};

export function Panel({
  children,
  className,
  title,
  icon,
  actions,
  variant = 'default',
}: PanelProps) {
  const variantClass =
    variant === 'narrow' ? styles.panelNarrow : variant === 'flush' ? styles.panelFlush : '';
  return (
    <section className={[styles.panel, variantClass, className].filter(Boolean).join(' ')}>
      {title ? (
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            {icon ? <span className={styles.panelTitleIcon}>{icon}</span> : null}
            {title}
          </h2>
          {actions ? <div className={styles.panelActions}>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}
