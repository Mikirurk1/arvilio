'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, ChevronRight, Info, Lock } from 'lucide-react';
import { LessonBalanceLedgerActivity } from '../../components/billing/LessonBalanceLedgerActivity';
import { LegalFooter } from '../../components/legal/LegalFooter';
import { PaymentMethodLogos } from '../../components/payments/PaymentMethodLogos';
import {
  buildOrderSummary,
  filterCheckoutMethodsForPackage,
  formatCheckoutAmount,
  getUnavailableCheckoutMethods,
  getUnavailableCheckoutReason,
  groupPackagesByCurrency,
} from '../../lib/billing/checkout-display';
import { Badge, Button, EmptyStateCard, PageHeader, StatTile, SurfaceCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { useBillingStore } from '../../stores/billing-store';
import { showsGroupTrack, showsIndividualTrack } from '../../lib/student-lesson-format';
import type { PaymentMethodKindDto } from '@pkg/types';
import {
  CHECKOUT_METHODS,
  buildPaymentMethodStudentMeta,
} from './payment-page-meta';
import { ManualInvoiceMethodDetails, PaymentMethodIcon, SectionIntro, CopyablePaymentValue } from './payment-ui';
import { getFeaturedPackageId, PackageCard, PackageOfferPanel } from './PackageSelector';
import styles from './page.module.scss';

export default function PaymentPage() {
  const t = useCampusT();
  const methodMeta = buildPaymentMethodStudentMeta(t);
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
  const orderSummary = selectedPackage ? buildOrderSummary(selectedPackage, t) : null;
  const packageGroups = useMemo(() => groupPackagesByCurrency(packages), [packages]);
  const hasManualInvoice = (data?.availableMethods ?? []).includes('manual_invoice');
  const showOnlineCheckout = Boolean(data?.showSelfServePackages && packages.length > 0);
  const hasOnlineCheckout = onlineMethods.length > 0;
  const isSinglePackage = packages.length === 1;
  const pageSubtitle =
    hasOnlineCheckout && hasManualInvoice
      ? t('payment.subtitle')
      : hasOnlineCheckout
        ? t('payment.subtitleOnlineOnly')
        : hasManualInvoice
          ? t('payment.subtitleManualOnly')
          : t('payment.subtitle');
  const packageSectionDescription = isSinglePackage
    ? hasOnlineCheckout
      ? t('payment.confirmPackage')
      : t('payment.confirmPackageManual')
    : t('payment.selectPackage');

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
      ? t('payment.balance.debt')
      : primaryBalance <= 0
        ? t('payment.balance.empty')
        : primaryBalance === 1
          ? t('payment.balance.oneLeft')
          : t('payment.balance.ok');

  const startCheckout = async (method: PaymentMethodKindDto) => {
    if (!selectedPackage) return;
    setCheckoutLoading(method);
    setError(null);
    try {
      const url = await createCheckout({ method, packageId: selectedPackage.id });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('payment.error.checkoutFailed'));
      setCheckoutLoading(null);
    }
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={t('payment.title')}
        subtitle={pageSubtitle}
      />

      <div className={styles.stack}>
      {statusParam === 'success' ? (
        <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
          {t('payment.alert.success')}
        </div>
      ) : null}
      {statusParam === 'cancelled' ? (
        <div className={`${styles.alert} ${styles.alertNeutral}`} role="status">
          {t('payment.alert.cancelled')}
        </div>
      ) : null}
      {error ? (
        <div className={`${styles.alert} ${styles.alertError}`} role="alert">
          {error}
        </div>
      ) : null}

      <SurfaceCard
        className={`${styles.balanceCard} ${styles[`balanceCard_${balanceTone}`]}`}
        data-tour-anchor="payment-balance"
      >
        <div className={styles.balanceCardInner}>
          <div className={styles.balanceCopy}>
            <p className={styles.balanceLabel}>{t('payment.yourBalance')}</p>
            <p className={styles.balanceMessage}>{loading ? t('common.loading') : balanceMessage}</p>
          </div>
          <div className={styles.balanceStats}>
            {showIndividualBalance ? (
              <StatTile
                className={styles.balanceStat}
                label={t('payment.individualLessons')}
                value={loading ? '…' : balance}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
            {showGroupBalance ? (
              <StatTile
                className={styles.balanceStat}
                label={t('payment.groupLessons')}
                value={loading ? '…' : groupBalance}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
            {data?.showPerLessonPricing && showIndividualBalance ? (
              <StatTile
                className={styles.balanceStat}
                label={t('payment.individualRate')}
                value={formatCheckoutAmount(data.resolvedPricePerLessonMinor, data.defaultCurrency)}
                valueClassName={styles.balanceStatValue}
              />
            ) : null}
            {showGroupBalance ? (
              <StatTile
                className={styles.balanceStat}
                label={t('payment.groupRate')}
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
          <p className={styles.loadingText}>{t('payment.loadingOptions')}</p>
        </SurfaceCard>
      ) : null}

      {!loading && data && showOnlineCheckout ? (
        <section
          className={styles.checkoutSection}
          aria-labelledby="payment-packages-heading"
          data-tour-anchor="payment-packages"
        >
          <SectionIntro
            headingId="payment-packages-heading"
            title={isSinglePackage ? t('payment.yourPackage') : t('payment.packages')}
            description={packageSectionDescription}
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
                        <h3 className={styles.packageCurrencyHeading}>
                          {t('payment.payInCurrency', { currency: group.currency })}
                        </h3>
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
                    {hasManualInvoice
                      ? t('payment.noProviderForCurrency', { currency: selectedPackage.currency })
                      : t('payment.noProviderForCurrencyOnlineOnly', {
                          currency: selectedPackage.currency,
                        })}
                  </p>
                </div>
              ) : null}
            </div>

            <aside className={styles.checkoutAside} aria-label={t('payment.checkoutSummary')}>
              <SurfaceCard className={styles.checkoutSticky}>
                {selectedPackage && orderSummary ? (
                  <>
                    <p className={styles.orderSummaryEyebrow}>{t('payment.orderSummary')}</p>
                    <h3 className={styles.orderSummaryTitle}>{orderSummary.label}</h3>
                    <p className={styles.orderSummaryAmount}>{orderSummary.amountLabel}</p>
                    <ul className={styles.orderSummaryMeta}>
                      <li>
                        {t('payment.orderLessonsCurrency', {
                          count: orderSummary.lessons,
                          currency: orderSummary.currency,
                        })}
                      </li>
                      <li>
                        {t('payment.orderAfterPayment', { label: orderSummary.balanceAfterLabel })}
                      </li>
                    </ul>
                  </>
                ) : (
                  <p className={styles.checkoutPlaceholder}>{t('payment.selectPackageHint')}</p>
                )}

                {selectedPackage && compatibleOnlineMethods.length > 0 ? (
                  <div className={styles.payMethodGrid} data-tour-anchor="payment-methods">
                    <p className={styles.payMethodHeading}>{t('payment.payOnline')}</p>
                    {compatibleOnlineMethods.map((method) => {
                      const meta = methodMeta[method];
                      const busy = checkoutLoading === method;
                      return (
                        <Button
                          key={method}
                          type="button"
                          variant="primary"
                          className={styles.payMethodBtn}
                          loading={busy}
                          loadingLabel={t('payment.redirecting')}
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
                            {getUnavailableCheckoutReason(method, selectedPackage.currency, t)}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {hasOnlineCheckout ? (
                  <p className={styles.checkoutTrust}>
                    <Lock size={14} aria-hidden />
                    {t('payment.secureCheckout')}
                  </p>
                ) : hasManualInvoice ? (
                  <p className={styles.checkoutTrust}>
                    <Building2 size={14} aria-hidden />
                    {t('payment.payByTransferHint')}
                  </p>
                ) : null}
              </SurfaceCard>
            </aside>
          </div>
        </section>
      ) : null}

      {!loading && data && !showOnlineCheckout && !hasManualInvoice ? (
        <EmptyStateCard
          className={styles.emptyCard}
          title={t('payment.noOptions.title')}
          description={t('payment.noOptions.body')}
        />
      ) : null}

      {!loading && data && !showOnlineCheckout && hasManualInvoice ? (
        <div className={styles.infoCallout}>
          <Info size={18} aria-hidden />
          <p>{t('payment.packagesManaged')}</p>
        </div>
      ) : null}

      {!loading && hasManualInvoice ? (
        <section className={styles.section} aria-labelledby="payment-manual-heading">
          <SectionIntro
            headingId="payment-manual-heading"
            title={hasOnlineCheckout ? t('payment.orBankTransfer') : t('payment.bankTransfer')}
            description={t('payment.transfer.hint')}
          />
          <ol className={styles.manualSteps}>
            <li>
              {selectedPackage
                ? t('payment.step.transferAmount', {
                    amount: formatCheckoutAmount(selectedPackage.amountMinor, selectedPackage.currency),
                  })
                : t('payment.step.transferGeneric')}
            </li>
            <li>{t('payment.step.addReference')}</li>
            <li>{t('payment.step.sendReceipt')}</li>
          </ol>

          {manualMethods.length > 0 ? (
            <div className={styles.manualMethodList}>
              {manualMethods.map((manualMethod) => (
                <article key={manualMethod.id} className={styles.manualMethodCard}>
                  <div className={styles.manualMethodHead}>
                    <div>
                      <p className={styles.manualMethodKind}>
                        {manualMethod.kind === 'iban_sepa'
                          ? t('payment.kind.ibanSepa')
                          : manualMethod.kind === 'swift_wire'
                            ? t('payment.kind.swiftWire')
                            : manualMethod.kind === 'card_transfer'
                              ? t('payment.kind.cardTransfer')
                              : t('payment.kind.manualInvoice')}
                      </p>
                      <h3 className={styles.manualMethodTitle}>{manualMethod.label}</h3>
                    </div>
                    {data?.manualInvoiceSelection.defaultMethodId === manualMethod.id ? (
                      <Badge variant="green" size="sm">
                        {t('payment.recommended')}
                      </Badge>
                    ) : null}
                  </div>
                  {manualMethod.description ? (
                    <p className={styles.manualNote}>{manualMethod.description}</p>
                  ) : null}
                  <ManualInvoiceMethodDetails method={manualMethod} />
                  {manualMethod.paymentReferenceHint ? (
                    <CopyablePaymentValue
                      label={t('payment.referenceLabel')}
                      value={manualMethod.paymentReferenceHint}
                      className={styles.referenceBox}
                      valueClassName={styles.referenceValue}
                    />
                  ) : null}
                  {(manualMethod.importantNotes?.length ?? 0) > 0 ? (
                    <div className={styles.manualMethodNotes}>
                      <p className={styles.manualMethodNotesTitle}>{t('payment.important')}</p>
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
            <p className={styles.manualEmpty}>{t('payment.manualEmpty')}</p>
          )}
        </section>
      ) : null}

      {!loading && data ? (
        <div data-tour-anchor="payment-ledger">
          <LessonBalanceLedgerActivity entries={data.recentLedger} className={styles.ledgerSection} />
        </div>
      ) : null}

      {onlineMethods.length > 0 ? (
        <PaymentMethodLogos methods={onlineMethods} />
      ) : null}
      <LegalFooter />
      </div>
    </div>
  );
}
