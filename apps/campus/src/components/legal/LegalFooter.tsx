'use client';

import Link from 'next/link';
import { useCampusT } from '../../lib/cms';
import styles from './LegalFooter.module.scss';

const LINKS = [
  { href: '/offer', key: 'legal.nav.offer' },
  { href: '/legal/terms', key: 'legal.nav.terms' },
  { href: '/legal/payment-refund', key: 'legal.nav.paymentRefund' },
  { href: '/legal/contacts', key: 'legal.nav.contacts' },
  { href: '/privacy', key: 'legal.nav.privacy' },
] as const;

export function LegalFooter({ className }: { className?: string }) {
  const t = useCampusT();
  return (
    <nav
      className={[styles.footer, className].filter(Boolean).join(' ')}
      aria-label={t('legal.nav.aria')}
    >
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={styles.link}>
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
