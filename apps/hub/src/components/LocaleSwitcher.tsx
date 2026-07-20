'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@pkg/types';
import { HUB_ROUTE_LOCALES } from '@/lib/locales';
import styles from '../app/[locale]/locale-shell.module.scss';

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const parts = pathname.split('/');
  // /{locale}/...
  const rest = parts.length > 2 ? `/${parts.slice(2).join('/')}` : '';

  return (
    <div className={styles.locales} aria-label="Language">
      {HUB_ROUTE_LOCALES.map((code) => (
        <Link
          key={code}
          href={`/${code}${rest}`}
          className={`${styles.localeLink}${code === locale ? ` ${styles.localeLinkActive}` : ''}`}
          hrefLang={code}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
