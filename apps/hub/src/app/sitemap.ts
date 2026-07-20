import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@pkg/types';
import {
  getAllPages,
  getSiteSettings,
  getVisibleProducts,
  hubPathForPageSlug,
  hubPathForProductSlug,
  resolveHubPublicBaseUrl,
} from '@/lib/cms';

function localeUrl(base: string, locale: string, path: string): string {
  const rest = path === '/' ? '' : path;
  return `${base}/${locale}${rest}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSettings(DEFAULT_LOCALE);
  if (site.sitemapEnabled === false) return [];

  const base = resolveHubPublicBaseUrl(site);
  const locales = (site.enabledLocales?.length ? site.enabledLocales : [...SUPPORTED_LOCALES]) as Locale[];
  const [pages, products] = await Promise.all([
    getAllPages(DEFAULT_LOCALE),
    getVisibleProducts(DEFAULT_LOCALE),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    if (page.noIndex || page.sitemapInclude === false) continue;
    const path = hubPathForPageSlug(page.slug);
    if (!path) continue;
    for (const locale of locales) {
      entries.push({
        url: localeUrl(base, locale, path),
        lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
        changeFrequency: (page.sitemapChangeFrequency as MetadataRoute.Sitemap[0]['changeFrequency']) || undefined,
        priority: page.sitemapPriority ?? (path === '/' ? 1 : 0.7),
      });
    }
  }

  for (const product of products) {
    if (product.noIndex || product.sitemapInclude === false || product.status === 'hidden') continue;
    const path = hubPathForProductSlug(product.slug);
    if (!path) continue;
    for (const locale of locales) {
      entries.push({
        url: localeUrl(base, locale, path),
        lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
        changeFrequency: (product.sitemapChangeFrequency as MetadataRoute.Sitemap[0]['changeFrequency']) || undefined,
        priority: product.sitemapPriority ?? 0.8,
      });
    }
  }

  return entries;
}
