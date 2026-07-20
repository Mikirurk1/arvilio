import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE } from '@pkg/types';
import {
  getCampusGlobalSeo,
  getCampusPage,
  resolveCampusPublicBaseUrl,
} from '@/lib/cms/campus-cms';

/** Public Campus URLs eligible for sitemap (Content SEO / seed). */
const PUBLIC_ENTRIES: Array<{ slug: string; path: string; priority: number }> = [
  { slug: 'privacy', path: '/privacy', priority: 0.5 },
  { slug: 'legal-terms', path: '/legal/terms', priority: 0.4 },
  { slug: 'legal-payment-refund', path: '/legal/payment-refund', priority: 0.4 },
  { slug: 'login', path: '/login', priority: 0.3 },
  { slug: 'signup', path: '/signup', priority: 0.3 },
  { slug: 'forgot', path: '/forgot-password', priority: 0.2 },
  { slug: 'status', path: '/status', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getCampusGlobalSeo(DEFAULT_LOCALE);
  if (seo.robotsIndexDefault === false) return [];

  const base = resolveCampusPublicBaseUrl(seo);
  const entries: MetadataRoute.Sitemap = [];

  for (const item of PUBLIC_ENTRIES) {
    const doc = await getCampusPage(item.slug, DEFAULT_LOCALE);
    if (doc?.noIndex) continue;
    const path = doc?.canonicalPath?.trim() || item.path;
    entries.push({
      url: `${base}${path.startsWith('/') ? path : `/${path}`}`,
      changeFrequency: 'yearly',
      priority: item.priority,
    });
  }

  return entries;
}
