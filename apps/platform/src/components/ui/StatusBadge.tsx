import styles from './ui.module.scss';

export type CampusStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | string;

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: styles.badgeActive,
  TRIAL: styles.badgeTrial,
  SUSPENDED: styles.badgeSuspended,
};

export function StatusBadge({ status }: { status: CampusStatus }) {
  const tone = STATUS_CLASS[status] ?? styles.badgeNeutral;
  return <span className={[styles.badge, tone].join(' ')}>{status}</span>;
}
