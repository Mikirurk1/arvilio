'use client';

import type { StudentLessonBalanceDto } from '@pkg/types';
import { Button, Field } from '../../../../components/ui';
import { BanknoteArrowUp, FileText } from 'lucide-react';
import { BillingSectionHeader } from './BillingSharedComponents';
import { formatMinor } from './billing-tab-utils';
import styles from '../page.module.scss';

type PendingAction = 'billingRules' | 'pricing' | 'manualCredit' | null;
type FeedbackState = { action: string; kind: 'success' | 'error'; text: string } | null;

// ─── Per-lesson pricing override ─────────────────────────────────────────────

interface BillingPricingSectionProps {
  balance: StudentLessonBalanceDto;
  priceOverride: string;
  groupPriceOverride: string;
  groupLessonsEnabled: boolean;
  pendingAction: PendingAction;
  isBusy: boolean;
  feedback: FeedbackState;
  setPriceOverride: (v: string) => void;
  setGroupPriceOverride: (v: string) => void;
  onSavePricing: () => void;
}

export function BillingPricingSection({
  balance, priceOverride, groupPriceOverride, groupLessonsEnabled,
  pendingAction, isBusy, feedback, setPriceOverride, setGroupPriceOverride, onSavePricing,
}: BillingPricingSectionProps) {
  if (!balance.showPerLessonPricing) return null;

  return (
    <section className={styles.billingSectionCard}>
      <BillingSectionHeader
        icon={<BanknoteArrowUp size={18} aria-hidden />}
        eyebrow="Lesson rate"
        title="Per-lesson pricing"
        description={`Leave empty to use the platform default of ${formatMinor(balance.defaultPricePerLessonMinor, balance.defaultCurrency)}.`}
        aside={
          <Button type="button" loading={pendingAction === 'pricing'} loadingLabel="Saving…" disabled={isBusy} onClick={onSavePricing}>
            Save pricing
          </Button>
        }
      />
      {feedback?.action === 'pricing' ? (
        <p className={feedback.kind === 'success' ? styles.billingActionSuccess : styles.billingActionError}>
          {feedback.text}
        </p>
      ) : null}
      <div className={styles.billingNoticeCard}>
        <div className={styles.billingNoticeTitle}>Current resolved lesson price</div>
        <div className={styles.billingNoticeText}>
          {formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)} ·{' '}
          {balance.isCustomPrice ? 'Custom student rate' : 'Using platform default'}
        </div>
      </div>
      <div className={styles.billingSelectRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Individual price override</label>
          <Field type="number" className={styles.input} min={0} placeholder={String(balance.defaultPricePerLessonMinor)} value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} />
        </div>
        {groupLessonsEnabled ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Group per-member price override</label>
            <Field type="number" className={styles.input} min={0} placeholder={String(balance.defaultGroupPricePerLessonMinor)} value={groupPriceOverride} onChange={(e) => setGroupPriceOverride(e.target.value)} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Manual credit section ────────────────────────────────────────────────────

interface ManualCreditSectionProps {
  billingTracks: { showIndividual: boolean; showGroup: boolean } | null;
  lessonsToAdd: string;
  note: string;
  manualCreditTrack: 'individual' | 'group';
  pendingAction: PendingAction;
  isBusy: boolean;
  feedback: FeedbackState;
  setLessonsToAdd: (v: string) => void;
  setNote: (v: string) => void;
  setManualCreditTrack: (v: 'individual' | 'group') => void;
  onAdjust: () => void;
}

export function ManualCreditSection({
  billingTracks, lessonsToAdd, note, manualCreditTrack,
  pendingAction, isBusy, feedback,
  setLessonsToAdd, setNote, setManualCreditTrack, onAdjust,
}: ManualCreditSectionProps) {
  return (
    <section className={styles.billingSectionCard}>
      <BillingSectionHeader
        icon={<FileText size={18} aria-hidden />}
        eyebrow="After payment arrives"
        title="Manual credit after invoice payment"
        description="Use this only after an offline invoice has already been paid and you need to add lessons manually."
        aside={
          <Button type="button" loading={pendingAction === 'manualCredit'} loadingLabel="Crediting…" disabled={isBusy} onClick={onAdjust}>
            Credit lessons
          </Button>
        }
      />
      {feedback?.action === 'manualCredit' ? (
        <p className={feedback.kind === 'success' ? styles.billingActionSuccess : styles.billingActionError}>
          {feedback.text}
        </p>
      ) : null}
      <div className={styles.billingNoticeCard}>
        <div className={styles.billingNoticeTitle}>Best used for manual invoice payments</div>
        <div className={styles.billingNoticeText}>
          Add the paid lesson amount and leave a note like invoice number, bank reference, or payment date for future staff context.
        </div>
      </div>
      <div className={styles.formGrid}>
        {billingTracks?.showIndividual && billingTracks.showGroup ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Credit balance</label>
            <Field as="select" className={styles.input} value={manualCreditTrack} onChange={(e) => setManualCreditTrack(e.target.value === 'group' ? 'group' : 'individual')}>
              <option value="individual">Individual lesson credits</option>
              <option value="group">Group lesson credits</option>
            </Field>
          </div>
        ) : null}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Paid lessons</label>
          <Field type="number" className={styles.input} min={1} value={lessonsToAdd} onChange={(e) => setLessonsToAdd(e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Note</label>
          <Field className={styles.input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Invoice #123" />
        </div>
      </div>
    </section>
  );
}
