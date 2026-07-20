'use client';

import { useEffect } from 'react';
import { Banknote, X } from 'lucide-react';
import type { PaymentCurrencyCode } from '@pkg/types';
import { BodyPortal, Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { RecordStaffPayoutForm, type RecordStaffPayoutFormValues } from './RecordStaffPayoutForm';
import styles from './staff-payout.module.scss';

type RecordStaffPayoutModalProps = {
  open: boolean;
  staffDisplayName: string;
  currency: PaymentCurrencyCode;
  values: RecordStaffPayoutFormValues;
  onChange: (patch: Partial<RecordStaffPayoutFormValues>) => void;
  onSubmit: () => void;
  onClose: () => void;
  saving?: boolean;
  error?: string | null;
  paidAtMax?: string;
  outstandingLabel?: string | null;
};

export function RecordStaffPayoutModal({
  open,
  staffDisplayName,
  currency,
  values,
  onChange,
  onSubmit,
  onClose,
  saving = false,
  error = null,
  paidAtMax,
  outstandingLabel = null,
}: RecordStaffPayoutModalProps) {
  const t = useCampusT();
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, saving]);

  if (!open) return null;

  return (
    <BodyPortal>
      <div
        className={styles.payoutModalOverlay}
        role="presentation"
        onClick={() => {
          if (!saving) onClose();
        }}
      >
        <div
          className={styles.payoutModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-payout-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className={styles.payoutModalHeader}>
            <div className={styles.payoutModalHeaderMain}>
              <span className={styles.payoutModalIcon} aria-hidden>
                <Banknote size={18} />
              </span>
              <div>
                <h2 id="record-payout-title" className={styles.payoutModalTitle}>
                  {t('staffPayout.record.title')}
                </h2>
                <p className={styles.payoutModalSubtitle}>
                  {t('staffPayout.record.subtitle', { name: staffDisplayName })}
                  {outstandingLabel ? (
                    <>
                      {' '}
                      · {t('staffPayout.record.outstanding', { amount: outstandingLabel })}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              className={styles.payoutModalClose}
              aria-label={t('staffPayout.close')}
              disabled={saving}
              onClick={onClose}
            >
              <X size={18} aria-hidden />
            </Button>
          </header>

          <div className={styles.payoutModalBody}>
            <RecordStaffPayoutForm
              variant="modal"
              staffDisplayName={staffDisplayName}
              currency={currency}
              values={values}
              onChange={onChange}
              onSubmit={onSubmit}
              onCancel={onClose}
              saving={saving}
              error={error}
              paidAtMax={paidAtMax}
            />
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}
