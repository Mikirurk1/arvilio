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

const SLUG_BY_SEGMENT = {
  terms: 'legal-terms',
  privacy: 'legal-privacy',
  cookies: 'legal-cookies',
} as const;

type LegalSegment = keyof typeof SLUG_BY_SEGMENT;

type Props = { params: Promise<{ locale: string; segment: string }> };

function isLegalSegment(value: string): value is LegalSegment {
  return value in SLUG_BY_SEGMENT;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, segment } = await params;
  if (!isHubLocale(raw) || !isLegalSegment(segment)) return {};
  const locale = raw as Locale;
  const path = `/legal/${segment}`;
  const [page, brandKit, site] = await Promise.all([
    getPageBySlug(SLUG_BY_SEGMENT[segment], locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  return buildHubMetadata({
    doc: page,
    fallbackTitle: page?.title,
    site,
    brandKit,
    path,
    locale,
    languages: hreflangAlternates(path),
  });
}

export default async function LegalPage({ params }: Props) {
  const { locale: raw, segment } = await params;
  if (!isHubLocale(raw) || !isLegalSegment(segment)) notFound();
  const locale = raw as Locale;
  const path = `/legal/${segment}`;
  const [page, brandKit, site] = await Promise.all([
    getPageBySlug(SLUG_BY_SEGMENT[segment], locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  if (!page) notFound();
  const paragraphs = lexicalToPlainParagraphs(page.body);
  const homeLabel = locale === 'uk' ? 'Головна' : 'Home';
  const crumbName =
    page.breadcrumbLabel?.trim() || page.seoTitle?.trim() || page.title || segment;
  const pageJsonLd = buildDocumentJsonLd({
    doc: page,
    fallbackName: page.title,
    site,
    brandKit,
    path,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    trail: [
      { name: homeLabel, path: '/' },
      { name: crumbName, path },
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
