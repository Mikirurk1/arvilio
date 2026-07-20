import type { Metadata } from 'next';
import type { Locale } from '@pkg/types';
import { DEFAULT_LOCALE } from '@pkg/types';
import { cache } from 'react';

/**
 * Marketing site reads company CMS over HTTP from `@app/cms`.
 * Local API stays inside the CMS process only.
 */
function cmsBaseUrl(): string {
  return (process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL ?? 'http://127.0.0.1:4410').replace(
    /\/$/,
    '',
  );
}

async function cmsFetch<T>(
  path: string,
  locale?: Locale,
  opts?: { edge?: boolean },
): Promise<T | null> {
  const url = new URL(`/payload-api${path}`, cmsBaseUrl());
  if (locale) {
    url.searchParams.set('locale', locale);
    url.searchParams.set('fallback-locale', 'en');
  }
  if (!url.searchParams.has('depth')) {
    url.searchParams.set('depth', '1');
  }
  try {
    const res = await fetch(url, {
      ...(opts?.edge ? { cache: 'no-store' as const } : { next: { revalidate: 30 } }),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.error(`[hub/cms] ${res.status} ${url.pathname}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[hub/cms] fetch failed ${url.toString()}`, err);
    return null;
  }
}

/** Payload media relation (depth≥1) or raw id. */
export type CmsMedia =
  | {
      id?: string | number;
      url?: string | null;
      filename?: string | null;
      alt?: string | null;
      width?: number;
      height?: number;
      sizes?: {
        og?: { url?: string | null } | null;
        logo?: { url?: string | null } | null;
        thumb?: { url?: string | null } | null;
      } | null;
    }
  | string
  | number
  | null
  | undefined;

export type CmsFaqItem = {
  question?: string | null;
  answer?: string | null;
};

/** Shared document SEO shape (pages + products). */
export type CmsDocumentSeo = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: CmsMedia;
  twitterImage?: CmsMedia;
  canonicalPath?: string | null;
  breadcrumbLabel?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
  sitemapInclude?: boolean | null;
  sitemapPriority?: number | null;
  sitemapChangeFrequency?: string | null;
  jsonLdType?: 'none' | 'WebPage' | 'Product' | 'FAQPage' | 'Article' | string | null;
  faqItems?: CmsFaqItem[] | null;
};

export type CmsProduct = CmsDocumentSeo & {
  id: string | number;
  slug: string;
  status: 'live' | 'coming_soon' | 'hidden' | string;
  sortOrder?: number;
  name?: string | null;
  tagline?: string | null;
  description?: string | null;
  hero?: string | null;
  ctaLabel?: string | null;
  ctaPath?: string | null;
  ctaBaseEnv?: 'campus' | 'connect' | 'custom' | string | null;
  ctaCustomBase?: string | null;
  icon?: CmsMedia;
  logo?: CmsMedia;
  logoOnDark?: CmsMedia;
  primaryColor?: string | null;
  accentColor?: string | null;
  updatedAt?: string | null;
};

export type CmsPage = CmsDocumentSeo & {
  id: string | number;
  slug: string;
  title?: string | null;
  body?: unknown;
  updatedAt?: string | null;
};

export type CmsSiteSettings = {
  defaultLocale?: string | null;
  enabledLocales?: string[] | null;
  connectCtaEnabled?: boolean | null;
  siteName?: string | null;
  titleTemplate?: string | null;
  defaultSeoDescription?: string | null;
  publicBaseUrl?: string | null;
  twitterHandle?: string | null;
  twitterCardDefault?: 'summary' | 'summary_large_image' | string | null;
  facebookAppId?: string | null;
  robotsIndexDefault?: boolean | null;
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;
  websiteJsonLdEnabled?: boolean | null;
  searchActionUrl?: string | null;
  sitemapEnabled?: boolean | null;
  robotsDisallow?: Array<{ path?: string | null }> | null;
  robotsTxtExtra?: string | null;
};

export type CmsBrandKit = {
  primaryColor?: string | null;
  accentColor?: string | null;
  companyLegalName?: string | null;
  supportEmail?: string | null;
  logoMark?: CmsMedia;
  logoWordmark?: CmsMedia;
  logoOnDark?: CmsMedia;
  favicon?: CmsMedia;
  ogDefaultImage?: CmsMedia;
  socialLinks?: Array<{ platform?: string | null; url?: string | null }> | null;
};

export type CmsRedirect = {
  id: string | number;
  fromPath: string;
  toPath?: string | null;
  toUrl?: string | null;
  statusCode?: '301' | '302' | string | null;
  enabled?: boolean | null;
};

type ListResponse<T> = { docs: T[] };

export function resolveMediaUrl(media: CmsMedia, prefer?: 'og' | 'logo' | 'thumb'): string | null {
  if (media == null || typeof media === 'string' || typeof media === 'number') return null;
  const sized = prefer ? media.sizes?.[prefer]?.url : null;
  const raw = (typeof sized === 'string' && sized.trim() ? sized : media.url) ?? null;
  if (!raw || typeof raw !== 'string') return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = cmsBaseUrl();
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
}

export function mediaAlt(media: CmsMedia, fallback = ''): string {
  if (media == null || typeof media === 'string' || typeof media === 'number') return fallback;
  return (media.alt && String(media.alt).trim()) || fallback;
}

export function resolveHubPublicBaseUrl(site?: CmsSiteSettings | null): string {
  const fromCms = site?.publicBaseUrl?.trim().replace(/\/$/, '');
  if (fromCms) return fromCms;
  const fromEnv = (
    process.env.NEXT_PUBLIC_HUB_URL ||
    process.env.HUB_ORIGIN ||
    ''
  ).replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return 'http://127.0.0.1:4400';
}

export function absoluteHubUrl(
  path: string,
  site?: CmsSiteSettings | null,
  locale?: Locale | null,
): string {
  const base = resolveHubPublicBaseUrl(site);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!locale || locale === DEFAULT_LOCALE) {
    // Hub URLs are always locale-prefixed in this app
  }
  if (normalized.startsWith(`/${locale}`) || /^\/(uk|en)(\/|$)/.test(normalized)) {
    return `${base}${normalized}`;
  }
  const loc = locale ?? DEFAULT_LOCALE;
  const rest = normalized === '/' ? '' : normalized;
  return `${base}/${loc}${rest}`;
}

/** Prefer document twitter → og → brand kit OG. */
export function resolveOgImageUrl(
  productOrPage: { ogImage?: CmsMedia; twitterImage?: CmsMedia } | null | undefined,
  brandKit?: CmsBrandKit | null,
): string | null {
  return (
    resolveMediaUrl(productOrPage?.ogImage, 'og') ??
    resolveMediaUrl(brandKit?.ogDefaultImage, 'og') ??
    null
  );
}

export function resolveTwitterImageUrl(
  productOrPage: { ogImage?: CmsMedia; twitterImage?: CmsMedia } | null | undefined,
  brandKit?: CmsBrandKit | null,
): string | null {
  return (
    resolveMediaUrl(productOrPage?.twitterImage, 'og') ??
    resolveMediaUrl(productOrPage?.ogImage, 'og') ??
    resolveMediaUrl(brandKit?.ogDefaultImage, 'og') ??
    null
  );
}

export function resolveProductLogoUrl(product: CmsProduct): string | null {
  return resolveMediaUrl(product.logo, 'logo') ?? resolveMediaUrl(product.icon, 'logo');
}

function robotsForDoc(
  doc: CmsDocumentSeo | null | undefined,
  site?: CmsSiteSettings | null,
): Metadata['robots'] {
  const index = doc?.noIndex ? false : site?.robotsIndexDefault !== false;
  const follow = !doc?.noFollow;
  if (index && follow) return undefined;
  return { index, follow };
}

/**
 * Build Next Metadata from CMS document + Hub site SEO defaults + brand kit OG fallback.
 */
export function buildHubMetadata(opts: {
  doc?: CmsDocumentSeo | null;
  fallbackTitle?: string | null;
  fallbackDescription?: string | null;
  site?: CmsSiteSettings | null;
  brandKit?: CmsBrandKit | null;
  /** Path without locale, e.g. `/pricing` */
  path?: string;
  locale?: Locale;
  languages?: Record<string, string>;
}): Metadata {
  const { doc, site, brandKit, path, locale, languages } = opts;
  const title =
    doc?.seoTitle?.trim() ||
    opts.fallbackTitle?.trim() ||
    site?.siteName?.trim() ||
    'Arvilio';
  const description =
    doc?.seoDescription?.trim() ||
    opts.fallbackDescription?.trim() ||
    site?.defaultSeoDescription?.trim() ||
    undefined;
  const og = resolveOgImageUrl(doc, brandKit);
  const twitterImg = resolveTwitterImageUrl(doc, brandKit);
  const twitter = site?.twitterHandle?.replace(/^@/, '') || undefined;
  const card =
    (site?.twitterCardDefault as 'summary' | 'summary_large_image' | undefined) ||
    (twitterImg || og ? 'summary_large_image' : 'summary');

  const pathForCanonical = doc?.canonicalPath?.trim() || path || undefined;
  const canonical =
    pathForCanonical != null
      ? absoluteHubUrl(pathForCanonical, site, locale ?? DEFAULT_LOCALE)
      : undefined;

  const base = resolveHubPublicBaseUrl(site);
  const absoluteLanguages = languages
    ? Object.fromEntries(
        Object.entries(languages).map(([key, href]) => [
          key,
          href.startsWith('http://') || href.startsWith('https://')
            ? href
            : `${base}${href.startsWith('/') ? href : `/${href}`}`,
        ]),
      )
    : undefined;

  const verification: Metadata['verification'] = {};
  if (site?.googleSiteVerification) verification.google = site.googleSiteVerification;
  if (site?.bingSiteVerification) {
    verification.other = { 'msvalidate.01': site.bingSiteVerification };
  }

  const other: Record<string, string> = {};
  if (site?.facebookAppId) other['fb:app_id'] = site.facebookAppId;

  return {
    title,
    description,
    robots: robotsForDoc(doc, site),
    alternates: {
      ...(absoluteLanguages ? { languages: absoluteLanguages } : {}),
      ...(canonical ? { canonical } : {}),
    },
    openGraph: {
      title,
      description,
      siteName: site?.siteName ?? undefined,
      url: canonical,
      ...(og ? { images: [{ url: og }] } : {}),
    },
    twitter: {
      card,
      title,
      description,
      ...(twitter ? { site: `@${twitter}` } : {}),
      ...(twitterImg || og ? { images: [twitterImg || og!] } : {}),
    },
    ...(Object.keys(verification).length ? { verification } : {}),
    ...(Object.keys(other).length ? { other } : {}),
  };
}

export function buildOrganizationJsonLd(opts: {
  site?: CmsSiteSettings | null;
  brandKit?: CmsBrandKit | null;
}): Record<string, unknown> | null {
  const { site, brandKit } = opts;
  if (site?.websiteJsonLdEnabled === false) return null;
  const name =
    brandKit?.companyLegalName?.trim() || site?.siteName?.trim() || 'Arvilio';
  const url = resolveHubPublicBaseUrl(site);
  const logo =
    resolveMediaUrl(brandKit?.logoWordmark) ?? resolveMediaUrl(brandKit?.logoMark) ?? undefined;
  const sameAs = (brandKit?.socialLinks ?? [])
    .map((l) => l.url?.trim())
    .filter((u): u is string => Boolean(u));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo ? { logo } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(brandKit?.supportEmail ? { email: brandKit.supportEmail } : {}),
  };
}

export function buildWebsiteJsonLd(opts: {
  site?: CmsSiteSettings | null;
  brandKit?: CmsBrandKit | null;
}): Record<string, unknown> | null {
  const { site, brandKit } = opts;
  if (site?.websiteJsonLdEnabled === false) return null;
  const name = site?.siteName?.trim() || brandKit?.companyLegalName?.trim() || 'Arvilio';
  const url = resolveHubPublicBaseUrl(site);
  const search = site?.searchActionUrl?.trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(search
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: search,
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  };
}

export function buildDocumentJsonLd(opts: {
  doc?: CmsDocumentSeo | null;
  fallbackName?: string | null;
  site?: CmsSiteSettings | null;
  brandKit?: CmsBrandKit | null;
  path?: string;
  locale?: Locale;
}): Record<string, unknown> | null {
  const { doc, site, brandKit, path, locale } = opts;
  const type = doc?.jsonLdType;
  if (!type || type === 'none') return null;
  const name =
    doc?.breadcrumbLabel?.trim() ||
    doc?.seoTitle?.trim() ||
    opts.fallbackName?.trim() ||
    site?.siteName?.trim() ||
    'Arvilio';
  const description = doc?.seoDescription?.trim() || site?.defaultSeoDescription?.trim();
  const url = path ? absoluteHubUrl(path, site, locale ?? DEFAULT_LOCALE) : undefined;
  const image = resolveOgImageUrl(doc, brandKit) ?? undefined;

  if (type === 'FAQPage' && doc?.faqItems?.length) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: doc.faqItems
        .filter((i) => i.question?.trim() && i.answer?.trim())
        .map((i) => ({
          '@type': 'Question',
          name: i.question,
          acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(image ? { image } : {}),
  };
}

/** BreadcrumbList from CMS breadcrumbLabel / titles. Skip for home-only trails. */
export function buildBreadcrumbJsonLd(opts: {
  trail: { name: string; path: string }[];
  site?: CmsSiteSettings | null;
  locale?: Locale;
}): Record<string, unknown> | null {
  const trail = opts.trail.filter((item) => item.name.trim() && item.path);
  if (trail.length < 2) return null;
  const locale = opts.locale ?? DEFAULT_LOCALE;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name.trim(),
      item: absoluteHubUrl(item.path, opts.site, locale),
    })),
  };
}

/** Map CMS page slug → Hub path without locale. */
export function hubPathForPageSlug(slug: string): string | null {
  switch (slug) {
    case 'home':
      return '/';
    case 'pricing':
      return '/pricing';
    case 'legal-terms':
      return '/legal/terms';
    case 'legal-privacy':
      return '/legal/privacy';
    case 'legal-cookies':
      return '/legal/cookies';
    default:
      return null;
  }
}

export function hubPathForProductSlug(slug: string): string | null {
  if (slug === 'campus' || slug === 'connect') return `/${slug}`;
  return null;
}

export const getSiteSettings = cache(async (locale?: Locale): Promise<CmsSiteSettings> => {
  return (await cmsFetch<CmsSiteSettings>('/globals/site-settings', locale)) ?? {};
});

export const getBrandKit = cache(async (): Promise<CmsBrandKit> => {
  return (await cmsFetch<CmsBrandKit>('/globals/brand-kit')) ?? {};
});

export const getVisibleProducts = cache(async (locale: Locale): Promise<CmsProduct[]> => {
  const where = encodeURIComponent(JSON.stringify({ status: { not_equals: 'hidden' } }));
  const data = await cmsFetch<ListResponse<CmsProduct>>(
    `/products?limit=50&sort=sortOrder&where=${where}`,
    locale,
  );
  return data?.docs ?? [];
});

export const getAllPages = cache(async (locale: Locale): Promise<CmsPage[]> => {
  const data = await cmsFetch<ListResponse<CmsPage>>(`/pages?limit=100&depth=0`, locale);
  return data?.docs ?? [];
});

export const getProductBySlug = cache(async (slug: string, locale: Locale): Promise<CmsProduct | null> => {
  const where = encodeURIComponent(JSON.stringify({ slug: { equals: slug } }));
  const data = await cmsFetch<ListResponse<CmsProduct>>(
    `/products?limit=1&where=${where}`,
    locale,
  );
  return data?.docs?.[0] ?? null;
});

export const getPageBySlug = cache(async (slug: string, locale: Locale): Promise<CmsPage | null> => {
  const where = encodeURIComponent(JSON.stringify({ slug: { equals: slug } }));
  const data = await cmsFetch<ListResponse<CmsPage>>(`/pages?limit=1&where=${where}`, locale);
  return data?.docs?.[0] ?? null;
});

export const getEnabledRedirects = cache(async (): Promise<CmsRedirect[]> => {
  return fetchEnabledRedirects();
});

export type { RedirectMatch } from './match-redirect';
export { matchRedirect } from './match-redirect';

/** Edge-safe (no React cache) for middleware. */
export async function fetchEnabledRedirects(): Promise<CmsRedirect[]> {
  const where = encodeURIComponent(JSON.stringify({ enabled: { equals: true } }));
  const data = await cmsFetch<ListResponse<CmsRedirect>>(
    `/redirects?limit=200&depth=0&where=${where}`,
    undefined,
    { edge: true },
  );
  return data?.docs ?? [];
}

/** Flatten Lexical JSON to plain paragraphs for simple marketing pages. */
export function lexicalToPlainParagraphs(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return [];

  const paragraphs: string[] = [];
  for (const node of root.children) {
    if (!node || typeof node !== 'object') continue;
    const n = node as { type?: string; children?: Array<{ text?: string }> };
    if (n.type === 'paragraph' && Array.isArray(n.children)) {
      const text = n.children.map((c) => c.text ?? '').join('').trim();
      if (text) paragraphs.push(text);
    }
  }
  return paragraphs;
}
