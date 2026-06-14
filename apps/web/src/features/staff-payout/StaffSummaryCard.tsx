'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { StaffFinanceStaffRowDto } from '@pkg/types';
import { Badge, PanelCard, UserAvatar } from '../../components/ui';
import { formatMoneyMinor } from '../../lib/format-money';
import {
  staffCompensationModeLabel,
} from '../../lib/staff-payout-ui';
import { StaffPayoutStatusBadge } from './StaffPayoutStatusBadge';
import sharedStyles from '../../components/students/StudentSummaryCard.module.scss';
import styles from './StaffSummaryCard.module.scss';

const ROLE_LABEL: Record<string, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super admin',
};

const ROLE_BADGE_VARIANT: Record<string, 'blue' | 'neutral' | 'green'> = {
  teacher: 'green',
  admin: 'blue',
  super_admin: 'blue',
};

type StaffSummaryCardProps = {
  row: StaffFinanceStaffRowDto;
};

export function StaffSummaryCard({ row }: StaffSummaryCardProps) {
  const router = useRouter();
  const profileHref = `/staff/${row.userId}`;
  const roleLabel = ROLE_LABEL[row.role] ?? row.role;

  return (
    <PanelCard interactive fillHeight>
      <div className={sharedStyles.header}>
        <UserAvatar size="md" name={row.displayName} />
        <div className={sharedStyles.headerMeta}>
          <div className={sharedStyles.name}>{row.displayName}</div>
          <div className={sharedStyles.teacher}>{roleLabel}</div>
        </div>
      </div>

      <div className={sharedStyles.badges}>
        <Badge className={sharedStyles.badge} variant={ROLE_BADGE_VARIANT[row.role] ?? 'neutral'}>
          {roleLabel}
        </Badge>
        <Badge className={sharedStyles.badge} variant="neutral">
          {staffCompensationModeLabel(row.mode)}
        </Badge>
        <StaffPayoutStatusBadge status={row.payoutStatus} />
      </div>

      <div
        className={[sharedStyles.scanStats, styles.scanStats].filter(Boolean).join(' ')}
        aria-label="Compensation snapshot"
      >
        <div className={sharedStyles.scanStat}>
          <span className={[sharedStyles.scanStatValue, styles.scanStatValue].filter(Boolean).join(' ')}>
            {row.completedLessons}
          </span>
          <span className={sharedStyles.scanStatLabel}>Lessons</span>
        </div>
        <div className={sharedStyles.scanStat}>
          <span className={[sharedStyles.scanStatValue, styles.scanStatValue].filter(Boolean).join(' ')}>
            {formatMoneyMinor(row.accruedMinor, row.currency)}
          </span>
          <span className={sharedStyles.scanStatLabel}>Accrued</span>
        </div>
        <div className={sharedStyles.scanStat}>
          <span className={[sharedStyles.scanStatValue, styles.scanStatValue].filter(Boolean).join(' ')}>
            {formatMoneyMinor(row.outstandingMinor, row.currency)}
          </span>
          <span className={[sharedStyles.scanStatLabel, styles.scanStatLabelShort].filter(Boolean).join(' ')}>
            Due
          </span>
        </div>
      </div>

      <div className={sharedStyles.metaBlock}>
        <div className={sharedStyles.metaRow}>
          <span className={sharedStyles.metaLabel}>Next pay</span>
          <span className={sharedStyles.metaValue}>
            {new Date(row.nextPayDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className={sharedStyles.footer}>
        <Link
          href={profileHref}
          prefetch
          className={sharedStyles.openBtn}
          onMouseEnter={() => router.prefetch(profileHref)}
          onFocus={() => router.prefetch(profileHref)}
        >
          Open profile <ArrowRight size={14} />
        </Link>
      </div>
    </PanelCard>
  );
}
