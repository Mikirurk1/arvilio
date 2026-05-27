'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Field, SurfaceCard } from '../../components/ui';
import { useBillingStore } from '../../stores/billing-store';
import {
  DEFAULT_MIN_PACKAGE_LESSONS,
  getLemonSqueezyActiveVariantCurrency,
  getPaymentSettingsCurrencyIssues,
  getPaymentProviderDisplayName,
  getPricePerLessonForCurrency,
  normalizePricePerLessonByCurrency,
  PAYMENT_CURRENCY_OPTIONS,
  PAYMENT_PROVIDER_CHECKOUT_CURRENCIES,
  providerSupportsCheckoutCurrency,
  type LessonPackageDto,
  type LessonPriceByCurrencyDto,
  type PaymentConfigDto,
  type PaymentCurrencyCode,
  type PaymentMethodKindDto,
  type PaymentSecretsDto,
  type PaymentSettingsDto,
} from '@pkg/types';
import { ApiError } from '../../lib/api';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodConfigModal } from './PaymentMethodConfigModal';
import styles from './page.module.scss';

function newPackageId(): string {
  return `pkg-${Date.now().toString(36)}`;
}

function formatMoney(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

function syncDraftPricing(
  draft: PaymentSettingsDto,
  patch: Partial<PaymentConfigDto>,
): PaymentSettingsDto {
  const merged = { ...draft.config, ...patch };
  const allowedCurrencies = merged.allowedCurrencies as PaymentCurrencyCode[];
  const defaultCurrency = allowedCurrencies.includes(
    merged.defaultCurrency as PaymentCurrencyCode,
  )
    ? (merged.defaultCurrency as PaymentCurrencyCode)
    : allowedCurrencies[0];
  const pricePerLessonByCurrency = normalizePricePerLessonByCurrency({
    allowedCurrencies,
    defaultCurrency,
    defaultPricePerLessonMinor: merged.defaultPricePerLessonMinor,
    pricePerLessonByCurrency: merged.pricePerLessonByCurrency ?? [],
  });
  const defaultPricePerLessonMinor =
    pricePerLessonByCurrency.find((row) => row.currency === defaultCurrency)?.pricePerLessonMinor ??
    0;
  const packages = (merged.packages ?? []).map((pkg) => {
    const raw = pkg.currency?.trim().toUpperCase();
    const pkgCurrency =
      raw && allowedCurrencies.includes(raw as PaymentCurrencyCode)
        ? raw
        : defaultCurrency;
    return { ...pkg, currency: pkgCurrency };
  });
  return {
    ...draft,
    config: {
      ...merged,
      allowedCurrencies,
      defaultCurrency,
      pricePerLessonByCurrency,
      defaultPricePerLessonMinor,
      packages,
    },
  };
}

function getProviderCurrencyHint(method: PaymentMethodKindDto): string {
  if (method === 'manual_invoice') return 'Any currency';
  if (method === 'lemonsqueezy') return 'Variant currency in Lemon Squeezy';
  return 'UAH, USD, EUR';
}

function getFeaturedPackageId(
  packages: Array<{ id: string; lessons: number }>,
): string | null {
  if (packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  return sorted[Math.floor(sorted.length / 2)]?.id ?? null;
}

function getPackageTone(
  packages: Array<{ id: string; lessons: number }>,
  packageId: string,
): 'starter' | 'popular' | 'premium' {
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  if (sorted.length <= 1) return 'popular';
  if (sorted[0]?.id === packageId) return 'starter';
  if (sorted[sorted.length - 1]?.id === packageId) return 'premium';
  return 'popular';
}

function getMethodModeFromConfig(
  method: PaymentMethodKindDto,
  config: PaymentConfigDto,
): 'live' | 'test' | null {
  if (method === 'stripe') return config.stripe?.mode ?? 'live';
  if (method === 'liqpay') return config.liqpay?.mode ?? 'live';
  if (method === 'wayforpay') return config.wayforpay?.mode ?? 'live';
  if (method === 'lemonsqueezy') return config.lemonsqueezy?.mode ?? 'live';
  if (method === 'paddle') return config.paddle?.mode ?? 'live';
  if (method === 'monopay') return config.monopay?.mode ?? 'live';
  if (method === 'paypal') return config.paypal?.mode ?? 'live';
  return null;
}

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

  useEffect(() => {
    void fetchPaymentSettings();
  }, [fetchPaymentSettings]);

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
          [
            'manual_invoice',
            'stripe',
            'liqpay',
            'wayforpay',
            'lemonsqueezy',
            'paddle',
            'monopay',
            'paypal',
          ] as PaymentMethodKindDto[]
        ).map((id) => ({
          id,
          enabled: draft.enabledMethods.includes(id),
          configured: false,
          configuredLabel: '',
          mode: getMethodModeFromConfig(id, draft.config),
        }));
  }, [draft]);
  const enabledCount = methodStatuses.filter((m) => m.enabled).length;
  const configuredCount = methodStatuses.filter((m) => m.configured).length;

  const toggleMethod = (method: PaymentMethodKindDto) => {
    if (!draft) return;
    const enabled = draft.enabledMethods.includes(method)
      ? draft.enabledMethods.filter((m) => m !== method)
      : [...draft.enabledMethods, method];
    setDraft({ ...draft, enabledMethods: enabled });
  };

  const addPackage = () => {
    if (!draft) return;
    const minLessons = draft?.config.minPackageLessons ?? DEFAULT_MIN_PACKAGE_LESSONS;
    const pkg: LessonPackageDto = {
      id: newPackageId(),
      lessons: minLessons,
      label: `${minLessons} lessons`,
      currency,
    };
    setDraft({
      ...draft,
      config: { ...draft.config, packages: [...draft.config.packages, pkg] },
    });
  };

  const updatePackage = (index: number, patch: Partial<LessonPackageDto>) => {
    if (!draft) return;
    const packages = draft.config.packages.map((p, i) =>
      i === index ? { ...p, ...patch } : p,
    );
    setDraft(syncDraftPricing(draft, { packages }));
  };

  const removePackage = (index: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      config: {
        ...draft.config,
        packages: draft.config.packages.filter((_, i) => i !== index),
      },
    });
  };

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

  const loading = slice.status === 'loading' || !draft;
  const currency = (draft?.config.defaultCurrency ?? 'UAH') as PaymentCurrencyCode;
  const priceMinor = draft ? getPricePerLessonForCurrency(draft.config, currency) : 0;
  const allowedCurrencies = (draft?.config.allowedCurrencies ?? []) as PaymentCurrencyCode[];
  const pricePerLessonByCurrency = draft?.config.pricePerLessonByCurrency ?? [];
  const minPackageLessons = draft?.config.minPackageLessons ?? DEFAULT_MIN_PACKAGE_LESSONS;
  const featuredPackageId = getFeaturedPackageId(draft?.config.packages ?? []);
  const currencyIssues = useMemo(() => {
    if (!draft) return [];
    return getPaymentSettingsCurrencyIssues({
      enabledMethods: draft.enabledMethods,
      config: draft.config,
    });
  }, [draft]);
  const lemonVariantCurrency = draft
    ? getLemonSqueezyActiveVariantCurrency(draft.config.lemonsqueezy)
    : null;
  const providerSupportsCurrency = (method: PaymentMethodKindDto, code: PaymentCurrencyCode) =>
    providerSupportsCheckoutCurrency(method, code, {
      lemonSqueezyVariantCurrency: lemonVariantCurrency,
    });

  const updatePriceForCurrency = (code: PaymentCurrencyCode, value: number) => {
    if (!draft) return;
    const nextRows: LessonPriceByCurrencyDto[] = allowedCurrencies.map((rowCurrency) => {
      const existing = pricePerLessonByCurrency.find((row) => row.currency === rowCurrency);
      const pricePerLessonMinor =
        rowCurrency === code
          ? Math.max(0, value)
          : (existing?.pricePerLessonMinor ?? 0);
      return { currency: rowCurrency, pricePerLessonMinor };
    });
    setDraft(
      syncDraftPricing(draft, {
        pricePerLessonByCurrency: nextRows,
        defaultPricePerLessonMinor:
          code === currency ? Math.max(0, value) : draft.config.defaultPricePerLessonMinor,
      }),
    );
  };

  const toggleAllowedCurrency = (code: PaymentCurrencyCode) => {
    if (!draft) return;
    const next = allowedCurrencies.includes(code)
      ? allowedCurrencies.filter((c) => c !== code)
      : [...allowedCurrencies, code];
    const normalized = next.length > 0 ? next : [code];
    const defaultCurrency = normalized.includes(currency) ? currency : normalized[0];
    setDraft(syncDraftPricing(draft, { allowedCurrencies: normalized, defaultCurrency }));
  };

  const setDefaultCurrency = (nextCurrency: PaymentCurrencyCode) => {
    if (!draft) return;
    setDraft(syncDraftPricing(draft, { defaultCurrency: nextCurrency }));
  };

  return (
    <SurfaceCard className={styles.card}>
      <header className={styles.panelHeader}>
        <CreditCard size={18} />
        <div>
          <div className={styles.panelTitle}>Payments</div>
          <p className={styles.hint}>
            Enable payment methods and set the default price per lesson. Students can have an
            individual price override on their profile.
          </p>
        </div>
      </header>

      {loading ? <p className={styles.hint}>Loading…</p> : null}

      {draft ? (
        <>
          <section className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Default lesson price</div>
              <div className={styles.overviewValue}>{formatMoney(priceMinor, currency)}</div>
              <div className={styles.overviewHint}>Applied unless a student has an override.</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Payment methods</div>
              <div className={styles.overviewValue}>
                {enabledCount} / {methodStatuses.length} enabled
              </div>
              <div className={styles.overviewHint}>
                {configuredCount} configured for use right now.
              </div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Checkout packages</div>
              <div className={styles.overviewValue}>{draft.config.packages.length}</div>
              <div className={styles.overviewHint}>
                Student self-serve packages from {minPackageLessons} lessons.
              </div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewLabel}>Allowed currencies</div>
              <div className={styles.overviewValue}>{allowedCurrencies.join(', ')}</div>
              <div className={styles.overviewHint}>Default currency: {currency}</div>
            </div>
          </section>

          <section className={styles.pricingSection}>
            <div className={styles.pricingSectionHead}>
              <div>
                <h3 className={styles.sectionTitle}>Currencies & lesson rates</h3>
                <p className={styles.hint}>
                  Set a separate lesson price per allowed currency — this is not automatic conversion.
                  Students see package totals in the currency you assign to each template.
                </p>
              </div>
            </div>

            <div className={styles.pricingLayout}>
              <div className={styles.pricingMainCard}>
                <div className={styles.pricingHero}>
                  <div>
                    <div className={styles.pricingHeroLabel}>Default student lesson rate</div>
                    <div className={styles.pricingHeroValue}>{formatMoney(priceMinor, currency)}</div>
                    <p className={styles.hint}>
                      This amount is used everywhere until a student gets an individual override.
                    </p>
                  </div>
                  <div className={styles.pricingHeroStats}>
                    <div className={styles.pricingHeroStat}>
                      <span className={styles.pricingHeroStatLabel}>Currency</span>
                      <strong>{currency}</strong>
                    </div>
                    <div className={styles.pricingHeroStat}>
                      <span className={styles.pricingHeroStatLabel}>Min package</span>
                      <strong>{minPackageLessons} lessons</strong>
                    </div>
                    <div className={styles.pricingHeroStat}>
                      <span className={styles.pricingHeroStatLabel}>Packages</span>
                      <strong>{draft.config.packages.length}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.pricingControlGrid}>
                  <div className={styles.pricingControlCard}>
                    <div className={styles.pricingControlTop}>
                      <div>
                        <div className={styles.pricingControlEyebrow}>Pricing</div>
                        <div className={styles.pricingControlTitle}>Price per lesson by currency</div>
                      </div>
                    </div>
                    <div className={styles.pricingControlText}>
                      Enter the lesson price in minor units for each allowed currency. Example for
                      UAH: `45000` = `450.00 UAH`; for USD: `1200` = `12.00 USD`.
                    </div>
                    <div className={styles.currencyPriceGrid}>
                      {allowedCurrencies.map((code) => (
                        <div key={code} className={styles.currencyPriceRow}>
                          <label className={styles.currencyPriceLabel} htmlFor={`price-${code}`}>
                            {code}
                            {code === currency ? (
                              <Badge variant="green" size="sm">
                                Default
                              </Badge>
                            ) : null}
                          </label>
                          <Field
                            id={`price-${code}`}
                            type="number"
                            className={styles.input}
                            min={0}
                            step={1}
                            value={String(
                              pricePerLessonByCurrency.find((row) => row.currency === code)
                                ?.pricePerLessonMinor ??
                                getPricePerLessonForCurrency(draft.config, code),
                            )}
                            onChange={(e) =>
                              updatePriceForCurrency(
                                code,
                                Number.parseInt(e.target.value, 10) || 0,
                              )
                            }
                          />
                          <span className={styles.hint}>
                            {formatMoney(
                              pricePerLessonByCurrency.find((row) => row.currency === code)
                                ?.pricePerLessonMinor ??
                                getPricePerLessonForCurrency(draft.config, code),
                              code,
                            )}{' '}
                            per lesson
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.pricingControlCard}>
                    <div className={styles.pricingControlTop}>
                      <div>
                        <div className={styles.pricingControlEyebrow}>Currencies</div>
                        <div className={styles.pricingControlTitle}>Allowed currencies</div>
                      </div>
                    </div>
                    <div className={styles.pricingControlText}>
                      Pick which currencies the school supports. Each one needs its own lesson price
                      above.
                    </div>
                    <div className={styles.currencyChecks}>
                      {PAYMENT_CURRENCY_OPTIONS.map((code) => (
                        <label key={code} className={styles.currencyCheck}>
                          <input
                            type="checkbox"
                            checked={allowedCurrencies.includes(code)}
                            onChange={() => toggleAllowedCurrency(code)}
                          />
                          {code}
                        </label>
                      ))}
                    </div>
                    {methodStatuses.some((method) => method.enabled) ? (
                      <div className={styles.providerCurrencyHints}>
                        {methodStatuses
                          .filter((method) => method.enabled)
                          .map((method) => (
                            <div key={method.id} className={styles.providerCurrencyHint}>
                              <strong>{method.id.replace('_', ' ')}</strong>
                              <span>{getProviderCurrencyHint(method.id)}</span>
                              {allowedCurrencies.some(
                                (code) => !providerSupportsCurrency(method.id, code),
                              ) ? (
                                <span className={styles.providerCurrencyHintWarn}>
                                  Not compatible with all selected currencies
                                </span>
                              ) : null}
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.pricingControlCard}>
                    <div className={styles.pricingControlTop}>
                      <div>
                        <div className={styles.pricingControlEyebrow}>Rules</div>
                        <div className={styles.pricingControlTitle}>Package rules</div>
                      </div>
                    </div>
                    <div className={styles.pricingControlText}>
                      Default currency and minimum package size for self-serve checkout.
                    </div>
                    <div className={styles.pricingInlineControls}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Default currency</label>
                        <Field
                          as="select"
                          className={styles.input}
                          value={currency}
                          onChange={(e) => setDefaultCurrency(e.target.value as PaymentCurrencyCode)}
                        >
                          {allowedCurrencies.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Min lessons</label>
                        <Field
                          type="number"
                          className={styles.input}
                          min={1}
                          value={String(minPackageLessons)}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              config: {
                                ...draft.config,
                                minPackageLessons: Math.max(
                                  1,
                                  Number.parseInt(e.target.value, 10) || 1,
                                ),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className={styles.pricingSidebarCard}>
                <div className={styles.pricingSidebarTitle}>Live summary</div>
                <div className={styles.pricingSidebarBlock}>
                  <div className={styles.pricingSidebarLabel}>What students see</div>
                  <div className={styles.pricingSidebarValue}>{formatMoney(priceMinor, currency)}</div>
                  <p className={styles.hint}>
                    Package totals are calculated automatically as `lessons × lesson price`.
                  </p>
                </div>

                <div className={styles.pricingSidebarBlock}>
                  <div className={styles.pricingSidebarLabel}>Currencies</div>
                  <div className={styles.pricingBadgeList}>
                    {allowedCurrencies.map((code) => (
                      <Badge key={code} variant={code === currency ? 'green' : 'neutral'} size="sm">
                        {code}:{' '}
                        {formatMoney(getPricePerLessonForCurrency(draft.config, code), code)}
                      </Badge>
                    ))}
                  </div>
                  {currencyIssues.length > 0 ? (
                    <div className={styles.currencyWarning}>
                      {currencyIssues.map((issue) => (
                        <p key={issue}>{issue}</p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className={styles.pricingSidebarBlock}>
                  <div className={styles.pricingSidebarLabel}>Quick preview</div>
                  {draft.config.packages.length > 0 ? (
                    <div className={styles.pricingPreviewList}>
                      {draft.config.packages.slice(0, 3).map((pkg) => {
                        const pkgCurrency = (pkg.currency ?? currency) as PaymentCurrencyCode;
                        const perLesson = getPricePerLessonForCurrency(draft.config, pkgCurrency);
                        return (
                        <div key={pkg.id} className={styles.pricingPreviewRow}>
                          <span>
                            {pkg.label}{' '}
                            <Badge variant="neutral" size="sm">
                              {pkgCurrency}
                            </Badge>
                          </span>
                          <strong>
                            {formatMoney(pkg.lessons * perLesson, pkgCurrency)}
                          </strong>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.pricingPreviewEmpty}>Add packages to preview totals.</div>
                  )}
                </div>
              </aside>
            </div>
          </section>

          <section className={styles.methodSection}>
            <div className={styles.pricingSectionHead}>
              <div>
                <h3 className={styles.sectionTitle}>Payment methods</h3>
                <p className={styles.hint}>
                  Enable providers and configure credentials. Checkout currencies per provider are
                  listed below.
                </p>
              </div>
            </div>
            <div className={styles.methodGrid}>
              {methodStatuses.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onToggleEnabled={() => toggleMethod(method.id)}
                  onOpenConfig={() => setConfigMethod(method.id)}
                />
              ))}
            </div>
            <div className={styles.providerCurrencyMatrix}>
              <div className={styles.providerCurrencyMatrixTitle}>Checkout currency support</div>
              <div className={styles.providerCurrencyMatrixRows}>
                {(
                  [
                    'stripe',
                    'paypal',
                    'paddle',
                    'liqpay',
                    'wayforpay',
                    'monopay',
                    'lemonsqueezy',
                  ] as PaymentMethodKindDto[]
                ).map((methodId) => {
                  const supported = PAYMENT_PROVIDER_CHECKOUT_CURRENCIES[methodId];
                  const label =
                    supported === 'variant'
                      ? lemonVariantCurrency
                        ? `Variant: ${lemonVariantCurrency}`
                        : 'Set variant currency in method config'
                      : supported.join(', ');
                  return (
                    <div key={methodId} className={styles.providerCurrencyMatrixRow}>
                      <strong>{getPaymentProviderDisplayName(methodId)}</strong>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className={styles.packagesSection}>
            <div className={styles.packagesHeader}>
              <div>
                <h4 className={styles.packagesTitle}>
                  Self-serve lesson packages (from {minPackageLessons} lessons)
                </h4>
                <p className={styles.hint}>
                  Each template has its own currency. Students pick a ready-made card (e.g. 10 lessons
                  · 4500 UAH vs 10 lessons · 120 USD).
                </p>
              </div>
              <Button type="button" variant="ghost" startIcon={<Plus size={16} />} onClick={addPackage}>
                Add package
              </Button>
            </div>

            {draft.config.packages.length === 0 ? (
              <p className={styles.hint}>No packages yet. Add at least one for online checkout.</p>
            ) : (
              <div className={styles.packagesTableWrap}>
                <div className={styles.packageStatsRow}>
                  <div className={styles.packageStatCard}>
                    <span className={styles.packageStatLabel}>Package templates</span>
                    <strong>{draft.config.packages.length}</strong>
                  </div>
                  <div className={styles.packageStatCard}>
                    <span className={styles.packageStatLabel}>Minimum size</span>
                    <strong>{minPackageLessons} lessons</strong>
                  </div>
                  <div className={styles.packageStatCard}>
                    <span className={styles.packageStatLabel}>Default checkout rate</span>
                    <strong>{formatMoney(priceMinor, currency)}</strong>
                  </div>
                </div>

                <div className={styles.packagesTable}>
                  {draft.config.packages.map((pkg, index) => {
                    const pkgCurrency = (pkg.currency ?? currency) as PaymentCurrencyCode;
                    const perLesson = getPricePerLessonForCurrency(draft.config, pkgCurrency);
                    const total = pkg.lessons * perLesson;
                    const tone = getPackageTone(draft.config.packages, pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        className={`${styles.packageRowCard} ${
                          pkg.id === featuredPackageId ? styles.packageRowCardFeatured : ''
                        } ${tone === 'starter' ? styles.packageRowCardStarter : ''} ${
                          tone === 'popular' ? styles.packageRowCardPopular : ''
                        } ${tone === 'premium' ? styles.packageRowCardPremium : ''}`}
                      >
                        <div className={styles.packageRowAccent} />
                        <div className={styles.packageRowMeta}>
                          <div className={styles.packageRowTitleWrap}>
                            <div className={styles.packageRowEyebrow}>
                              {tone === 'starter'
                                ? 'Starter'
                                : tone === 'premium'
                                  ? 'Premium'
                                  : 'Popular choice'}
                            </div>
                            <div className={styles.packageRowTitle}>
                              {pkg.label || `Package ${index + 1}`}
                            </div>
                            <div className={styles.packageRowBadges}>
                              {pkg.id === featuredPackageId ? (
                                <Badge variant="green" size="sm">
                                  Recommended
                                </Badge>
                              ) : null}
                              <Badge variant={tone === 'premium' ? 'rose' : 'blue'} size="sm">
                                Template #{index + 1}
                              </Badge>
                              <Badge variant="neutral" size="sm">
                                {pkg.lessons} lessons
                              </Badge>
                              <Badge variant="blue" size="sm">
                                {pkgCurrency}
                              </Badge>
                            </div>
                          </div>
                          <div className={styles.packageTotal}>{formatMoney(total, pkgCurrency)}</div>
                        </div>

                        <div className={styles.packageRowSubmeta}>
                          <span>{formatMoney(perLesson, pkgCurrency)} per lesson</span>
                          <span>Student checkout total = lessons × lesson price ({pkgCurrency})</span>
                        </div>

                        <div className={styles.packageRowControls}>
                          <div className={styles.packageFieldCard}>
                            <span className={styles.packageFieldLabel}>Currency</span>
                            <Field
                              as="select"
                              className={styles.input}
                              value={pkgCurrency}
                              onChange={(e) =>
                                updatePackage(index, {
                                  currency: e.target.value as PaymentCurrencyCode,
                                })
                              }
                            >
                              {allowedCurrencies.map((code) => (
                                <option key={code} value={code}>
                                  {code}
                                </option>
                              ))}
                            </Field>
                          </div>

                          <div className={styles.packageFieldCard}>
                            <span className={styles.packageFieldLabel}>Package label</span>
                            <Field
                              className={styles.input}
                              placeholder="Label"
                              value={pkg.label}
                              onChange={(e) => updatePackage(index, { label: e.target.value })}
                            />
                          </div>

                          <div className={styles.packageFieldCard}>
                            <span className={styles.packageFieldLabel}>Lessons in package</span>
                            <Field
                              type="number"
                              className={styles.input}
                              min={minPackageLessons}
                              placeholder="Lessons"
                              value={String(pkg.lessons)}
                              onChange={(e) =>
                                updatePackage(index, {
                                  lessons: Math.max(
                                    minPackageLessons,
                                    Number.parseInt(e.target.value, 10) || minPackageLessons,
                                  ),
                                })
                              }
                            />
                            <span className={styles.packageHint}>
                              Must stay at or above the platform minimum.
                            </span>
                          </div>

                          <div className={styles.packageFieldSummary}>
                            <span className={styles.packageFieldLabel}>Live total</span>
                            <strong>{formatMoney(total, pkgCurrency)}</strong>
                            <span className={styles.packageHint}>
                              {pkg.lessons} × {formatMoney(perLesson, pkgCurrency)}
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            aria-label="Remove package"
                            onClick={() => removePackage(index)}
                          >
                            <Trash2 size={16} aria-hidden />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className={styles.readySection}>
            <div className={styles.pricingSectionHead}>
              <div>
                <h3 className={styles.sectionTitle}>Ready for students</h3>
                <p className={styles.hint}>
                  Review package templates and fix currency issues before saving.
                </p>
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
                        {pkg.lessons} lessons · {formatMoney(pkg.lessons * perLesson, pkgCurrency)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.hint}>Add at least one package template for online checkout.</p>
            )}
            {currencyIssues.length > 0 ? (
              <div className={styles.currencyWarning}>
                {currencyIssues.map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
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
          onChange={(config) =>
            setDraft((current) => (current ? { ...current, config } : current))
          }
          onSecretsChange={setSecretDraft}
          onSave={() => void onSave()}
          saving={saving}
          onClose={() => setConfigMethod(null)}
        />
      ) : null}
    </SurfaceCard>
  );
}
