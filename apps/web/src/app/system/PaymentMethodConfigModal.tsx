'use client';

import { useRef, useState } from 'react';
import { CircleHelp, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import {
  BodyPortal,
  Button,
  Field,
  SegmentedControl,
  Tooltip,
} from '../../components/ui';
import {
  DEFAULT_PAYMENT_ENVIRONMENT_MODE,
  getManualInvoiceMethodSetupIssues,
  isManualInvoiceMethodConfigured,
  PAYMENT_CURRENCY_OPTIONS,
  type ManualInvoiceMethodDto,
  type ManualInvoiceMethodKindDto,
  type PaymentConfigDto,
  type PaymentEnvironmentModeDto,
  type PaymentMethodKindDto,
  type PaymentSecretFieldStatusDto,
  type PaymentSecretStatusesDto,
  type PaymentSecretsDto,
} from '@pkg/types';
import {
  PAYMENT_PROVIDER_META,
  type ProviderFieldHelpKey,
} from './payment-provider-meta';
import styles from './page.module.scss';

type Props = {
  method: PaymentMethodKindDto;
  config: PaymentConfigDto;
  secretStatuses: PaymentSecretStatusesDto;
  secretDraft: PaymentSecretsDto;
  onChange: (config: PaymentConfigDto) => void;
  onSecretsChange: (secrets: PaymentSecretsDto) => void;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
  onClose: () => void;
};

const MANUAL_METHOD_KIND_LABELS: Record<ManualInvoiceMethodKindDto, string> = {
  iban_sepa: 'IBAN / SEPA',
  swift_wire: 'SWIFT wire',
  card_transfer: 'Card transfer',
  custom: 'Manual invoice',
};

const MODE_OPTIONS = [
  { value: 'test', label: 'Test mode' },
  { value: 'live', label: 'Live mode' },
] as const;

function newManualMethodId(): string {
  return `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createManualMethod(
  kind: Extract<ManualInvoiceMethodKindDto, 'iban_sepa' | 'swift_wire' | 'card_transfer'>,
): ManualInvoiceMethodDto {
  const base = {
    id: newManualMethodId(),
    label:
      kind === 'iban_sepa'
        ? 'Bank transfer (IBAN / SEPA)'
        : kind === 'swift_wire'
          ? 'International wire transfer'
          : 'Card transfer',
    description:
      kind === 'iban_sepa'
        ? 'Pay by IBAN/SEPA transfer to the account below.'
        : kind === 'swift_wire'
          ? 'Pay by SWIFT wire transfer using the bank details below.'
          : 'Pay by card transfer using the bank and card details below.',
    receiptHintUk: 'Після оплати надішліть квитанцію адміністратору.',
    paymentReferenceHint: 'Student name or invoice number',
    recipientTaxId: null,
    paymentPurpose: null,
    importantNotes: [] as string[],
  };

  if (kind === 'iban_sepa') {
    return {
      ...base,
      kind,
      beneficiaryName: '',
      iban: '',
      bankName: null,
      bankCountry: null,
      bic: null,
    };
  }

  if (kind === 'card_transfer') {
    return {
      ...base,
      kind,
      beneficiaryName: '',
      bankName: '',
      cardNumber: '',
    };
  }

  return {
    ...base,
    kind,
    beneficiaryName: '',
    accountNumber: '',
    iban: null,
    bankName: null,
    bankAddress: null,
    swiftBic: '',
    beneficiaryAddress: null,
    intermediaryBankName: null,
    intermediarySwiftBic: null,
  };
}

function formatImportantNotes(notes: string[] | null | undefined): string {
  return (notes ?? []).join('\n');
}

function parseImportantNotes(value: string): string[] {
  return [...new Set(value.split('\n').map((line) => line.trim()).filter(Boolean))];
}

function FieldLabel({
  label,
  tooltip,
}: {
  label: string;
  tooltip?: string;
}) {
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
          <Tooltip
            open={open}
            targetEl={buttonRef.current}
            content={tooltip}
            placement="top"
            className={styles.configTooltip}
          />
        </>
      ) : null}
    </div>
  );
}

function ConfigField({
  label,
  tooltip,
  children,
  wide = false,
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`${styles.fieldGroup} ${wide ? styles.fieldWide : ''}`}>
      <FieldLabel label={label} tooltip={tooltip} />
      {children}
    </div>
  );
}

function formatSecretStatus(status: PaymentSecretFieldStatusDto): string {
  if (status.source === 'system') return 'Saved in this school';
  if (status.source === 'env') return 'Using legacy env fallback';
  return 'Missing';
}

function SecretField({
  label,
  tooltip,
  value,
  status,
  onChange,
}: {
  label: string;
  tooltip?: string;
  value?: string;
  status: PaymentSecretFieldStatusDto;
  onChange: (value: string) => void;
}) {
  return (
    <ConfigField label={label} tooltip={tooltip}>
      <Field
        type="password"
        className={styles.input}
        value={value ?? ''}
        placeholder="Leave blank to keep current value"
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        className={`${styles.secretStatus} ${
          status.configured ? styles.secretStatusConfigured : styles.secretStatusMissing
        }`}
      >
        {formatSecretStatus(status)}
      </div>
    </ConfigField>
  );
}

function ProviderHelp({ method }: { method: PaymentMethodKindDto }) {
  const meta = PAYMENT_PROVIDER_META[method];
  return (
    <div className={styles.providerHelpCard}>
      <div className={styles.providerHelpTop}>
        <div>
          <div className={styles.providerHelpTitle}>{meta.title}</div>
          <p className={styles.hint}>{meta.description}</p>
        </div>
        {meta.docsUrl ? (
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.providerHelpLink}
          >
            {meta.docsLabel ?? 'Official docs'}
            <ExternalLink size={14} aria-hidden />
          </a>
        ) : null}
      </div>
      {meta.modeHelp ? <p className={styles.providerModeHint}>{meta.modeHelp}</p> : null}
      <div className={styles.providerChecklistTitle}>What you need to connect</div>
      <ul className={styles.providerChecklist}>
        {meta.setupChecklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ProviderModeSwitch({
  value,
  onChange,
  tooltip,
}: {
  value: PaymentEnvironmentModeDto;
  onChange: (value: PaymentEnvironmentModeDto) => void;
  tooltip?: string;
}) {
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

export function PaymentMethodConfigModal({
  method,
  config,
  secretStatuses,
  secretDraft,
  onChange,
  onSecretsChange,
  onSave,
  saving = false,
  onClose,
}: Props) {
  const getManualMethodKindLabel = (entry: ManualInvoiceMethodDto): string =>
    entry.kind === 'custom'
      ? entry.label.trim() || 'Manual invoice'
      : MANUAL_METHOD_KIND_LABELS[entry.kind];

  const updateManualMethod = (methodId: string, patch: Partial<ManualInvoiceMethodDto>) => {
    onChange({
      ...config,
      manualInvoiceMethods: config.manualInvoiceMethods.map((entry) =>
        entry.id === methodId ? ({ ...entry, ...patch } as ManualInvoiceMethodDto) : entry,
      ),
    });
  };

  const addManualMethod = (
    kind: Extract<ManualInvoiceMethodKindDto, 'iban_sepa' | 'swift_wire' | 'card_transfer'>,
  ) => {
    onChange({
      ...config,
      manualInvoiceMethods: [createManualMethod(kind), ...config.manualInvoiceMethods],
    });
  };

  const removeManualMethod = (methodId: string) => {
    onChange({
      ...config,
      manualInvoiceMethods: config.manualInvoiceMethods.filter((entry) => entry.id !== methodId),
    });
  };

  const updateStripe = (patch: Partial<NonNullable<PaymentConfigDto['stripe']>>) => {
    onChange({
      ...config,
      stripe: {
        mode: config.stripe?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        livePublishableKey: config.stripe?.livePublishableKey,
        testPublishableKey: config.stripe?.testPublishableKey,
        ...patch,
      },
    });
  };

  const updateLiqPay = (patch: Partial<NonNullable<PaymentConfigDto['liqpay']>>) => {
    onChange({
      ...config,
      liqpay: {
        mode: config.liqpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        livePublicKey: config.liqpay?.livePublicKey,
        testPublicKey: config.liqpay?.testPublicKey,
        ...patch,
      },
    });
  };

  const updateWayForPay = (patch: Partial<NonNullable<PaymentConfigDto['wayforpay']>>) => {
    onChange({
      ...config,
      wayforpay: {
        mode: config.wayforpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        liveMerchantAccount: config.wayforpay?.liveMerchantAccount,
        liveMerchantDomainName: config.wayforpay?.liveMerchantDomainName,
        testMerchantAccount: config.wayforpay?.testMerchantAccount,
        testMerchantDomainName: config.wayforpay?.testMerchantDomainName,
        ...patch,
      },
    });
  };

  const updateLemonSqueezy = (
    patch: Partial<NonNullable<PaymentConfigDto['lemonsqueezy']>>,
  ) => {
    onChange({
      ...config,
      lemonsqueezy: {
        mode: config.lemonsqueezy?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        liveStoreId: config.lemonsqueezy?.liveStoreId,
        liveVariantId: config.lemonsqueezy?.liveVariantId,
        liveVariantCurrency: config.lemonsqueezy?.liveVariantCurrency,
        testStoreId: config.lemonsqueezy?.testStoreId,
        testVariantId: config.lemonsqueezy?.testVariantId,
        testVariantCurrency: config.lemonsqueezy?.testVariantCurrency,
        ...patch,
      },
    });
  };

  const updatePaddle = (patch: Partial<NonNullable<PaymentConfigDto['paddle']>>) => {
    onChange({
      ...config,
      paddle: {
        mode: config.paddle?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        ...patch,
      },
    });
  };

  const updateMonoPay = (patch: Partial<NonNullable<PaymentConfigDto['monopay']>>) => {
    onChange({
      ...config,
      monopay: {
        mode: config.monopay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        ...patch,
      },
    });
  };

  const updatePayPal = (patch: Partial<NonNullable<PaymentConfigDto['paypal']>>) => {
    onChange({
      ...config,
      paypal: {
        mode: config.paypal?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE,
        liveClientId: config.paypal?.liveClientId,
        testClientId: config.paypal?.testClientId,
        ...patch,
      },
    });
  };

  const updateSecrets = (patch: Partial<PaymentSecretsDto>) => {
    onSecretsChange({
      ...secretDraft,
      ...patch,
    });
  };

  const updateStripeSecrets = (patch: Partial<NonNullable<PaymentSecretsDto['stripe']>>) => {
    updateSecrets({
      stripe: {
        ...(secretDraft.stripe ?? {}),
        ...patch,
      },
    });
  };

  const updateLiqPaySecrets = (patch: Partial<NonNullable<PaymentSecretsDto['liqpay']>>) => {
    updateSecrets({
      liqpay: {
        ...(secretDraft.liqpay ?? {}),
        ...patch,
      },
    });
  };

  const updateWayForPaySecrets = (
    patch: Partial<NonNullable<PaymentSecretsDto['wayforpay']>>,
  ) => {
    updateSecrets({
      wayforpay: {
        ...(secretDraft.wayforpay ?? {}),
        ...patch,
      },
    });
  };

  const updateLemonSqueezySecrets = (
    patch: Partial<NonNullable<PaymentSecretsDto['lemonsqueezy']>>,
  ) => {
    updateSecrets({
      lemonsqueezy: {
        ...(secretDraft.lemonsqueezy ?? {}),
        ...patch,
      },
    });
  };

  const updatePaddleSecrets = (patch: Partial<NonNullable<PaymentSecretsDto['paddle']>>) => {
    updateSecrets({
      paddle: {
        ...(secretDraft.paddle ?? {}),
        ...patch,
      },
    });
  };

  const updateMonoPaySecrets = (patch: Partial<NonNullable<PaymentSecretsDto['monopay']>>) => {
    updateSecrets({
      monopay: {
        ...(secretDraft.monopay ?? {}),
        ...patch,
      },
    });
  };

  const updatePayPalSecrets = (patch: Partial<NonNullable<PaymentSecretsDto['paypal']>>) => {
    updateSecrets({
      paypal: {
        ...(secretDraft.paypal ?? {}),
        ...patch,
      },
    });
  };

  const providerMeta = PAYMENT_PROVIDER_META[method];

  return (
    <BodyPortal>
      <div className={styles.configModalBackdrop} onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-method-config-title"
          className={styles.configModal}
          onClick={(e) => e.stopPropagation()}
        >
          <header className={styles.configModalHead}>
            <div className={styles.configModalHeading}>
              <div className={styles.configModalEyebrow}>Payment method</div>
              <h3 id="payment-method-config-title" className={styles.configModalTitle}>
                {providerMeta.title} settings
              </h3>
              <p className={styles.configModalSubtitle}>{providerMeta.description}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className={styles.configModalClose}
              aria-label="Close"
              onClick={onClose}
            >
              <X size={18} aria-hidden />
            </Button>
          </header>

          <div className={styles.configModalBody}>
            <ProviderHelp method={method} />

            {method === 'manual_invoice' ? (
              <>
                <div className={styles.manualMethodToolbar}>
                  <p className={styles.hint}>
                    Add one or more offline payment instructions. Students can later be restricted to
                    specific manual methods in the student billing tab.
                  </p>
                  <div className={styles.manualMethodToolbarActions}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addManualMethod('iban_sepa')}
                    >
                      <Plus size={16} aria-hidden />
                      Add IBAN / SEPA
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addManualMethod('swift_wire')}
                    >
                      <Plus size={16} aria-hidden />
                      Add SWIFT
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addManualMethod('card_transfer')}
                    >
                      <Plus size={16} aria-hidden />
                      Add card transfer
                    </Button>
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
                        <div className={styles.manualMethodKindLabel}>
                          {getManualMethodKindLabel(entry)}
                        </div>
                        <div className={styles.manualMethodId}>ID: {entry.id}</div>
                        {!isReady ? (
                          <p className={styles.manualMethodSetupHint}>
                            Missing: {setupIssues.join(', ')}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className={styles.manualMethodRemove}
                        aria-label={`Remove ${entry.label || getManualMethodKindLabel(entry)}`}
                        onClick={() => removeManualMethod(entry.id)}
                      >
                        <Trash2 size={16} aria-hidden />
                      </Button>
                    </div>

                    <div className={styles.manualMethodGrid}>
                      <ConfigField label="Label">
                        <Field
                          className={styles.input}
                          value={entry.label}
                          onChange={(e) => updateManualMethod(entry.id, { label: e.target.value })}
                        />
                      </ConfigField>
                      <ConfigField label="Payment reference hint">
                        <Field
                          className={styles.input}
                          value={entry.paymentReferenceHint}
                          onChange={(e) =>
                            updateManualMethod(entry.id, { paymentReferenceHint: e.target.value })
                          }
                        />
                      </ConfigField>
                      <ConfigField label="Payment purpose">
                        <Field
                          className={styles.input}
                          value={entry.paymentPurpose ?? ''}
                          onChange={(e) =>
                            updateManualMethod(entry.id, {
                              paymentPurpose: e.target.value || null,
                            })
                          }
                        />
                      </ConfigField>
                      <ConfigField label="Tax ID / EDRPOU">
                        <Field
                          className={styles.input}
                          value={entry.recipientTaxId ?? ''}
                          onChange={(e) =>
                            updateManualMethod(entry.id, {
                              recipientTaxId: e.target.value || null,
                            })
                          }
                        />
                      </ConfigField>
                      <ConfigField label="Description" wide>
                        <Field
                          as="textarea"
                          className={styles.textarea}
                          value={entry.description}
                          onChange={(e) =>
                            updateManualMethod(entry.id, { description: e.target.value })
                          }
                        />
                      </ConfigField>
                      <ConfigField label="Important notes (one per line)" wide>
                        <Field
                          as="textarea"
                          className={styles.textarea}
                          value={formatImportantNotes(entry.importantNotes)}
                          onChange={(e) =>
                            updateManualMethod(entry.id, {
                              importantNotes: parseImportantNotes(e.target.value),
                            })
                          }
                        />
                      </ConfigField>
                      <ConfigField label="Receipt hint (UK)">
                        <Field
                          className={styles.input}
                          value={entry.receiptHintUk}
                          onChange={(e) =>
                            updateManualMethod(entry.id, { receiptHintUk: e.target.value })
                          }
                        />
                      </ConfigField>

                      {entry.kind === 'iban_sepa' || entry.kind === 'swift_wire' ? (
                        <>
                          <ConfigField label="Beneficiary name">
                            <Field
                              className={styles.input}
                              value={entry.beneficiaryName}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { beneficiaryName: e.target.value })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Bank name (optional)">
                            <Field
                              className={styles.input}
                              value={entry.bankName ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, {
                                  bankName: e.target.value || null,
                                })
                              }
                            />
                          </ConfigField>
                        </>
                      ) : null}

                      {entry.kind === 'card_transfer' ? (
                        <>
                          <ConfigField label="Cardholder name">
                            <Field
                              className={styles.input}
                              value={entry.beneficiaryName}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { beneficiaryName: e.target.value })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Bank name">
                            <Field
                              className={styles.input}
                              value={entry.bankName}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { bankName: e.target.value })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Card number">
                            <Field
                              className={styles.input}
                              value={entry.cardNumber}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { cardNumber: e.target.value })
                              }
                            />
                          </ConfigField>
                        </>
                      ) : null}

                      {entry.kind === 'iban_sepa' ? (
                        <>
                          <ConfigField label="IBAN">
                            <Field
                              className={styles.input}
                              value={entry.iban}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { iban: e.target.value })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Bank country (optional)">
                            <Field
                              className={styles.input}
                              placeholder="Ukraine, Germany, Poland..."
                              value={entry.bankCountry ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, {
                                  bankCountry: e.target.value || null,
                                })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="BIC / SWIFT (optional)">
                            <Field
                              className={styles.input}
                              value={entry.bic ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { bic: e.target.value || null })
                              }
                            />
                          </ConfigField>
                        </>
                      ) : null}

                      {entry.kind === 'swift_wire' ? (
                        <>
                          <ConfigField label="Account number">
                            <Field
                              className={styles.input}
                              value={entry.accountNumber}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { accountNumber: e.target.value })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="IBAN (optional)">
                            <Field
                              className={styles.input}
                              value={entry.iban ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { iban: e.target.value || null })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="SWIFT / BIC">
                            <Field
                              className={styles.input}
                              value={entry.swiftBic}
                              onChange={(e) =>
                                updateManualMethod(entry.id, { swiftBic: e.target.value })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Bank address (optional)" wide>
                            <Field
                              as="textarea"
                              className={styles.textarea}
                              value={entry.bankAddress ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, {
                                  bankAddress: e.target.value || null,
                                })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Beneficiary address (optional)" wide>
                            <Field
                              as="textarea"
                              className={styles.textarea}
                              value={entry.beneficiaryAddress ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, {
                                  beneficiaryAddress: e.target.value || null,
                                })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Intermediary bank (optional)">
                            <Field
                              className={styles.input}
                              value={entry.intermediaryBankName ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, {
                                  intermediaryBankName: e.target.value || null,
                                })
                              }
                            />
                          </ConfigField>
                          <ConfigField label="Intermediary SWIFT (optional)">
                            <Field
                              className={styles.input}
                              value={entry.intermediarySwiftBic ?? ''}
                              onChange={(e) =>
                                updateManualMethod(entry.id, {
                                  intermediarySwiftBic: e.target.value || null,
                                })
                              }
                            />
                          </ConfigField>
                        </>
                      ) : null}

                      {entry.kind === 'custom' ? (
                        <ConfigField label="Instructions" wide>
                          <Field
                            as="textarea"
                            className={styles.textarea}
                            value={entry.instructionsUk}
                            onChange={(e) =>
                              updateManualMethod(entry.id, { instructionsUk: e.target.value })
                            }
                          />
                        </ConfigField>
                      ) : null}
                    </div>
                  </div>
                  );
                })}
              </>
            ) : null}

            {method === 'stripe' ? (
              <>
                <ProviderModeSwitch
                  value={config.stripe?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updateStripe({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School merchant details</div>
                <div className={styles.providerFieldGrid}>
                  <ConfigField
                    label="Live publishable key"
                    tooltip={providerMeta.fieldHelp['stripe.livePublishableKey']}
                  >
                    <Field
                      className={styles.input}
                      value={config.stripe?.livePublishableKey ?? ''}
                      onChange={(e) => updateStripe({ livePublishableKey: e.target.value || undefined })}
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test publishable key"
                    tooltip={providerMeta.fieldHelp['stripe.testPublishableKey']}
                  >
                    <Field
                      className={styles.input}
                      value={config.stripe?.testPublishableKey ?? ''}
                      onChange={(e) => updateStripe({ testPublishableKey: e.target.value || undefined })}
                    />
                  </ConfigField>
                </div>
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live secret key"
                    tooltip={providerMeta.fieldHelp['stripe.liveSecretKey' as ProviderFieldHelpKey]}
                    value={secretDraft.stripe?.liveSecretKey}
                    status={secretStatuses.stripe.liveSecretKey}
                    onChange={(value) =>
                      updateStripeSecrets({ liveSecretKey: value || undefined })
                    }
                  />
                  <SecretField
                    label="Live webhook secret"
                    tooltip={providerMeta.fieldHelp['stripe.liveWebhookSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.stripe?.liveWebhookSecret}
                    status={secretStatuses.stripe.liveWebhookSecret}
                    onChange={(value) =>
                      updateStripeSecrets({ liveWebhookSecret: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test secret key"
                    tooltip={providerMeta.fieldHelp['stripe.testSecretKey' as ProviderFieldHelpKey]}
                    value={secretDraft.stripe?.testSecretKey}
                    status={secretStatuses.stripe.testSecretKey}
                    onChange={(value) =>
                      updateStripeSecrets({ testSecretKey: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test webhook secret"
                    tooltip={providerMeta.fieldHelp['stripe.testWebhookSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.stripe?.testWebhookSecret}
                    status={secretStatuses.stripe.testWebhookSecret}
                    onChange={(value) =>
                      updateStripeSecrets({ testWebhookSecret: value || undefined })
                    }
                  />
                </div>
              </>
            ) : null}

            {method === 'liqpay' ? (
              <>
                <ProviderModeSwitch
                  value={config.liqpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updateLiqPay({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School merchant details</div>
                <div className={styles.providerFieldGrid}>
                  <ConfigField
                    label="Live public key"
                    tooltip={providerMeta.fieldHelp['liqpay.livePublicKey']}
                  >
                    <Field
                      className={styles.input}
                      value={config.liqpay?.livePublicKey ?? ''}
                      onChange={(e) => updateLiqPay({ livePublicKey: e.target.value || undefined })}
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test public key"
                    tooltip={providerMeta.fieldHelp['liqpay.testPublicKey']}
                  >
                    <Field
                      className={styles.input}
                      value={config.liqpay?.testPublicKey ?? ''}
                      onChange={(e) => updateLiqPay({ testPublicKey: e.target.value || undefined })}
                    />
                  </ConfigField>
                </div>
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live private key"
                    tooltip={providerMeta.fieldHelp['liqpay.livePrivateKey' as ProviderFieldHelpKey]}
                    value={secretDraft.liqpay?.livePrivateKey}
                    status={secretStatuses.liqpay.livePrivateKey}
                    onChange={(value) =>
                      updateLiqPaySecrets({ livePrivateKey: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test private key"
                    tooltip={providerMeta.fieldHelp['liqpay.testPrivateKey' as ProviderFieldHelpKey]}
                    value={secretDraft.liqpay?.testPrivateKey}
                    status={secretStatuses.liqpay.testPrivateKey}
                    onChange={(value) =>
                      updateLiqPaySecrets({ testPrivateKey: value || undefined })
                    }
                  />
                </div>
              </>
            ) : null}

            {method === 'wayforpay' ? (
              <>
                <ProviderModeSwitch
                  value={config.wayforpay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updateWayForPay({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School merchant details</div>
                <div className={styles.providerFieldGrid}>
                  <ConfigField
                    label="Live merchant account"
                    tooltip={providerMeta.fieldHelp['wayforpay.liveMerchantAccount']}
                  >
                    <Field
                      className={styles.input}
                      value={config.wayforpay?.liveMerchantAccount ?? ''}
                      onChange={(e) =>
                        updateWayForPay({ liveMerchantAccount: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Live merchant domain"
                    tooltip={providerMeta.fieldHelp['wayforpay.liveMerchantDomainName']}
                  >
                    <Field
                      className={styles.input}
                      placeholder="soenglish.com"
                      value={config.wayforpay?.liveMerchantDomainName ?? ''}
                      onChange={(e) =>
                        updateWayForPay({ liveMerchantDomainName: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test merchant account"
                    tooltip={providerMeta.fieldHelp['wayforpay.testMerchantAccount']}
                  >
                    <Field
                      className={styles.input}
                      value={config.wayforpay?.testMerchantAccount ?? ''}
                      onChange={(e) =>
                        updateWayForPay({ testMerchantAccount: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test merchant domain"
                    tooltip={providerMeta.fieldHelp['wayforpay.testMerchantDomainName']}
                  >
                    <Field
                      className={styles.input}
                      placeholder="soenglish.local"
                      value={config.wayforpay?.testMerchantDomainName ?? ''}
                      onChange={(e) =>
                        updateWayForPay({ testMerchantDomainName: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                </div>
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live merchant secret"
                    tooltip={providerMeta.fieldHelp['wayforpay.liveSecretKey' as ProviderFieldHelpKey]}
                    value={secretDraft.wayforpay?.liveSecretKey}
                    status={secretStatuses.wayforpay.liveSecretKey}
                    onChange={(value) =>
                      updateWayForPaySecrets({ liveSecretKey: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test merchant secret"
                    tooltip={providerMeta.fieldHelp['wayforpay.testSecretKey' as ProviderFieldHelpKey]}
                    value={secretDraft.wayforpay?.testSecretKey}
                    status={secretStatuses.wayforpay.testSecretKey}
                    onChange={(value) =>
                      updateWayForPaySecrets({ testSecretKey: value || undefined })
                    }
                  />
                </div>
              </>
            ) : null}

            {method === 'lemonsqueezy' ? (
              <>
                <ProviderModeSwitch
                  value={config.lemonsqueezy?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updateLemonSqueezy({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School merchant details</div>
                <div className={styles.providerFieldGrid}>
                  <ConfigField
                    label="Live store ID"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.liveStoreId']}
                  >
                    <Field
                      className={styles.input}
                      value={config.lemonsqueezy?.liveStoreId ?? ''}
                      onChange={(e) =>
                        updateLemonSqueezy({ liveStoreId: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Live variant ID"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.liveVariantId']}
                  >
                    <Field
                      className={styles.input}
                      value={config.lemonsqueezy?.liveVariantId ?? ''}
                      onChange={(e) =>
                        updateLemonSqueezy({ liveVariantId: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Live variant currency"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.liveVariantCurrency']}
                  >
                    <Field
                      as="select"
                      className={styles.input}
                      value={config.lemonsqueezy?.liveVariantCurrency ?? ''}
                      onChange={(e) =>
                        updateLemonSqueezy({
                          liveVariantCurrency: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">Select currency</option>
                      {PAYMENT_CURRENCY_OPTIONS.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </Field>
                  </ConfigField>
                  <ConfigField
                    label="Test store ID"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.testStoreId']}
                  >
                    <Field
                      className={styles.input}
                      value={config.lemonsqueezy?.testStoreId ?? ''}
                      onChange={(e) =>
                        updateLemonSqueezy({ testStoreId: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test variant ID"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.testVariantId']}
                  >
                    <Field
                      className={styles.input}
                      value={config.lemonsqueezy?.testVariantId ?? ''}
                      onChange={(e) =>
                        updateLemonSqueezy({ testVariantId: e.target.value || undefined })
                      }
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test variant currency"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.testVariantCurrency']}
                  >
                    <Field
                      as="select"
                      className={styles.input}
                      value={config.lemonsqueezy?.testVariantCurrency ?? ''}
                      onChange={(e) =>
                        updateLemonSqueezy({
                          testVariantCurrency: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">Select currency</option>
                      {PAYMENT_CURRENCY_OPTIONS.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </Field>
                  </ConfigField>
                </div>
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live API key"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.liveApiKey' as ProviderFieldHelpKey]}
                    value={secretDraft.lemonsqueezy?.liveApiKey}
                    status={secretStatuses.lemonsqueezy.liveApiKey}
                    onChange={(value) =>
                      updateLemonSqueezySecrets({ liveApiKey: value || undefined })
                    }
                  />
                  <SecretField
                    label="Live webhook secret"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.liveWebhookSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.lemonsqueezy?.liveWebhookSecret}
                    status={secretStatuses.lemonsqueezy.liveWebhookSecret}
                    onChange={(value) =>
                      updateLemonSqueezySecrets({ liveWebhookSecret: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test API key"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.testApiKey' as ProviderFieldHelpKey]}
                    value={secretDraft.lemonsqueezy?.testApiKey}
                    status={secretStatuses.lemonsqueezy.testApiKey}
                    onChange={(value) =>
                      updateLemonSqueezySecrets({ testApiKey: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test webhook secret"
                    tooltip={providerMeta.fieldHelp['lemonsqueezy.testWebhookSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.lemonsqueezy?.testWebhookSecret}
                    status={secretStatuses.lemonsqueezy.testWebhookSecret}
                    onChange={(value) =>
                      updateLemonSqueezySecrets({ testWebhookSecret: value || undefined })
                    }
                  />
                </div>
              </>
            ) : null}

            {method === 'paddle' ? (
              <>
                <ProviderModeSwitch
                  value={config.paddle?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updatePaddle({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live API key"
                    tooltip={providerMeta.fieldHelp['paddle.liveApiKey' as ProviderFieldHelpKey]}
                    value={secretDraft.paddle?.liveApiKey}
                    status={secretStatuses.paddle.liveApiKey}
                    onChange={(value) => updatePaddleSecrets({ liveApiKey: value || undefined })}
                  />
                  <SecretField
                    label="Live webhook secret"
                    tooltip={providerMeta.fieldHelp['paddle.liveWebhookSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.paddle?.liveWebhookSecret}
                    status={secretStatuses.paddle.liveWebhookSecret}
                    onChange={(value) =>
                      updatePaddleSecrets({ liveWebhookSecret: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test API key"
                    tooltip={providerMeta.fieldHelp['paddle.testApiKey' as ProviderFieldHelpKey]}
                    value={secretDraft.paddle?.testApiKey}
                    status={secretStatuses.paddle.testApiKey}
                    onChange={(value) => updatePaddleSecrets({ testApiKey: value || undefined })}
                  />
                  <SecretField
                    label="Test webhook secret"
                    tooltip={providerMeta.fieldHelp['paddle.testWebhookSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.paddle?.testWebhookSecret}
                    status={secretStatuses.paddle.testWebhookSecret}
                    onChange={(value) =>
                      updatePaddleSecrets({ testWebhookSecret: value || undefined })
                    }
                  />
                </div>
              </>
            ) : null}

            {method === 'monopay' ? (
              <>
                <ProviderModeSwitch
                  value={config.monopay?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updateMonoPay({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live merchant token"
                    tooltip={providerMeta.fieldHelp['monopay.liveToken' as ProviderFieldHelpKey]}
                    value={secretDraft.monopay?.liveToken}
                    status={secretStatuses.monopay.liveToken}
                    onChange={(value) => updateMonoPaySecrets({ liveToken: value || undefined })}
                  />
                  <SecretField
                    label="Test merchant token"
                    tooltip={providerMeta.fieldHelp['monopay.testToken' as ProviderFieldHelpKey]}
                    value={secretDraft.monopay?.testToken}
                    status={secretStatuses.monopay.testToken}
                    onChange={(value) => updateMonoPaySecrets({ testToken: value || undefined })}
                  />
                </div>
              </>
            ) : null}

            {method === 'paypal' ? (
              <>
                <ProviderModeSwitch
                  value={config.paypal?.mode ?? DEFAULT_PAYMENT_ENVIRONMENT_MODE}
                  onChange={(value) => updatePayPal({ mode: value })}
                  tooltip={providerMeta.fieldHelp.mode}
                />
                <div className={styles.providerSectionTitle}>School merchant details</div>
                <div className={styles.providerFieldGrid}>
                  <ConfigField
                    label="Live client ID"
                    tooltip={providerMeta.fieldHelp['paypal.liveClientId']}
                  >
                    <Field
                      className={styles.input}
                      value={config.paypal?.liveClientId ?? ''}
                      onChange={(e) => updatePayPal({ liveClientId: e.target.value || undefined })}
                    />
                  </ConfigField>
                  <ConfigField
                    label="Test client ID"
                    tooltip={providerMeta.fieldHelp['paypal.testClientId']}
                  >
                    <Field
                      className={styles.input}
                      value={config.paypal?.testClientId ?? ''}
                      onChange={(e) => updatePayPal({ testClientId: e.target.value || undefined })}
                    />
                  </ConfigField>
                </div>
                <div className={styles.providerSectionTitle}>School secure secrets</div>
                <div className={styles.providerFieldGrid}>
                  <SecretField
                    label="Live client secret"
                    tooltip={providerMeta.fieldHelp['paypal.liveClientSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.paypal?.liveClientSecret}
                    status={secretStatuses.paypal.liveClientSecret}
                    onChange={(value) =>
                      updatePayPalSecrets({ liveClientSecret: value || undefined })
                    }
                  />
                  <SecretField
                    label="Live webhook ID"
                    tooltip={providerMeta.fieldHelp['paypal.liveWebhookId' as ProviderFieldHelpKey]}
                    value={secretDraft.paypal?.liveWebhookId}
                    status={secretStatuses.paypal.liveWebhookId}
                    onChange={(value) =>
                      updatePayPalSecrets({ liveWebhookId: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test client secret"
                    tooltip={providerMeta.fieldHelp['paypal.testClientSecret' as ProviderFieldHelpKey]}
                    value={secretDraft.paypal?.testClientSecret}
                    status={secretStatuses.paypal.testClientSecret}
                    onChange={(value) =>
                      updatePayPalSecrets({ testClientSecret: value || undefined })
                    }
                  />
                  <SecretField
                    label="Test webhook ID"
                    tooltip={providerMeta.fieldHelp['paypal.testWebhookId' as ProviderFieldHelpKey]}
                    value={secretDraft.paypal?.testWebhookId}
                    status={secretStatuses.paypal.testWebhookId}
                    onChange={(value) =>
                      updatePayPalSecrets({ testWebhookId: value || undefined })
                    }
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className={styles.configModalActions}>
            {method === 'manual_invoice' ? (
              <Button
                type="button"
                loading={saving}
                loadingLabel="Saving…"
                disabled={saving}
                onClick={() => void onSave?.()}
              >
                Save
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}
