import Link from 'next/link';
import type { Locale } from '@pkg/types';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import styles from '../app/[locale]/locale-shell.module.scss';

const LABELS: Record<Locale, { pricing: string; campus: string; connect: string }> = {
  uk: { pricing: 'Тарифи', campus: 'Campus', connect: 'Connect' },
  en: { pricing: 'Pricing', campus: 'Campus', connect: 'Connect' },
};

export function SiteHeader({ locale }: { locale: Locale }) {
  const labels = LABELS[locale];

  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.brand}>
        Arvilio
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <Link href={`/${locale}/campus`}>{labels.campus}</Link>
        <Link href={`/${locale}/connect`}>{labels.connect}</Link>
        <Link href={`/${locale}/pricing`}>{labels.pricing}</Link>
        <LocaleSwitcher locale={locale} />
      </nav>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const legal =
    locale === 'uk'
      ? { terms: 'Умови', privacy: 'Конфіденційність', cookies: 'Cookies' }
      : { terms: 'Terms', privacy: 'Privacy', cookies: 'Cookies' };

  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Arvilio</span>
      <Link href={`/${locale}/legal/terms`}>{legal.terms}</Link>
      <Link href={`/${locale}/legal/privacy`}>{legal.privacy}</Link>
      <Link href={`/${locale}/legal/cookies`}>{legal.cookies}</Link>
    </footer>
  );
}
