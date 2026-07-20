#!/usr/bin/env node
/**
 * SEO smoke — Hub (+ optional Campus) crawl hygiene.
 *
 * Usage:
 *   node scripts/seo-smoke.mjs
 *   HUB_URL=https://preview.example npm run seo:smoke
 *   CAMPUS_URL=http://127.0.0.1:4200 npm run seo:smoke
 *
 * Env:
 *   HUB_URL      default http://127.0.0.1:4400
 *   CAMPUS_URL   optional — also smoke Campus robots/sitemap + public locs
 *   SEO_SMOKE_MAX_URLS  cap sitemap URL checks (default 40)
 */
const hub = (process.env.HUB_URL ?? 'http://127.0.0.1:4400').replace(/\/$/, '');
const campus = (process.env.CAMPUS_URL ?? '').replace(/\/$/, '');
const maxUrls = Math.max(1, Number(process.env.SEO_SMOKE_MAX_URLS ?? 40) || 40);

async function get(base, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const res = await fetch(url, {
    redirect: opts.redirect ?? 'follow',
    headers: { Accept: '*/*' },
  });
  const text = opts.skipBody ? '' : await res.text();
  return { status: res.status, text, url: res.url, headers: res.headers };
}

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`OK    ${msg}`);
}

function warn(msg) {
  console.warn(`WARN  ${msg}`);
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter(Boolean);
}

async function checkSitemapUrls(label, locs) {
  const slice = locs.slice(0, maxUrls);
  if (locs.length > maxUrls) {
    warn(`${label}: checking first ${maxUrls} of ${locs.length} sitemap URLs (SEO_SMOKE_MAX_URLS)`);
  }
  let failed = 0;
  for (const loc of slice) {
    try {
      const res = await get(loc, '', { skipBody: true });
      if (res.status !== 200) {
        fail(`${label} sitemap loc ${loc} → ${res.status}`);
        failed += 1;
      }
    } catch (err) {
      fail(`${label} sitemap loc ${loc} → ${err instanceof Error ? err.message : err}`);
      failed += 1;
    }
  }
  if (failed === 0) ok(`${label} sitemap locs ${slice.length}/${locs.length} returned 200`);
}

async function smokeHub() {
  console.log(`SEO smoke → Hub ${hub}\n`);

  const robots = await get(hub, '/robots.txt');
  if (robots.status !== 200) fail(`robots.txt status ${robots.status}`);
  else ok('robots.txt 200');
  if (!/sitemap:/i.test(robots.text)) fail('robots.txt missing Sitemap:');
  else ok('robots.txt has Sitemap');
  if (!/user-agent:/i.test(robots.text)) fail('robots.txt missing User-agent');
  else ok('robots.txt has User-agent');

  const sitemap = await get(hub, '/sitemap.xml');
  if (sitemap.status !== 200) fail(`sitemap.xml status ${sitemap.status}`);
  else ok('sitemap.xml 200');
  if (!/<urlset/i.test(sitemap.text)) fail('sitemap.xml not a urlset');
  else ok('sitemap.xml urlset');
  const locs = parseLocs(sitemap.text);
  if (locs.length < 1) fail('sitemap.xml has no <loc>');
  else ok(`sitemap.xml ${locs.length} URLs`);

  await checkSitemapUrls('Hub', locs);

  const home = await get(hub, '/en');
  if (home.status !== 200) fail(`/en status ${home.status}`);
  else ok('/en 200');
  if (!/application\/ld\+json/i.test(home.text)) fail('/en missing JSON-LD');
  else ok('/en JSON-LD present');
  if (!/rel="canonical"/i.test(home.text)) fail('/en missing canonical');
  else ok('/en canonical present');
  if (!/og:title/i.test(home.text)) fail('/en missing og:title');
  else ok('/en og:title present');

  const hreflangAbs = [...home.text.matchAll(/hreflang="([^"]+)"[^>]*href="(https?:\/\/[^"]+)"/gi)];
  const hreflangAny = [...home.text.matchAll(/hreflang="([^"]+)"/gi)];
  if (hreflangAny.length < 2) fail('/en missing hreflang alternates');
  else ok(`/en hreflang count ${hreflangAny.length}`);
  if (hreflangAbs.length >= 2) ok('/en hreflang URLs are absolute');
  else warn('/en hreflang still relative (ok for local if publicBaseUrl empty)');

  const pricing = await get(hub, '/en/pricing');
  if (pricing.status !== 200) fail(`/en/pricing status ${pricing.status}`);
  else ok('/en/pricing 200');
  if (!/hreflang=/i.test(pricing.text)) fail('/en/pricing missing hreflang');
  else ok('/en/pricing hreflang present');
  if (!/BreadcrumbList/i.test(pricing.text)) warn('/en/pricing missing BreadcrumbList JSON-LD');
  else ok('/en/pricing BreadcrumbList present');

  // CMS redirects (seeded): /home → / — expect 301/302 then land on locale home
  const redirectProbe = await get(hub, '/en/home', { redirect: 'manual', skipBody: true });
  if (redirectProbe.status === 301 || redirectProbe.status === 302) {
    const loc = redirectProbe.headers.get('location') ?? '';
    if (/\/en\/?$/.test(loc) || loc.endsWith('/en')) ok(`CMS redirect /en/home → ${redirectProbe.status} ${loc}`);
    else warn(`CMS redirect /en/home → ${redirectProbe.status} location=${loc}`);
  } else if (redirectProbe.status === 404) {
    warn('CMS redirect /home not seeded (run npm run seed -w @app/cms)');
  } else {
    warn(`CMS redirect probe /en/home status ${redirectProbe.status} (expected 301/302 after seed)`);
  }
}

async function smokeCampus() {
  console.log(`\nSEO smoke → Campus ${campus}\n`);

  let robots;
  try {
    robots = await get(campus, '/robots.txt');
  } catch (err) {
    fail(`Campus unreachable (${err instanceof Error ? err.message : err})`);
    return;
  }
  if (robots.status !== 200) fail(`Campus robots.txt status ${robots.status}`);
  else ok('Campus robots.txt 200');
  if (/location:\s*\/login/i.test(String(robots.headers.get('location') ?? ''))) {
    fail('Campus robots.txt redirected to login (proxy must bypass crawl files)');
  }

  const sitemap = await get(campus, '/sitemap.xml');
  if (sitemap.status !== 200) fail(`Campus sitemap.xml status ${sitemap.status}`);
  else ok('Campus sitemap.xml 200');
  const locs = parseLocs(sitemap.text);
  if (locs.length < 1) fail('Campus sitemap has no <loc>');
  else ok(`Campus sitemap ${locs.length} URLs`);

  await checkSitemapUrls('Campus', locs);

  const login = await get(campus, '/login');
  if (login.status !== 200) fail(`Campus /login status ${login.status}`);
  else ok('Campus /login 200');
  if (!/rel="canonical"/i.test(login.text)) warn('Campus /login missing canonical');
  else ok('Campus /login canonical present');
}

async function main() {
  await smokeHub();
  if (campus) await smokeCampus();
  else console.log('\n(tip: set CAMPUS_URL to also smoke Campus robots/sitemap)');

  console.log(process.exitCode ? '\nSmoke finished with failures.' : '\nSmoke passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
