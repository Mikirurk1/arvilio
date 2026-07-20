import { Check } from 'lucide-react';
import type { ResolvedLessonPackageDto } from '@pkg/types';
import { Badge, Button } from '../../components/ui';
import { formatCheckoutAmount } from '../../lib/billing/checkout-display';
import styles from './page.module.scss';

export function getFeaturedPackageId(
  packages: Array<{ id: string; lessons: number }>,
): string | null {
  if (packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  return sorted[Math.floor(sorted.length / 2)]?.id ?? null;
}

export function PackageOfferPanel({ pkg }: { pkg: ResolvedLessonPackageDto }) {
  return (
    <div className={styles.packageOffer} aria-label={`${pkg.label}, ${pkg.lessons} lessons`}>
      <div className={styles.packageOfferBody}>
        <div className={styles.packageOfferMeta}>
          <Badge variant="blue" size="sm">
            {pkg.currency}
          </Badge>
          {pkg.lessonsLocked ? (
            <Badge variant="neutral" size="sm">
              Fixed size
            </Badge>
          ) : null}
        </div>
        <h3 className={styles.packageOfferTitle}>{pkg.label}</h3>
        <p className={styles.packageOfferLessons}>
          <strong>{pkg.lessons}</strong> lessons on your balance after payment
        </p>
        <p className={styles.packageOfferRate}>
          {formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency)} per lesson
        </p>
      </div>
      <div className={styles.packageOfferPrice}>
        <span className={styles.packageOfferPriceLabel}>Total to pay</span>
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
  const isFeatured = pkg.id === featuredPackageId;

  return (
    <Button
      type="button"
      variant="ghost"
      className={[
        styles.packageCard,
        selected ? styles.packageCardSelected : '',
        isFeatured ? styles.packageCardFeatured : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${pkg.label}, ${pkg.lessons} lessons, ${formatCheckoutAmount(pkg.amountMinor, pkg.currency)}`}
    >
      <span className={styles.packageCardRadio} aria-hidden>
        {selected ? <Check size={14} strokeWidth={3} /> : null}
      </span>

      <div className={styles.packageCardMain}>
        {isFeatured ? (
          <Badge variant="green" size="sm" className={styles.packageCardRibbon}>
            Most popular
          </Badge>
        ) : null}
        <h3 className={styles.packageCardTitle}>{pkg.label}</h3>
        <p className={styles.packageCardLessons}>
          <strong>{pkg.lessons}</strong>{' '}
          {pkg.creditTrack === 'group' ? 'group lessons' : 'lessons'} · {pkg.currency}
        </p>
      </div>

      <div className={styles.packageCardPriceBlock}>
        <span className={styles.packageCardPrice}>{formatCheckoutAmount(pkg.amountMinor, pkg.currency)}</span>
        <span className={styles.packageCardRate}>
          {formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency)} / lesson
        </span>
      </div>
    </Button>
  );
}
