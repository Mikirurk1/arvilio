'use client';

import { useRef, useState } from 'react';
import { CircleHelp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
  Button,
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
import { useCampusT } from '../../../lib/cms';
import type { TranslateFn } from '../../../lib/cms/nav-i18n';
import {
  PAYMENT_PROVIDER_META,
  resolvePaymentProviderUiMeta,
} from './payment-provider-meta';
import styles from '../page.module.scss';

const MANUAL_METHOD_KIND_KEYS: Record<ManualInvoiceMethodKindDto, string> = {
  iban_sepa: 'system.payments.manualInvoice.kind.ibanSepa',
  swift_wire: 'system.payments.manualInvoice.kind.swiftWire',
  card_transfer: 'system.payments.manualInvoice.kind.cardTransfer',
  custom: 'system.payments.manualInvoice.kind.custom',
};

const MANUAL_METHOD_KIND_FALLBACK: Record<ManualInvoiceMethodKindDto, string> = {
  iban_sepa: 'IBAN / SEPA',
  swift_wire: 'SWIFT wire',
  card_transfer: 'Card transfer',
  custom: 'Manual invoice',
};

export function manualMethodKindLabel(kind: ManualInvoiceMethodKindDto, t?: TranslateFn): string {
  const key = MANUAL_METHOD_KIND_KEYS[kind];
  return t ? t(key) : MANUAL_METHOD_KIND_FALLBACK[kind];
}

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

export function formatSecretStatus(status: PaymentSecretFieldStatusDto, t?: TranslateFn): string {
  if (status.source === 'system') return t?.('system.payments.config.secretSaved') ?? 'Saved in this school';
  if (status.source === 'env') return t?.('system.payments.config.secretEnvFallback') ?? 'Using legacy env fallback';
  return t?.('system.payments.config.secretMissing') ?? 'Missing';
}

export function FieldLabel({ label, tooltip }: { label: string; tooltip?: string }) {
  const t = useCampusT();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <div className={styles.configLabelRow}>
      <label className={styles.label}>{label}</label>
      {tooltip ? (
        <>
          <Button
            ref={buttonRef}
            variant="bare"
            type="button"
            className={styles.configInfoButton}
            aria-label={t('system.payments.config.moreInfoAria', { label })}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          >
            <CircleHelp size={14} className={styles.configInfoIcon} aria-hidden />
          </Button>
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
  const t = useCampusT();
  return (
    <ConfigField label={label} tooltip={tooltip}>
      <Field
        type="password"
        className={styles.input}
        value={value ?? ''}
        placeholder={t('system.payments.config.secretPlaceholder')}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={`${styles.secretStatus} ${status.configured ? styles.secretStatusConfigured : styles.secretStatusMissing}`}>
        {formatSecretStatus(status, t)}
      </div>
    </ConfigField>
  );
}

export function ProviderHelp({ method }: { method: PaymentMethodKindDto }) {
  const t = useCampusT();
  const meta = PAYMENT_PROVIDER_META[method];
  const uiMeta = resolvePaymentProviderUiMeta(method, t);
  const title = method === 'manual_invoice' ? uiMeta.title : meta.title;
  const description = method === 'manual_invoice' ? uiMeta.description : meta.description;
  const checklist = method === 'manual_invoice' ? uiMeta.setupChecklist : meta.setupChecklist;

  return (
    <div className={styles.providerHelpCard}>
      <div className={styles.providerHelpTop}>
        <div>
          <div className={styles.providerHelpTitle}>{title}</div>
          <p className={styles.hint}>{description}</p>
        </div>
        {meta.docsUrl ? (
          <Link href={meta.docsUrl} target="_blank" rel="noreferrer" className={styles.providerHelpLink}>
            {meta.docsLabel ?? t('system.payments.config.officialDocs')}
            <ExternalLink size={14} aria-hidden />
          </Link>
        ) : null}
      </div>
      {meta.modeHelp ? <p className={styles.providerModeHint}>{meta.modeHelp}</p> : null}
      <div className={styles.providerChecklistTitle}>{t('system.payments.config.setupTitle')}</div>
      <ul className={styles.providerChecklist}>
        {checklist.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export function ProviderModeSwitch({ value, onChange, tooltip }: { value: PaymentEnvironmentModeDto; onChange: (value: PaymentEnvironmentModeDto) => void; tooltip?: string }) {
  const t = useCampusT();
  const modeOptions = [
    { value: 'test' as const, label: t('system.payments.config.testMode') },
    { value: 'live' as const, label: t('system.payments.config.liveMode') },
  ];

  return (
    <div className={styles.providerModeSection}>
      <FieldLabel label={t('system.payments.config.environment')} tooltip={tooltip} />
      <SegmentedControl<PaymentEnvironmentModeDto>
        ariaLabel={t('system.payments.config.environmentAria')}
        value={value}
        onValueChange={onChange}
        options={modeOptions}
      />
    </div>
  );
}
