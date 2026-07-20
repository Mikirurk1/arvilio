'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import type { PublicSellerProfile } from '../../lib/seller-profile';
import { LegalFooter } from './LegalFooter';
import privacyStyles from '../../app/privacy/page.module.scss';

const emptySeller: PublicSellerProfile = {
  schoolName: '',
  legalName: null,
  legalAddress: null,
  legalCountry: 'UA',
  supportEmail: null,
  supportPhone: null,
  mcc: '8299',
  termsOverrideMd: null,
  paymentRefundOverrideMd: null,
  isComplete: false,
};

export function usePublicSellerProfile() {
  const [seller, setSeller] = useState<PublicSellerProfile>(emptySeller);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiClient
      .get<PublicSellerProfile>('/school/seller-profile')
      .then(setSeller)
      .catch(() => setSeller(emptySeller))
      .finally(() => setLoading(false));
  }, []);

  return { seller, loading };
}

export function LegalPageShell({
  children,
  loading,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  const t = useCampusT();

  return (
    <main className={privacyStyles.page}>
      <article className={privacyStyles.article}>
        {loading ? <p className={privacyStyles.meta}>{t('legal.loading')}</p> : children}
      </article>
      <LegalFooter />
    </main>
  );
}
