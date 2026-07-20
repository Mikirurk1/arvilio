import {
  campusUiFallbackMap,
  DEFAULT_LOCALE,
  isLocale,
  resolveLocale,
  type Locale,
} from '@pkg/types';
import { cache } from 'react';

/**
 * Campus reads company CMS (`@app/cms`) over HTTP — same pattern as Hub.
 * Missing CMS / keys fall back to catalog in `@pkg/types` campus-ui-catalog.
 */
function cmsBaseUrl(): string {
  return (process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL ?? 'http://127.0.0.1:4410').replace(
    /\/$/,
    '',
  );
}

async function cmsFetch<T>(path: string, locale?: Locale): Promise<T | null> {
  const url = new URL(`/payload-api${path}`, cmsBaseUrl());
  if (locale) {
    url.searchParams.set('locale', locale);
    url.searchParams.set('fallback-locale', 'en');
  }
  try {
    const res = await fetch(url, {
      ...(process.env.NODE_ENV === 'development'
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 30 } }),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.error(`[campus/cms] ${res.status} ${url.pathname}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[campus/cms] fetch failed ${url.toString()}`, err);
    return null;
  }
}

export function resolveCampusLocale(input: {
  userLocale?: string | null;
  schoolDefault?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  return resolveLocale({
    userPreference: input.userLocale,
    schoolDefault: input.schoolDefault,
    acceptLanguage: input.acceptLanguage,
  });
}

export function normalizeCampusLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

type ListResponse<T> = {
  docs: T[];
  totalDocs?: number;
  totalPages?: number;
  page?: number;
  hasNextPage?: boolean;
};

type CmsStringRow = { key?: string | null; value?: string | null };

type CmsMedia =
  | {
      id?: string | number;
      url?: string | null;
      alt?: string | null;
    }
  | string
  | number
  | null
  | undefined;

type CampusGlobalDto = {
  strings?: CmsStringRow[] | null;
  siteName?: string | null;
  titleTemplate?: string | null;
  defaultSeoDescription?: string | null;
  publicBaseUrl?: string | null;
  ogDefaultImage?: CmsMedia;
  twitterHandle?: string | null;
  twitterCardDefault?: string | null;
  robotsIndexDefault?: boolean | null;
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;
};

type CampusContentDoc = {
  id: string | number;
  slug: string;
  title?: string | null;
  subtitle?: string | null;
  body?: unknown;
  strings?: CmsStringRow[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: CmsMedia;
  twitterImage?: CmsMedia;
  canonicalPath?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
};

const CONTENT_PAGE_SIZE = 50;

function mergeStringRows(
  target: Record<string, string>,
  rows: CmsStringRow[] | null | undefined,
): number {
  let n = 0;
  for (const row of rows ?? []) {
    if (row.key && typeof row.value === 'string' && row.value.length > 0) {
      target[row.key] = row.value;
      n += 1;
    }
  }
  return n;
}

async function fetchAllContentDocs(locale: Locale): Promise<CampusContentDoc[]> {
  const docs: CampusContentDoc[] = [];
  let page = 1;
  for (;;) {
    const data = await cmsFetch<ListResponse<CampusContentDoc>>(
      `/campus-content?limit=${CONTENT_PAGE_SIZE}&page=${page}&depth=1`,
      locale,
    );
    if (!data?.docs?.length) break;
    docs.push(...data.docs);
    if (data.hasNextPage === false) break;
    if (typeof data.totalPages === 'number' && page >= data.totalPages) break;
    if (data.docs.length < CONTENT_PAGE_SIZE) break;
    page += 1;
    if (page > 100) break;
  }
  return docs;
}

export const getCampusStringMap = cache(async (locale: Locale): Promise<Record<string, string>> => {
  const fallback = campusUiFallbackMap(locale);
  const [globalDoc, contentDocs] = await Promise.all([
    cmsFetch<CampusGlobalDto>('/globals/campus-global?depth=1', locale),
    fetchAllContentDocs(locale),
  ]);

  const merged = { ...fallback };
  let cmsCount = 0;
  cmsCount += mergeStringRows(merged, globalDoc?.strings);
  for (const doc of contentDocs) {
    cmsCount += mergeStringRows(merged, doc.strings);
  }
  if (cmsCount === 0) return fallback;
  return merged;
});

export type CampusCmsPage = {
  id: string | number;
  slug: string;
  title?: string | null;
  subtitle?: string | null;
  body?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: CmsMedia;
  twitterImage?: CmsMedia;
  canonicalPath?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
};

export type CampusGlobalSeo = {
  siteName?: string | null;
  titleTemplate?: string | null;
  defaultSeoDescription?: string | null;
  publicBaseUrl?: string | null;
  ogDefaultImage?: CmsMedia;
  twitterHandle?: string | null;
  twitterCardDefault?: string | null;
  robotsIndexDefault?: boolean | null;
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;
};

export type CampusNavItem = {
  href: string;
  label: string;
  icon: string;
  labelKey?: string | null;
};

export type CampusNavSection = {
  sectionKey: string;
  sectionLabel: string;
  items: CampusNavItem[];
};

export type CampusNavGlobal = {
  sections?: CampusNavSection[] | null;
};

export type CampusTourStep = {
  stepId: string;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  area?: string | null;
  target?: string | null;
  /** Populated upload relation from Payload (depth≥1). */
  voice?: CmsMedia;
  /** Absolute URL resolved for the browser Audio() player. */
  voiceSrc?: string | null;
};

export type CampusTour = {
  trackId: string;
  steps?: CampusTourStep[] | null;
};

export const getCampusPage = cache(
  async (slug: string, locale: Locale): Promise<CampusCmsPage | null> => {
    const where = encodeURIComponent(JSON.stringify({ slug: { equals: slug } }));
    const data = await cmsFetch<ListResponse<CampusContentDoc>>(
      `/campus-content?limit=1&where=${where}&depth=1`,
      locale,
    );
    const doc = data?.docs?.[0];
    if (!doc) return null;
    return {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      subtitle: doc.subtitle,
      body: doc.body,
      seoTitle: doc.seoTitle,
      seoDescription: doc.seoDescription,
      ogImage: doc.ogImage,
      twitterImage: doc.twitterImage,
      canonicalPath: doc.canonicalPath,
      noIndex: doc.noIndex,
      noFollow: doc.noFollow,
    };
  },
);

export const getCampusGlobalSeo = cache(async (locale: Locale): Promise<CampusGlobalSeo> => {
  const data = await cmsFetch<CampusGlobalDto>('/globals/campus-global?depth=1', locale);
  if (!data) return {};
  return {
    siteName: data.siteName,
    titleTemplate: data.titleTemplate,
    defaultSeoDescription: data.defaultSeoDescription,
    publicBaseUrl: data.publicBaseUrl,
    ogDefaultImage: data.ogDefaultImage,
    twitterHandle: data.twitterHandle,
    twitterCardDefault: data.twitterCardDefault,
    robotsIndexDefault: data.robotsIndexDefault,
    googleSiteVerification: data.googleSiteVerification,
    bingSiteVerification: data.bingSiteVerification,
  };
});

function resolveCampusMediaUrl(media: CmsMedia): string | null {
  if (media == null || typeof media === 'string' || typeof media === 'number') return null;
  const raw = media.url;
  if (!raw || typeof raw !== 'string') return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = cmsBaseUrl();
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
}

export function resolveCampusPublicBaseUrl(seo?: CampusGlobalSeo | null): string {
  const fromCms = seo?.publicBaseUrl?.trim().replace(/\/$/, '');
  if (fromCms) return fromCms;
  return (process.env.NEXT_PUBLIC_CAMPUS_URL ?? 'http://127.0.0.1:4200').replace(/\/$/, '');
}

/** Build Next Metadata for Campus public routes from Content + Global SEO. */
export async function buildCampusPublicMetadata(opts: {
  slug: string;
  locale: Locale;
  path: string;
  fallbackTitle?: string;
}): Promise<import('next').Metadata> {
  const [doc, globalSeo] = await Promise.all([
    getCampusPage(opts.slug, opts.locale),
    getCampusGlobalSeo(opts.locale),
  ]);
  const title =
    doc?.seoTitle?.trim() ||
    doc?.title?.trim() ||
    opts.fallbackTitle ||
    globalSeo.siteName?.trim() ||
    'Arvilio Campus';
  const description =
    doc?.seoDescription?.trim() ||
    doc?.subtitle?.trim() ||
    globalSeo.defaultSeoDescription?.trim() ||
    undefined;
  const og =
    resolveCampusMediaUrl(doc?.ogImage) ??
    resolveCampusMediaUrl(doc?.twitterImage) ??
    resolveCampusMediaUrl(globalSeo.ogDefaultImage);
  const twitterImg =
    resolveCampusMediaUrl(doc?.twitterImage) ??
    resolveCampusMediaUrl(doc?.ogImage) ??
    resolveCampusMediaUrl(globalSeo.ogDefaultImage);
  const index = doc?.noIndex ? false : globalSeo.robotsIndexDefault !== false;
  const follow = !doc?.noFollow;
  const base = resolveCampusPublicBaseUrl(globalSeo);
  const path = doc?.canonicalPath?.trim() || opts.path;
  const canonical = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const twitter = globalSeo.twitterHandle?.replace(/^@/, '');
  const verification: import('next').Metadata['verification'] = {};
  if (globalSeo.googleSiteVerification) verification.google = globalSeo.googleSiteVerification;
  if (globalSeo.bingSiteVerification) {
    verification.other = { 'msvalidate.01': globalSeo.bingSiteVerification };
  }

  return {
    title,
    description,
    robots: index && follow ? undefined : { index, follow },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      siteName: globalSeo.siteName ?? undefined,
      url: canonical,
      ...(og ? { images: [{ url: og }] } : {}),
    },
    twitter: {
      card:
        (globalSeo.twitterCardDefault as 'summary' | 'summary_large_image') ||
        (twitterImg || og ? 'summary_large_image' : 'summary'),
      title,
      description,
      ...(twitter ? { site: `@${twitter}` } : {}),
      ...(twitterImg || og ? { images: [twitterImg || og!] } : {}),
    },
    ...(Object.keys(verification).length ? { verification } : {}),
  };
}

export const getCampusNav = cache(async (locale: Locale): Promise<CampusNavSection[]> => {
  const data = await cmsFetch<CampusNavGlobal>('/globals/campus-nav', locale);
  return data?.sections ?? [];
});

export const getCampusTour = cache(
  async (trackId: string, locale: Locale): Promise<CampusTour | null> => {
    const where = encodeURIComponent(JSON.stringify({ trackId: { equals: trackId } }));
    const data = await cmsFetch<ListResponse<CampusTour>>(
      `/campus-tours?limit=1&where=${where}&depth=1`,
      locale,
    );
    const tour = data?.docs?.[0] ?? null;
    if (!tour?.steps?.length) return tour;
    return {
      ...tour,
      steps: tour.steps.map((step) => ({
        ...step,
        voiceSrc: resolveCampusMediaUrl(step.voice) ?? step.voiceSrc ?? null,
      })),
    };
  },
);

/** Interpolate `{name}` placeholders. */
export function formatCampusString(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  );
}

export function tFromMap(
  map: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const localeFallback = campusUiFallbackMap('en');
  const raw = map[key] ?? localeFallback[key] ?? key;
  return formatCampusString(raw, vars);
}
