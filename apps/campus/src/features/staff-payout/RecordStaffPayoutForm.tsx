'use client';

import type { PaymentCurrencyCode } from '@pkg/types';
import { Banknote } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import styles from './staff-payout.module.scss';

export type RecordStaffPayoutFormValues = {
  amountMajor: string;
  paidAt: string;
  note: string;
};

type RecordStaffPayoutFormProps = {
  staffDisplayName: string;
  currency: PaymentCurrencyCode;
  values: RecordStaffPayoutFormValues;
  onChange: (patch: Partial<RecordStaffPayoutFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
  paidAtMax?: string;
  variant?: 'inline' | 'modal';
};

export function RecordStaffPayoutForm({
  staffDisplayName,
  currency,
  values,
  onChange,
  onSubmit,
  onCancel,
  saving = false,
  error = null,
  paidAtMax,
  variant = 'inline',
}: RecordStaffPayoutFormProps) {
  const t = useCampusT();
  const gridClass =
    variant === 'modal' ? styles.formGridModal : styles.formGrid;

  return (
    <>
      <div className={gridClass}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="payout-amount">
            {t('staffPayout.form.amount', { currency })}
          </label>
          <Field
            id="payout-amount"
            type="number"
            className={styles.input}
            min={0}
            step="0.01"
            value={values.amountMajor}
            onChange={(event) => onChange({ amountMajor: event.target.value })}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="payout-date">
            {t('staffPayout.form.paidOn')}
          </label>
          <Field
            id="payout-date"
            type="date"
            className={styles.input}
            value={values.paidAt}
            max={paidAtMax}
            onChange={(event) => onChange({ paidAt: event.target.value })}
          />
        </div>
        <div className={[styles.fieldGroup, variant === 'modal' ? styles.fieldGroupWide : ''].join(' ')}>
          <label className={styles.label} htmlFor="payout-note">
            {t('staffPayout.form.note')}
          </label>
          <Field
            id="payout-note"
            className={styles.input}
            value={values.note}
            onChange={(event) => onChange({ note: event.target.value })}
          />
        </div>
      </div>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={variant === 'modal' ? styles.formActionsModal : styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          {t('staffPayout.form.cancel')}
        </Button>
        <Button type="button" onClick={onSubmit} loading={saving} loadingLabel={t('staffPayout.form.saving')}>
          <Banknote size={14} aria-hidden />
          {t('staffPayout.form.save')}
        </Button>
      </div>
      {variant === 'inline' ? (
        <p className={styles.formHint}>
          {t('staffPayout.form.recordingFor', { name: staffDisplayName })}
        </p>
      ) : null}
    </>
  );
}
