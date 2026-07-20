'use client';

import Link from 'next/link';
import { Banknote, Save } from 'lucide-react';
import type { StaffPayoutDefaultsDto } from '@pkg/types';
import { Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();

  if (loading) {
    return <p className={styles.compensationLoading}>{t('system.payouts.loading')}</p>;
  }

  return (
    <div className={styles.compensationPanel}>
      <section className={styles.compensationSummary} aria-label={t('system.payouts.summaryAria')}>
        <div className={styles.compensationSummaryIntro}>
          <span className={styles.compensationSummaryIcon} aria-hidden>
            <Banknote size={18} />
          </span>
          <div>
            <h3 className={styles.compensationSummaryTitle}>{t('system.payouts.title')}</h3>
            <p className={styles.compensationSummaryText}>{t('system.payouts.summaryText')}</p>
          </div>
        </div>
        <dl className={styles.compensationSummaryGrid}>
          <div className={styles.compensationSummaryItem}>
            <dt>{t('system.payouts.mode')}</dt>
            <dd>{staffCompensationModeLabel(draft.defaultMode, t)}</dd>
          </div>
          <div className={styles.compensationSummaryItem}>
            <dt>{t('system.payouts.currency')}</dt>
            <dd>{draft.defaultCurrency}</dd>
          </div>
          {draft.defaultMode !== 'salary' ? (
            <div className={styles.compensationSummaryItem}>
              <dt>{t('system.payouts.lessonRate')}</dt>
              <dd>
                {formatMoneyMinor(draft.defaultPerLessonRateMinor, draft.defaultCurrency)}
              </dd>
            </div>
          ) : null}
          {draft.defaultMode !== 'per_lesson' ? (
            <div className={styles.compensationSummaryItem}>
              <dt>{t('system.payouts.salary')}</dt>
              <dd>
                {formatMoneyMinor(draft.defaultSalaryMinor, draft.defaultCurrency)}/
                {staffPayFrequencyLabel(draft.defaultPayFrequency, t)}
              </dd>
            </div>
          ) : null}
          <div className={styles.compensationSummaryItem}>
            <dt>{t('system.payouts.payDay')}</dt>
            <dd>
              {staffPayFrequencyLabel(draft.defaultPayFrequency, t)} ·{' '}
              {formatStaffPayDayLabel(
                draft.defaultPayFrequency,
                draft.defaultPayDayOfWeek,
                draft.defaultPayDayOfMonth,
                t,
              )}
            </dd>
          </div>
          <div className={styles.compensationSummaryItem}>
            <dt>{t('system.payouts.gracePeriod')}</dt>
            <dd>
              {draft.defaultGraceDays === 1
                ? t('system.payouts.graceDay', { count: String(draft.defaultGraceDays) })
                : t('system.payouts.graceDays', { count: String(draft.defaultGraceDays) })}
            </dd>
          </div>
        </dl>
      </section>

      <p className={styles.compensationIntro}>
        {t('system.payouts.introBefore')}
        <Link href="/staff" className={styles.compensationIntroLink}>
          {t('system.payouts.introLink')}
        </Link>
        {t('system.payouts.introAfter')}
      </p>

      {error ? <p className={styles.formError}>{error}</p> : null}

      <StaffPayoutDefaultsFields draft={draft} onChange={onChange} disabled={saving} />

      <footer className={styles.compensationFooter}>
        {feedback ? <p className={styles.compensationFeedback}>{feedback}</p> : null}
        <Button type="button" onClick={onSave} loading={saving} loadingLabel={t('common.saving')}>
          <Save size={14} aria-hidden />
          {t('system.payouts.save')}
        </Button>
      </footer>
    </div>
  );
}
