'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { track } from '../../lib/analytics';
import { Button, Field, PageHeader, SurfaceCard } from '../../components/ui';
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
}

const PURCHASABLE = [
  { key: 'STARTER', name: 'Starter', blurb: 'Up to 50 students · 10 GB storage · lesson recordings' },
  {
    key: 'PRO',
    name: 'Pro',
    blurb: 'Unlimited students · 100 GB storage · custom domain · AI assist',
  },
] as const;

/** Plans that already have an active paid subscription (not on free tier). */
const PAID_PLANS = new Set(['STARTER', 'PRO']);

function formatBytes(bytes: string): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Loading…</div>}>
      <BillingPageInner />
    </Suspense>
  );
}

function BillingPageInner() {
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

  const load = useCallback(() => {
    setLoading(true);
    apiClient
      .get<EntitlementsSummary>('/billing/entitlements')
      .then((data) => setSummary(data))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load billing'))
      .finally(() => setLoading(false));
  }, []);

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
      setError(e instanceof Error ? e.message : 'Could not start checkout');
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
      const date = new Date(res.trialEndsAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      setTrialPromoResult(`Trial extended — your trial now runs until ${date}.`);
      setTrialPromoCode('');
      load();
    } catch (e) {
      setTrialPromoError(e instanceof Error ? e.message : 'Could not apply promo code');
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
      setError(e instanceof Error ? e.message : 'Could not open billing portal');
      setPortaling(false);
    }
  }

  const isSubscribed = summary != null && PAID_PLANS.has(summary.plan);
  const isBusy = checkoutPlan !== null || portaling;

  return (
    <div className={styles.page}>
      <PageHeader title="Subscription" subtitle="Your school plan, usage, and billing." />

      {billingStatus === 'success' ? (
        <div className={styles.success}>Subscription updated — thank you!</div>
      ) : null}
      {billingStatus === 'cancelled' ? (
        <div className={styles.notice}>Checkout cancelled — no changes were made.</div>
      ) : null}
      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      {loading || !summary ? (
        <SurfaceCard>Loading…</SurfaceCard>
      ) : (
        <>
          <SurfaceCard className={styles.usage}>
            <div className={styles.planRow}>
              <span className={styles.planLabel}>Current plan</span>
              <span className={styles.planValue}>{summary.plan}</span>
            </div>

            <div className={styles.meter}>
              <div className={styles.meterHead}>
                <span>Storage</span>
                <span>
                  {formatBytes(summary.storage.usedBytes)} / {formatBytes(summary.storage.quotaBytes)}
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
                <p className={styles.overQuotaHint}>
                  Storage quota exceeded — uploads are blocked. Upgrade to continue.
                </p>
              ) : null}
            </div>

            <div className={styles.meter}>
              <div className={styles.meterHead}>
                <span>Students</span>
                <span>
                  {summary.activeStudentCount}
                  {summary.maxActiveStudents == null ? ' (unlimited)' : ` / ${summary.maxActiveStudents}`}
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

            {isSubscribed ? (
              <div className={styles.portalRow}>
                <Button
                  variant="default"
                  loading={portaling}
                  loadingLabel="Opening…"
                  disabled={isBusy}
                  onClick={() => void openPortal()}
                >
                  Manage subscription
                </Button>
                <span className={styles.portalHint}>
                  Change plan, update payment method, or cancel via the Stripe portal.
                </span>
              </div>
            ) : null}
          </SurfaceCard>

          {/* Trial-extension promo code — only for schools actively on TRIAL */}
          {summary.plan === 'TRIAL' ? (
            <SurfaceCard className={styles.trialPromo}>
              <h3 className={styles.trialPromoTitle}>Have a promo code?</h3>
              <p className={styles.trialPromoHint}>Enter a trial-extension code to add more days to your free trial.</p>
              {trialPromoResult ? (
                <div className={styles.success}>{trialPromoResult}</div>
              ) : null}
              {trialPromoError ? (
                <div className={styles.error} role="alert">{trialPromoError}</div>
              ) : null}
              <div className={styles.trialPromoRow}>
                <Field
                  label="Trial extension code"
                  placeholder="e.g. PARTNER30"
                  value={trialPromoCode}
                  onChange={(e) => setTrialPromoCode((e.target as HTMLInputElement).value.toUpperCase())}
                  disabled={trialPromoLoading || isBusy}
                />
                <Button
                  variant="default"
                  loading={trialPromoLoading}
                  loadingLabel="Applying…"
                  disabled={!trialPromoCode.trim() || trialPromoLoading || isBusy}
                  onClick={() => void redeemTrialPromo()}
                >
                  Apply
                </Button>
              </div>
            </SurfaceCard>
          ) : null}

          {/* Plan picker — only shown for non-subscribers (trial / grandfathered) */}
          {!isSubscribed ? (
            <>
              <div className={styles.promoRow}>
                <Field
                  label="Promo code"
                  placeholder="e.g. LAUNCH20"
                  value={promoCode}
                  onChange={(e) => setPromoCode((e.target as HTMLInputElement).value)}
                  disabled={isBusy}
                />
              </div>

              <div className={styles.plans}>
                {PURCHASABLE.map((p) => (
                  <SurfaceCard key={p.key} className={styles.planCard}>
                    <h3 className={styles.planName}>{p.name}</h3>
                    <p className={styles.planBlurb}>{p.blurb}</p>
                    <Button
                      variant="primary"
                      disabled={isBusy}
                      loading={checkoutPlan === p.key}
                      loadingLabel="Redirecting…"
                      onClick={() => void checkout(p.key)}
                    >
                      {`Subscribe to ${p.name}`}
                    </Button>
                  </SurfaceCard>
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
