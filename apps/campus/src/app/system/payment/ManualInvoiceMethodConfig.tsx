'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button, Field } from '../../../components/ui';
import {
  getManualInvoiceMethodSetupIssues,
  isManualInvoiceMethodConfigured,
  type ManualInvoiceMethodDto,
  type PaymentConfigDto,
} from '@pkg/types';
import {
  ConfigField,
  MANUAL_METHOD_KIND_LABELS,
  createManualMethod,
  formatImportantNotes,
  parseImportantNotes,
} from './payment-config-primitives';
import styles from '../page.module.scss';

function getManualMethodKindLabel(entry: ManualInvoiceMethodDto): string {
  return entry.kind === 'custom' ? entry.label.trim() || 'Manual invoice' : MANUAL_METHOD_KIND_LABELS[entry.kind];
}

interface Props {
  config: PaymentConfigDto;
  onChange: (config: PaymentConfigDto) => void;
}

export function ManualInvoiceMethodConfig({ config, onChange }: Props) {
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
        <p className={styles.hint}>
          Add one or more offline payment instructions. Students can later be restricted to specific manual methods in the student billing tab.
        </p>
        <div className={styles.manualMethodToolbarActions}>
          <Button type="button" variant="ghost" onClick={() => addMethod('iban_sepa')}><Plus size={16} aria-hidden />Add IBAN / SEPA</Button>
          <Button type="button" variant="ghost" onClick={() => addMethod('swift_wire')}><Plus size={16} aria-hidden />Add SWIFT</Button>
          <Button type="button" variant="ghost" onClick={() => addMethod('card_transfer')}><Plus size={16} aria-hidden />Add card transfer</Button>
        </div>
      </div>

      {config.manualInvoiceMethods.length === 0 ? (
        <p className={styles.hint}>No manual invoice methods configured yet.</p>
      ) : null}

      {config.manualInvoiceMethods.map((entry) => {
        const setupIssues = getManualInvoiceMethodSetupIssues(entry);
        const isReady = isManualInvoiceMethodConfigured(entry);
        return (
          <div key={entry.id} className={styles.manualMethodCard}>
            <div className={styles.manualMethodHead}>
              <div>
                <div className={styles.manualMethodKindLabel}>{getManualMethodKindLabel(entry)}</div>
                <div className={styles.manualMethodId}>ID: {entry.id}</div>
                {!isReady ? <p className={styles.manualMethodSetupHint}>Missing: {setupIssues.join(', ')}</p> : null}
              </div>
              <Button type="button" variant="ghost" className={styles.manualMethodRemove} aria-label={`Remove ${entry.label || getManualMethodKindLabel(entry)}`} onClick={() => removeMethod(entry.id)}>
                <Trash2 size={16} aria-hidden />
              </Button>
            </div>

            <div className={styles.manualMethodGrid}>
              <ConfigField label="Label">
                <Field className={styles.input} value={entry.label} onChange={(e) => updateMethod(entry.id, { label: e.target.value })} />
              </ConfigField>
              <ConfigField label="Payment reference hint">
                <Field className={styles.input} value={entry.paymentReferenceHint} onChange={(e) => updateMethod(entry.id, { paymentReferenceHint: e.target.value })} />
              </ConfigField>
              <ConfigField label="Payment purpose">
                <Field className={styles.input} value={entry.paymentPurpose ?? ''} onChange={(e) => updateMethod(entry.id, { paymentPurpose: e.target.value || null })} />
              </ConfigField>
              <ConfigField label="Tax ID / EDRPOU">
                <Field className={styles.input} value={entry.recipientTaxId ?? ''} onChange={(e) => updateMethod(entry.id, { recipientTaxId: e.target.value || null })} />
              </ConfigField>
              <ConfigField label="Description" wide>
                <Field as="textarea" className={styles.textarea} value={entry.description} onChange={(e) => updateMethod(entry.id, { description: e.target.value })} />
              </ConfigField>
              <ConfigField label="Important notes (one per line)" wide>
                <Field as="textarea" className={styles.textarea} value={formatImportantNotes(entry.importantNotes)} onChange={(e) => updateMethod(entry.id, { importantNotes: parseImportantNotes(e.target.value) })} />
              </ConfigField>
              <ConfigField label="Receipt hint (UK)">
                <Field className={styles.input} value={entry.receiptHintUk} onChange={(e) => updateMethod(entry.id, { receiptHintUk: e.target.value })} />
              </ConfigField>

              {entry.kind === 'iban_sepa' || entry.kind === 'swift_wire' ? (
                <>
                  <ConfigField label="Beneficiary name">
                    <Field className={styles.input} value={entry.beneficiaryName} onChange={(e) => updateMethod(entry.id, { beneficiaryName: e.target.value })} />
                  </ConfigField>
                  <ConfigField label="Bank name (optional)">
                    <Field className={styles.input} value={entry.bankName ?? ''} onChange={(e) => updateMethod(entry.id, { bankName: e.target.value || null })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'card_transfer' ? (
                <>
                  <ConfigField label="Cardholder name">
                    <Field className={styles.input} value={entry.beneficiaryName} onChange={(e) => updateMethod(entry.id, { beneficiaryName: e.target.value })} />
                  </ConfigField>
                  <ConfigField label="Bank name">
                    <Field className={styles.input} value={entry.bankName} onChange={(e) => updateMethod(entry.id, { bankName: e.target.value })} />
                  </ConfigField>
                  <ConfigField label="Card number">
                    <Field className={styles.input} value={entry.cardNumber} onChange={(e) => updateMethod(entry.id, { cardNumber: e.target.value })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'iban_sepa' ? (
                <>
                  <ConfigField label="IBAN">
                    <Field className={styles.input} value={entry.iban} onChange={(e) => updateMethod(entry.id, { iban: e.target.value })} />
                  </ConfigField>
                  <ConfigField label="Bank country (optional)">
                    <Field className={styles.input} placeholder="Ukraine, Germany, Poland..." value={entry.bankCountry ?? ''} onChange={(e) => updateMethod(entry.id, { bankCountry: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label="BIC / SWIFT (optional)">
                    <Field className={styles.input} value={entry.bic ?? ''} onChange={(e) => updateMethod(entry.id, { bic: e.target.value || null })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'swift_wire' ? (
                <>
                  <ConfigField label="Account number">
                    <Field className={styles.input} value={entry.accountNumber} onChange={(e) => updateMethod(entry.id, { accountNumber: e.target.value })} />
                  </ConfigField>
                  <ConfigField label="IBAN (optional)">
                    <Field className={styles.input} value={entry.iban ?? ''} onChange={(e) => updateMethod(entry.id, { iban: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label="SWIFT / BIC">
                    <Field className={styles.input} value={entry.swiftBic} onChange={(e) => updateMethod(entry.id, { swiftBic: e.target.value })} />
                  </ConfigField>
                  <ConfigField label="Bank address (optional)" wide>
                    <Field as="textarea" className={styles.textarea} value={entry.bankAddress ?? ''} onChange={(e) => updateMethod(entry.id, { bankAddress: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label="Beneficiary address (optional)" wide>
                    <Field as="textarea" className={styles.textarea} value={entry.beneficiaryAddress ?? ''} onChange={(e) => updateMethod(entry.id, { beneficiaryAddress: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label="Intermediary bank (optional)">
                    <Field className={styles.input} value={entry.intermediaryBankName ?? ''} onChange={(e) => updateMethod(entry.id, { intermediaryBankName: e.target.value || null })} />
                  </ConfigField>
                  <ConfigField label="Intermediary SWIFT (optional)">
                    <Field className={styles.input} value={entry.intermediarySwiftBic ?? ''} onChange={(e) => updateMethod(entry.id, { intermediarySwiftBic: e.target.value || null })} />
                  </ConfigField>
                </>
              ) : null}

              {entry.kind === 'custom' ? (
                <ConfigField label="Instructions" wide>
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
