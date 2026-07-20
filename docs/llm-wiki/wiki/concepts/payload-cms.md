---
tags: [concept, cms, frontend, i18n]
updated: 2026-07-20
---

# Payload CMS

## CMS — `apps/cms`

Payload CMS v3 for **Hub marketing + Campus UI chrome** lives in **`apps/cms`** (`@app/cms`, port **4410**):

- Admin UI: `http://localhost:4410/cms-admin`
- API: `/payload-api`
- Config: `apps/cms/payload.config.ts`
- Postgres schema: **`payload_www`**
- Seed marketing: `npm run seed -w @app/cms`
- Seed Campus UI (uk+en): `npm run seed:campus-ui -w @app/cms`
- Dev: `npm run dev:cms`

**Not** embedded in Hub or Campus.

### Admin menu (by brand)

One instance; sidebar groups by brand. **Shared** assets are brand-agnostic:

| Group | Items |
|-------|--------|
| **Shared** | `users` (CMS editors), `media` (uploads used by any brand) |
| **Hub** | `brand-kit`, `site-settings`, `products`, `pages`, `redirects` |
| **Campus** | **Content**, **Global**, Nav, Tours, **Tour audio** (MP3 for step narration) |
| **Connect** | **Overview** (`connect-prep`) — placeholder until Phase E |

### SEO model (Payload) — full catalog

School white-label SEO stays in Prisma. Connect landings use **Products → SEO** until Connect has its own site.

#### Hub site defaults — `site-settings` → SEO

| Field | Role |
|-------|------|
| `siteName`, `titleTemplate`, `defaultSeoDescription` | Titles / fallbacks |
| `publicBaseUrl` | Absolute canonical / sitemap / JSON-LD origin |
| `twitterHandle`, `twitterCardDefault`, `facebookAppId` | Social |
| `robotsIndexDefault`, `robotsDisallow[]`, `robotsTxtExtra` | robots.txt |
| `sitemapEnabled` | Toggle Hub `sitemap.xml` |
| `googleSiteVerification`, `bingSiteVerification` | Webmaster |
| `websiteJsonLdEnabled`, `searchActionUrl` | Organization + WebSite JSON-LD |

OG image fallback: `brand-kit.ogDefaultImage` (+ `socialLinks`, `companyLegalName` for JSON-LD).

#### Document SEO — `pages` / `products` / `campus-content`

Shared fields in `payload/fields/seo.ts`: `seoTitle`, `seoDescription`, `ogImage`, `twitterImage`, `canonicalPath`, `breadcrumbLabel`, `noIndex`, `noFollow`, `sitemapInclude`, `sitemapPriority`, `sitemapChangeFrequency`, `jsonLdType`. Hub **pages** also have `faqItems[]` when `jsonLdType=FAQPage`.

#### Hub redirects — collection `redirects`

`fromPath`, `toPath` \| `toUrl`, `statusCode` (301/302), `enabled`. Applied in Hub middleware (`matchRedirect`, locale-aware). Seed starters: `/home` → `/`, `/products/campus|connect` → product landings. Smoke: `npm run seo:smoke` (sitemap locs → 200). Runbook: [`docs/runbooks/seo-phase6-crawl-redirects.md`](../../../runbooks/seo-phase6-crawl-redirects.md). IndexNow skipped until publish cadence rises.

#### Campus — `campus-global` SEO + Content SEO

Global: site defaults + GSC/Bing + `publicBaseUrl` + `ogDefaultImage`. Content: same document SEO. Wired on public routes (`/privacy`, `/legal/*`, auth) via `buildCampusPublicMetadata` / `auth-page-seo.ts`.

**Campus runtime**

- `app/robots.txt/route.ts` — Global SEO + hard disallow of authenticated app paths
- `app/sitemap.ts` — public slugs only (privacy, legal, auth, status)
- `proxy.ts` must pass `/robots.txt` and `/sitemap.xml` without auth redirect

#### Hub runtime

- `buildHubMetadata` — absolute canonical, Twitter card, verification
- `app/robots.txt/route.ts`, `app/sitemap.ts`
- Locale layout: Organization + WebSite JSON-LD
- Document + `BreadcrumbList` JSON-LD on marketing pages (`breadcrumbLabel` / title)
- Editor UX: `maxLength` 60/160 on SEO title/description; checklist on SEO tabs (no `@payloadcms/plugin-seo`)
- CWV: Hub self-hosts fonts via `next/font`; product logos via `CmsLogo`; CMS media long-cache + `imageSizes` (og/logo/thumb)
- Migrate: `npm run migrate:seo -w @app/cms`

**Out of Payload:** keywords, GA/GTM, Search Console API, school tenant SEO.

**Roadmap (phased ops + code):** [`docs/arvilio-seo-roadmap.md`](../../../arvilio-seo-roadmap.md) — Phase 0–6 code done; next Phase 7 (measurement) or remaining ops (GSC / PSI / quarterly crawl).

### Campus Content + Global

Page-scoped copy (not one flat string dump):

| Admin | Slug | Role |
|-------|------|------|
| **Content** | `campus-content` | One doc per screen (`dashboard`, `lessons`, …). Admin tabs: **Page** (title/subtitle/body) · **Strings** · **SEO**. Not Hub `pages`. |
| **Global** | `campus-global` | Shared chrome keys (`nav.*`, `header.*`, `common.*`, …) + SEO tab |
| **Nav** | `campus-nav` | Sidebar structure |
| **Tours** | `campus-tours` | Full Level A + chapter step copy by role (`student` ~26 / `teacher` ~26 / `admin` ~27). Per-step **Voice** (localized → `campus-tour-audio`). Sync seed: `node --import tsx scripts/sync-campus-tour-seed.ts` then `npm run seed:campus-ui -w @app/cms` |
| **Tour audio** | `campus-tour-audio` | MP3/OGG/WAV uploads for tour narration |

Key routing: `@pkg/types` `campusContentPlacementFromKey`. Migrate: `npm run migrate:campus-content -w @app/cms`. Tour voice schema: `npm run migrate:tour-audio -w @app/cms`. Seed: `npm run seed:campus-ui -w @app/cms`. Local schema `push` opt-in via `PAYLOAD_PUSH=true`.

### Collections / globals

- Collections: `users`, `media`, `products`, `pages`, `redirects`, `campus-content`, `campus-tour-audio`, `campus-tours`
- Globals: `brand-kit`, `site-settings`, `campus-nav`, `campus-global`, `connect-prep`

**Brand layers:**

| Layer | Where | Purpose |
|-------|--------|---------|
| Hub umbrella | `brand-kit` | Hub chrome, default OG, company legal |
| Per-product | `products` Brand tab (`logo`, `logoOnDark`, `primaryColor`, `accentColor`, `icon`) + SEO tab (`seoTitle`, `seoDescription`, `ogImage`) | Distinct product identity; SEO is per product/page, not shared |
| School white-label | Prisma `School` | Tenant — never Payload |

## Marketing site — `apps/hub`

**`apps/hub`** (`@app/hub`, port **4400**) is a plain Next app:

- Reads CMS over HTTP (`CMS_URL` → `/payload-api/...`, `depth=1` for media)
- Resolves media URLs + OG: product/page `ogImage` → `brand-kit.ogDefaultImage`
- Product landings tint via `--product-primary` / `--product-accent`
- No Payload dependencies / Local API
- Dev: `npm run dev:hub`

## Campus UI chrome — HTTP client

**`apps/campus`** has **no** Payload packages. Static UI chrome comes from `apps/cms`:

| Collection / global | Campus consumer |
|---------------------|-----------------|
| `campus-global` + `campus-content` | `useCampusT()` / `/cms-proxy/strings` — merged via `getCampusStringMap` |
| `campus-content` | page chrome via `getCampusPage` (privacy / legal / …) |
| `campus-nav` | sidebar via `useCampusNavSections` |
| `campus-tours` | `ProductTour` + `mergeTourCopy` |

- Catalog + code fallbacks: `@pkg/types` `campus-ui-catalog`
- Same-origin proxies: `/cms-proxy/{strings,pages,nav,tours}`
- Locale: URL prefix (`/uk`) + session; default `en` unprefixed

Out of CMS: users, lessons, balances, chat, vocab, quizzes, school secrets (Prisma/Nest). Legal *templates* in CMS + Prisma seller `{{vars}}`.

Plan: [`docs/arvilio-marketing-site-payload-plan.md`](../../../arvilio-marketing-site-payload-plan.md) Phase D done for Campus embed removal.

## Boundaries

| Concern | Owner |
|---------|--------|
| Hub marketing pages / brand-kit / product cards | `apps/cms` + `apps/hub` |
| Campus static UI chrome (uk/en) | `apps/cms` campus-* collections + Campus HTTP client |
| UI locales | `SUPPORTED_LOCALES` + cms `enabledLocales` |
| Tenant white-label, seller/MCC, packages, payments | Prisma + Nest |
| Learning-language catalog | Prisma [[entities/language]] |

### UI locale ≠ learning language

| Axis | SoT |
|------|-----|
| UI / marketing (`User.locale`, session locale) | `@pkg/types` `SUPPORTED_LOCALES` |
| Subject taught (EN, DE, …) | Prisma [[entities/language]] |

## Related

- [[concepts/campus-i18n]] — key registry / waves
- [[concepts/web-app]] — Campus routes
- [[synthesis/product]] — Campus / Connect / Control Plane / marketing site
- [[synthesis/tech-stack]] — apps map
- [`docs/arvilio-ecosystem-control-plane.md`](../../../arvilio-ecosystem-control-plane.md)
