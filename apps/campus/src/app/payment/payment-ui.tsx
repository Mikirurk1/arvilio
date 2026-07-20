import { Building2, CreditCard, Wallet } from 'lucide-react';
import type { ManualInvoiceMethodDto, PaymentMethodKindDto } from '@pkg/types';
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

function ManualField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className={styles.manualField}>
      <span className={styles.manualFieldLabel}>{label}</span>
      <strong className={styles.manualFieldValue}>{value}</strong>
    </div>
  );
}

export function ManualInvoiceMethodDetails({ method }: { method: ManualInvoiceMethodDto }) {
  if (method.kind === 'iban_sepa') {
    return (
      <div className={styles.manualFieldGrid}>
        <ManualField label="Receiver" value={method.beneficiaryName} />
        <ManualField label="IBAN" value={method.iban} />
        <ManualField label="Tax ID / EDRPOU" value={method.recipientTaxId} />
        <ManualField label="Payment purpose" value={method.paymentPurpose} />
        <ManualField label="Bank" value={method.bankName} />
        <ManualField label="Country" value={method.bankCountry} />
        <ManualField label="BIC / SWIFT" value={method.bic} />
      </div>
    );
  }
  if (method.kind === 'swift_wire') {
    return (
      <>
        <div className={styles.manualFieldGrid}>
          <ManualField label="Receiver" value={method.beneficiaryName} />
          <ManualField label="SWIFT / BIC" value={method.swiftBic} />
          <ManualField label="Account number" value={method.accountNumber} />
          <ManualField label="IBAN" value={method.iban} />
          <ManualField label="Tax ID / EDRPOU" value={method.recipientTaxId} />
          <ManualField label="Payment purpose" value={method.paymentPurpose} />
          <ManualField label="Bank" value={method.bankName} />
          <ManualField label="Intermediary SWIFT" value={method.intermediarySwiftBic} />
        </div>
        {method.bankAddress ? (
          <p className={styles.manualNote}>Bank address: {method.bankAddress}</p>
        ) : null}
        {method.beneficiaryAddress ? (
          <p className={styles.manualNote}>Receiver address: {method.beneficiaryAddress}</p>
        ) : null}
        {method.intermediaryBankName ? (
          <p className={styles.manualNote}>Intermediary bank: {method.intermediaryBankName}</p>
        ) : null}
      </>
    );
  }
  if (method.kind === 'card_transfer') {
    return (
      <div className={styles.manualFieldGrid}>
        <ManualField label="Cardholder" value={method.beneficiaryName} />
        <ManualField label="Bank" value={method.bankName} />
        <ManualField label="Card number" value={method.cardNumber} />
        <ManualField label="Tax ID / EDRPOU" value={method.recipientTaxId} />
        <ManualField label="Payment purpose" value={method.paymentPurpose} />
      </div>
    );
  }
  return <p className={styles.manualNote}>{method.instructionsUk}</p>;
}
