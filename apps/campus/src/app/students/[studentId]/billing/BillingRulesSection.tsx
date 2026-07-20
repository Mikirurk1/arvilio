'use client';

import type {
  ManualInvoiceMethodDto,
  PaymentMethodKindDto,
  StudentBillingModeDto,
  StudentManualInvoiceSelectionDto,
} from '@pkg/types';
import { STUDENT_BILLING_MODE_OPTIONS } from '@pkg/types';
import { Badge, Button, Field } from '../../../../components/ui';
import { CreditCard, Settings2, WalletCards } from 'lucide-react';
import { BillingSectionHeader, BillingRuleCard } from './BillingSharedComponents';
import { MANUAL_METHOD_KIND_LABELS, PAYMENT_METHOD_LABELS, getManualMethodSummary, isManualMethodReadyForStudent } from './billing-tab-utils';
import styles from '../page.module.scss';

type PendingAction = 'billingRules' | 'pricing' | 'manualCredit' | null;
type FeedbackState = { action: string; kind: 'success' | 'error'; text: string } | null;

interface BillingRulesSectionProps {
  billingMode: StudentBillingModeDto;
  enabledMethods: PaymentMethodKindDto[];
  selectedPaymentMethodIds: PaymentMethodKindDto[];
  platformManualInvoiceMethods: ManualInvoiceMethodDto[];
  manualInvoiceEnabledForStudent: boolean;
  selectedManualMethodIds: string[];
  selectedManualMethodCount: number;
  manualMethodsForSelection: ManualInvoiceMethodDto[];
  shouldShowRecommendedManualTemplate: boolean;
  manualInvoiceDefaultLabel: string | null;
  manualInvoiceSelection: StudentManualInvoiceSelectionDto;
  pendingAction: PendingAction;
  isBusy: boolean;
  feedback: FeedbackState;
  setBillingMode: (mode: StudentBillingModeDto) => void;
  togglePaymentMethod: (method: PaymentMethodKindDto, checked: boolean) => void;
  toggleManualMethod: (methodId: string, checked: boolean) => void;
  setRecommendedManualMethod: (methodId: string | null) => void;
  onSaveBillingRules: () => void;
}

export function BillingRulesSection({
  billingMode, enabledMethods, selectedPaymentMethodIds, platformManualInvoiceMethods,
  manualInvoiceEnabledForStudent, selectedManualMethodIds, selectedManualMethodCount,
  manualMethodsForSelection, shouldShowRecommendedManualTemplate, manualInvoiceDefaultLabel,
  manualInvoiceSelection, pendingAction, isBusy, feedback,
  setBillingMode, togglePaymentMethod, toggleManualMethod, setRecommendedManualMethod, onSaveBillingRules,
}: BillingRulesSectionProps) {
  return (
    <section className={styles.billingSectionCard}>
      <BillingSectionHeader
        icon={<Settings2 size={18} aria-hidden />}
        eyebrow="Core setup"
        title="Billing rules"
        description="This section controls how the student is billed, which payment methods are visible, and which manual invoice templates can be used."
        aside={
          <Button type="button" loading={pendingAction === 'billingRules'} loadingLabel="Saving…" disabled={isBusy} onClick={onSaveBillingRules}>
            Save billing rules
          </Button>
        }
      />
      {feedback?.action === 'billingRules' ? (
        <p className={feedback.kind === 'success' ? styles.billingActionSuccess : styles.billingActionError}>
          {feedback.text}
        </p>
      ) : null}
      <div className={styles.billingRuleStack}>
        <BillingRuleCard
          icon={<WalletCards size={18} aria-hidden />}
          title="How the student is billed"
          description="Pick the main charging model first. This controls whether self-serve packages and per-lesson pricing are visible."
        >
          <div className={styles.billingModeGrid}>
            {STUDENT_BILLING_MODE_OPTIONS.map((opt) => (
              <label key={opt.value} className={`${styles.billingModeCard} ${billingMode === opt.value ? styles.billingModeCardActive : ''}`}>
                <input type="radio" name="student-billing-mode" checked={billingMode === opt.value} onChange={() => setBillingMode(opt.value)} />
                <span className={styles.billingModeTitle}>{opt.label}</span>
                <span className={styles.billingModeDesc}>{opt.description}</span>
              </label>
            ))}
          </div>
        </BillingRuleCard>
        <BillingRuleCard
          icon={<CreditCard size={18} aria-hidden />}
          title="Allowed payment methods"
          description="Choose one or many top-level payment methods for this student, or leave the restriction off to use everything enabled platform-wide."
          badge={<Badge variant="neutral" size="sm">{enabledMethods.length} enabled platform-wide</Badge>}
        >
          {enabledMethods.length === 0 ? (
            <p className={styles.colorFieldHint}>No payment methods are enabled yet in System → Payments.</p>
          ) : (
            <>
              <p className={styles.billingHelperText}>
                Choose one or several payment methods for this student. If all methods stay selected, the student keeps access to every platform-enabled payment method.
              </p>
              <div className={styles.paymentMethodStudentGrid}>
                {enabledMethods.map((method) => {
                  const isAllowed = selectedPaymentMethodIds.includes(method);
                  return (
                    <div
                      key={method}
                      className={`${styles.paymentMethodStudentCard} ${isAllowed ? styles.paymentMethodStudentCardActive : ''}`}
                    >
                      <Field
                        as="checkbox"
                        checked={isAllowed}
                        onChange={(e) => togglePaymentMethod(method, e.target.checked)}
                        label={PAYMENT_METHOD_LABELS[method]}
                        hint={
                          method === 'manual_invoice'
                            ? 'Offline bank transfer instructions configured in System → Payments.'
                            : 'Available for this student at checkout when enabled.'
                        }
                      />
                      {method === 'manual_invoice' && isAllowed ? (
                        <div className={styles.paymentMethodStudentExtra}>
                          <div className={styles.paymentMethodStudentBadges}>
                            <Badge variant="neutral" size="sm">
                              {platformManualInvoiceMethods.length === 0
                                ? 'No templates configured'
                                : selectedManualMethodCount === platformManualInvoiceMethods.length
                                  ? `All ${platformManualInvoiceMethods.length} templates available`
                                  : `${selectedManualMethodCount} of ${platformManualInvoiceMethods.length} templates selected`}
                            </Badge>
                            {shouldShowRecommendedManualTemplate && manualInvoiceDefaultLabel ? (
                              <Badge variant="blue" size="sm">Default: {manualInvoiceDefaultLabel}</Badge>
                            ) : null}
                          </div>
                          <div className={styles.paymentMethodStudentHint}>
                            Choose one or several concrete invoice templates right here.
                          </div>
                          {platformManualInvoiceMethods.length === 0 ? (
                            <div className={styles.manualInvoiceInlineEmpty}>
                              No manual invoice templates are created yet in System → Payments.
                            </div>
                          ) : (
                            <div className={styles.manualInvoiceInlinePanel}>
                              <p className={styles.billingHelperText}>
                                Choose one or several templates for this student. Only fully filled templates are shown to the student on the payment page.
                              </p>
                              <div className={styles.manualInvoiceInlineGrid}>
                                {platformManualInvoiceMethods.map((manualMethod) => {
                                  const manualIsAllowed = selectedManualMethodIds.includes(manualMethod.id);
                                  const isRecommended = manualInvoiceSelection.defaultMethodId === manualMethod.id;
                                  const isReady = isManualMethodReadyForStudent(manualMethod);
                                  return (
                                    <div
                                      key={manualMethod.id}
                                      className={`${styles.manualInvoiceInlineCard} ${manualIsAllowed ? styles.manualInvoiceInlineCardActive : ''}`}
                                    >
                                      <Field
                                        as="checkbox"
                                        checked={manualIsAllowed}
                                        onChange={(e) => toggleManualMethod(manualMethod.id, e.target.checked)}
                                        label={
                                          <span className={styles.manualInvoiceInlineMeta}>
                                            <span className={styles.manualInvoiceInlineTitleRow}>
                                              <span className={styles.manualInvoiceInlineTitle}>{manualMethod.label}</span>
                                              <span className={styles.manualInvoiceInlineBadges}>
                                                <Badge variant="neutral" size="sm">{MANUAL_METHOD_KIND_LABELS[manualMethod.kind]}</Badge>
                                                {!isReady ? <Badge variant="neutral" size="sm">Incomplete</Badge> : null}
                                                {isRecommended ? <Badge variant="blue" size="sm">Recommended</Badge> : null}
                                              </span>
                                            </span>
                                            <span className={styles.manualInvoiceInlineSummary}>{getManualMethodSummary(manualMethod)}</span>
                                          </span>
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              {shouldShowRecommendedManualTemplate ? (
                                <div className={styles.manualInvoiceInlineFooter}>
                                  <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Recommended template</label>
                                    <Field as="select" className={styles.input} value={manualInvoiceSelection.defaultMethodId ?? ''} onChange={(e) => setRecommendedManualMethod(e.target.value || null)}>
                                      <option value="">No recommended template</option>
                                      {manualMethodsForSelection.map((manualMethod) => (
                                        <option key={manualMethod.id} value={manualMethod.id}>{manualMethod.label}</option>
                                      ))}
                                    </Field>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </BillingRuleCard>
      </div>
    </section>
  );
}
