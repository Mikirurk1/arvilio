'use client';

import type { StudentLessonBalanceDto, StudentPackageOverrideDto } from '@pkg/types';
import { Badge, Field } from '../../../../components/ui';
import { PackageOpen } from 'lucide-react';
import { BillingSectionHeader } from './BillingSharedComponents';
import { formatMinor, getFeaturedPackageId, getPackageTone } from './billing-tab-utils';
import styles from '../page.module.scss';

// ─── Admin package overrides ─────────────────────────────────────────────────

interface AdminPackagesSectionProps {
  balance: StudentLessonBalanceDto;
  packageOverrides: StudentPackageOverrideDto[];
  billingMode: string;
  minPackageLessons: number;
  updatePackageOverride: (packageId: string, patch: Partial<StudentPackageOverrideDto>) => void;
}

export function AdminPackagesSection({
  balance, packageOverrides, billingMode, minPackageLessons, updatePackageOverride,
}: AdminPackagesSectionProps) {
  if (billingMode !== 'packages' && billingMode !== 'both') return null;

  const enabledPackageCount = packageOverrides.filter((row) => row.enabled).length;
  const lockedPackageCount = packageOverrides.filter((row) => row.lessonsLocked).length;

  return (
    <section className={styles.billingSectionCard}>
      <BillingSectionHeader
        icon={<PackageOpen size={18} aria-hidden />}
        eyebrow="Checkout packages"
        title="Package rules for this student"
        description="Packages are predefined lesson bundles. You can hide a package, change its lesson count, or lock the size for this student."
      />
      {packageOverrides.length === 0 ? (
        <p className={styles.colorFieldHint}>No platform packages configured. Add them in System → Payments first.</p>
      ) : (
        <div className={styles.billingPackageRulesBody}>
          <div className={styles.billingPackageStats}>
            <div className={styles.billingPackageStat}>
              <span className={styles.billingPackageStatLabel}>Visible packages</span>
              <strong>{enabledPackageCount}</strong>
            </div>
            <div className={styles.billingPackageStat}>
              <span className={styles.billingPackageStatLabel}>Locked packages</span>
              <strong>{lockedPackageCount}</strong>
            </div>
            <div className={styles.billingPackageStat}>
              <span className={styles.billingPackageStatLabel}>Min size</span>
              <strong>{minPackageLessons} lessons</strong>
            </div>
          </div>
          <div className={styles.billingPackageList}>
            {packageOverrides.map((ov) => {
              const platform = balance.platformPackages.find((p) => p.id === ov.packageId);
              const resolved = balance.packages.find((p) => p.id === ov.packageId);
              const lessons = ov.lessons ?? platform?.lessons ?? minPackageLessons;
              const amountMinor = resolved?.amountMinor ?? lessons * balance.resolvedPricePerLessonMinor;
              const tone = getPackageTone(
                packageOverrides.map((row) => ({
                  id: row.packageId,
                  lessons: row.lessons ?? balance.platformPackages.find((p) => p.id === row.packageId)?.lessons ?? minPackageLessons,
                })),
                ov.packageId,
              );
              return (
                <div key={ov.packageId} className={`${styles.billingPackageCard} ${tone === 'starter' ? styles.billingPackageCardStarter : ''} ${tone === 'popular' ? styles.billingPackageCardPopular : ''} ${tone === 'premium' ? styles.billingPackageCardPremium : ''}`}>
                  <div className={styles.billingPackageAccent} />
                  <div className={styles.billingPackageMeta}>
                    <div className={styles.billingPackageTitleWrap}>
                      <div className={styles.billingPackageEyebrow}>{tone === 'starter' ? 'Starter' : tone === 'premium' ? 'Premium' : 'Popular choice'}</div>
                      <div className={styles.billingPackageTitle}>{platform?.label ?? ov.packageId}</div>
                      <div className={styles.billingPackageBadges}>
                        <Badge variant={ov.enabled ? 'green' : 'neutral'} size="sm">{ov.enabled ? 'Visible' : 'Hidden'}</Badge>
                        <Badge variant={ov.lessonsLocked ? 'blue' : 'neutral'} size="sm">{ov.lessonsLocked ? 'Fixed size' : 'Flexible'}</Badge>
                      </div>
                    </div>
                    <div className={styles.billingPackagePrice}>{formatMinor(amountMinor, balance.defaultCurrency)}</div>
                  </div>
                  <div className={styles.billingPackageSubmeta}>
                    <span>{lessons} lessons</span>
                    <span>{formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)} per lesson</span>
                  </div>
                  <div className={styles.billingPackageControls}>
                    <div className={styles.billingPackageControlCell}>
                      <span className={styles.billingPackageControlLabel}>Visibility</span>
                      <Field
                        as="checkbox"
                        checked={ov.enabled}
                        onChange={(e) => updatePackageOverride(ov.packageId, { enabled: e.target.checked })}
                        label="Visible to student"
                        rootClassName={styles.billingPackageToggle}
                      />
                    </div>
                    <div className={`${styles.billingPackageControlCell} ${styles.billingPackageControlCellWide}`}>
                      <div className={styles.billingInlineField}>
                        <span className={styles.billingInlineLabel}>Lessons in package</span>
                        <Field type="number" className={styles.input} min={minPackageLessons} disabled={ov.lessonsLocked} value={String(lessons)} onChange={(e) => updatePackageOverride(ov.packageId, { lessons: Math.max(minPackageLessons, Number.parseInt(e.target.value, 10) || minPackageLessons) })} />
                        <span className={styles.billingInlineHint}>{ov.lessonsLocked ? 'Size is fixed — student cannot change lesson count.' : 'Student can buy this exact package size.'}</span>
                      </div>
                    </div>
                    <div className={styles.billingPackageControlCell}>
                      <span className={styles.billingPackageControlLabel}>Size rule</span>
                      <Field
                        as="checkbox"
                        checked={ov.lessonsLocked}
                        onChange={(e) =>
                          updatePackageOverride(ov.packageId, {
                            lessonsLocked: e.target.checked,
                            lessons: e.target.checked && ov.lessons == null ? lessons : ov.lessons,
                          })
                        }
                        label="Fixed for student"
                        rootClassName={styles.billingPackageToggle}
                      />
                    </div>
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

// ─── Student-facing packages view ────────────────────────────────────────────

interface StudentPackagesSectionProps {
  balance: StudentLessonBalanceDto;
  hideStudentPricing: boolean;
}

export function StudentPackagesSection({ balance, hideStudentPricing }: StudentPackagesSectionProps) {
  if (!balance.showSelfServePackages || balance.packages.length === 0) return null;

  const featuredId = getFeaturedPackageId(balance.packages);

  return (
    <section className={styles.billingSectionCard}>
      <BillingSectionHeader
        icon={<PackageOpen size={18} aria-hidden />}
        eyebrow="Student-facing"
        title="Available packages"
        description="These package sizes are currently visible to the student on the payment page."
      />
      <div className={styles.billingStudentPackageStats}>
        <div className={styles.billingPackageStat}>
          <span className={styles.billingPackageStatLabel}>Available</span>
          <strong>{balance.packages.length}</strong>
        </div>
        <div className={styles.billingPackageStat}>
          <span className={styles.billingPackageStatLabel}>Starting from</span>
          <strong>{Math.min(...balance.packages.map((pkg) => pkg.lessons))} lessons</strong>
        </div>
        {!hideStudentPricing ? (
          <div className={styles.billingPackageStat}>
            <span className={styles.billingPackageStatLabel}>Current lesson rate</span>
            <strong>{formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)}</strong>
          </div>
        ) : null}
      </div>
      <div className={styles.billingPackageList}>
        {balance.packages.map((pkg) => {
          const tone = getPackageTone(balance.packages, pkg.id);
          return (
            <div key={pkg.id} className={`${styles.billingPackageCard} ${pkg.id === featuredId ? styles.billingPackageCardFeatured : ''} ${tone === 'starter' ? styles.billingPackageCardStarter : ''} ${tone === 'popular' ? styles.billingPackageCardPopular : ''} ${tone === 'premium' ? styles.billingPackageCardPremium : ''}`}>
              <div className={styles.billingPackageAccent} />
              <div className={styles.billingPackageMeta}>
                <div className={styles.billingPackageTitleWrap}>
                  <div className={styles.billingPackageEyebrow}>{tone === 'starter' ? 'Starter' : tone === 'premium' ? 'Premium' : 'Popular choice'}</div>
                  <div className={styles.billingPackageTitle}>{pkg.label}</div>
                  <div className={styles.billingPackageBadges}>
                    {pkg.id === featuredId ? <Badge variant="green" size="sm">Recommended</Badge> : null}
                    <Badge variant="blue" size="sm">{pkg.lessons} lessons</Badge>
                    <Badge variant={pkg.lessonsLocked ? 'green' : 'neutral'} size="sm">{pkg.lessonsLocked ? 'Fixed package' : 'Flexible package'}</Badge>
                  </div>
                </div>
                <div className={styles.billingPackagePrice}>{formatMinor(pkg.amountMinor, pkg.currency)}</div>
              </div>
              <div className={styles.billingPackageSubmeta}>
                <span>{pkg.lessons} lessons</span>
                <span>{formatMinor(pkg.pricePerLessonMinor, pkg.currency)} per lesson</span>
              </div>
              <div className={styles.billingPackageHint}>
                {pkg.id === featuredId
                  ? 'A balanced package to highlight in discussions with the student.'
                  : pkg.lessonsLocked
                    ? 'This package size is fixed for the student.'
                    : 'This package can be offered as a flexible checkout option.'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
