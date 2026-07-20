'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Field, Tabs } from '../../../components/ui';
import {
  DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
  getLemonSqueezyActiveVariantCurrency,
  getPricePerLessonForCurrency,
  PAYMENT_CURRENCY_OPTIONS,
  type LessonPriceByCurrencyDto,
  type PaymentConfigDto,
  type PaymentCurrencyCode,
  type PaymentSettingsDto,
  type SchoolGroupLessonsSettingsDto,
} from '@pkg/types';
import { formatMoney, groupBillingModeLabel, groupSplitModeLabel, syncDraftPricing } from './payment-panel-utils';
import styles from '../page.module.scss';

interface Props {
  draft: PaymentSettingsDto;
  currency: PaymentCurrencyCode;
  priceMinor: number;
  allowedCurrencies: PaymentCurrencyCode[];
  pricePerLessonByCurrency: LessonPriceByCurrencyDto[];
  minPackageLessons: number;
  currencyIssues: string[];
  onDraftChange: (next: PaymentSettingsDto) => void;
}

export function PaymentsPricingSection({
  draft,
  currency,
  priceMinor,
  allowedCurrencies,
  pricePerLessonByCurrency,
  minPackageLessons,
  currencyIssues,
  onDraftChange,
}: Props) {
  const [ratesTab, setRatesTab] = useState<'individual' | 'group'>('individual');

  const groupLessons = draft.config.groupLessons ?? DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS;
  const groupLessonsEnabled = groupLessons.enabled;
  const groupDefaultCurrency = (groupLessons.defaultCurrency ?? currency) as PaymentCurrencyCode;
  const groupDefaultPriceMinor = groupLessons.defaultPriceMinor ?? 0;
  const lemonVariantCurrency = getLemonSqueezyActiveVariantCurrency(draft.config.lemonsqueezy);

  const updatePriceForCurrency = (code: PaymentCurrencyCode, value: number) => {
    const nextRows: LessonPriceByCurrencyDto[] = allowedCurrencies.map((rowCurrency) => {
      const existing = pricePerLessonByCurrency.find((row) => row.currency === rowCurrency);
      const pricePerLessonMinor = rowCurrency === code ? Math.max(0, value) : (existing?.pricePerLessonMinor ?? 0);
      return { currency: rowCurrency, pricePerLessonMinor };
    });
    onDraftChange(syncDraftPricing(draft, {
      pricePerLessonByCurrency: nextRows,
      defaultPricePerLessonMinor: code === currency ? Math.max(0, value) : draft.config.defaultPricePerLessonMinor,
    }));
  };

  const toggleAllowedCurrency = (code: PaymentCurrencyCode) => {
    const next = allowedCurrencies.includes(code)
      ? allowedCurrencies.filter((c) => c !== code)
      : [...allowedCurrencies, code];
    const normalized = next.length > 0 ? next : [code];
    const defaultCurrency = normalized.includes(currency) ? currency : normalized[0];
    onDraftChange(syncDraftPricing(draft, { allowedCurrencies: normalized, defaultCurrency }));
  };

  const setDefaultCurrency = (nextCurrency: PaymentCurrencyCode) => {
    onDraftChange(syncDraftPricing(draft, { defaultCurrency: nextCurrency }));
  };

  const patchGroupLessons = (patch: Partial<SchoolGroupLessonsSettingsDto>) => {
    onDraftChange(syncDraftPricing(draft, { groupLessons: { ...groupLessons, ...patch } }));
  };

  return (
    <section className={styles.pricingSection}>
      <div className={styles.pricingSectionHead}>
        <div>
          <h3 className={styles.sectionTitle}>Currencies & lesson rates</h3>
          <p className={styles.hint}>
            Set individual lesson prices per currency and default billing rules for new learning groups.
          </p>
        </div>
      </div>

      <Tabs
        value={ratesTab}
        onValueChange={setRatesTab}
        keepMounted
        ariaLabel="Lesson rates"
        listClassName={styles.tabsList}
        triggerClassName={styles.tabsTrigger}
        activeTriggerClassName={styles.tabsTriggerActive}
        panelClassName={styles.tabsPanel}
        items={[
          {
            value: 'individual',
            label: 'Individual lessons',
            panel: (
              <IndividualRatesPanel
                draft={draft}
                currency={currency}
                priceMinor={priceMinor}
                allowedCurrencies={allowedCurrencies}
                pricePerLessonByCurrency={pricePerLessonByCurrency}
                minPackageLessons={minPackageLessons}
                currencyIssues={currencyIssues}
                lemonVariantCurrency={lemonVariantCurrency}
                onUpdatePrice={updatePriceForCurrency}
                onToggleCurrency={toggleAllowedCurrency}
                onSetDefaultCurrency={setDefaultCurrency}
                onSetMinLessons={(v) =>
                  onDraftChange({ ...draft, config: { ...draft.config, minPackageLessons: v } })
                }
              />
            ),
          },
          {
            value: 'group',
            label: 'Group payments',
            panel: (
              <GroupRatesPanel
                groupLessons={groupLessons}
                groupLessonsEnabled={groupLessonsEnabled}
                groupDefaultCurrency={groupDefaultCurrency}
                groupDefaultPriceMinor={groupDefaultPriceMinor}
                allowedCurrencies={allowedCurrencies}
                onPatch={patchGroupLessons}
              />
            ),
          },
        ]}
      />
    </section>
  );
}

interface IndividualRatesPanelProps {
  draft: PaymentSettingsDto;
  currency: PaymentCurrencyCode;
  priceMinor: number;
  allowedCurrencies: PaymentCurrencyCode[];
  pricePerLessonByCurrency: LessonPriceByCurrencyDto[];
  minPackageLessons: number;
  currencyIssues: string[];
  lemonVariantCurrency: string | null;
  onUpdatePrice: (code: PaymentCurrencyCode, value: number) => void;
  onToggleCurrency: (code: PaymentCurrencyCode) => void;
  onSetDefaultCurrency: (code: PaymentCurrencyCode) => void;
  onSetMinLessons: (v: number) => void;
}

function IndividualRatesPanel({
  draft, currency, priceMinor, allowedCurrencies, pricePerLessonByCurrency, minPackageLessons,
  currencyIssues, onUpdatePrice, onToggleCurrency, onSetDefaultCurrency, onSetMinLessons,
}: IndividualRatesPanelProps) {
  return (
    <div className={styles.pricingLayout}>
      <div className={styles.pricingMainCard}>
        <div className={styles.pricingHero}>
          <div>
            <div className={styles.pricingHeroLabel}>Default student lesson rate</div>
            <div className={styles.pricingHeroValue}>{formatMoney(priceMinor, currency)}</div>
            <p className={styles.hint}>This amount is used everywhere until a student gets an individual override.</p>
          </div>
          <div className={styles.pricingHeroStats}>
            <div className={styles.pricingHeroStat}><span className={styles.pricingHeroStatLabel}>Currency</span><strong>{currency}</strong></div>
            <div className={styles.pricingHeroStat}><span className={styles.pricingHeroStatLabel}>Min package</span><strong>{minPackageLessons} lessons</strong></div>
            <div className={styles.pricingHeroStat}><span className={styles.pricingHeroStatLabel}>Packages</span><strong>{draft.config.packages.length}</strong></div>
          </div>
        </div>

        <div className={styles.pricingControlGrid}>
          <div className={styles.pricingControlCard}>
            <div className={styles.pricingControlTop}><div><div className={styles.pricingControlEyebrow}>Pricing</div><div className={styles.pricingControlTitle}>Price per lesson by currency</div></div></div>
            <div className={styles.pricingControlText}>Enter the lesson price in minor units. Example: `45000` = `450.00 UAH`</div>
            <div className={styles.currencyPriceGrid}>
              {allowedCurrencies.map((code) => (
                <div key={code} className={styles.currencyPriceRow}>
                  <label className={styles.currencyPriceLabel} htmlFor={`price-${code}`}>
                    {code}
                    {code === currency ? <Badge variant="green" size="sm">Default</Badge> : null}
                  </label>
                  <Field id={`price-${code}`} type="number" className={styles.input} min={0} step={1}
                    value={String(pricePerLessonByCurrency.find((r) => r.currency === code)?.pricePerLessonMinor ?? getPricePerLessonForCurrency(draft.config, code))}
                    onChange={(e) => onUpdatePrice(code, Number.parseInt(e.target.value, 10) || 0)}
                  />
                  <span className={styles.hint}>
                    {formatMoney(pricePerLessonByCurrency.find((r) => r.currency === code)?.pricePerLessonMinor ?? getPricePerLessonForCurrency(draft.config, code), code)} per lesson
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.pricingControlCard}>
            <div className={styles.pricingControlTop}><div><div className={styles.pricingControlEyebrow}>Currencies</div><div className={styles.pricingControlTitle}>Allowed currencies</div></div></div>
            <div className={styles.currencyChecks}>
              {PAYMENT_CURRENCY_OPTIONS.map((code) => (
                <label key={code} className={styles.currencyCheck}>
                  <input type="checkbox" checked={allowedCurrencies.includes(code)} onChange={() => onToggleCurrency(code)} />
                  {code}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.pricingControlCard}>
            <div className={styles.pricingControlTop}><div><div className={styles.pricingControlEyebrow}>Rules</div><div className={styles.pricingControlTitle}>Package rules</div></div></div>
            <div className={styles.pricingInlineControls}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Default currency</label>
                <Field as="select" className={styles.input} value={currency}
                  onChange={(e) => onSetDefaultCurrency(e.target.value as PaymentCurrencyCode)}
                >
                  {allowedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}
                </Field>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="min-package-lessons">Min lessons</label>
                <Field id="min-package-lessons" type="number" className={styles.input} min={1} value={String(minPackageLessons)}
                  onChange={(e) => onSetMinLessons(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
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
          <p className={styles.hint}>Package totals are calculated as `lessons × lesson price`.</p>
        </div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>Currencies</div>
          <div className={styles.pricingBadgeList}>
            {allowedCurrencies.map((code) => (
              <Badge key={code} variant={code === currency ? 'green' : 'neutral'} size="sm">
                {code}: {formatMoney(getPricePerLessonForCurrency(draft.config, code), code)}
              </Badge>
            ))}
          </div>
          {currencyIssues.length > 0 ? (
            <div className={styles.currencyWarning}>
              {currencyIssues.map((issue) => <p key={issue}>{issue}</p>)}
            </div>
          ) : null}
        </div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>Quick preview</div>
          {draft.config.packages.length > 0 ? (
            <div className={styles.pricingPreviewList}>
              {draft.config.packages.slice(0, 3).map((pkg) => {
                const pkgCurrency = (pkg.currency ?? currency) as PaymentCurrencyCode;
                const perLesson = pkg.creditTrack === 'group'
                  ? (draft.config.groupLessons?.defaultPriceMinor ?? 0)
                  : getPricePerLessonForCurrency(draft.config, pkgCurrency);
                return (
                  <div key={pkg.id} className={styles.pricingPreviewRow}>
                    <span>{pkg.label} <Badge variant="neutral" size="sm">{pkgCurrency}</Badge></span>
                    <strong>{formatMoney(pkg.lessons * perLesson, pkgCurrency)}</strong>
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
  );
}

interface GroupRatesPanelProps {
  draft: PaymentSettingsDto;
  groupLessons: SchoolGroupLessonsSettingsDto;
  groupLessonsEnabled: boolean;
  groupDefaultCurrency: PaymentCurrencyCode;
  groupDefaultPriceMinor: number;
  allowedCurrencies: PaymentCurrencyCode[];
  onPatch: (patch: Partial<SchoolGroupLessonsSettingsDto>) => void;
}

function GroupRatesPanel({
  groupLessons, groupLessonsEnabled, groupDefaultCurrency, groupDefaultPriceMinor, allowedCurrencies, onPatch,
}: Omit<GroupRatesPanelProps, 'draft'>) {
  return (
    <div className={styles.pricingLayout}>
      <div className={styles.pricingMainCard}>
        <div className={styles.pricingHero}>
          <div>
            <div className={styles.pricingHeroLabel}>Default group billing</div>
            <div className={styles.pricingHeroValue}>
              {groupLessons.defaultBillingMode === 'per_member'
                ? '1 lesson credit per member'
                : formatMoney(groupDefaultPriceMinor, groupDefaultCurrency)}
            </div>
          </div>
          <div className={styles.pricingHeroStats}>
            <div className={styles.pricingHeroStat}>
              <span className={styles.pricingHeroStatLabel}>Billing mode</span>
              <strong>{groupBillingModeLabel(groupLessons.defaultBillingMode ?? 'per_member')}</strong>
            </div>
            {groupLessons.defaultBillingMode === 'fixed_total' ? (
              <>
                <div className={styles.pricingHeroStat}><span className={styles.pricingHeroStatLabel}>Currency</span><strong>{groupDefaultCurrency}</strong></div>
                <div className={styles.pricingHeroStat}><span className={styles.pricingHeroStatLabel}>Split</span><strong>{groupSplitModeLabel(groupLessons.defaultSplitMode ?? 'equal_split')}</strong></div>
              </>
            ) : (
              <div className={styles.pricingHeroStat}><span className={styles.pricingHeroStatLabel}>Feature</span><strong>{groupLessonsEnabled ? 'Enabled' : 'Disabled'}</strong></div>
            )}
          </div>
        </div>

        {groupLessonsEnabled ? (
          <div className={styles.pricingControlGrid}>
            <div className={styles.pricingControlCard}>
              <div className={styles.pricingControlTop}><div><div className={styles.pricingControlEyebrow}>Billing</div><div className={styles.pricingControlTitle}>How group lessons charge</div></div></div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="group-billing-mode">Billing mode</label>
                <Field id="group-billing-mode" as="select" className={styles.input}
                  value={groupLessons.defaultBillingMode}
                  onChange={(e) => onPatch({ defaultBillingMode: e.target.value as 'per_member' | 'fixed_total' })}
                >
                  <option value="per_member">Per student (lesson credit each)</option>
                  <option value="fixed_total">Fixed total per lesson</option>
                </Field>
              </div>
            </div>

            {groupLessons.defaultBillingMode === 'fixed_total' ? (
              <div className={styles.pricingControlCard}>
                <div className={styles.pricingControlTop}><div><div className={styles.pricingControlEyebrow}>Amount</div><div className={styles.pricingControlTitle}>Fixed lesson total</div></div></div>
                <div className={styles.pricingInlineControls}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="group-price-minor">Price (minor units)</label>
                    <Field id="group-price-minor" type="number" className={styles.input} min={0}
                      value={String(groupDefaultPriceMinor)}
                      onChange={(e) => onPatch({ defaultPriceMinor: Math.max(0, Number(e.target.value) || 0) })}
                    />
                    <span className={styles.hint}>{formatMoney(groupDefaultPriceMinor, groupDefaultCurrency)} per lesson</span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="group-currency">Currency</label>
                    <Field id="group-currency" as="select" className={styles.input} value={groupDefaultCurrency}
                      onChange={(e) => onPatch({ defaultCurrency: e.target.value as PaymentCurrencyCode })}
                    >
                      {allowedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}
                    </Field>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="group-split-mode">Split mode</label>
                    <Field id="group-split-mode" as="select" className={styles.input}
                      value={groupLessons.defaultSplitMode}
                      onChange={(e) => onPatch({ defaultSplitMode: e.target.value as 'equal_split' | 'single_payer' })}
                    >
                      <option value="equal_split">Split equally</option>
                      <option value="single_payer">Single payer (set on group)</option>
                    </Field>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={styles.pricingDisabledNotice}>
            <p className={styles.hint}>
              Group lessons are turned off. Enable them in <Link href="/system">System → General</Link> under Group lessons.
            </p>
          </div>
        )}
      </div>

      <aside className={styles.pricingSidebarCard}>
        <div className={styles.pricingSidebarTitle}>Group summary</div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>Default charge</div>
          <div className={styles.pricingSidebarValue}>
            {groupLessons.defaultBillingMode === 'per_member'
              ? '1 credit / member'
              : formatMoney(groupDefaultPriceMinor, groupDefaultCurrency)}
          </div>
        </div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>Billing mode</div>
          <Badge variant="neutral" size="sm">{groupBillingModeLabel(groupLessons.defaultBillingMode ?? 'per_member')}</Badge>
          {groupLessons.defaultBillingMode === 'fixed_total' ? (
            <div className={styles.pricingBadgeList}>
              <Badge variant="neutral" size="sm">{groupSplitModeLabel(groupLessons.defaultSplitMode ?? 'equal_split')}</Badge>
            </div>
          ) : null}
        </div>
        {!groupLessonsEnabled ? (
          <div className={styles.pricingSidebarBlock}>
            <div className={styles.pricingSidebarLabel}>Status</div>
            <Badge variant="neutral" size="sm">Feature disabled</Badge>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
