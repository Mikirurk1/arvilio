'use client';

import type { PaymentCurrencyCode } from '@pkg/types';
import { Banknote } from 'lucide-react';
import { Button, Field } from '../../components/ui';
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
  const gridClass =
    variant === 'modal' ? styles.formGridModal : styles.formGrid;

  return (
    <>
      <div className={gridClass}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="payout-amount">
            Amount ({currency})
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
            Paid on
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
            Note (optional)
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
          Cancel
        </Button>
        <Button type="button" onClick={onSubmit} loading={saving} loadingLabel="Saving…">
          <Banknote size={14} aria-hidden />
          Save payout
        </Button>
      </div>
      {variant === 'inline' ? (
        <p className={styles.formHint}>
          Recording payout for <strong>{staffDisplayName}</strong>.
        </p>
      ) : null}
    </>
  );
}
