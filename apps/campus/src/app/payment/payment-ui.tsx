'use client';

import { useCallback, useState } from 'react';
import { Building2, Check, Copy, CreditCard, Wallet } from 'lucide-react';
import type { ManualInvoiceMethodDto, PaymentMethodKindDto } from '@pkg/types';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export function PaymentMethodIcon({ method }: { method: PaymentMethodKindDto }) {
  if (method === 'manual_invoice') return <Building2 size={18} aria-hidden />;
  if (method === 'paypal' || method === 'liqpay' || method === 'monopay') {
    return <Wallet size={18} aria-hidden />;
  }
  return <CreditCard size={18} aria-hidden />;
}

export function SectionIntro({
  title,
  description,
  headingId,
}: {
  title: string;
  description: string;
  headingId?: string;
}) {
  return (
    <header className={styles.sectionIntro}>
      <h2 id={headingId} className={styles.sectionTitle}>
        {title}
      </h2>
      <p className={styles.sectionDescription}>{description}</p>
    </header>
  );
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** Click-to-copy row for bank/card transfer details. */
export function CopyablePaymentValue({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  const t = useCampusT();
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [value]);

  return (
    <button
      type="button"
      className={[styles.manualField, styles.manualFieldCopyable, className].filter(Boolean).join(' ')}
      onClick={() => void onCopy()}
      aria-label={t('payment.copyFieldAria', { label, value })}
      title={copied ? t('payment.copied') : t('payment.copyHint')}
    >
      <span className={styles.manualFieldLabelRow}>
        <span className={styles.manualFieldLabel}>{label}</span>
        <span className={styles.manualFieldCopyBadge} aria-hidden>
          {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
          <span>{copied ? t('payment.copied') : t('payment.copy')}</span>
        </span>
      </span>
      <strong className={[styles.manualFieldValue, valueClassName].filter(Boolean).join(' ')}>
        {value}
      </strong>
    </button>
  );
}

function ManualField({
  label,
  value,
  copyable = true,
}: {
  label: string;
  value: string | null | undefined;
  /** Default true — payment details should be easy to paste into a banking app. */
  copyable?: boolean;
}) {
  if (!value) return null;
  if (!copyable) {
    return (
      <div className={styles.manualField}>
        <span className={styles.manualFieldLabel}>{label}</span>
        <strong className={styles.manualFieldValue}>{value}</strong>
      </div>
    );
  }
  return <CopyablePaymentValue label={label} value={value} />;
}

export function ManualInvoiceMethodDetails({ method }: { method: ManualInvoiceMethodDto }) {
  const t = useCampusT();

  if (method.kind === 'iban_sepa') {
    return (
      <div className={styles.manualFieldGrid}>
        <ManualField label={t('payment.field.receiver')} value={method.beneficiaryName} />
        <ManualField label={t('payment.field.iban')} value={method.iban} />
        <ManualField label={t('payment.field.taxId')} value={method.recipientTaxId} />
        <ManualField label={t('payment.field.purpose')} value={method.paymentPurpose} />
        <ManualField label={t('payment.field.bank')} value={method.bankName} />
        <ManualField label={t('payment.field.country')} value={method.bankCountry} />
        <ManualField label={t('payment.field.bic')} value={method.bic} />
      </div>
    );
  }
  if (method.kind === 'swift_wire') {
    return (
      <>
        <div className={styles.manualFieldGrid}>
          <ManualField label={t('payment.field.receiver')} value={method.beneficiaryName} />
          <ManualField label={t('payment.field.swiftBic')} value={method.swiftBic} />
          <ManualField label={t('payment.field.accountNumber')} value={method.accountNumber} />
          <ManualField label={t('payment.field.iban')} value={method.iban} />
          <ManualField label={t('payment.field.taxId')} value={method.recipientTaxId} />
          <ManualField label={t('payment.field.purpose')} value={method.paymentPurpose} />
          <ManualField label={t('payment.field.bank')} value={method.bankName} />
          <ManualField label={t('payment.field.intermediarySwift')} value={method.intermediarySwiftBic} />
        </div>
        {method.bankAddress ? (
          <CopyablePaymentValue
            label={t('payment.field.bankAddressLabel')}
            value={method.bankAddress}
            className={styles.manualFieldWide}
          />
        ) : null}
        {method.beneficiaryAddress ? (
          <CopyablePaymentValue
            label={t('payment.field.receiverAddressLabel')}
            value={method.beneficiaryAddress}
            className={styles.manualFieldWide}
          />
        ) : null}
        {method.intermediaryBankName ? (
          <CopyablePaymentValue
            label={t('payment.field.intermediaryBankLabel')}
            value={method.intermediaryBankName}
            className={styles.manualFieldWide}
          />
        ) : null}
      </>
    );
  }
  if (method.kind === 'card_transfer') {
    return (
      <div className={styles.manualFieldGrid}>
        <ManualField label={t('payment.field.cardholder')} value={method.beneficiaryName} />
        <ManualField label={t('payment.field.bank')} value={method.bankName} />
        <ManualField label={t('payment.field.cardNumber')} value={method.cardNumber} />
        <ManualField label={t('payment.field.taxId')} value={method.recipientTaxId} />
        <ManualField label={t('payment.field.purpose')} value={method.paymentPurpose} />
      </div>
    );
  }
  return method.instructionsUk ? (
    <CopyablePaymentValue
      label={t('payment.field.instructions')}
      value={method.instructionsUk}
      className={styles.manualFieldWide}
    />
  ) : null;
}
