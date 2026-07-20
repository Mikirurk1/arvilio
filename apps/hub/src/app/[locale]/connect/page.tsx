import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import type { Locale } from '@pkg/types';
import {
  buildBreadcrumbJsonLd,
  buildDocumentJsonLd,
  buildHubMetadata,
  getBrandKit,
  getProductBySlug,
  getSiteSettings,
  mediaAlt,
  resolveProductLogoUrl,
} from '@/lib/cms';
import { JsonLd } from '@/components/JsonLd';
import { CmsLogo } from '@/components/CmsLogo';
import { resolveProductCtaUrl } from '@/lib/cta';
import { hreflangAlternates, isHubLocale } from '@/lib/locales';
import styles from '@/components/marketing.module.scss';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) return {};
  const locale = raw as Locale;
  const [product, brandKit, site] = await Promise.all([
    getProductBySlug('connect', locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  if (!product || product.status === 'hidden') return {};
  return buildHubMetadata({
    doc: product,
    fallbackTitle: product.name,
    fallbackDescription: product.description,
    site,
    brandKit,
    path: '/connect',
    locale,
    languages: hreflangAlternates('/connect'),
  });
}

export default async function ConnectLandingPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isHubLocale(raw)) notFound();
  const locale = raw as Locale;

  const [product, brandKit, site] = await Promise.all([
    getProductBySlug('connect', locale),
    getBrandKit(),
    getSiteSettings(locale),
  ]);
  if (!product || product.status === 'hidden') notFound();

  const ctaEnabled = Boolean(site?.connectCtaEnabled) && product.status === 'live';
  const ctaUrl = ctaEnabled
    ? resolveProductCtaUrl({
        ctaBaseEnv: product.ctaBaseEnv,
        ctaPath: product.ctaPath,
        ctaCustomBase: typeof product.ctaCustomBase === 'string' ? product.ctaCustomBase : null,
        locale,
        utm: { utm_campaign: 'connect_landing' },
      })
    : null;

  const logoUrl = resolveProductLogoUrl(product);
  const style = {
    ...(product.primaryColor ? { ['--product-primary']: product.primaryColor } : {}),
    ...(product.accentColor ? { ['--product-accent']: product.accentColor } : {}),
  } as CSSProperties;

  const homeLabel = locale === 'uk' ? 'Головна' : 'Home';
  const crumbName =
    product.breadcrumbLabel?.trim() || product.seoTitle?.trim() || product.name || 'Connect';
  const pageJsonLd = buildDocumentJsonLd({
    doc: product,
    fallbackName: product.name,
    site,
    brandKit,
    path: '/connect',
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    trail: [
      { name: homeLabel, path: '/' },
      { name: crumbName, path: '/connect' },
    ],
    site,
    locale,
  });

  return (
    <>
      <JsonLd data={[pageJsonLd, breadcrumbJsonLd]} />
      <div className={styles.productLanding} style={style}>
        <p className={styles.eyebrow}>Connect</p>
        {logoUrl ? (
          <CmsLogo
            className={styles.productLogo}
            src={logoUrl}
            alt={mediaAlt(product.logo ?? product.icon, product.name ?? 'Connect')}
            width={176}
            height={44}
            priority
          />
        ) : null}
        <h1 className={styles.pageTitle}>{product.name}</h1>
        {product.tagline ? <p className={styles.tagline}>{product.tagline}</p> : null}
        <div className={styles.prose}>
          {(product.hero || product.description || '')
            .split(/\n+/)
            .filter(Boolean)
            .map((p: string) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
        </div>
        <div className={styles.actions}>
          {ctaUrl ? (
            <Link className={styles.button} href={ctaUrl}>
              {product.ctaLabel}
            </Link>
          ) : (
            <span className={`${styles.button} ${styles.buttonDisabled}`}>
              {product.ctaLabel || (locale === 'uk' ? 'Скоро' : 'Coming soon')}
            </span>
          )}
          <Link className={`${styles.button} ${styles.buttonGhost}`} href={`/${locale}/campus`}>
            {locale === 'uk' ? 'Перейти до Campus' : 'Go to Campus'}
          </Link>
        </div>
      </div>
    </>
  );
}
