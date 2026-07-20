'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Info, Lock } from 'lucide-react';
import { LessonBalanceLedgerActivity } from '../../components/billing/LessonBalanceLedgerActivity';
import {
  buildOrderSummary,
  filterCheckoutMethodsForPackage,
  formatCheckoutAmount,
  getUnavailableCheckoutMethods,
  getUnavailableCheckoutReason,
  groupPackagesByCurrency,
} from '../../lib/billing/checkout-display';
import { Badge, Button, EmptyStateCard, PageHeader, StatTile, SurfaceCard } from '../../components/ui';
import { useBillingStore } from '../../stores/billing-store';
import { showsGroupTrack, showsIndividualTrack } from '../../lib/student-lesson-format';
import type { PaymentMethodKindDto } from '@pkg/types';
import {
  CHECKOUT_METHODS,
  PAYMENT_METHOD_STUDENT_META,
} from './payment-page-meta';
import { ManualInvoiceMethodDetails, PaymentMethodIcon, SectionIntro } from './payment-ui';
import { getFeaturedPackageId, PackageCard, PackageOfferPanel } from './PackageSelector';
import styles from './page.module.scss';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const fetchMyBalance = useBillingStore((s) => s.fetchMyBalance);
  const createCheckout = useBillingStore((s) => s.createCheckout);
  const slice = useBillingStore((s) => s.myBalance);
  const [checkoutLoading, setCheckoutLoading] = useState<PaymentMethodKindDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const statusParam = searchParams.get('status');

  useEffect(() => {
    void fetchMyBalance(true);
  }, [fetchMyBalance]);

  const data = slice.data;
  const loading = slice.status === 'loading' || slice.status === 'idle';
  const balance = data?.balance ?? 0;
  const groupBalance = data?.groupBalance ?? 0;
  const lessonFormat = data?.lessonFormat ?? 'individual_only';
  const showIndividualBalance = showsIndividualTrack(lessonFormat);
  const showGroupBalance = showsGroupTrack(lessonFormat);
  const packages = data?.packages ?? [];
  const featuredPackageId = getFeaturedPackageId(packages);
  const manualMethods = data?.manualInvoiceMethods ?? [];

  const onlineMethods = useMemo(
    () => (data?.availableMethods ?? []).filter((m) => CHECKOUT_METHODS.includes(m)),
    [data?.availableMethods],
  );
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? null;
  const compatibleOnlineMethods = useMemo(() => {
    if (!selectedPackage) return [];
    return filterCheckoutMethodsForPackage(
      onlineMethods,
      selectedPackage.currency,
      data?.lemonSqueezyVariantCurrency,
    );
  }, [onlineMethods, selectedPackage, data?.lemonSqueezyVariantCurrency]);
  const unavailableOnlineMethods = useMemo(() => {
    if (!selectedPackage) return [];
    return getUnavailableCheckoutMethods(
      onlineMethods,
      selectedPackage.currency,
      data?.lemonSqueezyVariantCurrency,
    );
  }, [onlineMethods, selectedPackage, data?.lemonSqueezyVariantCurrency]);
  const orderSummary = selectedPackage ? buildOrderSummary(selectedPackage) : null;
  const packageGroups = useMemo(() => groupPackagesByCurrency(packages), [packages]);
  const hasManualInvoice = (data?.availableMethods ?? []).includes('manual_invoice');
  const showOnlineCheckout = Boolean(data?.showSelfServePackages && packages.length > 0);
  const isSinglePackage = packages.length === 1;

  useEffect(() => {
    if (packages.length === 0) {
      setSelectedPackageId(null);
      return;
    }
    setSelectedPackageId((current) => {
      if (current && packages.some((pkg) => pkg.id === current)) return current;
      return featuredPackageId ?? packages[0]?.id ?? null;
    });
  }, [packages, featuredPackageId]);

  const primaryBalance = showIndividualBalance ? balance : groupBalance;
  const balanceTone =
    primaryBalance < 0 || primaryBalance <= 0
      ? 'danger'
      : primaryBalance === 1
        ? 'warning'
        : 'ok';

  const balanceMessage =
    primaryBalance < 0
      ? 'You have a lesson debt. Top up your balance to book new lessons.'
      : primaryBalance <= 0
        ? 'No prepaid lessons left. Choose a package below or pay by bank transfer.'
        : primaryBalance === 1
          ? 'One lesson left on your balance — consider topping up soon.'
          : 'Lessons remaining on your prepaid balance.';

  const startCheckout = async (method: PaymentMethodKindDto) => {
    if (!selectedPackage) return;
    setCheckoutLoading(method);
    setError(null);
    try {
      const url = await createCheckout({ method, packageId: selectedPackage.id });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setCheckoutLoading(null);
    }
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="Payment"
        subtitle="Choose a package, pay securely online, or transfer to your school’s bank account."
      />

      <div className={styles.stack}>
      {statusParam === 'success' ? (
        <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
          Thank you — your payment is being processed. Lessons will appear on your balance shortly.
        </div>
      ) : null}
      {statusParam === 'cancelled' ? (
        <div className={`${styles.alert} ${styles.alertNeutral}`} role="status">
          Payment was cancelled. You can choose a package and try again.
        </div>
      ) : null}
      {error ? (
        <div className={`${styles.alert} ${styles.alertError}`} role="alert">
          {error}
        </div>
      ) : null}

      <SurfaceCard className={`${styles.balanceCard} ${styles[`balanceCard_${balanceTone}`]}`}>
        <div className={styles.balanceCardInner}>
          <div className={styles.balanceCopy}>
            <p className={styles.balanceLabel}>Your balance</p>
            <p className={styles.balanceMessage}>{loading ? 'Loading…' : balanceMessage}</p>
          </div>
          <div className={styles.balanceStats}>
            {showIndividualBalance ? (
              <StatTile
                className={styles.balanceStat}
                label="Individual lessons"
                value={loading ? '…' : balance}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
            {showGroupBalance ? (
              <StatTile
                className={styles.balanceStat}
                label="Group lessons"
                value={loading ? '…' : groupBalance}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
            {data?.showPerLessonPricing && showIndividualBalance ? (
              <StatTile
                className={styles.balanceStat}
                label="Individual rate"
                value={formatCheckoutAmount(data.resolvedPricePerLessonMinor, data.defaultCurrency)}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
            {showGroupBalance ? (
              <StatTile
                className={styles.balanceStat}
                label="Group rate"
                value={formatCheckoutAmount(
                  data?.resolvedGroupPricePerLessonMinor ?? 0,
                  data?.groupCurrency ?? data?.defaultCurrency ?? 'UAH',
                )}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
          </div>
        </div>
      </SurfaceCard>

      {loading ? (
        <SurfaceCard className={styles.loadingCard} aria-busy="true">
          <p className={styles.loadingText}>Loading payment options…</p>
        </SurfaceCard>
      ) : null}

      {!loading && data && showOnlineCheckout ? (
        <section className={styles.checkoutSection} aria-labelledby="payment-packages-heading">
          <SectionIntro
            headingId="payment-packages-heading"
            title={isSinglePackage ? 'Your lesson package' : 'Lesson packages'}
            description={
              isSinglePackage
                ? 'Confirm the package below, then complete checkout on the right.'
                : 'Select how many lessons to add. Your total updates in the summary.'
            }
          />

          <div className={styles.checkoutLayout}>
            <div className={styles.checkoutMain}>
              {isSinglePackage && packages[0] ? (
                <PackageOfferPanel pkg={packages[0]} />
              ) : (
                <div className={styles.packageGrid}>
                  {packageGroups.map((group) => (
                    <div key={group.currency} className={styles.packageCurrencyGroup}>
                      {packageGroups.length > 1 ? (
                        <h3 className={styles.packageCurrencyHeading}>Pay in {group.currency}</h3>
                      ) : null}
                      <div className={styles.packageGridInner}>
                        {group.packages.map((pkg) => (
                          <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            featuredPackageId={featuredPackageId}
                            selected={selectedPackageId === pkg.id}
                            onSelect={() => setSelectedPackageId(pkg.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPackage && compatibleOnlineMethods.length === 0 && onlineMethods.length > 0 ? (
                <div className={styles.infoCallout}>
                  <Info size={18} aria-hidden />
                  <p>
                    No online provider supports checkout in {selectedPackage.currency} for this package.
                    Use bank transfer below or contact your school.
                  </p>
                </div>
              ) : null}

              {selectedPackage && onlineMethods.length === 0 ? (
                <div className={styles.infoCallout}>
                  <Info size={18} aria-hidden />
                  <p>
                    Online checkout is not enabled for your account. Use bank transfer below or contact
                    your school.
                  </p>
                </div>
              ) : null}
            </div>

            <aside className={styles.checkoutAside} aria-label="Checkout summary">
              <SurfaceCard className={styles.checkoutSticky}>
                {selectedPackage && orderSummary ? (
                  <>
                    <p className={styles.orderSummaryEyebrow}>Order summary</p>
                    <h3 className={styles.orderSummaryTitle}>{orderSummary.label}</h3>
                    <p className={styles.orderSummaryAmount}>{orderSummary.amountLabel}</p>
                    <ul className={styles.orderSummaryMeta}>
                      <li>
                        {orderSummary.lessons} lessons · {orderSummary.currency}
                      </li>
                      <li>After payment: {orderSummary.balanceAfterLabel}</li>
                    </ul>
                  </>
                ) : (
                  <p className={styles.checkoutPlaceholder}>Select a package to see your total.</p>
                )}

                {selectedPackage && compatibleOnlineMethods.length > 0 ? (
                  <div className={styles.payMethodGrid}>
                    <p className={styles.payMethodHeading}>Pay online</p>
                    {compatibleOnlineMethods.map((method) => {
                      const meta = PAYMENT_METHOD_STUDENT_META[method];
                      const busy = checkoutLoading === method;
                      return (
                        <Button
                          key={method}
                          type="button"
                          variant="primary"
                          className={styles.payMethodBtn}
                          loading={busy}
                          loadingLabel="Redirecting…"
                          disabled={checkoutLoading !== null || selectedPackage.amountMinor <= 0}
                          startIcon={<PaymentMethodIcon method={method} />}
                          endIcon={busy ? undefined : <ChevronRight size={16} aria-hidden />}
                          onClick={() => void startCheckout(method)}
                        >
                          {meta.shortTitle}
                        </Button>
                      );
                    })}
                    {unavailableOnlineMethods.length > 0 ? (
                      <div className={styles.unavailableMethods}>
                        {unavailableOnlineMethods.map((method) => (
                          <p key={method}>
                            {getUnavailableCheckoutReason(method, selectedPackage.currency)}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <p className={styles.checkoutTrust}>
                  <Lock size={14} aria-hidden />
                  Secure checkout via your school&apos;s payment provider
                </p>
              </SurfaceCard>
            </aside>
          </div>
        </section>
      ) : null}

      {!loading && data && !showOnlineCheckout && !hasManualInvoice ? (
        <EmptyStateCard
          className={styles.emptyCard}
          title="No payment options yet"
          description="Your school has not enabled self-serve top-up or bank transfer for your account. Please contact the administrator."
        />
      ) : null}

      {!loading && data && !showOnlineCheckout && hasManualInvoice ? (
        <div className={styles.infoCallout}>
          <Info size={18} aria-hidden />
          <p>
            Lesson packages are managed by your school. Use the bank transfer details below and
            your balance will be updated after payment is confirmed.
          </p>
        </div>
      ) : null}

      {!loading && hasManualInvoice ? (
        <section className={styles.section} aria-labelledby="payment-manual-heading">
          <SectionIntro
            headingId="payment-manual-heading"
            title={showOnlineCheckout ? 'Or pay by bank transfer' : 'Bank transfer'}
            description="Use the account for your region. Include the reference and send your receipt to the school."
          />
          <ol className={styles.manualSteps}>
            <li>
              {selectedPackage
                ? `Transfer ${formatCheckoutAmount(selectedPackage.amountMinor, selectedPackage.currency)} using the details for your region.`
                : 'Transfer the package amount using the details for your region.'}
            </li>
            <li>Add the payment reference shown below (usually your name).</li>
            <li>Send the receipt to your school — lessons are credited after confirmation.</li>
          </ol>

          {manualMethods.length > 0 ? (
            <div className={styles.manualMethodList}>
              {manualMethods.map((manualMethod) => (
                <article key={manualMethod.id} className={styles.manualMethodCard}>
                  <div className={styles.manualMethodHead}>
                    <div>
                      <p className={styles.manualMethodKind}>
                        {manualMethod.kind === 'iban_sepa'
                          ? 'IBAN / SEPA'
                          : manualMethod.kind === 'swift_wire'
                            ? 'SWIFT wire'
                            : manualMethod.kind === 'card_transfer'
                              ? 'Card transfer'
                              : 'Manual invoice'}
                      </p>
                      <h3 className={styles.manualMethodTitle}>{manualMethod.label}</h3>
                    </div>
                    {data?.manualInvoiceSelection.defaultMethodId === manualMethod.id ? (
                      <Badge variant="green" size="sm">
                        Recommended
                      </Badge>
                    ) : null}
                  </div>
                  {manualMethod.description ? (
                    <p className={styles.manualNote}>{manualMethod.description}</p>
                  ) : null}
                  <ManualInvoiceMethodDetails method={manualMethod} />
                  {manualMethod.paymentReferenceHint ? (
                    <div className={styles.referenceBox}>
                      <span className={styles.referenceLabel}>Payment reference</span>
                      <strong className={styles.referenceValue}>
                        {manualMethod.paymentReferenceHint}
                      </strong>
                    </div>
                  ) : null}
                  {(manualMethod.importantNotes?.length ?? 0) > 0 ? (
                    <div className={styles.manualMethodNotes}>
                      <p className={styles.manualMethodNotesTitle}>Important</p>
                      <ul className={styles.manualMethodNotesList}>
                        {(manualMethod.importantNotes ?? []).map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {manualMethod.receiptHintUk ? (
                    <p className={styles.receiptHint}>{manualMethod.receiptHintUk}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.manualEmpty}>No bank transfer templates are available for your account.</p>
          )}
        </section>
      ) : null}

      {!loading && data ? (
        <LessonBalanceLedgerActivity entries={data.recentLedger} className={styles.ledgerSection} />
      ) : null}
      </div>
    </div>
  );
}
