'use client';

import { useRef, useState } from 'react';
import { CircleHelp, ExternalLink } from 'lucide-react';
import {
  Field,
  SegmentedControl,
  Tooltip,
} from '../../../components/ui';
import {
  DEFAULT_PAYMENT_ENVIRONMENT_MODE,
  type ManualInvoiceMethodDto,
  type ManualInvoiceMethodKindDto,
  type PaymentEnvironmentModeDto,
  type PaymentMethodKindDto,
  type PaymentSecretFieldStatusDto,
} from '@pkg/types';
import {
  PAYMENT_PROVIDER_META,
} from './payment-provider-meta';
import styles from '../page.module.scss';

export const MANUAL_METHOD_KIND_LABELS: Record<ManualInvoiceMethodKindDto, string> = {
  iban_sepa: 'IBAN / SEPA',
  swift_wire: 'SWIFT wire',
  card_transfer: 'Card transfer',
  custom: 'Manual invoice',
};

const MODE_OPTIONS = [
  { value: 'test', label: 'Test mode' },
  { value: 'live', label: 'Live mode' },
] as const;

export function newManualMethodId(): string {
  return `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createManualMethod(
  kind: Extract<ManualInvoiceMethodKindDto, 'iban_sepa' | 'swift_wire' | 'card_transfer'>,
): ManualInvoiceMethodDto {
  const base = {
    id: newManualMethodId(),
    label:
      kind === 'iban_sepa' ? 'Bank transfer (IBAN / SEPA)'
      : kind === 'swift_wire' ? 'International wire transfer'
      : 'Card transfer',
    description:
      kind === 'iban_sepa' ? 'Pay by IBAN/SEPA transfer to the account below.'
      : kind === 'swift_wire' ? 'Pay by SWIFT wire transfer using the bank details below.'
      : 'Pay by card transfer using the bank and card details below.',
    receiptHintUk: 'Після оплати надішліть квитанцію адміністратору.',
    paymentReferenceHint: 'Student name or invoice number',
    recipientTaxId: null,
    paymentPurpose: null,
    importantNotes: [] as string[],
  };
  if (kind === 'iban_sepa') return { ...base, kind, beneficiaryName: '', iban: '', bankName: null, bankCountry: null, bic: null };
  if (kind === 'card_transfer') return { ...base, kind, beneficiaryName: '', bankName: '', cardNumber: '' };
  return { ...base, kind, beneficiaryName: '', accountNumber: '', iban: null, bankName: null, bankAddress: null, swiftBic: '', beneficiaryAddress: null, intermediaryBankName: null, intermediarySwiftBic: null };
}

export function formatImportantNotes(notes: string[] | null | undefined): string {
  return (notes ?? []).join('\n');
}

export function parseImportantNotes(value: string): string[] {
  return [...new Set(value.split('\n').map((line) => line.trim()).filter(Boolean))];
}

export function formatSecretStatus(status: PaymentSecretFieldStatusDto): string {
  if (status.source === 'system') return 'Saved in this school';
  if (status.source === 'env') return 'Using legacy env fallback';
  return 'Missing';
}

export function FieldLabel({ label, tooltip }: { label: string; tooltip?: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <div className={styles.configLabelRow}>
      <label className={styles.label}>{label}</label>
      {tooltip ? (
        <>
          <button
            ref={buttonRef}
            type="button"
            className={styles.configInfoButton}
            aria-label={`More info about ${label}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          >
            <CircleHelp size={14} className={styles.configInfoIcon} aria-hidden />
          </button>
          <Tooltip open={open} targetEl={buttonRef.current} content={tooltip} placement="top" className={styles.configTooltip} />
        </>
      ) : null}
    </div>
  );
}

export function ConfigField({ label, tooltip, children, wide = false }: { label: string; tooltip?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`${styles.fieldGroup} ${wide ? styles.fieldWide : ''}`}>
      <FieldLabel label={label} tooltip={tooltip} />
      {children}
    </div>
  );
}

export function SecretField({ label, tooltip, value, status, onChange }: { label: string; tooltip?: string; value?: string; status: PaymentSecretFieldStatusDto; onChange: (value: string) => void }) {
  return (
    <ConfigField label={label} tooltip={tooltip}>
      <Field
        type="password"
        className={styles.input}
        value={value ?? ''}
        placeholder="Leave blank to keep current value"
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={`${styles.secretStatus} ${status.configured ? styles.secretStatusConfigured : styles.secretStatusMissing}`}>
        {formatSecretStatus(status)}
      </div>
    </ConfigField>
  );
}

export function ProviderHelp({ method }: { method: PaymentMethodKindDto }) {
  const meta = PAYMENT_PROVIDER_META[method];
  return (
    <div className={styles.providerHelpCard}>
      <div className={styles.providerHelpTop}>
        <div>
          <div className={styles.providerHelpTitle}>{meta.title}</div>
          <p className={styles.hint}>{meta.description}</p>
        </div>
        {meta.docsUrl ? (
          <a href={meta.docsUrl} target="_blank" rel="noreferrer" className={styles.providerHelpLink}>
            {meta.docsLabel ?? 'Official docs'}
            <ExternalLink size={14} aria-hidden />
          </a>
        ) : null}
      </div>
      {meta.modeHelp ? <p className={styles.providerModeHint}>{meta.modeHelp}</p> : null}
      <div className={styles.providerChecklistTitle}>What you need to connect</div>
      <ul className={styles.providerChecklist}>
        {meta.setupChecklist.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export function ProviderModeSwitch({ value, onChange, tooltip }: { value: PaymentEnvironmentModeDto; onChange: (value: PaymentEnvironmentModeDto) => void; tooltip?: string }) {
  return (
    <div className={styles.providerModeSection}>
      <FieldLabel label="Environment" tooltip={tooltip} />
      <SegmentedControl<PaymentEnvironmentModeDto>
        ariaLabel="Select payment environment"
        value={value}
        onValueChange={onChange}
        options={[...MODE_OPTIONS]}
      />
    </div>
  );
}
