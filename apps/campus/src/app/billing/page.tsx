'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { track } from '../../lib/analytics';
import { Button, Field, PageHeader, SurfaceCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

interface EntitlementsSummary {
  plan: string;
  maxActiveStudents: number | null;
  activeStudentCount: number;
  seatsRemaining: number | null;
  features: { customDomain: boolean; aiAssist: boolean; recordings: boolean };
  storage: {
    usedBytes: string;
    quotaBytes: string;
    remainingBytes: string;
    percentUsed: number;
    overQuota: boolean;
  };
  /** Stripe Customer Portal available (paid Layer-B subscription). */
  billingManaged: boolean;
}

const BYTE_UNIT_KEYS = [
  'entitlements.bytes.b',
  'entitlements.bytes.kb',
  'entitlements.bytes.mb',
  'entitlements.bytes.gb',
  'entitlements.bytes.tb',
] as const;

const PURCHASABLE = [
  { key: 'STARTER', nameKey: 'billing.plan.starter.name', blurbKey: 'billing.plan.starter.blurb' },
  { key: 'PRO', nameKey: 'billing.plan.pro.name', blurbKey: 'billing.plan.pro.blurb' },
] as const;

function formatBytes(bytes: string, unitLabel: (i: number) => string): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n === 0) return `0 ${unitLabel(0)}`;
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), BYTE_UNIT_KEYS.length - 1);
  return `${(n / 1024 ** i).toFixed(1)} ${unitLabel(i)}`;
}

function BillingPageFallback() {
  const t = useCampusT();
  return <div className={styles.page}>{t('billing.loading')}</div>;
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingPageFallback />}>
      <BillingPageInner />
    </Suspense>
  );
}

function BillingPageInner() {
  const t = useCampusT();
  const searchParams = useSearchParams();
  const billingStatus = searchParams.get('billing');
  const [summary, setSummary] = useState<EntitlementsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [portaling, setPortaling] = useState(false);
  const [trialPromoCode, setTrialPromoCode] = useState('');
  const [trialPromoLoading, setTrialPromoLoading] = useState(false);
  const [trialPromoResult, setTrialPromoResult] = useState<string | null>(null);
  const [trialPromoError, setTrialPromoError] = useState<string | null>(null);

  const unitLabel = (i: number) => t(BYTE_UNIT_KEYS[i]);

  const load = useCallback(() => {
    setLoading(true);
    apiClient
      .get<EntitlementsSummary>('/billing/entitlements')
      .then((data) => setSummary(data))
      .catch((e) => setError(e instanceof Error ? e.message : t('billing.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => load(), [load]);

  async function checkout(plan: string) {
    setCheckoutPlan(plan);
    setError(null);
    try {
      const body: { plan: string; promoCode?: string } = { plan };
      if (promoCode.trim()) body.promoCode = promoCode.trim().toUpperCase();
      const res = await apiClient.post<{ url: string }>('/billing/subscription/checkout', body);
      track({ name: 'trial_checkout_started', plan, schoolId: '' });
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t('billing.checkoutError'));
      setCheckoutPlan(null);
    }
  }

  async function redeemTrialPromo() {
    const code = trialPromoCode.trim().toUpperCase();
    if (!code) return;
    setTrialPromoLoading(true);
    setTrialPromoError(null);
    setTrialPromoResult(null);
    try {
      const res = await apiClient.post<{ trialEndsAt: string }>('/billing/subscription/promo/redeem', { code });
      const date = new Date(res.trialEndsAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setTrialPromoResult(t('billing.trialExtended', { date }));
      setTrialPromoCode('');
      load();
    } catch (e) {
      setTrialPromoError(e instanceof Error ? e.message : t('billing.promoApplyError'));
    } finally {
      setTrialPromoLoading(false);
    }
  }

  async function openPortal() {
    setPortaling(true);
    setError(null);
    try {
      const res = await apiClient.post<{ url: string }>('/billing/subscription/portal', {});
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t('billing.portalError'));
      setPortaling(false);
    }
  }

  const isBillingManaged = Boolean(summary?.billingManaged);
  const isBusy = checkoutPlan !== null || portaling;

  return (
    <div className={styles.page}>
      <PageHeader title={t('billing.title')} subtitle={t('billing.subtitle')} />

      {billingStatus === 'success' ? (
        <div className={styles.success}>{t('billing.success')}</div>
      ) : null}
      {billingStatus === 'cancelled' ? (
        <div className={styles.notice}>{t('billing.checkoutCancelled')}</div>
      ) : null}
      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      {loading || !summary ? (
        <SurfaceCard>{t('billing.loading')}</SurfaceCard>
      ) : (
        <>
          <SurfaceCard className={styles.usage} data-tour-anchor="billing-plan">
            <div className={styles.planRow}>
              <span className={styles.planLabel}>{t('billing.currentPlan')}</span>
              <span className={styles.planValue}>
                {summary.plan}
                {!summary.billingManaged && summary.plan === 'PRO' ? (
                  <span className={styles.planHint}>{t('billing.legacyHint')}</span>
                ) : null}
              </span>
            </div>

            <div className={styles.meter} data-tour-anchor="billing-usage">
              <div className={styles.meterHead}>
                <span>{t('entitlements.storage')}</span>
                <span>
                  {formatBytes(summary.storage.usedBytes, unitLabel)} /{' '}
                  {formatBytes(summary.storage.quotaBytes, unitLabel)}
                </span>
              </div>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  data-over={summary.storage.overQuota}
                  style={{ width: `${Math.min(100, summary.storage.percentUsed)}%` }}
                />
              </div>
              {summary.storage.overQuota ? (
                <p className={styles.overQuotaHint}>{t('billing.overQuota')}</p>
              ) : null}
            </div>

            <div className={styles.meter}>
              <div className={styles.meterHead}>
                <span>{t('entitlements.students')}</span>
                <span>
                  {summary.activeStudentCount}
                  {summary.maxActiveStudents == null
                    ? t('billing.unlimited')
                    : ` / ${summary.maxActiveStudents}`}
                </span>
              </div>
              {summary.maxActiveStudents != null ? (
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${Math.min(100, Math.round((summary.activeStudentCount / summary.maxActiveStudents) * 100))}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>

            {isBillingManaged ? (
              <div className={styles.portalRow}>
                <Button
                  variant="default"
                  loading={portaling}
                  loadingLabel={t('billing.openingPortal')}
                  disabled={isBusy}
                  onClick={() => void openPortal()}
                >
                  {t('billing.manageSubscription')}
                </Button>
                <span className={styles.portalHint}>{t('billing.portalHint')}</span>
              </div>
            ) : null}
          </SurfaceCard>

          {summary.plan === 'TRIAL' ? (
            <SurfaceCard className={styles.trialPromo} data-tour-anchor="billing-promo">
              <h3 className={styles.trialPromoTitle}>{t('billing.trialPromoTitle')}</h3>
              <p className={styles.trialPromoHint}>{t('billing.trialPromoHint')}</p>
              {trialPromoResult ? <div className={styles.success}>{trialPromoResult}</div> : null}
              {trialPromoError ? (
                <div className={styles.error} role="alert">
                  {trialPromoError}
                </div>
              ) : null}
              <div className={styles.trialPromoRow}>
                <Field
                  label={t('billing.trialExtensionCode')}
                  placeholder={t('billing.trialExtensionPlaceholder')}
                  value={trialPromoCode}
                  onChange={(e) => setTrialPromoCode((e.target as HTMLInputElement).value.toUpperCase())}
                  disabled={trialPromoLoading || isBusy}
                />
                <Button
                  variant="default"
                  loading={trialPromoLoading}
                  loadingLabel={t('billing.applying')}
                  disabled={!trialPromoCode.trim() || trialPromoLoading || isBusy}
                  onClick={() => void redeemTrialPromo()}
                >
                  {t('billing.apply')}
                </Button>
              </div>
            </SurfaceCard>
          ) : null}

          {!isBillingManaged ? (
            <>
              {summary.plan === 'PRO' ? (
                <p className={styles.notice}>{t('billing.legacyNotice')}</p>
              ) : null}
              <div className={styles.promoRow} data-tour-anchor="billing-promo">
                <Field
                  label={t('billing.promoCode')}
                  placeholder={t('billing.promoPlaceholder')}
                  value={promoCode}
                  onChange={(e) => setPromoCode((e.target as HTMLInputElement).value)}
                  disabled={isBusy}
                />
              </div>

              <div className={styles.plans}>
                {PURCHASABLE.map((p) => {
                  const planName = t(p.nameKey);
                  return (
                    <SurfaceCard key={p.key} className={styles.planCard}>
                      <h3 className={styles.planName}>{planName}</h3>
                      <p className={styles.planBlurb}>{t(p.blurbKey)}</p>
                      <Button
                        variant="primary"
                        disabled={isBusy}
                        loading={checkoutPlan === p.key}
                        loadingLabel={t('billing.redirecting')}
                        onClick={() => void checkout(p.key)}
                      >
                        {t('billing.subscribeTo', { plan: planName })}
                      </Button>
                    </SurfaceCard>
                  );
                })}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
