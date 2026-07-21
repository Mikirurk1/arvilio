'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Field, Tabs } from '../../../components/ui';
import {
  DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
  getPricePerLessonForCurrency,
  PAYMENT_CURRENCY_OPTIONS,
  type LessonPriceByCurrencyDto,
  type PaymentCurrencyCode,
  type PaymentSettingsDto,
  type SchoolGroupLessonsSettingsDto,
} from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
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
  const t = useCampusT();
  const [ratesTab, setRatesTab] = useState<'individual' | 'group'>('individual');

  const groupLessons = draft.config.groupLessons ?? DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS;
  const groupLessonsEnabled = groupLessons.enabled;
  const groupDefaultCurrency = (groupLessons.defaultCurrency ?? currency) as PaymentCurrencyCode;
  const groupDefaultPriceMinor = groupLessons.defaultPriceMinor ?? 0;
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
          <h3 className={styles.sectionTitle}>{t('system.payments.pricing.title')}</h3>
          <p className={styles.hint}>{t('system.payments.pricing.subtitle')}</p>
        </div>
      </div>

      <Tabs
        value={ratesTab}
        onValueChange={setRatesTab}
        keepMounted
        ariaLabel={t('system.payments.pricing.ratesTabAria')}
        listClassName={styles.tabsList}
        triggerClassName={styles.tabsTrigger}
        activeTriggerClassName={styles.tabsTriggerActive}
        panelClassName={styles.tabsPanel}
        items={[
          {
            value: 'individual',
            label: t('students.detail.billing.individualLessons'),
            panel: (
              <IndividualRatesPanel
                draft={draft}
                currency={currency}
                priceMinor={priceMinor}
                allowedCurrencies={allowedCurrencies}
                pricePerLessonByCurrency={pricePerLessonByCurrency}
                minPackageLessons={minPackageLessons}
                currencyIssues={currencyIssues}
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
            label: t('system.payments.pricing.groupTab'),
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
  onUpdatePrice: (code: PaymentCurrencyCode, value: number) => void;
  onToggleCurrency: (code: PaymentCurrencyCode) => void;
  onSetDefaultCurrency: (code: PaymentCurrencyCode) => void;
  onSetMinLessons: (v: number) => void;
}

function IndividualRatesPanel({
  draft, currency, priceMinor, allowedCurrencies, pricePerLessonByCurrency, minPackageLessons,
  currencyIssues, onUpdatePrice, onToggleCurrency, onSetDefaultCurrency, onSetMinLessons,
}: IndividualRatesPanelProps) {
  const t = useCampusT();

  return (
    <div className={styles.pricingLayout}>
      <div className={styles.pricingMainCard}>
        <div className={styles.pricingHero}>
          <div>
            <div className={styles.pricingHeroLabel}>{t('system.payments.pricing.defaultStudentRate')}</div>
            <div className={styles.pricingHeroValue}>{formatMoney(priceMinor, currency)}</div>
            <p className={styles.hint}>{t('system.payments.pricing.defaultStudentHint')}</p>
          </div>
          <div className={styles.pricingHeroStats}>
            <div className={styles.pricingHeroStat}>
              <span className={styles.pricingHeroStatLabel}>{t('students.groups.editor.currencyLabel')}</span>
              <strong>{currency}</strong>
            </div>
            <div className={styles.pricingHeroStat}>
              <span className={styles.pricingHeroStatLabel}>{t('system.payments.pricing.minPackage')}</span>
              <strong>{t('students.detail.billing.lessonsCount', { count: minPackageLessons })}</strong>
            </div>
            <div className={styles.pricingHeroStat}>
              <span className={styles.pricingHeroStatLabel}>{t('students.detail.billing.tagPackages')}</span>
              <strong>{draft.config.packages.length}</strong>
            </div>
          </div>
        </div>

        <div className={styles.pricingControlGrid}>
          <div className={styles.pricingControlCard}>
            <div className={styles.pricingControlTop}>
              <div>
                <div className={styles.pricingControlEyebrow}>{t('system.payments.pricing.eyebrow.pricing')}</div>
                <div className={styles.pricingControlTitle}>{t('system.payments.pricing.priceByCurrency')}</div>
              </div>
            </div>
            <div className={styles.pricingControlText}>{t('system.payments.pricing.priceByCurrencyHint')}</div>
            <div className={styles.currencyPriceGrid}>
              {allowedCurrencies.map((code) => (
                <div key={code} className={styles.currencyPriceRow}>
                  <label className={styles.currencyPriceLabel} htmlFor={`price-${code}`}>
                    {code}
                    {code === currency ? <Badge variant="green" size="sm">{t('system.payments.pricing.defaultBadge')}</Badge> : null}
                  </label>
                  <Field id={`price-${code}`} type="number" className={styles.input} min={0} step={1}
                    value={String(pricePerLessonByCurrency.find((r) => r.currency === code)?.pricePerLessonMinor ?? getPricePerLessonForCurrency(draft.config, code))}
                    onChange={(e) => onUpdatePrice(code, Number.parseInt(e.target.value, 10) || 0)}
                  />
                  <span className={styles.hint}>
                    {formatMoney(pricePerLessonByCurrency.find((r) => r.currency === code)?.pricePerLessonMinor ?? getPricePerLessonForCurrency(draft.config, code), code)}{' '}
                    {t('students.detail.billing.perLesson')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.pricingControlCard}>
            <div className={styles.pricingControlTop}>
              <div>
                <div className={styles.pricingControlEyebrow}>{t('system.payments.pricing.eyebrow.currencies')}</div>
                <div className={styles.pricingControlTitle}>{t('system.payments.pricing.allowedCurrencies')}</div>
              </div>
            </div>
            <div className={styles.currencyChecks}>
              {PAYMENT_CURRENCY_OPTIONS.map((code) => (
                <Field
                  key={code}
                  as="checkbox"
                  checked={allowedCurrencies.includes(code)}
                  onChange={() => onToggleCurrency(code)}
                  label={code}
                  rootClassName={styles.currencyCheck}
                />
              ))}
            </div>
          </div>

          <div className={styles.pricingControlCard}>
            <div className={styles.pricingControlTop}>
              <div>
                <div className={styles.pricingControlEyebrow}>{t('system.payments.pricing.eyebrow.rules')}</div>
                <div className={styles.pricingControlTitle}>{t('system.payments.pricing.packageRules')}</div>
              </div>
            </div>
            <div className={styles.pricingInlineControls}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('students.groups.editor.currencyLabel')}</label>
                <Field as="select" className={styles.input} value={currency}
                  onChange={(e) => onSetDefaultCurrency(e.target.value as PaymentCurrencyCode)}
                >
                  {allowedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}
                </Field>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="min-package-lessons">{t('system.payments.pricing.minLessons')}</label>
                <Field id="min-package-lessons" type="number" className={styles.input} min={1} value={String(minPackageLessons)}
                  onChange={(e) => onSetMinLessons(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className={styles.pricingSidebarCard}>
        <div className={styles.pricingSidebarTitle}>{t('system.payments.pricing.liveSummary')}</div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>{t('system.payments.pricing.whatStudentsSee')}</div>
          <div className={styles.pricingSidebarValue}>{formatMoney(priceMinor, currency)}</div>
          <p className={styles.hint}>{t('system.payments.pricing.packageTotalsHint')}</p>
        </div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>{t('system.payments.pricing.eyebrow.currencies')}</div>
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
          <div className={styles.pricingSidebarLabel}>{t('system.payments.pricing.quickPreview')}</div>
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
            <div className={styles.pricingPreviewEmpty}>{t('system.payments.pricing.previewEmpty')}</div>
          )}
        </div>
      </aside>
    </div>
  );
}

interface GroupRatesPanelProps {
  groupLessons: SchoolGroupLessonsSettingsDto;
  groupLessonsEnabled: boolean;
  groupDefaultCurrency: PaymentCurrencyCode;
  groupDefaultPriceMinor: number;
  allowedCurrencies: PaymentCurrencyCode[];
  onPatch: (patch: Partial<SchoolGroupLessonsSettingsDto>) => void;
}

function GroupRatesPanel({
  groupLessons, groupLessonsEnabled, groupDefaultCurrency, groupDefaultPriceMinor, allowedCurrencies, onPatch,
}: GroupRatesPanelProps) {
  const t = useCampusT();

  return (
    <div className={styles.pricingLayout}>
      <div className={styles.pricingMainCard}>
        <div className={styles.pricingHero}>
          <div>
            <div className={styles.pricingHeroLabel}>{t('system.payments.pricing.defaultGroupBilling')}</div>
            <div className={styles.pricingHeroValue}>
              {groupLessons.defaultBillingMode === 'per_member'
                ? t('system.payments.pricing.creditPerMemberLong')
                : formatMoney(groupDefaultPriceMinor, groupDefaultCurrency)}
            </div>
          </div>
          <div className={styles.pricingHeroStats}>
            <div className={styles.pricingHeroStat}>
              <span className={styles.pricingHeroStatLabel}>{t('students.detail.billing.billingMode')}</span>
              <strong>{groupBillingModeLabel(groupLessons.defaultBillingMode ?? 'per_member', t)}</strong>
            </div>
            {groupLessons.defaultBillingMode === 'fixed_total' ? (
              <>
                <div className={styles.pricingHeroStat}>
                  <span className={styles.pricingHeroStatLabel}>{t('students.groups.editor.currencyLabel')}</span>
                  <strong>{groupDefaultCurrency}</strong>
                </div>
                <div className={styles.pricingHeroStat}>
                  <span className={styles.pricingHeroStatLabel}>{t('students.groups.editor.splitLabel')}</span>
                  <strong>{groupSplitModeLabel(groupLessons.defaultSplitMode ?? 'equal_split', t)}</strong>
                </div>
              </>
            ) : (
              <div className={styles.pricingHeroStat}>
                <span className={styles.pricingHeroStatLabel}>{t('system.payments.pricing.feature')}</span>
                <strong>{groupLessonsEnabled ? t('system.payments.pricing.enabled') : t('system.payments.pricing.disabled')}</strong>
              </div>
            )}
          </div>
        </div>

        {groupLessonsEnabled ? (
          <div className={styles.pricingControlGrid}>
            <div className={styles.pricingControlCard}>
              <div className={styles.pricingControlTop}>
                <div>
                  <div className={styles.pricingControlEyebrow}>{t('system.payments.pricing.eyebrow.billing')}</div>
                  <div className={styles.pricingControlTitle}>{t('system.payments.pricing.howGroupCharges')}</div>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="group-billing-mode">{t('students.detail.billing.billingMode')}</label>
                <Field id="group-billing-mode" as="select" className={styles.input}
                  value={groupLessons.defaultBillingMode}
                  onChange={(e) => onPatch({ defaultBillingMode: e.target.value as 'per_member' | 'fixed_total' })}
                >
                  <option value="per_member">{t('system.payments.pricing.perStudentOption')}</option>
                  <option value="fixed_total">{t('system.payments.pricing.fixedTotalOption')}</option>
                </Field>
              </div>
            </div>

            {groupLessons.defaultBillingMode === 'fixed_total' ? (
              <div className={styles.pricingControlCard}>
                <div className={styles.pricingControlTop}>
                  <div>
                    <div className={styles.pricingControlEyebrow}>{t('system.payments.pricing.eyebrow.amount')}</div>
                    <div className={styles.pricingControlTitle}>{t('system.payments.pricing.fixedLessonTotal')}</div>
                  </div>
                </div>
                <div className={styles.pricingInlineControls}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="group-price-minor">{t('students.groups.editor.amountLabel')}</label>
                    <Field id="group-price-minor" type="number" className={styles.input} min={0}
                      value={String(groupDefaultPriceMinor)}
                      onChange={(e) => onPatch({ defaultPriceMinor: Math.max(0, Number(e.target.value) || 0) })}
                    />
                    <span className={styles.hint}>
                      {formatMoney(groupDefaultPriceMinor, groupDefaultCurrency)} {t('students.detail.billing.perLesson')}
                    </span>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="group-currency">{t('students.groups.editor.currencyLabel')}</label>
                    <Field id="group-currency" as="select" className={styles.input} value={groupDefaultCurrency}
                      onChange={(e) => onPatch({ defaultCurrency: e.target.value as PaymentCurrencyCode })}
                    >
                      {allowedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}
                    </Field>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="group-split-mode">{t('students.groups.editor.splitLabel')}</label>
                    <Field id="group-split-mode" as="select" className={styles.input}
                      value={groupLessons.defaultSplitMode}
                      onChange={(e) => onPatch({ defaultSplitMode: e.target.value as 'equal_split' | 'single_payer' })}
                    >
                      <option value="equal_split">{t('students.groups.editor.splitEqual')}</option>
                      <option value="single_payer">{t('students.groups.editor.splitSinglePayer')}</option>
                    </Field>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={styles.pricingDisabledNotice}>
            <p className={styles.hint}>
              {t('system.payments.pricing.groupDisabledBefore')}{' '}
              <Link href="/system">{t('system.payments.pricing.groupDisabledLink')}</Link>{' '}
              {t('system.payments.pricing.groupDisabledAfter')}
            </p>
          </div>
        )}
      </div>

      <aside className={styles.pricingSidebarCard}>
        <div className={styles.pricingSidebarTitle}>{t('system.payments.pricing.groupSummary')}</div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>{t('system.payments.pricing.defaultCharge')}</div>
          <div className={styles.pricingSidebarValue}>
            {groupLessons.defaultBillingMode === 'per_member'
              ? t('students.groups.creditPerMember')
              : formatMoney(groupDefaultPriceMinor, groupDefaultCurrency)}
          </div>
        </div>
        <div className={styles.pricingSidebarBlock}>
          <div className={styles.pricingSidebarLabel}>{t('students.detail.billing.billingMode')}</div>
          <Badge variant="neutral" size="sm">{groupBillingModeLabel(groupLessons.defaultBillingMode ?? 'per_member', t)}</Badge>
          {groupLessons.defaultBillingMode === 'fixed_total' ? (
            <div className={styles.pricingBadgeList}>
              <Badge variant="neutral" size="sm">{groupSplitModeLabel(groupLessons.defaultSplitMode ?? 'equal_split', t)}</Badge>
            </div>
          ) : null}
        </div>
        {!groupLessonsEnabled ? (
          <div className={styles.pricingSidebarBlock}>
            <div className={styles.pricingSidebarLabel}>{t('system.payments.pricing.status')}</div>
            <Badge variant="neutral" size="sm">{t('system.payments.pricing.featureDisabled')}</Badge>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
