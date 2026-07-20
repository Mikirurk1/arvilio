'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { StaffFinanceStaffRowDto } from '@pkg/types';
import { Badge, PanelCard, UserAvatar } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { formatMoneyMinor } from '../../lib/format-money';
import {
  staffCompensationModeLabel,
} from '../../lib/staff-payout-ui';
import { StaffPayoutStatusBadge } from './StaffPayoutStatusBadge';
import sharedStyles from '../../components/students/StudentSummaryCard.module.scss';
import styles from './StaffSummaryCard.module.scss';

const ROLE_LABEL: Record<string, string> = {
  teacher: 'staff.role.teacher',
  admin: 'staff.role.admin',
  super_admin: 'staff.role.superAdmin',
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
  const t = useCampusT();
  const router = useRouter();
  const profileHref = `/staff/${row.userId}`;
  const roleLabel = t(ROLE_LABEL[row.role] ?? 'staff.role.teacher');

  return (
    <PanelCard interactive fillHeight data-tour-anchor="staff-detail">
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
        <Badge
          className={sharedStyles.badge}
          variant="neutral"
          data-tour-anchor="staff-compensation"
        >
          {staffCompensationModeLabel(row.mode, t)}
        </Badge>
        <StaffPayoutStatusBadge status={row.payoutStatus} />
      </div>

      <div
        className={[sharedStyles.scanStats, styles.scanStats].filter(Boolean).join(' ')}
        aria-label={t('staff.card.snapshotAria')}
      >
        <div className={sharedStyles.scanStat}>
          <span className={[sharedStyles.scanStatValue, styles.scanStatValue].filter(Boolean).join(' ')}>
            {row.completedLessons}
          </span>
          <span className={sharedStyles.scanStatLabel}>{t('staff.card.lessons')}</span>
        </div>
        <div className={sharedStyles.scanStat}>
          <span className={[sharedStyles.scanStatValue, styles.scanStatValue].filter(Boolean).join(' ')}>
            {formatMoneyMinor(row.accruedMinor, row.currency)}
          </span>
          <span className={sharedStyles.scanStatLabel}>{t('staff.card.accrued')}</span>
        </div>
        <div className={sharedStyles.scanStat}>
          <span className={[sharedStyles.scanStatValue, styles.scanStatValue].filter(Boolean).join(' ')}>
            {formatMoneyMinor(row.outstandingMinor, row.currency)}
          </span>
          <span className={[sharedStyles.scanStatLabel, styles.scanStatLabelShort].filter(Boolean).join(' ')}>
            {t('staff.card.due')}
          </span>
        </div>
      </div>

      <div className={sharedStyles.metaBlock}>
        <div className={sharedStyles.metaRow}>
          <span className={sharedStyles.metaLabel}>{t('staff.card.nextPay')}</span>
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
          {t('staff.card.openProfile')} <ArrowRight size={14} />
        </Link>
      </div>
    </PanelCard>
  );
}
