'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Field } from '../../../components/ui';
import {
  getPricePerLessonForCurrency,
  type LessonPackageDto,
  type PaymentConfigDto,
  type PaymentCurrencyCode,
} from '@pkg/types';
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
  const allowedCurrencies = config.allowedCurrencies as PaymentCurrencyCode[];
  const featuredPackageId = getFeaturedPackageId(config.packages);

  return (
    <section className={styles.packagesSection}>
      <div className={styles.packagesHeader}>
        <div>
          <h4 className={styles.packagesTitle}>
            Self-serve lesson packages (from {minPackageLessons} lessons)
          </h4>
          <p className={styles.hint}>
            Each template has its own currency. Students pick a ready-made card (e.g. 10 lessons · 4500 UAH vs 10 lessons · 120 USD).
          </p>
        </div>
        <Button type="button" variant="ghost" startIcon={<Plus size={16} />} onClick={onAdd}>
          Add package
        </Button>
      </div>

      {config.packages.length === 0 ? (
        <p className={styles.hint}>No packages yet. Add at least one for online checkout.</p>
      ) : (
        <div className={styles.packagesTableWrap}>
          <div className={styles.packageStatsRow}>
            <div className={styles.packageStatCard}>
              <span className={styles.packageStatLabel}>Package templates</span>
              <strong>{config.packages.length}</strong>
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
            {config.packages.map((pkg, index) => {
              const pkgCurrency = (pkg.currency ?? currency) as PaymentCurrencyCode;
              const perLesson =
                pkg.creditTrack === 'group'
                  ? (config.groupLessons?.defaultPriceMinor ?? 0)
                  : getPricePerLessonForCurrency(config, pkgCurrency);
              const total = pkg.lessons * perLesson;
              const tone = getPackageTone(config.packages, pkg.id);
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
                        {tone === 'starter' ? 'Starter' : tone === 'premium' ? 'Premium' : 'Popular choice'}
                      </div>
                      <div className={styles.packageRowTitle}>{pkg.label || `Package ${index + 1}`}</div>
                      <div className={styles.packageRowBadges}>
                        {pkg.id === featuredPackageId ? (
                          <Badge variant="green" size="sm">Recommended</Badge>
                        ) : null}
                        <Badge variant={tone === 'premium' ? 'rose' : 'blue'} size="sm">Template #{index + 1}</Badge>
                        <Badge variant="neutral" size="sm">{pkg.lessons} lessons</Badge>
                        <Badge variant="blue" size="sm">{pkgCurrency}</Badge>
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
                      <Field as="select" className={styles.input} value={pkgCurrency}
                        onChange={(e) => onUpdate(index, { currency: e.target.value as PaymentCurrencyCode })}
                      >
                        {allowedCurrencies.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </Field>
                    </div>

                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>Package label</span>
                      <Field className={styles.input} placeholder="Label" value={pkg.label}
                        onChange={(e) => onUpdate(index, { label: e.target.value })}
                      />
                    </div>

                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>Lessons in package</span>
                      <Field type="number" className={styles.input} min={minPackageLessons}
                        placeholder="Lessons" value={String(pkg.lessons)}
                        onChange={(e) =>
                          onUpdate(index, {
                            lessons: Math.max(minPackageLessons, Number.parseInt(e.target.value, 10) || minPackageLessons),
                          })
                        }
                      />
                      <span className={styles.packageHint}>Must stay at or above the platform minimum.</span>
                    </div>

                    <div className={styles.packageFieldCard}>
                      <span className={styles.packageFieldLabel}>Credits bucket</span>
                      <Field as="select" className={styles.input} value={pkg.creditTrack ?? 'individual'}
                        onChange={(e) =>
                          onUpdate(index, { creditTrack: e.target.value === 'group' ? 'group' : 'individual' })
                        }
                      >
                        <option value="individual">Individual lessons</option>
                        <option value="group">Group lessons (per-member)</option>
                      </Field>
                    </div>

                    <div className={styles.packageFieldSummary}>
                      <span className={styles.packageFieldLabel}>Live total</span>
                      <strong>{formatMoney(total, pkgCurrency)}</strong>
                      <span className={styles.packageHint}>
                        {pkg.lessons} × {formatMoney(perLesson, pkgCurrency)}
                      </span>
                    </div>

                    <Button type="button" variant="ghost" aria-label="Remove package" onClick={() => onRemove(index)}>
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
