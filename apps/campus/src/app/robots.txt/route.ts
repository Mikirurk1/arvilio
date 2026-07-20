import {
  getCampusGlobalSeo,
  resolveCampusPublicBaseUrl,
} from '@/lib/cms/campus-cms';
import { DEFAULT_LOCALE } from '@pkg/types';

/** Authenticated / private app areas — keep out of crawl when indexing is on. */
const DISALLOW_PATHS = [
  '/dashboard',
  '/lessons',
  '/vocabulary',
  '/quiz',
  '/chat',
  '/profile',
  '/students',
  '/staff',
  '/billing',
  '/finance',
  '/calendar',
  '/materials',
  '/payment',
  '/practice',
  '/speaking',
  '/system',
  '/platform',
  '/cms-proxy',
  '/api',
];

/** Plain-text robots.txt from Campus Global SEO. */
export async function GET() {
  const seo = await getCampusGlobalSeo(DEFAULT_LOCALE);
  const base = resolveCampusPublicBaseUrl(seo);
  const lines: string[] = ['User-agent: *'];

  if (seo.robotsIndexDefault === false) {
    lines.push('Disallow: /');
  } else {
    lines.push('Allow: /');
    for (const path of DISALLOW_PATHS) {
      lines.push(`Disallow: ${path}`);
    }
  }

  lines.push('');
  const host = base.replace(/^https?:\/\//, '');
  if (host) lines.push(`Host: ${host}`);
  lines.push(`Sitemap: ${base}/sitemap.xml`);

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
