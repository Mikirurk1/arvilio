# Arvilio SEO roadmap

Phased plan for Hub + Campus SEO after the Payload catalog is in place.  
Work **one phase at a time**; check boxes when done. Do not reopen Payload field sprawl unless a phase explicitly needs it.

**Related**

- CMS model: [`docs/arvilio-marketing-site-payload-plan.md`](./arvilio-marketing-site-payload-plan.md) §5 SEO  
- Wiki: [`docs/llm-wiki/wiki/concepts/payload-cms.md`](./llm-wiki/wiki/concepts/payload-cms.md) (SEO catalog)  
- Seed Campus SEO: `npm run seed:campus-ui -w @app/cms`  
- Migrate SEO columns: `npm run migrate:seo -w @app/cms`

**Out of scope for this roadmap**

- School / tenant white-label SEO (Prisma `School`)  
- `keywords` meta  
- Connect standalone site SEO (until Connect web ships)  
- Rank-tracking SaaS as a hard dependency (optional later)

---

## Status legend

| Mark | Meaning |
|------|---------|
| `[x]` | Done in code / CMS |
| `[ ]` | Not started |
| `(ops)` | Manual / account work, not a code PR |
| `(code)` | Engineering in monorepo |

---

## Phase 0 — Foundation (Payload + Hub/Campus runtime)

**Goal:** Editors can manage SEO in cms-admin; Hub/Campus emit correct meta.

### Payload / CMS

- [x] Hub `site-settings` → SEO (siteName, titleTemplate, description, publicBaseUrl, Twitter, robots, GSC/Bing, sitemap toggle, JSON-LD flags)
- [x] Hub `brand-kit` OG fallback + social / legal for Organization
- [x] Document SEO on `pages` / `products` / `campus-content`
- [x] Collection `redirects` (Hub)
- [x] Campus Global + Content SEO fields; public routes seeded
- [x] `media.alt` required

### Apps

- [x] Hub `buildHubMetadata`, absolute canonical, hreflang
- [x] Hub `robots.ts` + `sitemap.ts`
- [x] Hub Organization + WebSite JSON-LD; document JSON-LD when set
- [x] Hub middleware applies CMS redirects
- [x] Campus `buildCampusPublicMetadata` on privacy / legal public pages

**Exit criteria:** Local Hub `/robots.txt`, `/sitemap.xml`, page `<title>` / OG from CMS; Campus privacy title from Content SEO.

---

## Phase 1 — Verify & wire Search Console `(ops + light code)`

**Goal:** Production (or staging) domains are verified and receiving sitemaps.

**Runbook:** [`docs/runbooks/seo-phase1-search-console.md`](./runbooks/seo-phase1-search-console.md)  
**Local smoke:** `node scripts/seo-smoke.mjs` (Hub on :4400)

### Code / readiness (done)

- [x] `(code)` Hub robots.txt route supports CMS disallow + `robotsTxtExtra` + Sitemap  
- [x] `(code)` Hub `publicBaseUrl` falls back to `NEXT_PUBLIC_HUB_URL` / `HUB_ORIGIN`  
- [x] `(code)` Campus root + auth layouts emit GSC/Bing verification from Global SEO  
- [x] `(code)` Smoke script + Phase 1 runbook  

### Ops (your turn — needs live HTTPS + GSC account)

1. [ ] `(ops)` Create Google Search Console properties for Hub + Campus public hosts  
2. [ ] `(ops)` Paste verification tokens into CMS → Hub Site settings SEO / Campus Global SEO  
3. [ ] `(ops)` Confirm `publicBaseUrl` on Hub + Campus Global matches the live origin (https)  
4. [ ] `(ops)` Submit `https://<hub>/sitemap.xml` in GSC  
5. [ ] `(ops)` Bing Webmaster (optional; same CMS fields)  
6. [ ] `(ops)` Validate 2–3 URLs in [Rich Results Test](https://search.google.com/test/rich-results) (Organization / WebSite)  
7. [ ] `(ops)` Facebook Sharing Debugger + X Card Validator on home + one product landing  

**Exit criteria:** GSC shows sitemap as fetched; no critical verification errors.

---

## Phase 2 — Hub content completeness `(ops + seed)`

**Goal:** Every indexed Hub URL has intentional SEO copy and OG image strategy.

### Done via seed / code

1. [x] `(code)` Hub seed fills Pages SEO (home, pricing, legal-*) for **uk + en** + canonical / jsonLd / sitemap fields  
2. [x] `(code)` Hub seed fills Products SEO (campus, connect) with same extras  
3. [x] `(code)` Seed generates Brand kit `ogDefaultImage` (1200×630 PNG placeholder) — replace with final art in cms-admin when ready  
4. [x] `(code)` Hub `publicBaseUrl` from CMS / `NEXT_PUBLIC_HUB_URL` / `HUB_ORIGIN` (set HTTPS origin in CMS for prod)  
5. [x] `(code)` Absolute hreflang URLs in `buildHubMetadata`  
6. [x] `(code)` Spot-check via `node scripts/seo-smoke.mjs` (home + pricing hreflang)

### Still optional (ops)

- [ ] `(ops)` Replace placeholder OG with final brand artwork; per-product `ogImage` if distinct  
- [ ] `(ops)` Set Twitter handle in Site settings when account exists  
- [ ] `(ops)` On production, set `publicBaseUrl` to `https://arvilio.app` (not localhost)

**Exit criteria:** No indexed Hub URL relies only on hardcoded layout fallbacks. ✅ met locally via seed.

---

## Phase 3 — Campus public surface `(code + ops)`

**Goal:** Campus public URLs are crawlable consistently (meta already seeded).

1. [x] `(code)` Campus `app/robots.txt/route.ts` driven by Campus Global SEO (disallow authenticated areas)  
2. [x] `(code)` Campus `app/sitemap.ts` for public slugs only (`privacy`, `legal-*`, auth, status)  
3. [x] `(code)` Wire `generateMetadata` on auth pages (login / signup / forgot / reset) via `auth-page-seo.ts`  
4. [x] `(code)` Proxy bypass: `/robots.txt` + `/sitemap.xml` must not redirect to `/login` (`proxy.ts`)  
5. [ ] `(ops)` Confirm noIndex on dashboard/lessons/etc. remains true after re-seed (seed already sets `noIndex` on chrome Content)  
6. [ ] `(ops)` GSC property for Campus + sitemap submit  

**Exit criteria:** Campus sitemap lists only public URLs; authenticated chrome stays noindex. Code exit met locally (robots/sitemap 200, login title/canonical from CMS).

---

## Phase 4 — Editor UX `(code)`

**Goal:** Safer editing without guessing SERP length.

1. [x] `(code)` Evaluate `@payloadcms/plugin-seo` → **skip** (duplicates our custom SEO catalog; add dependency for little gain)  
2. [x] `(code)` Character hints: `maxLength` 60/160 + admin descriptions on `seoTitle` / `seoDescription` (+ site defaults)  
3. [x] `(code)` Editor checklist on SEO collapsible / tab descriptions  
4. [x] `(code)` Breadcrumb JSON-LD on Hub (`buildBreadcrumbJsonLd` + pricing/campus/connect/legal; home keeps document JSON-LD only)  

**Exit criteria:** Editors can see whether title/description are roughly SERP-safe. ✅ met via field limits + checklist.

---

## Phase 5 — Performance & CWV `(code + ops)`

**Goal:** Technical SEO via Core Web Vitals, not more meta fields.

1. [x] `(code)` Local Lighthouse smoke + runbook [`docs/runbooks/seo-phase5-cwv.md`](runbooks/seo-phase5-cwv.md) (ops PSI on live hosts still open)  
2. [x] `(code)` Hub `next/font` (drop Google CSS); `CmsLogo` reserved size; Campus login `priority` + brand min-height  
3. [x] `(code)` CMS media `Cache-Control` + Payload `imageSizes` (`og` / `logo` / `thumb`); Hub prefers sized URLs when present  
4. [ ] `(ops)` PageSpeed Insights on production Hub home + Campus login (mobile) — re-measure after deploy  

**Exit criteria:** No “Poor” LCP/CLS on primary Hub landing in PSI mobile. Code mitigations done; CLS=0 on local Lighthouse; production PSI still ops.

---

## Phase 6 — Crawl hygiene & redirects `(ops + code)`

**Goal:** URL changes do not create soft-404s or chains.

1. [x] `(code)` Seed starter Hub redirects + cms-admin guidance; ops maintain via runbook [`docs/runbooks/seo-phase6-crawl-redirects.md`](runbooks/seo-phase6-crawl-redirects.md)  
2. [x] `(code)` `npm run seo:smoke` fetches all sitemap `<loc>` (Hub + optional Campus) expecting 200; probe CMS redirect `/home`  
3. [ ] `(ops)` Quarterly Screaming Frog (or similar) on Hub production  
4. [x] `(code)` IndexNow — **skip** until Hub publish cadence justifies Bing push  

**Exit criteria:** Known old URLs 301 to current; sitemap URLs return 200. ✅ met locally via smoke (+ seed redirects).

---

## Phase 7 — Measurement loop `(ops)`

**Goal:** SEO work is guided by data, not guesses.

1. [ ] Align PostHog / GA4 landing reports with Hub paths (UTM from product CTAs already exist)  
2. [ ] Monthly GSC review: queries, pages, coverage errors  
3. [ ] Decide if Ahrefs/Semrush is needed (competitor gaps) — skip until organic volume exists  
4. [ ] Feed learnings back into Hub Pages / Products copy in CMS  

**Exit criteria:** Recurring review habit; CMS copy updated from GSC insights.

---

## Phase 8 — Connect (when Connect web exists)

**Goal:** Same SEO seams as Hub/Campus for the Connect product site.

1. [ ] Connect Site settings / Global SEO (or reuse Products SEO only if Connect stays Hub-only landings)  
2. [ ] robots + sitemap for Connect host  
3. [ ] GSC property + verification tokens  
4. [ ] Do **not** put Connect chrome SEO into Campus collections  

---

## How we work this plan

1. Pick the **lowest unchecked phase** (usually Phase 1 next).  
2. Open a focused PR or ops checklist for that phase only.  
3. Check items here when done; append a one-line note under **Changelog** below.  
4. Update wiki `concepts/payload-cms.md` only if code/CMS behavior changes.

---

## Changelog

| Date | Note |
|------|------|
| 2026-07-19 | Phase 6 code: seed Hub redirects, seo-smoke fetches all sitemap locs (+ optional Campus), runbook `seo-phase6-crawl-redirects.md`; IndexNow skipped. Ops: quarterly crawl. Next: Phase 7 (measurement) or remaining GSC/PSI ops. |
| 2026-07-19 | Phase 5 code: Hub next/font, CmsLogo CLS, CMS media cache + imageSizes, Campus login LCP hints; runbook `seo-phase5-cwv.md`. Ops: PSI on live hosts. Next: Phase 6 or GSC ops. |
| 2026-07-19 | Phase 4: skip plugin-seo; SERP maxLength + editor checklist; Hub BreadcrumbList JSON-LD on pricing/products/legal. Next: Phase 5 (CWV) or remaining ops (GSC). |
| 2026-07-19 | Phase 3 code: Campus robots.txt + sitemap (public only), auth `generateMetadata`, proxy bypass for crawl files. Ops: GSC Campus + re-seed noIndex check. Next: Phase 4 (editor UX). |
| 2026-07-19 | Phase 2: Hub seed full page/product SEO + default OG PNG; absolute hreflang; smoke checks pricing. Optional: replace OG art + Twitter handle on prod. Next: Phase 3 (Campus robots/sitemap). |
| 2026-07-19 | Phase 1 code readiness: runbook, `seo-smoke.mjs`, Hub robots.txt route + HUB_ORIGIN fallback, Campus verification meta on root/auth layouts. Ops GSC steps remain for live hosts. |
| 2026-07-19 | Roadmap created. Phase 0 complete (Payload SEO catalog + Hub runtime + Campus public metadata + Campus SEO seed). Next: Phase 1. |
