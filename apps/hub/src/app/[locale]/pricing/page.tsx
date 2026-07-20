import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@pkg/types';
import {
  buildBreadcrumbJsonLd,
  buildDocumentJsonLd,
  buildHubMetadata,
  getBrandKit,
  getPageBySlug,
  getSiteSettings,
  lexicalToPlainParagraphs,
} from '@/lib/cms';
import { JsonLd } from '@/components/JsonLd';
import { hreflangAlternates, isHubLocale } from '@/lib/locales';
import styles from '@/components/marketing.module.scss';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) return {};
  const locale = raw as Locale;
  const [page, brandKit, site] = await Promise.all([
    getPageBySlug('pricing', locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  return buildHubMetadata({
    doc: page,
    fallbackTitle: page?.title || 'Pricing',
    site,
    brandKit,
    path: '/pricing',
    locale,
    languages: hreflangAlternates('/pricing'),
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) notFound();
  const locale = raw as Locale;
  const [page, brandKit, site] = await Promise.all([
    getPageBySlug('pricing', locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  if (!page) notFound();
  const paragraphs = lexicalToPlainParagraphs(page.body);
  const homeLabel = locale === 'uk' ? 'Головна' : 'Home';
  const crumbName =
    page.breadcrumbLabel?.trim() || page.seoTitle?.trim() || page.title || 'Pricing';
  const pageJsonLd = buildDocumentJsonLd({
    doc: page,
    fallbackName: page.title,
    site,
    brandKit,
    path: '/pricing',
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    trail: [
      { name: homeLabel, path: '/' },
      { name: crumbName, path: '/pricing' },
    ],
    site,
    locale,
  });

  return (
    <>
      <JsonLd data={[pageJsonLd, breadcrumbJsonLd]} />
      <h1 className={styles.pageTitle}>{page.title}</h1>
      <div className={styles.prose}>
        {paragraphs.map((text) => (
          <p key={text.slice(0, 32)}>{text}</p>
        ))}
      </div>
    </>
  );
}
