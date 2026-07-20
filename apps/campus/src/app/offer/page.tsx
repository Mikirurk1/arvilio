'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PaymentMethodKindDto } from '@pkg/types';
import { apiClient } from '../../lib/api';
import { formatCheckoutAmount } from '../../lib/billing/checkout-display';
import { LegalFooter } from '../../components/legal/LegalFooter';
import { useCampusT } from '../../lib/cms';
import { PaymentMethodLogos } from '../../components/payments/PaymentMethodLogos';
import styles from './page.module.scss';

type OfferPackage = {
  id: string;
  lessons: number;
  label: string;
  description?: string;
  currency: string;
  amountMinor: number;
  pricePerLessonMinor: number;
  creditTrack: string;
};

type PublicOffer = {
  schoolName: string;
  packages: OfferPackage[];
  enabledOnlineMethods: PaymentMethodKindDto[];
  allowedProductsNote: string;
};

export default function OfferPage() {
  const t = useCampusT();
  const [offer, setOffer] = useState<PublicOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiClient
      .get<PublicOffer>('/school/public-offer')
      .then(setOffer)
      .catch(() => setOffer(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{t('offer.eyebrow')}</p>
          <h1 className={styles.title}>{offer?.schoolName || t('offer.titleFallback')}</h1>
          <p className={styles.lead}>{t('offer.lead')}</p>
        </header>

        {loading ? (
          <p className={styles.muted}>{t('offer.loading')}</p>
        ) : !offer || offer.packages.length === 0 ? (
          <p className={styles.muted}>{t('offer.empty')}</p>
        ) : (
          <ul className={styles.grid}>
            {offer.packages.map((pkg) => (
              <li key={pkg.id} className={styles.card}>
                <h2 className={styles.cardTitle}>{pkg.label}</h2>
                <p className={styles.cardDesc}>
                  {pkg.description?.trim() ||
                    t('offer.prepaidCredit', { lessons: pkg.lessons })}
                </p>
                <p className={styles.cardMeta}>
                  {t('offer.lessonsMeta', {
                    lessons: pkg.lessons,
                    price: formatCheckoutAmount(pkg.pricePerLessonMinor, pkg.currency),
                  })}
                </p>
                <p className={styles.cardPrice}>
                  {formatCheckoutAmount(pkg.amountMinor, pkg.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.note}>{offer?.allowedProductsNote}</p>

        <div className={styles.ctaRow}>
          <Link href="/payment" className={styles.cta}>
            {t('offer.checkout')}
          </Link>
          <Link href="/legal/terms" className={styles.secondaryLink}>
            {t('offer.termsLink')}
          </Link>
        </div>

        {offer && offer.enabledOnlineMethods.length > 0 ? (
          <PaymentMethodLogos methods={offer.enabledOnlineMethods} />
        ) : null}

        <LegalFooter />
      </div>
    </main>
  );
}
