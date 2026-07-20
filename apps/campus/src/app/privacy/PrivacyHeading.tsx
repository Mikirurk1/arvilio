'use client';

import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export function PrivacyHeading({ updated }: { updated: string }) {
  const t = useCampusT();
  return (
    <>
      <h1>{t('privacy.title')}</h1>
      <p className={styles.meta}>{t('privacy.lastUpdated', { date: updated })}</p>
    </>
  );
}
