'use client';

import Link from 'next/link';
import { Coins, Save } from 'lucide-react';
import type { StaffCompensationProfileDto, StaffPayoutDefaultsDto } from '@pkg/types';
import { resolveStaffCompensation } from '@pkg/types';
import { Button } from '../../components/ui';
import { formatMoneyMinor } from '../../lib/format-money';
import {
  formatStaffPayDayLabel,
  staffCompensationModeLabel,
  staffPayFrequencyLabel,
} from '../../lib/staff-payout-ui';
import { StaffCompensationProfileFields } from './StaffCompensationProfileFields';
import styles from './staff-payout.module.scss';

type StaffCompensationPanelProps = {
  userId: string;
  defaults: StaffPayoutDefaultsDto;
  draft: StaffCompensationProfileDto;
  onChange: (next: StaffCompensationProfileDto) => void;
  loading?: boolean;
  saving?: boolean;
  feedback?: string | null;
  onSave: () => void;
};

export function StaffCompensationPanel({
  userId,
  defaults,
  draft,
  onChange,
  loading = false,
  saving = false,
  feedback = null,
  onSave,
}: StaffCompensationPanelProps) {
  const effective = resolveStaffCompensation(defaults, { ...draft, userId });

  if (loading) {
    return <p className={styles.compensationLoading}>Loading compensation profile…</p>;
  }

  return (
    <div className={styles.compensationPanel}>
      <section className={styles.compensationSummary} aria-label="Effective compensation">
        <div className={styles.compensationSummaryIntro}>
          <span className={styles.compensationSummaryIcon} aria-hidden>
            <Coins size={18} />
          </span>
          <div>
            <h3 className={styles.compensationSummaryTitle}>Effective compensation</h3>
            <p className={styles.compensationSummaryText}>
              What accrual and payout scheduling use today. Empty fields below inherit school
              defaults from System → Payouts.
            </p>
          </div>
        </div>
        <dl className={styles.compensationSummaryGrid}>
          <div className={styles.compensationSummaryItem}>
            <dt>Mode</dt>
            <dd>{staffCompensationModeLabel(effective.mode)}</dd>
          </div>
          <div className={styles.compensationSummaryItem}>
            <dt>Currency</dt>
            <dd>{effective.currency}</dd>
          </div>
          {effective.mode !== 'salary' ? (
            <div className={styles.compensationSummaryItem}>
              <dt>Lesson rate</dt>
              <dd>{formatMoneyMinor(effective.perLessonRateMinor, effective.currency)}</dd>
            </div>
          ) : null}
          {effective.mode !== 'per_lesson' ? (
            <div className={styles.compensationSummaryItem}>
              <dt>Salary</dt>
              <dd>
                {formatMoneyMinor(effective.salaryMinor, effective.currency)}/
                {staffPayFrequencyLabel(effective.payFrequency)}
              </dd>
            </div>
          ) : null}
          <div className={styles.compensationSummaryItem}>
            <dt>Pay day</dt>
            <dd>
              {staffPayFrequencyLabel(effective.payFrequency)} ·{' '}
              {formatStaffPayDayLabel(
                effective.payFrequency,
                effective.payDayOfWeek,
                effective.payDayOfMonth,
              )}
            </dd>
          </div>
          <div className={styles.compensationSummaryItem}>
            <dt>Grace period</dt>
            <dd>
              {effective.graceDays} day{effective.graceDays === 1 ? '' : 's'}
            </dd>
          </div>
        </dl>
      </section>

      <p className={styles.compensationIntro}>
        Override only what differs from school defaults. Manage shared rules in{' '}
        <Link href="/system" className={styles.compensationIntroLink}>
          System → Payouts
        </Link>
        .
      </p>

      <StaffCompensationProfileFields
        userId={userId}
        defaults={defaults}
        draft={draft}
        onChange={onChange}
        disabled={saving}
      />

      <footer className={styles.compensationFooter}>
        {feedback ? <p className={styles.compensationFeedback}>{feedback}</p> : null}
        <Button type="button" onClick={onSave} loading={saving} loadingLabel="Saving…">
          <Save size={14} aria-hidden />
          Save compensation
        </Button>
      </footer>
    </div>
  );
}
