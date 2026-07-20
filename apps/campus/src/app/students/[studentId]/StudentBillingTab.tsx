'use client';

import { useEffect, useState } from 'react';
import type {
  StudentBillingModeDto,
  StudentLessonBalanceDto,
  StudentManualInvoiceSelectionDto,
  StudentPackageOverrideDto,
  StudentPaymentMethodSelectionDto,
  PaymentMethodKindDto,
} from '@pkg/types';
import { STUDENT_BILLING_MODE_OPTIONS } from '@pkg/types';
import { useBillingStore } from '../../../stores/billing-store';
import { LessonBalanceLedgerActivity } from '../../../components/billing/LessonBalanceLedgerActivity';
import { SurfaceCard } from '../../../components/ui';
import { useSchoolGroupLessons } from '../../../hooks/use-school-group-lessons';
import { splitStudentBillingTracks, groupBillingModeShortLabel, summarizeGroupMembership } from '../../../lib/billing/student-billing-tracks';
import { BanknoteArrowUp, CreditCard, PackageOpen, WalletCards } from 'lucide-react';
import { getFeaturedPackageId, formatMinor } from './billing/billing-tab-utils';
import { useCampusT } from '../../../lib/cms';
import { BillingRulesSection } from './billing/BillingRulesSection';
import { AdminPackagesSection, StudentPackagesSection } from './billing/BillingPackagesSection';
import { BillingPricingSection, ManualCreditSection } from './billing/BillingPricingSection';
import styles from './page.module.scss';

export function StudentBillingTab({
  studentBackendId,
  canAdjust,
  isAdmin,
  hideStudentPricing = false,
}: {
  studentBackendId: string;
  canAdjust: boolean;
  isAdmin: boolean;
  hideStudentPricing?: boolean;
}) {
  const t = useCampusT();
  type PendingAction = 'billingRules' | 'pricing' | 'manualCredit' | null;
  type FeedbackState = { action: Exclude<PendingAction, null>; kind: 'success' | 'error'; text: string } | null;

  const fetchStudentBalance = useBillingStore((s) => s.fetchStudentBalance);
  const adjustStudentBalance = useBillingStore((s) => s.adjustStudentBalance);
  const updateStudentLessonPricing = useBillingStore((s) => s.updateStudentLessonPricing);
  const updateStudentLessonBilling = useBillingStore((s) => s.updateStudentLessonBilling);
  const [balance, setBalance] = useState<StudentLessonBalanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonsToAdd, setLessonsToAdd] = useState('1');
  const [note, setNote] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [priceOverride, setPriceOverride] = useState('');
  const [groupPriceOverride, setGroupPriceOverride] = useState('');
  const [manualCreditTrack, setManualCreditTrack] = useState<'individual' | 'group'>('individual');
  const [billingMode, setBillingMode] = useState<StudentBillingModeDto>('both');
  const [packageOverrides, setPackageOverrides] = useState<StudentPackageOverrideDto[]>([]);
  const [paymentMethodSelection, setPaymentMethodSelection] = useState<StudentPaymentMethodSelectionDto>({ allowedMethods: [] });
  const [manualInvoiceSelection, setManualInvoiceSelection] = useState<StudentManualInvoiceSelectionDto>({ allowedMethodIds: [], defaultMethodId: null });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentBalance(studentBackendId);
      setBalance(data);
      setPriceOverride(data.pricePerLessonMinor != null ? String(data.pricePerLessonMinor) : '');
      setGroupPriceOverride(data.groupPricePerLessonMinor != null ? String(data.groupPricePerLessonMinor) : '');
      setBillingMode(data.billingMode);
      setPackageOverrides(data.packageOverrides);
      setPaymentMethodSelection(data.paymentMethodSelection);
      setManualInvoiceSelection(data.manualInvoiceSelection);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('students.detail.billing.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [studentBackendId]);

  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const enabledMethods = balance?.enabledPaymentMethods ?? [];
  const isBusy = pendingAction !== null;
  const billingTracks = balance && groupLessonsEnabled
    ? splitStudentBillingTracks(balance, balance.lessonFormat ?? 'mixed')
    : null;

  const updatePackageOverride = (packageId: string, patch: Partial<StudentPackageOverrideDto>) => {
    setPackageOverrides((rows) => rows.map((row) => (row.packageId === packageId ? { ...row, ...patch } : row)));
  };

  const toggleManualMethod = (methodId: string, checked: boolean) => {
    setManualInvoiceSelection((current) => {
      const effectiveIds = current.allowedMethodIds.length > 0 ? current.allowedMethodIds : platformManualInvoiceMethods.map((m) => m.id);
      if (!checked && effectiveIds.length === 1 && effectiveIds[0] === methodId) return current;
      const allowedMethodIds = checked ? [...new Set([...effectiveIds, methodId])] : effectiveIds.filter((id) => id !== methodId);
      return { allowedMethodIds, defaultMethodId: !checked && current.defaultMethodId === methodId ? null : current.defaultMethodId };
    });
  };

  const setRecommendedManualMethod = (methodId: string | null) => {
    setManualInvoiceSelection((current) => ({ ...current, defaultMethodId: methodId }));
  };

  const togglePaymentMethod = (method: PaymentMethodKindDto, checked: boolean) => {
    setPaymentMethodSelection((current) => {
      const effectiveMethods = current.allowedMethods.length > 0 ? current.allowedMethods : enabledMethods;
      if (!checked && effectiveMethods.length === 1 && effectiveMethods[0] === method) return current;
      const allowedMethods = checked ? [...new Set([...effectiveMethods, method])] : effectiveMethods.filter((v) => v !== method);
      return { allowedMethods };
    });
  };

  const onSaveBillingRules = async () => {
    if (!isAdmin) return;
    if (manualInvoiceEnabledForStudent && platformManualInvoiceMethods.length > 0 && selectedManualMethodIds.length === 0) {
      setFeedback({ action: 'billingRules', kind: 'error', text: t('students.detail.billing.selectManualTemplate') });
      return;
    }
    setPendingAction('billingRules');
    setError(null);
    setFeedback(null);
    try {
      const data = await updateStudentLessonBilling({
        studentId: studentBackendId,
        billingMode,
        packageOverrides,
        paymentMethodSelection: {
          allowedMethods: selectedPaymentMethodIds.length === enabledMethods.length ? [] : selectedPaymentMethodIds,
          restrictToAllowlistOnly: selectedPaymentMethodIds.length > 0 && selectedPaymentMethodIds.length < enabledMethods.length,
        },
        manualInvoiceSelection: { allowedMethodIds: manualInvoiceSelection.allowedMethodIds, defaultMethodId: manualInvoiceSelection.defaultMethodId },
      });
      setBalance(data);
      setBillingMode(data.billingMode);
      setPackageOverrides(data.packageOverrides);
      setPaymentMethodSelection(data.paymentMethodSelection);
      setManualInvoiceSelection(data.manualInvoiceSelection);
      setFeedback({ action: 'billingRules', kind: 'success', text: t('students.detail.billing.rulesSaved') });
    } catch (err) {
      setFeedback({
        action: 'billingRules',
        kind: 'error',
        text: err instanceof Error ? err.message : t('students.detail.billing.rulesSaveFailed'),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const onSavePricing = async () => {
    if (!isAdmin) return;
    setPendingAction('pricing');
    setError(null);
    setFeedback(null);
    try {
      const trimmed = priceOverride.trim();
      const pricePerLessonMinor = trimmed === '' ? null : Math.max(0, Number.parseInt(trimmed, 10));
      if (trimmed !== '' && !Number.isFinite(pricePerLessonMinor)) {
        setFeedback({ action: 'pricing', kind: 'error', text: t('students.detail.billing.invalidPrice') });
        return;
      }
      const groupTrimmed = groupPriceOverride.trim();
      const groupPricePerLessonMinor = groupTrimmed === '' ? null : Math.max(0, Number.parseInt(groupTrimmed, 10));
      if (groupTrimmed !== '' && !Number.isFinite(groupPricePerLessonMinor)) {
        setFeedback({ action: 'pricing', kind: 'error', text: t('students.detail.billing.invalidGroupPrice') });
        return;
      }
      const data = await updateStudentLessonPricing({ studentId: studentBackendId, pricePerLessonMinor, groupPricePerLessonMinor: groupLessonsEnabled ? groupPricePerLessonMinor : undefined });
      setBalance(data);
      setPriceOverride(data.pricePerLessonMinor != null ? String(data.pricePerLessonMinor) : '');
      setGroupPriceOverride(data.groupPricePerLessonMinor != null ? String(data.groupPricePerLessonMinor) : '');
      setFeedback({ action: 'pricing', kind: 'success', text: t('students.detail.billing.pricingSaved') });
    } catch (err) {
      setFeedback({
        action: 'pricing',
        kind: 'error',
        text: err instanceof Error ? err.message : t('students.detail.billing.pricingSaveFailed'),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const onAdjust = async () => {
    const lessons = Number.parseInt(lessonsToAdd, 10);
    if (!Number.isFinite(lessons) || lessons <= 0) return;
    setPendingAction('manualCredit');
    setError(null);
    setFeedback(null);
    try {
      const data = await adjustStudentBalance({ studentId: studentBackendId, lessons, note: note.trim() || null, creditTrack: manualCreditTrack });
      setBalance(data);
      setNote('');
      setFeedback({ action: 'manualCredit', kind: 'success', text: t('students.detail.billing.credited') });
    } catch (err) {
      setFeedback({
        action: 'manualCredit',
        kind: 'error',
        text: err instanceof Error ? err.message : t('students.detail.billing.adjustFailed'),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const activeBillingMode = STUDENT_BILLING_MODE_OPTIONS.find((o) => o.value === (balance?.billingMode ?? billingMode)) ?? STUDENT_BILLING_MODE_OPTIONS[2];
  const platformManualInvoiceMethods = balance?.platformManualInvoiceMethods ?? [];
  const selectedPaymentMethodIds = paymentMethodSelection.allowedMethods.length > 0 ? paymentMethodSelection.allowedMethods : enabledMethods;
  const manualInvoiceAllowedByPlatform = enabledMethods.includes('manual_invoice');
  const manualInvoiceEnabledForStudent = manualInvoiceAllowedByPlatform && selectedPaymentMethodIds.includes('manual_invoice');
  const selectedManualMethodIds = manualInvoiceSelection.allowedMethodIds.length > 0 ? manualInvoiceSelection.allowedMethodIds : platformManualInvoiceMethods.map((m) => m.id);
  const manualMethodsForSelection = platformManualInvoiceMethods.filter((m) => selectedManualMethodIds.includes(m.id));
  const shouldShowRecommendedManualTemplate = manualMethodsForSelection.length > 1;
  const manualInvoiceDefaultLabel = shouldShowRecommendedManualTemplate
    ? platformManualInvoiceMethods.find((m) => m.id === manualInvoiceSelection.defaultMethodId)?.label ?? null
    : null;
  const minPackageLessons = balance?.minPackageLessons ?? 1;

  const debtSuffix = (isDebt: boolean) =>
    isDebt ? ` · ${t('students.detail.debt')}` : '';

  if (loading) {
    return <SurfaceCard className={styles.tabCard}><p className={styles.tabIntro}>{t('students.detail.billing.loading')}</p></SurfaceCard>;
  }

  return (
    <SurfaceCard className={styles.tabCard}>
      <div className={styles.billingWorkspaceHero}>
        <div className={styles.billingWorkspaceHeroMain}>
          <div className={styles.billingWorkspaceHeroIcon}><WalletCards size={20} aria-hidden /></div>
          <div>
            <div className={styles.billingWorkspaceEyebrow}>{t('students.detail.billing.eyebrow')}</div>
            <h3 className={styles.billingWorkspaceTitle}>{t('students.detail.billing.workspaceTitle')}</h3>
            <p className={styles.billingWorkspaceText}>
              {t('students.detail.billing.workspaceDesc')}
            </p>
          </div>
        </div>
        <div className={styles.billingWorkspaceTags}>
          <span className={styles.billingWorkspaceTag}>{t('students.detail.billing.tagRules')}</span>
          <span className={styles.billingWorkspaceTag}>{t('students.detail.billing.tagPricing')}</span>
          <span className={styles.billingWorkspaceTag}>{t('students.detail.billing.tagPackages')}</span>
          <span className={styles.billingWorkspaceTag}>{t('students.detail.billing.tagManualCredits')}</span>
        </div>
      </div>
      {error ? <span className={styles.errorHint}>{error}</span> : null}
      {balance ? (
        <>
          {billingTracks && (billingTracks.showIndividual || billingTracks.showGroup) ? (
            <div className={styles.billingTracksGrid}>
              {billingTracks.showIndividual && billingTracks.individual ? (
                <div className={styles.billingTrackCard}>
                  <div className={styles.billingTrackEyebrow}>{t('students.detail.billing.individualLessons')}</div>
                  <div className={styles.billingTrackValue}>
                    {t('students.detail.billing.lessonsCount', { count: billingTracks.individual.balance })}
                    {debtSuffix(billingTracks.individual.isDebt)}
                  </div>
                  <p className={styles.billingTrackHint}>{t('students.detail.billing.individualHint')}</p>
                  <p className={styles.billingTrackMeta}>
                    {t('students.detail.billing.rate')}{' '}
                    {hideStudentPricing
                      ? t('students.detail.billing.rateHidden')
                      : `${formatMinor(billingTracks.individual.resolvedPricePerLessonMinor, billingTracks.individual.defaultCurrency)} ${t('students.detail.billing.perLesson')}`}
                  </p>
                </div>
              ) : null}
              {billingTracks.showGroup && billingTracks.group ? (
                <div className={styles.billingTrackCard}>
                  <div className={styles.billingTrackEyebrow}>{t('students.detail.billing.groupLessons')}</div>
                  <div className={styles.billingTrackValue}>
                    {t('students.detail.billing.groupCredits', { count: billingTracks.group.groupBalance })}
                    {debtSuffix(billingTracks.group.isDebt)}
                  </div>
                  <p className={styles.billingTrackHint}>{t('students.detail.billing.groupHint')}</p>
                  {!hideStudentPricing ? (
                    <p className={styles.billingTrackMeta}>
                      {t('students.detail.billing.rate')}{' '}
                      {formatMinor(billingTracks.group.resolvedGroupPricePerLessonMinor, billingTracks.group.groupCurrency)}{' '}
                      {t('students.detail.billing.perGroupLesson')}
                    </p>
                  ) : null}
                  {billingTracks.group.memberships.length > 0 ? (
                    <ul className={styles.billingTrackList}>
                      {billingTracks.group.memberships.map((membership) => (
                        <li key={membership.groupId}><strong>{membership.name}</strong> · {groupBillingModeShortLabel(membership.groupBillingMode)} · {summarizeGroupMembership(membership)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.billingSummaryGrid}>
            <div className={styles.billingSummaryCard}>
              <div className={styles.billingSummaryIcon}><WalletCards size={18} aria-hidden /></div>
              <div className={styles.billingSummaryLabel}>{t('students.detail.billing.lessonBalance')}</div>
              <div className={styles.billingSummaryValue}>
                {balance.balance}
                {debtSuffix(balance.isDebt)}
              </div>
              <div className={styles.billingSummaryHint}>{t('students.detail.billing.lessonBalanceHint')}</div>
            </div>
            <div className={styles.billingSummaryCard}>
              <div className={styles.billingSummaryIcon}><PackageOpen size={18} aria-hidden /></div>
              <div className={styles.billingSummaryLabel}>{t('students.detail.billing.billingMode')}</div>
              <div className={styles.billingSummaryValue}>{activeBillingMode.label}</div>
              <div className={styles.billingSummaryHint}>{activeBillingMode.description}</div>
            </div>
            {balance.showPerLessonPricing && !hideStudentPricing ? (
              <div className={styles.billingSummaryCard}>
                <div className={styles.billingSummaryIcon}><BanknoteArrowUp size={18} aria-hidden /></div>
                <div className={styles.billingSummaryLabel}>{t('students.detail.billing.pricePerLesson')}</div>
                <div className={styles.billingSummaryValue}>{formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)}</div>
                <div className={styles.billingSummaryHint}>
                  {balance.isCustomPrice
                    ? t('students.detail.billing.customRate')
                    : t('students.detail.billing.platformRate')}
                </div>
              </div>
            ) : null}
            <div className={styles.billingSummaryCard}>
              <div className={styles.billingSummaryIcon}><CreditCard size={18} aria-hidden /></div>
              <div className={styles.billingSummaryLabel}>{t('students.detail.billing.selfServePackages')}</div>
              <div className={styles.billingSummaryValue}>
                {balance.showSelfServePackages
                  ? t('students.detail.billing.packagesActive', { count: balance.packages.length })
                  : t('students.detail.billing.packagesHidden')}
              </div>
              <div className={styles.billingSummaryHint}>
                {t('students.detail.billing.minPackage', { count: balance.minPackageLessons })}
              </div>
            </div>
          </div>

          {isAdmin ? (
            <BillingRulesSection
              billingMode={billingMode}
              enabledMethods={enabledMethods}
              selectedPaymentMethodIds={selectedPaymentMethodIds}
              platformManualInvoiceMethods={platformManualInvoiceMethods}
              manualInvoiceEnabledForStudent={manualInvoiceEnabledForStudent}
              selectedManualMethodIds={selectedManualMethodIds}
              selectedManualMethodCount={selectedManualMethodIds.length}
              manualMethodsForSelection={manualMethodsForSelection}
              shouldShowRecommendedManualTemplate={shouldShowRecommendedManualTemplate}
              manualInvoiceDefaultLabel={manualInvoiceDefaultLabel}
              manualInvoiceSelection={manualInvoiceSelection}
              pendingAction={pendingAction}
              isBusy={isBusy}
              feedback={feedback}
              setBillingMode={setBillingMode}
              togglePaymentMethod={togglePaymentMethod}
              toggleManualMethod={toggleManualMethod}
              setRecommendedManualMethod={setRecommendedManualMethod}
              onSaveBillingRules={() => void onSaveBillingRules()}
            />
          ) : null}

          {isAdmin ? (
            <AdminPackagesSection
              balance={balance}
              packageOverrides={packageOverrides}
              billingMode={billingMode}
              minPackageLessons={minPackageLessons}
              updatePackageOverride={updatePackageOverride}
            />
          ) : null}

          {isAdmin ? (
            <BillingPricingSection
              balance={balance}
              priceOverride={priceOverride}
              groupPriceOverride={groupPriceOverride}
              groupLessonsEnabled={groupLessonsEnabled}
              pendingAction={pendingAction}
              isBusy={isBusy}
              feedback={feedback}
              setPriceOverride={setPriceOverride}
              setGroupPriceOverride={setGroupPriceOverride}
              onSavePricing={() => void onSavePricing()}
            />
          ) : null}

          {!isAdmin ? (
            <StudentPackagesSection balance={balance} hideStudentPricing={hideStudentPricing} />
          ) : null}

          {canAdjust ? (
            <ManualCreditSection
              billingTracks={billingTracks}
              lessonsToAdd={lessonsToAdd}
              note={note}
              manualCreditTrack={manualCreditTrack}
              pendingAction={pendingAction}
              isBusy={isBusy}
              feedback={feedback}
              setLessonsToAdd={setLessonsToAdd}
              setNote={setNote}
              setManualCreditTrack={setManualCreditTrack}
              onAdjust={() => void onAdjust()}
            />
          ) : null}

          {balance.recentLedger.length > 0 ? (
            <section className={styles.billingSectionCard}>
              <LessonBalanceLedgerActivity entries={balance.recentLedger} />
            </section>
          ) : null}
        </>
      ) : null}
    </SurfaceCard>
  );
}
