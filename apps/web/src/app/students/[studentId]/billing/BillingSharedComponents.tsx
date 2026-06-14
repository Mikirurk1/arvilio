'use client';

import type { ReactNode } from 'react';
import styles from '../page.module.scss';

interface BillingSectionHeaderProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}

export function BillingSectionHeader({ icon, eyebrow, title, description, aside }: BillingSectionHeaderProps) {
  return (
    <div className={styles.billingSectionHeader}>
      <div className={styles.billingSectionHeaderMain}>
        <div className={styles.billingSectionIcon}>{icon}</div>
        <div>
          <div className={styles.billingSectionEyebrow}>{eyebrow}</div>
          <h4 className={styles.billingSectionTitle}>{title}</h4>
          <p className={styles.billingSectionDescription}>{description}</p>
        </div>
      </div>
      {aside ? <div className={styles.billingSectionAside}>{aside}</div> : null}
    </div>
  );
}

interface BillingRuleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function BillingRuleCard({ icon, title, description, badge, children }: BillingRuleCardProps) {
  return (
    <div className={styles.billingRuleCard}>
      <div className={styles.billingRuleCardHead}>
        <div className={styles.billingRuleCardIcon}>{icon}</div>
        <div className={styles.billingRuleCardText}>
          <div className={styles.billingRuleCardTitle}>{title}</div>
          <div className={styles.billingRuleCardDesc}>{description}</div>
        </div>
        {badge ? <div className={styles.billingRuleCardBadge}>{badge}</div> : null}
      </div>
      <div className={styles.billingRuleCardBody}>{children}</div>
    </div>
  );
}
