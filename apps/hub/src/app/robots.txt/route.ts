import { getSiteSettings, resolveHubPublicBaseUrl } from '@/lib/cms';

/** Plain-text robots.txt so CMS `robotsTxtExtra` can append free-form lines. */
export async function GET() {
  const site = await getSiteSettings();
  const base = resolveHubPublicBaseUrl(site);
  const lines: string[] = ['User-agent: *'];

  if (site.robotsIndexDefault === false) {
    lines.push('Disallow: /');
  } else {
    lines.push('Allow: /');
    for (const row of site.robotsDisallow ?? []) {
      const path = row.path?.trim();
      if (path) lines.push(`Disallow: ${path}`);
    }
  }

  lines.push('');
  const host = base.replace(/^https?:\/\//, '');
  if (host) lines.push(`Host: ${host}`);
  if (site.sitemapEnabled !== false) {
    lines.push(`Sitemap: ${base}/sitemap.xml`);
  }

  const extra = site.robotsTxtExtra?.trim();
  if (extra) {
    lines.push('');
    lines.push(extra);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
