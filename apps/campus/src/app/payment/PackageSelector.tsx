'use client';

import { Check } from 'lucide-react';
import type { ResolvedLessonPackageDto } from '@pkg/types';
import { Badge } from '../../components/ui';
import { formatCheckoutAmount } from '../../lib/billing/checkout-display';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export function getFeaturedPackageId(
  packages: Array<{ id: string; lessons: number }>,
): string | null {
  if (packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  return sorted[Math.floor(sorted.length / 2)]?.id ?? null;
}

export function PackageOfferPanel({ pkg }: { pkg: ResolvedLessonPackageDto }) {
  const t = useCampusT();
  return (
    <div
      className={styles.packageOffer}
      aria-label={t('payment.packageAria', { label: pkg.label, count: pkg.lessons })}
    >
      <div className={styles.packageOfferBody}>
        <div className={styles.packageOfferMeta}>
          <Badge variant="blue" size="sm">
            {pkg.currency}
          </Badge>
          {pkg.lessonsLocked ? (
            <Badge variant="neutral" size="sm">
              {t('payment.fixedSize')}
            </Badge>
          ) : null}
        </div>
        <h3 className={styles.packageOfferTitle}>{pkg.label}</h3>
        <p className={styles.packageOfferLessons}>
          {pkg.description?.trim()
            ? pkg.description
            : t('payment.lessonsPrepaid', { count: pkg.lessons })}
        </p>
        <p className={styles.packageOfferRate}>
          {t('payment.lessonsPerLesson', {
            count: pkg.lessons,
            rate: formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency),
          })}
        </p>
      </div>
      <div className={styles.packageOfferPrice}>
        <span className={styles.packageOfferPriceLabel}>{t('payment.totalToPay')}</span>
        <span className={styles.packageOfferAmount}>
          {formatCheckoutAmount(pkg.amountMinor, pkg.currency)}
        </span>
      </div>
    </div>
  );
}

export function PackageCard({
  pkg,
  featuredPackageId,
  selected,
  onSelect,
}: {
  pkg: ResolvedLessonPackageDto;
  featuredPackageId: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useCampusT();
  const isFeatured = pkg.id === featuredPackageId;
  const amount = formatCheckoutAmount(pkg.amountMinor, pkg.currency);

  return (
    <button
      type="button"
      className={[
        styles.packageCard,
        selected ? styles.packageCardSelected : '',
        isFeatured ? styles.packageCardFeatured : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={t('payment.packageCardAria', {
        label: pkg.label,
        count: pkg.lessons,
        amount,
      })}
    >
      <span className={styles.packageCardRadio} aria-hidden>
        {selected ? <Check size={14} strokeWidth={3} /> : null}
      </span>

      <div className={styles.packageCardMain}>
        {isFeatured ? (
          <Badge variant="green" size="sm" className={styles.packageCardRibbon}>
            {t('payment.mostPopular')}
          </Badge>
        ) : null}
        <h3 className={styles.packageCardTitle}>{pkg.label}</h3>
        <p className={styles.packageCardLessons}>
          {pkg.description?.trim()
            ? pkg.description
            : pkg.creditTrack === 'group'
              ? t('payment.groupLessonsPrepaid', { count: pkg.lessons })
              : t('payment.lessonsPrepaid', { count: pkg.lessons })}
        </p>
      </div>

      <div className={styles.packageCardPriceBlock}>
        <span className={styles.packageCardPrice}>{amount}</span>
        <span className={styles.packageCardRate}>
          {t('payment.perLesson', {
            rate: formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency),
          })}
        </span>
      </div>
    </button>
  );
}
