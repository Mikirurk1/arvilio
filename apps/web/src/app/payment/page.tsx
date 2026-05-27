'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Check,
  CreditCard,
  Info,
  Wallet,
} from 'lucide-react';
import { LessonBalanceLedgerActivity } from '../../components/billing/LessonBalanceLedgerActivity';
import {
  buildOrderSummary,
  filterCheckoutMethodsForPackage,
  formatCheckoutAmount,
  getUnavailableCheckoutMethods,
  getUnavailableCheckoutReason,
  groupPackagesByCurrency,
} from '../../lib/billing/checkout-display';
import { Badge, PageHeader, SurfaceCard } from '../../components/ui';
import { useBillingStore } from '../../stores/billing-store';
import type { ManualInvoiceMethodDto, PaymentMethodKindDto, ResolvedLessonPackageDto } from '@pkg/types';
import {
  CHECKOUT_METHODS,
  PAYMENT_METHOD_STUDENT_META,
} from './payment-page-meta';
import styles from './page.module.scss';

function getFeaturedPackageId(
  packages: Array<{ id: string; lessons: number }>,
): string | null {
  if (packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  return sorted[Math.floor(sorted.length / 2)]?.id ?? null;
}

function PaymentMethodIcon({ method }: { method: PaymentMethodKindDto }) {
  if (method === 'manual_invoice') return <Building2 size={18} aria-hidden />;
  if (method === 'paypal' || method === 'liqpay' || method === 'monopay') {
    return <Wallet size={18} aria-hidden />;
  }
  return <CreditCard size={18} aria-hidden />;
}

function SectionIntro({
  step,
  title,
  description,
}: {
  step?: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionIntro}>
      {step ? <span className={styles.sectionStep}>{step}</span> : null}
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
    </div>
  );
}

function ManualField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className={styles.manualField}>
      <span className={styles.manualFieldLabel}>{label}</span>
      <strong className={styles.manualFieldValue}>{value}</strong>
    </div>
  );
}

function ManualInvoiceMethodDetails({ method }: { method: ManualInvoiceMethodDto }) {
  if (method.kind === 'iban_sepa') {
    return (
      <div className={styles.manualFieldGrid}>
        <ManualField label="Receiver" value={method.beneficiaryName} />
        <ManualField label="IBAN" value={method.iban} />
        <ManualField label="Tax ID / EDRPOU" value={method.recipientTaxId} />
        <ManualField label="Payment purpose" value={method.paymentPurpose} />
        <ManualField label="Bank" value={method.bankName} />
        <ManualField label="Country" value={method.bankCountry} />
        <ManualField label="BIC / SWIFT" value={method.bic} />
      </div>
    );
  }
  if (method.kind === 'swift_wire') {
    return (
      <>
        <div className={styles.manualFieldGrid}>
          <ManualField label="Receiver" value={method.beneficiaryName} />
          <ManualField label="SWIFT / BIC" value={method.swiftBic} />
          <ManualField label="Account number" value={method.accountNumber} />
          <ManualField label="IBAN" value={method.iban} />
          <ManualField label="Tax ID / EDRPOU" value={method.recipientTaxId} />
          <ManualField label="Payment purpose" value={method.paymentPurpose} />
          <ManualField label="Bank" value={method.bankName} />
          <ManualField label="Intermediary SWIFT" value={method.intermediarySwiftBic} />
        </div>
        {method.bankAddress ? (
          <p className={styles.manualNote}>Bank address: {method.bankAddress}</p>
        ) : null}
        {method.beneficiaryAddress ? (
          <p className={styles.manualNote}>Receiver address: {method.beneficiaryAddress}</p>
        ) : null}
        {method.intermediaryBankName ? (
          <p className={styles.manualNote}>Intermediary bank: {method.intermediaryBankName}</p>
        ) : null}
      </>
    );
  }
  if (method.kind === 'card_transfer') {
    return (
      <div className={styles.manualFieldGrid}>
        <ManualField label="Cardholder" value={method.beneficiaryName} />
        <ManualField label="Bank" value={method.bankName} />
        <ManualField label="Card number" value={method.cardNumber} />
        <ManualField label="Tax ID / EDRPOU" value={method.recipientTaxId} />
        <ManualField label="Payment purpose" value={method.paymentPurpose} />
      </div>
    );
  }
  return <p className={styles.manualNote}>{method.instructionsUk}</p>;
}

function PackageOfferPanel({ pkg }: { pkg: ResolvedLessonPackageDto }) {
  return (
    <div className={styles.packageOffer} aria-label={`${pkg.label}, ${pkg.lessons} lessons`}>
      <div className={styles.packageOfferBody}>
        <div className={styles.packageOfferMeta}>
          <Badge variant="blue" size="sm">
            {pkg.currency}
          </Badge>
          {pkg.lessonsLocked ? (
            <Badge variant="neutral" size="sm">
              Fixed size
            </Badge>
          ) : null}
        </div>
        <h3 className={styles.packageOfferTitle}>{pkg.label}</h3>
        <p className={styles.packageOfferLessons}>
          <strong>{pkg.lessons}</strong> lessons on your balance after payment
        </p>
        <p className={styles.packageOfferRate}>
          {formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency)} per lesson
        </p>
      </div>
      <div className={styles.packageOfferPrice}>
        <span className={styles.packageOfferPriceLabel}>Total to pay</span>
        <span className={styles.packageOfferAmount}>
          {formatCheckoutAmount(pkg.amountMinor, pkg.currency)}
        </span>
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  featuredPackageId,
  selected,
  onSelect,
}: {
  pkg: ResolvedLessonPackageDto;
  featuredPackageId: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const isFeatured = pkg.id === featuredPackageId;

  return (
    <button
      type="button"
      className={[
        styles.packageCard,
        selected ? styles.packageCardSelected : '',
        isFeatured ? styles.packageCardFeatured : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${pkg.label}, ${pkg.lessons} lessons, ${formatCheckoutAmount(pkg.amountMinor, pkg.currency)}`}
    >
      <span className={styles.packageCardRadio} aria-hidden>
        {selected ? <Check size={14} strokeWidth={3} /> : null}
      </span>

      <div className={styles.packageCardMain}>
        {isFeatured ? <span className={styles.packageCardRibbon}>Recommended</span> : null}
        <h3 className={styles.packageCardTitle}>{pkg.label}</h3>
        <p className={styles.packageCardLessons}>
          <strong>{pkg.lessons}</strong> lessons · {pkg.currency}
        </p>
      </div>

      <div className={styles.packageCardPriceBlock}>
        <span className={styles.packageCardPrice}>{formatCheckoutAmount(pkg.amountMinor, pkg.currency)}</span>
        <span className={styles.packageCardRate}>
          {formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency)} / lesson
        </span>
      </div>
    </button>
  );
}

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

  const balanceTone =
    balance < 0 || balance <= 0 ? 'danger' : balance === 1 ? 'warning' : 'ok';

  const balanceMessage =
    balance < 0
      ? 'You have a lesson debt. Top up your balance to book new lessons.'
      : balance <= 0
        ? 'No prepaid lessons left. Choose a package below or pay by bank transfer.'
        : balance === 1
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
        title="Payment"
        subtitle="Top up your lesson balance and see how to pay"
      />

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
          <div>
            <p className={styles.balanceLabel}>Lessons on balance</p>
            <p className={styles.balanceNum}>{loading ? '…' : balance}</p>
            <p className={styles.balanceMessage}>{loading ? 'Loading balance…' : balanceMessage}</p>
          </div>
          {data?.showPerLessonPricing ? (
            <div className={styles.balanceAside}>
              <span className={styles.balanceAsideLabel}>Your rate</span>
              <strong className={styles.balanceAsideValue}>
                {formatCheckoutAmount(data.resolvedPricePerLessonMinor, data.defaultCurrency)}
              </strong>
              <span className={styles.balanceAsideMeta}>
                per lesson{data.isCustomPrice ? ' · individual' : ''}
              </span>
            </div>
          ) : null}
        </div>
      </SurfaceCard>

      {loading ? (
        <SurfaceCard className={styles.loadingCard} aria-busy="true">
          <p className={styles.loadingText}>Loading payment options…</p>
        </SurfaceCard>
      ) : null}

      {!loading && data && showOnlineCheckout ? (
        <section className={styles.section} aria-labelledby="payment-packages-heading">
          <SectionIntro
            step={isSinglePackage ? undefined : 'Step 1'}
            title={isSinglePackage ? 'Your lesson package' : 'Choose a lesson package'}
            description={
              isSinglePackage
                ? 'This is the package your school offers for topping up your balance.'
                : 'Pick how many lessons you want to buy. Prices include your personal rate where applicable.'
            }
          />
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

          {selectedPackage && orderSummary && !isSinglePackage ? (
            <aside className={styles.orderSummary} aria-label="Order summary">
              <p className={styles.orderSummaryEyebrow}>You buy</p>
              <h3 className={styles.orderSummaryTitle}>{orderSummary.label}</h3>
              <p className={styles.orderSummaryAmount}>{orderSummary.amountLabel}</p>
              <p className={styles.orderSummaryLessons}>
                {orderSummary.lessons} lessons · {orderSummary.currency}
              </p>
              <p className={styles.orderSummaryAfter}>After payment: {orderSummary.balanceAfterLabel}</p>
            </aside>
          ) : null}

          {selectedPackage && compatibleOnlineMethods.length > 0 ? (
            <div className={styles.checkoutPanel}>
              <SectionIntro
                step={isSinglePackage ? undefined : 'Step 2'}
                title="Pay online"
                description="Open secure checkout with your preferred provider. You will return here after payment."
              />
              <div className={styles.payMethodGrid}>
                {compatibleOnlineMethods.map((method) => {
                  const meta = PAYMENT_METHOD_STUDENT_META[method];
                  const busy = checkoutLoading === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      className={styles.payMethodCard}
                      disabled={checkoutLoading !== null || selectedPackage.amountMinor <= 0}
                      onClick={() => void startCheckout(method)}
                    >
                      <span className={styles.payMethodIcon}>
                        <PaymentMethodIcon method={method} />
                      </span>
                      <span className={styles.payMethodText}>
                        <span className={styles.payMethodTitle}>{meta.title}</span>
                        <span className={styles.payMethodDescription}>{meta.description}</span>
                      </span>
                      <span className={styles.payMethodAction}>
                        {busy ? 'Redirecting…' : `Pay with ${meta.shortTitle}`}
                      </span>
                    </button>
                  );
                })}
              </div>
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
        </section>
      ) : null}

      {!loading && data && !showOnlineCheckout && !hasManualInvoice ? (
        <SurfaceCard className={styles.emptyCard}>
          <p className={styles.emptyTitle}>No payment options yet</p>
          <p className={styles.emptyText}>
            Your school has not enabled self-serve top-up or bank transfer for your account. Please
            contact the administrator.
          </p>
        </SurfaceCard>
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
            step={showOnlineCheckout ? 'Or pay offline' : 'Bank transfer'}
            title="Pay by bank transfer"
            description="Use one of the accounts below. Include the payment reference and send your receipt to the school."
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
  );
}
