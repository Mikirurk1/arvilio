import type { ReactNode } from 'react';
import styles from './ui.module.scss';

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
  /** Decorative icon shown before the title. */
  icon?: ReactNode;
};

export function PageHeader({ title, description, actions, back, icon }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      {back ? <div className={styles.pageHeaderBack}>{back}</div> : null}
      <div className={styles.pageHeaderRow}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>
            {icon ? <span className={styles.pageTitleIcon}>{icon}</span> : null}
            {title}
          </h1>
          {description ? <p className={styles.pageDescription}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.pageHeaderActions}>{actions}</div> : null}
      </div>
    </header>
  );
}
