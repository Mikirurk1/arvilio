import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@pkg/types';
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  getBrandKit,
  getSiteSettings,
} from '@/lib/cms';
import { isHubLocale } from '@/lib/locales';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import styles from './locale-shell.module.scss';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) return {};
  const locale = raw as Locale;
  const site = await getSiteSettings(locale);
  const verification: Metadata['verification'] = {};
  if (site.googleSiteVerification) verification.google = site.googleSiteVerification;
  if (site.bingSiteVerification) {
    verification.other = { 'msvalidate.01': site.bingSiteVerification };
  }
  return {
    title: {
      default: site.siteName?.trim() || 'Arvilio',
      template: site.titleTemplate?.trim() || '%s | Arvilio',
    },
    description: site.defaultSeoDescription?.trim() || undefined,
    ...(Object.keys(verification).length ? { verification } : {}),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) notFound();
  const locale = raw as Locale;

  const [site, brandKit] = await Promise.all([getSiteSettings(locale), getBrandKit()]);
  const org = buildOrganizationJsonLd({ site, brandKit });
  const website = buildWebsiteJsonLd({ site, brandKit });
  const graphs = [org, website].filter(Boolean);

  return (
    <div className={styles.shell}>
      {graphs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(graphs.length === 1 ? graphs[0] : graphs),
          }}
        />
      ) : null}
      <SiteHeader locale={locale} />
      <main className={styles.main}>{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
