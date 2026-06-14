'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, ShieldCheck, Wallet } from 'lucide-react';
import { Badge, Button, SurfaceCard } from '../../../components/ui';
import { useBillingStore } from '../../../stores/billing-store';
import {
  DEFAULT_MIN_PACKAGE_LESSONS,
  getPaymentSettingsCurrencyIssues,
  getPricePerLessonForCurrency,
  getLemonSqueezyActiveVariantCurrency,
  providerSupportsCheckoutCurrency,
  type LessonPackageDto,
  type PaymentCurrencyCode,
  type PaymentMethodKindDto,
  type PaymentSecretsDto,
  type PaymentSettingsDto,
} from '@pkg/types';
import { ApiError } from '../../../lib/api';
import { PaymentMethodConfigModal } from './PaymentMethodConfigModal';
import { PaymentsPricingSection } from './PaymentsPricingSection';
import { PaymentsMethodSection } from './PaymentsMethodSection';
import { PaymentsPackagesSection } from './PaymentsPackagesSection';
import {
  getMethodModeFromConfig,
  newPackageId,
  syncDraftPricing,
  formatMoney,
} from './payment-panel-utils';
import styles from '../page.module.scss';

export function PaymentsPanel() {
  const fetchPaymentSettings = useBillingStore((s) => s.fetchPaymentSettings);
  const updatePaymentSettings = useBillingStore((s) => s.updatePaymentSettings);
  const slice = useBillingStore((s) => s.paymentSettings);

  const [draft, setDraft] = useState<PaymentSettingsDto | null>(null);
  const [secretDraft, setSecretDraft] = useState<PaymentSecretsDto>({});
  const [configMethod, setConfigMethod] = useState<PaymentMethodKindDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { void fetchPaymentSettings(); }, [fetchPaymentSettings]);

  useEffect(() => {
    if (slice.status === 'success' && slice.data) {
      setDraft(syncDraftPricing(slice.data, {}));
      setSecretDraft({});
    }
  }, [slice.status, slice.data]);

  const methodStatuses = useMemo(() => {
    if (!draft) return [];
    return draft.methods.length > 0
      ? draft.methods.map((m) => ({
          ...m,
          enabled: draft.enabledMethods.includes(m.id),
          mode: getMethodModeFromConfig(m.id, draft.config),
        }))
      : (
          ['manual_invoice', 'stripe', 'liqpay', 'wayforpay', 'lemonsqueezy', 'paddle', 'monopay', 'paypal'] as PaymentMethodKindDto[]
        ).map((id) => ({
          id,
          enabled: draft.enabledMethods.includes(id),
          configured: false,
          configuredLabel: '',
          mode: getMethodModeFromConfig(id, draft.config),
        }));
  }, [draft]);

  const currencyIssues = useMemo(() => {
    if (!draft) return [];
    return getPaymentSettingsCurrencyIssues({ enabledMethods: draft.enabledMethods, config: draft.config });
  }, [draft]);

  const onSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updatePaymentSettings({ ...draft, secrets: secretDraft });
      setSecretDraft({});
      setSuccess('Payment settings saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = (method: PaymentMethodKindDto) => {
    if (!draft) return;
    const enabled = draft.enabledMethods.includes(method)
      ? draft.enabledMethods.filter((m) => m !== method)
      : [...draft.enabledMethods, method];
    setDraft({ ...draft, enabledMethods: enabled });
  };

  const addPackage = () => {
    if (!draft) return;
    const minLessons = draft.config.minPackageLessons ?? DEFAULT_MIN_PACKAGE_LESSONS;
    const pkg: LessonPackageDto = {
      id: newPackageId(),
      lessons: minLessons,
      label: `${minLessons} lessons`,
      currency: draft.config.defaultCurrency as PaymentCurrencyCode,
    };
    setDraft({ ...draft, config: { ...draft.config, packages: [...draft.config.packages, pkg] } });
  };

  const updatePackage = (index: number, patch: Partial<LessonPackageDto>) => {
    if (!draft) return;
    const packages = draft.config.packages.map((p, i) => (i === index ? { ...p, ...patch } : p));
    setDraft(syncDraftPricing(draft, { packages }));
  };

  const removePackage = (index: number) => {
    if (!draft) return;
    setDraft({ ...draft, config: { ...draft.config, packages: draft.config.packages.filter((_, i) => i !== index) } });
  };

  const loading = slice.status === 'loading' || !draft;
  const currency = (draft?.config.defaultCurrency ?? 'UAH') as PaymentCurrencyCode;
  const priceMinor = draft ? getPricePerLessonForCurrency(draft.config, currency) : 0;
  const allowedCurrencies = (draft?.config.allowedCurrencies ?? []) as PaymentCurrencyCode[];
  const pricePerLessonByCurrency = draft?.config.pricePerLessonByCurrency ?? [];
  const minPackageLessons = draft?.config.minPackageLessons ?? DEFAULT_MIN_PACKAGE_LESSONS;
  const lemonVariantCurrency = draft ? getLemonSqueezyActiveVariantCurrency(draft.config.lemonsqueezy) : null;
  const enabledCount = methodStatuses.filter((m) => m.enabled).length;
  const configuredCount = methodStatuses.filter((m) => m.configured).length;

  const providerSupportsCurrency = (method: PaymentMethodKindDto, code: PaymentCurrencyCode) =>
    providerSupportsCheckoutCurrency(method, code, { lemonSqueezyVariantCurrency: lemonVariantCurrency });

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <CreditCard size={18} />
        <div>
          <div className={styles.panelTitle}>Payments</div>
          <p className={styles.hint}>
            Configure billing infrastructure, checkout templates, and provider readiness.
          </p>
        </div>
      </header>

      {loading ? <p className={styles.hint}>Loading…</p> : null}

      {draft ? (
        <>
          <section className={styles.paymentsRail} aria-label="Payments control summary">
            <article className={styles.paymentsRailCard}>
              <span className={styles.paymentsRailIcon} aria-hidden><ShieldCheck size={14} /></span>
              <div className={styles.paymentsRailTitle}>Operations mode</div>
              <p className={styles.paymentsRailText}>Keep providers disabled until credentials and webhook endpoints are verified.</p>
            </article>
            <article className={styles.paymentsRailCard}>
              <span className={styles.paymentsRailIcon} aria-hidden><Wallet size={14} /></span>
              <div className={styles.paymentsRailTitle}>Pricing consistency</div>
              <p className={styles.paymentsRailText}>Match currency-specific lesson rates with package cards before saving live settings.</p>
            </article>
          </section>

          <section className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Default lesson price</div>
              <div className={styles.overviewValue}>{formatMoney(priceMinor, currency)}</div>
              <div className={styles.overviewHint}>Applied unless a student has an override.</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Payment methods</div>
              <div className={styles.overviewValue}>{enabledCount} / {methodStatuses.length} enabled</div>
              <div className={styles.overviewHint}>{configuredCount} configured for use right now.</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Checkout packages</div>
              <div className={styles.overviewValue}>{draft.config.packages.length}</div>
              <div className={styles.overviewHint}>Student self-serve packages from {minPackageLessons} lessons.</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Allowed currencies</div>
              <div className={styles.overviewValue}>{allowedCurrencies.join(', ')}</div>
              <div className={styles.overviewHint}>Default currency: {currency}</div>
            </div>
          </section>

          <PaymentsPricingSection
            draft={draft}
            currency={currency}
            priceMinor={priceMinor}
            allowedCurrencies={allowedCurrencies}
            pricePerLessonByCurrency={pricePerLessonByCurrency}
            minPackageLessons={minPackageLessons}
            currencyIssues={currencyIssues}
            onDraftChange={setDraft}
          />

          <PaymentsMethodSection
            methodStatuses={methodStatuses}
            allowedCurrencies={allowedCurrencies}
            lemonVariantCurrency={lemonVariantCurrency}
            providerSupportsCurrency={providerSupportsCurrency}
            onToggle={toggleMethod}
            onOpenConfig={setConfigMethod}
          />

          <PaymentsPackagesSection
            config={draft.config}
            currency={currency}
            priceMinor={priceMinor}
            minPackageLessons={minPackageLessons}
            onAdd={addPackage}
            onUpdate={updatePackage}
            onRemove={removePackage}
          />

          <section className={styles.readySection}>
            <div className={styles.pricingSectionHead}>
              <div>
                <h3 className={styles.sectionTitle}>Ready for students</h3>
                <p className={styles.hint}>Review package templates and fix currency issues before saving.</p>
              </div>
            </div>
            {draft.config.packages.length > 0 ? (
              <ul className={styles.readyPackageList}>
                {draft.config.packages.map((pkg) => {
                  const pkgCurrency = (pkg.currency ?? currency) as PaymentCurrencyCode;
                  const perLesson = getPricePerLessonForCurrency(draft.config, pkgCurrency);
                  return (
                    <li key={pkg.id} className={styles.readyPackageItem}>
                      <span>{pkg.label}</span>
                      <span>{pkg.lessons} lessons · {formatMoney(pkg.lessons * perLesson, pkgCurrency)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.hint}>Add at least one package template for online checkout.</p>
            )}
            {currencyIssues.length > 0 ? (
              <div className={styles.currencyWarning}>
                {currencyIssues.map((issue) => <p key={issue}>{issue}</p>)}
              </div>
            ) : (
              <p className={styles.readyOk}>Configuration looks good for student checkout.</p>
            )}
          </section>

          <div className={styles.actions}>
            <Button
              type="button"
              loading={saving}
              loadingLabel="Saving…"
              disabled={saving || currencyIssues.length > 0}
              onClick={() => void onSave()}
            >
              Save payment settings
            </Button>
            {currencyIssues.length > 0 ? (
              <p className={styles.actionStatusError}>Resolve currency compatibility warnings before saving.</p>
            ) : null}
            {error ? <p className={styles.actionStatusError}>{error}</p> : null}
            {success ? <p className={styles.actionStatusSuccess}>{success}</p> : null}
          </div>
        </>
      ) : null}

      {configMethod && draft ? (
        <PaymentMethodConfigModal
          method={configMethod}
          config={draft.config}
          secretStatuses={draft.secretStatuses}
          secretDraft={secretDraft}
          onChange={(config) => setDraft((current) => (current ? { ...current, config } : current))}
          onSecretsChange={setSecretDraft}
          onSave={() => void onSave()}
          saving={saving}
          onClose={() => setConfigMethod(null)}
        />
      ) : null}
    </SurfaceCard>
  );
}
