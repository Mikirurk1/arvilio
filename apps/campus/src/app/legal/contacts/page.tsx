'use client';

import { LegalPageShell, usePublicSellerProfile } from '../../../components/legal/LegalPageShell';
import { useCampusT } from '../../../lib/cms';
import styles from '../../privacy/page.module.scss';

export default function LegalContactsPage() {
  const t = useCampusT();
  const { seller, loading } = usePublicSellerProfile();

  const schoolLabel = seller.schoolName || t('legal.contacts.schoolFallback');
  const notPublished = t('legal.contacts.notPublished');

  return (
    <LegalPageShell loading={loading}>
      <h1>{t('legal.contacts.title')}</h1>
      <p className={styles.meta}>{t('legal.contacts.meta', { schoolName: schoolLabel })}</p>

      <section>
        <h2>{t('legal.contacts.entityTitle')}</h2>
        <ul>
          <li>
            <strong>{t('legal.contacts.legalName')}</strong> {seller.legalName || notPublished}
          </li>
          <li>
            <strong>{t('legal.contacts.address')}</strong> {seller.legalAddress || notPublished}
          </li>
          <li>
            <strong>{t('legal.contacts.country')}</strong> {seller.legalCountry || 'UA'}
          </li>
          <li>
            <strong>{t('legal.contacts.mcc')}</strong> {seller.mcc || '8299'}{' '}
            {t('legal.contacts.mccNote')}
          </li>
        </ul>
      </section>

      <section>
        <h2>{t('legal.contacts.supportTitle')}</h2>
        <ul>
          <li>
            <strong>{t('legal.contacts.email')}</strong>{' '}
            {seller.supportEmail ? (
              <a href={`mailto:${seller.supportEmail}`}>{seller.supportEmail}</a>
            ) : (
              notPublished
            )}
          </li>
          <li>
            <strong>{t('legal.contacts.phone')}</strong> {seller.supportPhone || '—'}
          </li>
        </ul>
      </section>

      <section>
        <h2>{t('legal.contacts.schoolTitle')}</h2>
        <p>{seller.schoolName || t('legal.contacts.schoolUnavailable')}</p>
      </section>
    </LegalPageShell>
  );
}
