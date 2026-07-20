# Runbook: SEO Phase 1 — Search Console & validators

**Roadmap:** [`docs/arvilio-seo-roadmap.md`](../arvilio-seo-roadmap.md) Phase 1  
**When:** After Phase 0 (Payload SEO catalog). Before relying on organic traffic.  
**Time:** ~30–60 minutes once Hub + Campus are on public HTTPS hosts.

## Prerequisites

- Live (or staging) HTTPS origins for Hub and Campus  
- Access to [Google Search Console](https://search.google.com/search-console)  
- CMS admin: `https://<cms>/cms-admin` (local: http://localhost:4410/cms-admin)  
- Optional: Bing Webmaster Tools  

Local smoke (no GSC account needed):

```bash
# Hub must be running (:4400) and CMS (:4410)
node scripts/seo-smoke.mjs
```

## 1. Set publicBaseUrl in CMS

| Surface | Where in cms-admin | Value |
|---------|-------------------|--------|
| Hub | **Hub → Site settings → SEO → Public base URL** | `https://arvilio.app` (or staging Hub origin) |
| Campus | **Campus → Global → SEO → Public base URL** | `https://app.arvilio.app` (or your Campus host) |

Save. Confirm Hub `/robots.txt` shows `Sitemap: https://…/sitemap.xml` and Host matches.

Local fallbacks: `NEXT_PUBLIC_HUB_URL` / `HUB_ORIGIN` / `NEXT_PUBLIC_CAMPUS_URL` if CMS field is empty.

## 2. Google Search Console — Hub

1. Add property → **URL prefix** → `https://arvilio.app` (exact Hub origin).  
2. Choose **HTML tag** verification.  
3. Copy only the `content="…"` token (not the whole meta tag).  
4. Paste into **Hub → Site settings → SEO → Google site verification**.  
5. Save CMS. Soft-refresh Hub home (`/en` or `/uk`).  
6. View source → confirm `<meta name="google-site-verification" content="…">`.  
7. Click **Verify** in GSC.  
8. **Sitemaps** → submit `sitemap.xml` (full URL: `https://<hub>/sitemap.xml`).

## 3. Google Search Console — Campus

1. Add property for Campus origin (e.g. `https://app.arvilio.app`).  
2. HTML tag method → paste token into **Campus → Global → SEO → Google site verification**.  
3. Open Campus login or `/privacy` → confirm meta in source (root + auth layouts emit Global SEO verification).  
4. Verify in GSC.  
5. After Phase 3 ships Campus `sitemap.xml`, submit it here. Until then, URL Inspection on `/privacy` is enough.

## 4. Bing (optional)

1. [Bing Webmaster](https://www.bing.com/webmasters) → add Hub (and Campus) site.  
2. Paste Bing token into the matching **Bing site verification** field in CMS.  
3. Import from GSC if offered.

## 5. Validators (after deploy)

| Check | Tool | URLs |
|-------|------|------|
| JSON-LD | [Rich Results Test](https://search.google.com/test/rich-results) | Hub `/en`, `/en/campus` |
| Open Graph | [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) | Hub home + Campus product landing on Hub |
| Twitter cards | [Card Validator](https://cards-dev.twitter.com/validator) | Same |

Fix failures in CMS (OG image, title, description) — not in hardcoded app strings.

## 6. Checklist → roadmap

When done, tick Phase 1 items in [`arvilio-seo-roadmap.md`](../arvilio-seo-roadmap.md) and add a Changelog line.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Verify fails | Token mismatch; wrong host; CMS not saved; CDN caching old HTML |
| Sitemap “couldn’t fetch” | `publicBaseUrl` still localhost; robots `Disallow: /`; auth wall on Hub |
| No verification meta | Empty CMS field; wrong locale global; check Campus Global vs Hub Site settings |
| Canonical is http://127.0.0.1 | Set `publicBaseUrl` to https production origin |
