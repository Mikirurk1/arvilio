'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Field } from '../../../components/ui';
import {
  getPricePerLessonForCurrency,
  type LessonPackageDto,
  type PaymentConfigDto,
  type PaymentCurrencyCode,
} from '@pkg/types';
import { useCampusT } from '../../../lib/cms';
import { formatMoney, getFeaturedPackageId, getPackageTone } from './payment-panel-utils';
import styles from '../page.module.scss';

interface Props {
  config: PaymentConfigDto;
  currency: PaymentCurrencyCode;
  priceMinor: number;
  minPackageLessons: number;
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<LessonPackageDto>) => void;
  onRemove: (index: number) => void;
}

export function PaymentsPackagesSection({
  config,
  currency,
  priceMinor,
  minPackageLessons,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const t = useCampusT();
  const allowedCurrencies = config.allowedCurrencies as PaymentCurrencyCode[];
  const featuredPackageId = getFeaturedPackageId(config.packages);

  return (
    <section className={styles.packagesSection}>
      <div className={styles.packagesHeader}>
        <div>
          <h4 className={styles.packagesTitle}>
            {t('system.payments.packages.title', { min: minPackageLessons })}
          </h4>
          <p className={styles.hint}>{t('system.payments.packages.subtitle')}</p>
        </div>
        <Button type="button" variant="ghost" startIcon={<Plus size={16} />} onClick={onAdd}>
          {t('system.payments.packages.add')}
        </Button>
      </div>

      {config.packages.length === 0 ? (
        <p className={styles.hint}>{t('system.payments.packages.empty')}</p>
      ) : (
        <div className={styles.packagesTableWrap}>
          <div className={styles.packageStatsRow}>
            <div className={styles.packageStatCard}>
              <span className={styles.packageStatLabel}>{t('system.payments.packages.templates')}</span>
              <strong>{config.packages.length}</strong>
            </div>
            <div className={styles.packageStatCard}>
              <span className={styles.packageStatLabel}>{t('system.payments.packages.minimumSize')}</span>
              <strong>{t('students.detail.billing.lessonsCount', { count: minPackageLessons })}</strong>
            </div>
            <div className={styles.packageStatCard}>
              <span className={styles.packageStatLabel}>{t('system.payments.packages.defaultCheckoutRate')}</span>
              <strong>{formatMoney(priceMinor, currency)}</strong>
            </div>
          </div>

          <div className={styles.packagesTable}>
            {config.packages.map((pkg, index) => {
              const pkgCurrency = (pkg.currency ?? currency) as PaymentCurrencyCode;
              const perLesson =
                pkg.creditTrack === 'group'
                  ? (config.groupLessons?.defaultPriceMinor ?? 0)
                  : getPricePerLessonForCurrency(config, pkgCurrency);
              const total = pkg.lessons * perLesson;
              const tone = getPackageTone(config.packages, pkg.id);
              const toneLabel =
                tone === 'starter'
                  ? t('system.payments.packages.tone.starter')
                  : tone === 'premium'
                    ? t('system.payments.packages.tone.premium')
                    : t('system.payments.packages.tone.popular');
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
                      <div className={styles.packageRowEyebrow}>{toneLabel}</div>
                      <div className={styles.packageRowTitle}>
                        {pkg.label || t('system.payments.packages.fallbackLabel', { index: index + 1 })}
                      </div>
                      <div className={styles.packageRowBadges}>
                        {pkg.id === featuredPackageId ? (
                          <Badge variant="green" size="sm">{t('system.payments.packages.recommended')}</Badge>
                        ) : null}
                        <Badge variant={tone === 'premium' ? 'rose' : 'blue'} size="sm">
                          {t('system.payments.packages.templateBadge', { index: index + 1 })}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {t('students.detail.billing.lessonsCount', { count: pkg.lessons })}
                        </Badge>
                        <Badge variant="blue" size="sm">{pkgCurrency}</Badge>
                      </div>
                    </div>
                    <div className={styles.packageTotal}>{formatMoney(total, pkgCurrency)}</div>
                  </div>

                  <div className={styles.packageRowSubmeta}>
                    <span>
                      {formatMoney(perLesson, pkgCurrency)} {t('students.detail.billing.perLesson')}
                    </span>
                    <span>{t('system.payments.packages.checkoutFormula', { currency: pkgCurrency })}</span>
                  </div>

                  <div className={styles.packageRowControls}>
                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>{t('students.groups.editor.currencyLabel')}</span>
                      <Field as="select" className={styles.input} value={pkgCurrency}
                        onChange={(e) => onUpdate(index, { currency: e.target.value as PaymentCurrencyCode })}
                      >
                        {allowedCurrencies.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </Field>
                    </div>

                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>{t('system.payments.packages.labelField')}</span>
                      <Field className={styles.input} placeholder={t('system.payments.packages.labelPlaceholder')} value={pkg.label}
                        onChange={(e) => onUpdate(index, { label: e.target.value })}
                      />
                    </div>

                    <div className={styles.packageFieldCard} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.packageFieldLabel}>{t('system.payments.packages.descriptionField')}</span>
                      <Field
                        as="textarea"
                        className={styles.input}
                        rows={2}
                        placeholder={t('system.payments.packages.descriptionPlaceholder')}
                        value={pkg.description ?? ''}
                        onChange={(e) =>
                          onUpdate(index, {
                            description: (e.target as HTMLTextAreaElement).value.trim() || undefined,
                          })
                        }
                      />
                      <span className={styles.packageHint}>{t('system.payments.packages.descriptionHint')}</span>
                    </div>

                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>{t('system.payments.packages.lessonsField')}</span>
                      <Field type="number" className={styles.input} min={minPackageLessons}
                        placeholder={t('system.payments.packages.lessonsPlaceholder')} value={String(pkg.lessons)}
                        onChange={(e) =>
                          onUpdate(index, {
                            lessons: Math.max(minPackageLessons, Number.parseInt(e.target.value, 10) || minPackageLessons),
                          })
                        }
                      />
                      <span className={styles.packageHint}>{t('system.payments.packages.lessonsHint')}</span>
                    </div>

                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>{t('system.payments.packages.creditsBucket')}</span>
                      <Field as="select" className={styles.input} value={pkg.creditTrack ?? 'individual'}
                        onChange={(e) =>
                          onUpdate(index, { creditTrack: e.target.value === 'group' ? 'group' : 'individual' })
                        }
                      >
                        <option value="individual">{t('students.detail.billing.individualLessons')}</option>
                        <option value="group">{t('system.payments.packages.creditsGroup')}</option>
                      </Field>
                    </div>

                    <div className={styles.packageFieldSummary}>
                      <span className={styles.packageFieldLabel}>{t('system.payments.packages.liveTotal')}</span>
                      <strong>{formatMoney(total, pkgCurrency)}</strong>
                      <span className={styles.packageHint}>
                        {pkg.lessons} × {formatMoney(perLesson, pkgCurrency)}
                      </span>
                    </div>

                    <Button type="button" variant="ghost" aria-label={t('system.payments.packages.removeAria')} onClick={() => onRemove(index)}>
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
  );
}
