'use client';

import Link from 'next/link';
import { Banknote, Save } from 'lucide-react';
import type { StaffPayoutDefaultsDto } from '@pkg/types';
import { Button } from '../../components/ui';
import { formatMoneyMinor } from '../../lib/format-money';
import {
  formatStaffPayDayLabel,
  staffCompensationModeLabel,
  staffPayFrequencyLabel,
} from '../../lib/staff-payout-ui';
import { StaffPayoutDefaultsFields } from './StaffPayoutDefaultsFields';
import styles from './staff-payout.module.scss';

type StaffPayoutDefaultsPanelProps = {
  draft: StaffPayoutDefaultsDto;
  onChange: (next: StaffPayoutDefaultsDto) => void;
  loading?: boolean;
  saving?: boolean;
  feedback?: string | null;
  error?: string | null;
  onSave: () => void;
};

export function StaffPayoutDefaultsPanel({
  draft,
  onChange,
  loading = false,
  saving = false,
  feedback = null,
  error = null,
  onSave,
}: StaffPayoutDefaultsPanelProps) {
  if (loading) {
    return <p className={styles.compensationLoading}>Loading payout defaults…</p>;
  }

  return (
    <div className={styles.compensationPanel}>
      <section className={styles.compensationSummary} aria-label="School payout defaults preview">
        <div className={styles.compensationSummaryIntro}>
          <span className={styles.compensationSummaryIcon} aria-hidden>
            <Banknote size={18} />
          </span>
          <div>
            <h3 className={styles.compensationSummaryTitle}>Staff payout defaults</h3>
            <p className={styles.compensationSummaryText}>
              School-wide baseline for teacher and admin compensation. Individual overrides live on
              each staff profile.
            </p>
          </div>
        </div>
        <dl className={styles.compensationSummaryGrid}>
          <div className={styles.compensationSummaryItem}>
            <dt>Mode</dt>
            <dd>{staffCompensationModeLabel(draft.defaultMode)}</dd>
          </div>
          <div className={styles.compensationSummaryItem}>
            <dt>Currency</dt>
            <dd>{draft.defaultCurrency}</dd>
          </div>
          {draft.defaultMode !== 'salary' ? (
            <div className={styles.compensationSummaryItem}>
              <dt>Lesson rate</dt>
              <dd>
                {formatMoneyMinor(draft.defaultPerLessonRateMinor, draft.defaultCurrency)}
              </dd>
            </div>
          ) : null}
          {draft.defaultMode !== 'per_lesson' ? (
            <div className={styles.compensationSummaryItem}>
              <dt>Salary</dt>
              <dd>
                {formatMoneyMinor(draft.defaultSalaryMinor, draft.defaultCurrency)}/
                {staffPayFrequencyLabel(draft.defaultPayFrequency)}
              </dd>
            </div>
          ) : null}
          <div className={styles.compensationSummaryItem}>
            <dt>Pay day</dt>
            <dd>
              {staffPayFrequencyLabel(draft.defaultPayFrequency)} ·{' '}
              {formatStaffPayDayLabel(
                draft.defaultPayFrequency,
                draft.defaultPayDayOfWeek,
                draft.defaultPayDayOfMonth,
              )}
            </dd>
          </div>
          <div className={styles.compensationSummaryItem}>
            <dt>Grace period</dt>
            <dd>
              {draft.defaultGraceDays} day{draft.defaultGraceDays === 1 ? '' : 's'}
            </dd>
          </div>
        </dl>
      </section>

      <p className={styles.compensationIntro}>
        Changes apply school-wide. Per-staff overrides are managed under{' '}
        <Link href="/staff" className={styles.compensationIntroLink}>
          Staff → Compensation
        </Link>
        .
      </p>

      {error ? <p className={styles.formError}>{error}</p> : null}

      <StaffPayoutDefaultsFields draft={draft} onChange={onChange} disabled={saving} />

      <footer className={styles.compensationFooter}>
        {feedback ? <p className={styles.compensationFeedback}>{feedback}</p> : null}
        <Button type="button" onClick={onSave} loading={saving} loadingLabel="Saving…">
          <Save size={14} aria-hidden />
          Save payout defaults
        </Button>
      </footer>
    </div>
  );
}
