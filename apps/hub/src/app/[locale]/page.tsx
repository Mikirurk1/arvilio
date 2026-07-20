import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { Locale } from '@pkg/types';
import {
  buildDocumentJsonLd,
  buildHubMetadata,
  getBrandKit,
  getPageBySlug,
  getSiteSettings,
  getVisibleProducts,
  lexicalToPlainParagraphs,
  mediaAlt,
  resolveProductLogoUrl,
} from '@/lib/cms';
import { JsonLd } from '@/components/JsonLd';
import { CmsLogo } from '@/components/CmsLogo';
import { hreflangAlternates, isHubLocale } from '@/lib/locales';
import styles from '@/components/marketing.module.scss';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) return {};
  const locale = raw as Locale;
  const [page, brandKit, site] = await Promise.all([
    getPageBySlug('home', locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  return buildHubMetadata({
    doc: page,
    fallbackTitle: page?.title || 'Arvilio',
    site,
    brandKit,
    path: '/',
    locale,
    languages: hreflangAlternates('/'),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) notFound();
  const locale = raw as Locale;

  const [page, products, brandKit, site] = await Promise.all([
    getPageBySlug('home', locale),
    getVisibleProducts(locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);

  const paragraphs = lexicalToPlainParagraphs(page?.body);
  const eyebrow = locale === 'uk' ? 'Екосистема' : 'Ecosystem';
  const liveLabel = locale === 'uk' ? 'Зараз' : 'Live';
  const soonLabel = locale === 'uk' ? 'Скоро' : 'Soon';
  const pageJsonLd = buildDocumentJsonLd({
    doc: page,
    fallbackName: page?.title,
    site,
    brandKit,
    path: '/',
    locale,
  });

  return (
    <>
      <JsonLd data={pageJsonLd} />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{page?.title || 'Arvilio'}</h1>
        {paragraphs.map((text) => (
          <p key={text.slice(0, 24)} className={styles.lede}>
            {text}
          </p>
        ))}
      </section>

      <section className={styles.grid} aria-label="Products">
        {products.map((product) => {
          const soon = product.status === 'coming_soon';
          const logoUrl = resolveProductLogoUrl(product);
          return (
            <Link
              key={String(product.id)}
              href={`/${locale}/${product.slug}`}
              className={styles.card}
              style={
                product.primaryColor
                  ? ({ ['--product-primary']: product.primaryColor } as CSSProperties)
                  : undefined
              }
            >
              <div className={styles.cardMeta}>
                <span className={`${styles.badge}${soon ? ` ${styles.badgeSoon}` : ''}`}>
                  {soon ? soonLabel : liveLabel}
                </span>
                {logoUrl ? (
                  <CmsLogo
                    className={styles.cardLogo}
                    src={logoUrl}
                    alt={mediaAlt(product.logo ?? product.icon, product.name ?? '')}
                    width={128}
                    height={30}
                  />
                ) : null}
              </div>
              <h2>{product.name}</h2>
              {product.tagline ? <p className={styles.tagline}>{product.tagline}</p> : null}
              {product.description ? <p className={styles.desc}>{product.description}</p> : null}
              <span className={styles.cta}>
                {soon
                  ? soonLabel
                  : locale === 'uk'
                    ? 'Детальніше →'
                    : 'Learn more →'}
              </span>
            </Link>
          );
        })}
      </section>
    </>
  );
}
