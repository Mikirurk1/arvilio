'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button, Field } from '../../../components/ui';
import {
  getManualInvoiceMethodSetupIssues,
  isManualInvoiceMethodConfigured,
  type ManualInvoiceMethodDto,
  type PaymentConfigDto,
} from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
import {
  ConfigField,
  createManualMethod,
  formatImportantNotes,
  manualMethodKindLabel,
  parseImportantNotes,
} from './payment-config-primitives';
import styles from '../page.module.scss';

function getManualMethodKindLabel(entry: ManualInvoiceMethodDto, t: ReturnType<typeof useCampusT>): string {
  return entry.kind === 'custom'
    ? entry.label.trim() || t('system.payments.manualInvoice.kind.custom')
    : manualMethodKindLabel(entry.kind, t);
}

interface Props {
  config: PaymentConfigDto;
  onChange: (config: PaymentConfigDto) => void;
}

export function ManualInvoiceMethodConfig({ config, onChange }: Props) {
  const t = useCampusT();

  const updateMethod = (methodId: string, patch: Partial<ManualInvoiceMethodDto>) => {
    onChange({
      ...config,
      manualInvoiceMethods: config.manualInvoiceMethods.map((entry) =>
        entry.id === methodId ? ({ ...entry, ...patch } as ManualInvoiceMethodDto) : entry,
      ),
    });
  };

  const addMethod = (kind: Extract<ManualInvoiceMethodDto['kind'], 'iban_sepa' | 'swift_wire' | 'card_transfer'>) => {
    onChange({ ...config, manualInvoiceMethods: [createManualMethod(kind), ...config.manualInvoiceMethods] });
  };

  const removeMethod = (methodId: string) => {
    onChange({ ...config, manualInvoiceMethods: config.manualInvoiceMethods.filter((e) => e.id !== methodId) });
  };

  return (
    <>
      <div className={styles.manualMethodToolbar}>
        <p className={styles.hint}>{t('system.payments.manualInvoice.toolbarHint')}</p>
        <div className={styles.manualMethodToolbarActions}>
          <Button type="button" variant="ghost" onClick={() => addMethod('iban_sepa')}>
            <Plus size={16} aria-hidden />{t('system.payments.manualInvoice.addIban')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => addMethod('swift_wire')}>
            <Plus size={16} aria-hidden />{t('system.payments.manualInvoice.addSwift')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => addMethod('card_transfer')}>
            <Plus size={16} aria-hidden />{t('system.payments.manualInvoice.addCard')}
          </Button>
        </div>
      </div>

      {config.manualInvoiceMethods.length === 0 ? (
        <p className={styles.hint}>{t('system.payments.manualInvoice.empty')}</p>
      ) : null}

      {config.manualInvoiceMethods.map((entry) => {
        const setupIssues = getManualInvoiceMethodSetupIssues(entry);
        const isReady = isManualInvoiceMethodConfigured(entry);
        const kindLabel = getManualMethodKindLabel(entry, t);
        return (
          <div key={entry.id} className={styles.manualMethodCard}>
            <div className={styles.manualMethodHead}>
              <div>
                <div className={styles.manualMethodKindLabel}>{kindLabel}</div>
                <div className={styles.manualMethodId}>ID: {entry.id}</div>
                {!isReady ? (
                  <p className={styles.manualMethodSetupHint}>
                    {t('system.payments.manualInvoice.missingPrefix')} {setupIssues.join(', ')}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                className={styles.manualMethodRemove}
                aria-label={t('system.payments.manualInvoice.removeAria', { label: entry.label || kindLabel })}
                onClick={() => removeMethod(entry.id)}
              >
                <Trash2 size={16} aria-hidden />
              </Button>
            </div>

            <div className={styles.manualMethodGrid}>
              <ConfigField label={t('system.payments.manualInvoice.field.label')}>
                <Field className={styles.input} value={entry.label} onChange={(e) => updateMethod(entry.id, { label: e.target.value })} />
              </ConfigField>
              <ConfigField label={t('system.payments.manualInvoice.field.paymentReferenceHint')}>
                <Field className={styles.input} value={entry.paymentReferenceHint} onChange={(e) => updateMethod(entry.id, { paymentReferenceHint: e.target.value })} />
              </ConfigField>
              <ConfigField label={t('system.payments.manualInvoice.field.paymentPurpose')}>
                <Field className={styles.input} value={entry.paymentPurpose ?? ''} onChange={(e) => updateMethod(entry.id, { paymentPurpose: e.target.value || null })} />
              </ConfigField>
              <ConfigField label={t('system.payments.manualInvoice.field.taxId')}>
                <Field className={styles.input} value={entry.recipientTaxId ?? ''} onChange={(e) => updateMethod(entry.id, { recipientTaxId: e.target.value || null })} />
              </ConfigField>
              <ConfigField label={t('system.payments.manualInvoice.field.description')} wide>
                <Field as="textarea" className={styles.textarea} value={entry.description} onChange={(e) => updateMethod(entry.id, { description: e.target.value })} />
              </ConfigField>
              <ConfigField label={t('system.payments.manualInvoice.field.importantNotes')} wide>
                <Field as="textarea" className={styles.textarea} value={formatImportantNotes(entry.importantNotes)} onChange={(e) => updateMethod(entry.id, { importantNotes: parseImportantNotes(e.target.value) })} />
              </ConfigField>
              <ConfigField label={t('system.payments.manualInvoice.field.receiptHintUk')}>
                <Field className={styles.input} value={entry.receiptHintUk} onChange={(e) => updateMethod(entry.id, { receiptHintUk: e.target.value })} />
              </ConfigField>

              {entry.kind === 'iban_sepa' || entry.kind === 'swift_wire' ? (
                <>
                  <ConfigField label={t('system.payments.manualInvoice.field.beneficiaryName')}>
                    <Field className={styles.input} value={entry.beneficiaryName} onChange={(e) => updateMethod(entry.id, { beneficiaryName: e.target.value })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.bankNameOptional')}>
                    <Field className={styles.input} value={entry.bankName ?? ''} onChange={(e) => updateMethod(entry.id, { bankName: e.target.value || null })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'card_transfer' ? (
                <>
                  <ConfigField label={t('system.payments.manualInvoice.field.cardholderName')}>
                    <Field className={styles.input} value={entry.beneficiaryName} onChange={(e) => updateMethod(entry.id, { beneficiaryName: e.target.value })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.bankName')}>
                    <Field className={styles.input} value={entry.bankName} onChange={(e) => updateMethod(entry.id, { bankName: e.target.value })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.cardNumber')}>
                    <Field className={styles.input} value={entry.cardNumber} onChange={(e) => updateMethod(entry.id, { cardNumber: e.target.value })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'iban_sepa' ? (
                <>
                  <ConfigField label={t('system.payments.manualInvoice.field.iban')}>
                    <Field className={styles.input} value={entry.iban} onChange={(e) => updateMethod(entry.id, { iban: e.target.value })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.bankCountryOptional')}>
                    <Field className={styles.input} placeholder={t('system.payments.manualInvoice.field.bankCountryPlaceholder')} value={entry.bankCountry ?? ''} onChange={(e) => updateMethod(entry.id, { bankCountry: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.bicOptional')}>
                    <Field className={styles.input} value={entry.bic ?? ''} onChange={(e) => updateMethod(entry.id, { bic: e.target.value || null })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'swift_wire' ? (
                <>
                  <ConfigField label={t('system.payments.manualInvoice.field.accountNumber')}>
                    <Field className={styles.input} value={entry.accountNumber} onChange={(e) => updateMethod(entry.id, { accountNumber: e.target.value })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.ibanOptional')}>
                    <Field className={styles.input} value={entry.iban ?? ''} onChange={(e) => updateMethod(entry.id, { iban: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.swiftBic')}>
                    <Field className={styles.input} value={entry.swiftBic} onChange={(e) => updateMethod(entry.id, { swiftBic: e.target.value })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.bankAddressOptional')} wide>
                    <Field as="textarea" className={styles.textarea} value={entry.bankAddress ?? ''} onChange={(e) => updateMethod(entry.id, { bankAddress: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.beneficiaryAddressOptional')} wide>
                    <Field as="textarea" className={styles.textarea} value={entry.beneficiaryAddress ?? ''} onChange={(e) => updateMethod(entry.id, { beneficiaryAddress: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.intermediaryBankOptional')}>
                    <Field className={styles.input} value={entry.intermediaryBankName ?? ''} onChange={(e) => updateMethod(entry.id, { intermediaryBankName: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label={t('system.payments.manualInvoice.field.intermediarySwiftOptional')}>
                    <Field className={styles.input} value={entry.intermediarySwiftBic ?? ''} onChange={(e) => updateMethod(entry.id, { intermediarySwiftBic: e.target.value || null })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'custom' ? (
                <ConfigField label={t('system.payments.manualInvoice.field.instructions')} wide>
                  <Field as="textarea" className={styles.textarea} value={entry.instructionsUk} onChange={(e) => updateMethod(entry.id, { instructionsUk: e.target.value })} />
                </ConfigField>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}
