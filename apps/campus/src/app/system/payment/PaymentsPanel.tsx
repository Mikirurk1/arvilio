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
import { ApiError, apiClient } from '../../../lib/api';
import type { PublicSellerProfile } from '../../../lib/seller-profile';
import { useCampusT } from '../../../lib/cms';
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

const ONLINE_PSP: PaymentMethodKindDto[] = [
  'stripe',
  'liqpay',
  'wayforpay',
  'lemonsqueezy',
  'paddle',
  'monopay',
  'paypal',
];

export function PaymentsPanel() {
  const t = useCampusT();
  const fetchPaymentSettings = useBillingStore((s) => s.fetchPaymentSettings);
  const updatePaymentSettings = useBillingStore((s) => s.updatePaymentSettings);
  const slice = useBillingStore((s) => s.paymentSettings);

  const [draft, setDraft] = useState<PaymentSettingsDto | null>(null);
  const [secretDraft, setSecretDraft] = useState<PaymentSecretsDto>({});
  const [configMethod, setConfigMethod] = useState<PaymentMethodKindDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sellerComplete, setSellerComplete] = useState<boolean | null>(null);

  useEffect(() => { void fetchPaymentSettings(); }, [fetchPaymentSettings]);

  useEffect(() => {
    void apiClient
      .get<PublicSellerProfile>('/school/seller-profile')
      .then((s) => setSellerComplete(s.isComplete))
      .catch(() => setSellerComplete(null));
  }, []);

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

  const onlineEnabled = draft?.enabledMethods.some((m) => ONLINE_PSP.includes(m)) ?? false;
  const sellerGateWarning = sellerComplete === false;

  const onSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updatePaymentSettings({ ...draft, secrets: secretDraft });
      setSecretDraft({});
      setSuccess(t('system.payments.saved'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : t('system.payments.error.save'));
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
    <SurfaceCard className={styles.card} data-tour-anchor="system-tab-payments">
      <header className={styles.panelHeader}>
        <CreditCard size={18} />
        <div>
          <div className={styles.panelTitle}>{t('system.payments.title')}</div>
          <p className={styles.hint}>{t('system.payments.subtitle')}</p>
        </div>
      </header>

      {loading ? <p className={styles.hint}>{t('common.loading')}</p> : null}

      {sellerGateWarning ? (
        <p className={styles.actionStatusError} role="status">
          {t('system.payments.sellerGateBefore')}{' '}
          <strong>{t('system.payments.sellerGateLink')}</strong>{' '}
          {t('system.payments.sellerGateAfter')}
          {onlineEnabled ? t('system.payments.sellerGateOnlineSuffix') : ''}.
        </p>
      ) : null}

      {draft ? (
        <>
          <section className={styles.paymentsRail} aria-label={t('system.payments.summaryAria')}>
            <article className={styles.paymentsRailCard}>
              <span className={styles.paymentsRailIcon} aria-hidden><ShieldCheck size={14} /></span>
              <div className={styles.paymentsRailTitle}>{t('system.payments.rail.operationsTitle')}</div>
              <p className={styles.paymentsRailText}>{t('system.payments.rail.operationsText')}</p>
            </article>
            <article className={styles.paymentsRailCard}>
              <span className={styles.paymentsRailIcon} aria-hidden><Wallet size={14} /></span>
              <div className={styles.paymentsRailTitle}>{t('system.payments.rail.pricingTitle')}</div>
              <p className={styles.paymentsRailText}>{t('system.payments.rail.pricingText')}</p>
            </article>
          </section>

          <section className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>{t('system.payments.overview.defaultLessonPrice')}</div>
              <div className={styles.overviewValue}>{formatMoney(priceMinor, currency)}</div>
              <div className={styles.overviewHint}>{t('system.payments.overview.defaultLessonHint')}</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>{t('system.payments.overview.methodsLabel')}</div>
              <div className={styles.overviewValue}>
                {t('system.payments.overview.methodsEnabled', { enabled: enabledCount, total: methodStatuses.length })}
              </div>
              <div className={styles.overviewHint}>
                {t('system.payments.overview.methodsConfigured', { count: configuredCount })}
              </div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>{t('system.payments.overview.packagesLabel')}</div>
              <div className={styles.overviewValue}>{draft.config.packages.length}</div>
              <div className={styles.overviewHint}>
                {t('system.payments.overview.packagesHint', { min: minPackageLessons })}
              </div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>{t('system.payments.overview.currenciesLabel')}</div>
              <div className={styles.overviewValue}>{allowedCurrencies.join(', ')}</div>
              <div className={styles.overviewHint}>
                {t('system.payments.overview.defaultCurrency', { currency })}
              </div>
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
                <h3 className={styles.sectionTitle}>{t('system.payments.ready.title')}</h3>
                <p className={styles.hint}>{t('system.payments.ready.hint')}</p>
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
                      <span>
                        {t('system.payments.ready.packageLine', {
                          lessons: pkg.lessons,
                          total: formatMoney(pkg.lessons * perLesson, pkgCurrency),
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.hint}>{t('system.payments.ready.noPackages')}</p>
            )}
            {currencyIssues.length > 0 ? (
              <div className={styles.currencyWarning}>
                {currencyIssues.map((issue) => <p key={issue}>{issue}</p>)}
              </div>
            ) : (
              <p className={styles.readyOk}>{t('system.payments.ready.configOk')}</p>
            )}
          </section>

          <div className={styles.actions}>
            <Button
              type="button"
              loading={saving}
              loadingLabel={t('system.payments.saving')}
              disabled={saving || currencyIssues.length > 0}
              onClick={() => void onSave()}
            >
              {t('system.payments.save')}
            </Button>
            {currencyIssues.length > 0 ? (
              <p className={styles.actionStatusError}>{t('system.payments.resolveCurrencyWarnings')}</p>
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
