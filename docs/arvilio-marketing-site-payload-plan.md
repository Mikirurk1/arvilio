# Arvilio marketing site & Payload plan (v2)

> **Status:** Phase B+C scaffolded — 2026-07-11 (**CMS split:** `apps/cms` + `apps/hub`)  
> **Audience:** founder + agents  
> **Companions:** [`arvilio-ecosystem-control-plane.md`](./arvilio-ecosystem-control-plane.md), [`business-model.md`](./business-model.md), [`arvilio-seo-roadmap.md`](./arvilio-seo-roadmap.md) (phased SEO after Payload catalog)
> **Historical (do not follow for new work):** [`superpowers/specs/2026-06-09-payload-cms-design.md`](./superpowers/specs/2026-06-09-payload-cms-design.md), [`superpowers/plans/2026-06-09-payload-cms.md`](./superpowers/plans/2026-06-09-payload-cms.md)

---

## 1. Why

Arvilio needs a **company marketing hub** at `arvilio.app` that:

1. Explains the **ecosystem** (Campus now, Connect later, more products later)
2. Routes visitors to the right product via CTAs
3. Hosts **company-level** legal, pricing narrative, SEO
4. Owns **company brand assets** (logos, colors, social) editable without redeploying Campus
5. Ships **multilingual** marketing from day one of hub (**v1 content:** `uk` + `en`; **architecture:** any ISO 639-1 UI locale we enable later)

Today Payload is **embedded in `apps/campus`**. That solved “edit Campus copy without deploy,” but it is the wrong home for ecosystem brand content and multi-product landings.

**Goal:** Payload is the **company content plane** in **`apps/cms`**. Public marketing surface is **`apps/hub`** (reads CMS over HTTP). Product/tenant data stays **Prisma + Nest**. Adding a future product should be mostly a CMS row + optional `apps/<product>`, not a marketing rewrite.

---

## 2. Locked decisions (v2)

| Topic | Decision |
|-------|----------|
| Marketing app | **`apps/hub`** (`@app/hub`), public site for `arvilio.app` (no Payload runtime) |
| CMS app | **`apps/cms`** (`@app/cms`), Payload only — admin `/cms-admin`, API `/payload-api` (dev port **4410**; prod may be `cms.arvilio.app`) |
| hub ↔ cms | hub SSR fetches `CMS_URL/payload-api/...` (public read). Local Payload API stays inside cms process |
| hub scope v1 | **Brand hub + product landing pages** (`/`, `/campus`, `/connect`, pricing narrative, company legal) — not a full help center yet |
| Locales | **Extensible UI locales** (ISO 639-1). Platform allowlist SoT: `@pkg/types` `SUPPORTED_LOCALES`. cms `site-settings.enabledLocales` ⊆ allowlist. **v1 ship set:** `uk`, `en` (seeded). Adding `pl`/`de`/… = extend allowlist + enable + translate — no IA redesign |
| URL locales | **Prefix every enabled locale** on hub: `/{locale}/...`. Root `/` → `defaultLocale` (v1: `uk`). Accept-Language optional later |
| UI locale ≠ learning language | Marketing/UI language is **not** the subject taught. Subjects live in Prisma `Language` catalog (EN, DE, …) — see §6.1 |
| Brand assets | Payload global **`brand-kit`** (company). **Not** Prisma `School` white-label |
| Product registry | Payload collection **`products`** — home cards are data-driven; new product = new doc + CTA URL |
| Product data | **Prisma + Nest only** (auth, tenancy, billing, seller profile, packages, Connect matching) |
| Campus Payload | Keep until marketing cms ships; then migrate useful content and **remove** Campus embed |
| Shared DB | Same Postgres; Campus Payload schema `payload`; company CMS schema **`payload_www`** until Phase D (avoids collection collisions). Separate CMS DB only if ops forces it |
| Connect | Deep-links from hub only; **no** matching/ledger data in Payload |
| Control Plane | Not a CMS; may later link out to cms `/cms-admin` |

```mermaid
flowchart TB
  subgraph cmsApp [apps/cms]
    PayloadAdmin[Payload /cms-admin]
    BrandKit[Global brand-kit]
    Products[Collection products]
    SitePages[Collection pages]
    SiteSettings[Global site-settings]
    PayloadApi[/payload-api]
  end
  subgraph hubApp [apps/hub]
    Pages[Localized routes]
  end
  subgraph productApps [Product apps]
    Campus[apps/campus]
    Connect[apps/connect later]
    Future[apps/future]
  end
  subgraph platform [Platform]
    API[apps/api Nest]
    Prisma[(Prisma tables)]
  end
  Visitor --> Pages
  Pages -->|HTTP CMS_URL| PayloadApi
  PayloadApi --> BrandKit
  PayloadApi --> Products
  PayloadApi --> SitePages
  PayloadApi --> SiteSettings
  Pages -->|CTA URL + locale| Campus
  Pages -->|CTA URL + locale| Connect
  Campus --> API
  Connect --> API
  API --> Prisma
  PayloadAdmin --> BrandKit
  PayloadAdmin --> Products
  PayloadAdmin --> SitePages
  PayloadAdmin --> SiteSettings
```

---

## 3. What belongs where

| Content / data | Owner | Notes |
|----------------|-------|-------|
| Ecosystem home, product landings, pricing narrative, company legal, SEO | **`apps/hub` + Payload in `apps/cms`** | Localized; hub reads CMS |
| Company logos, colors, social, OG defaults | **Payload `brand-kit` in cms** | Company brand |
| CTA “Open Campus” / “Join Connect” | **hub** (`products` + env base URLs) | UTM allowed; auth still Platform |
| School white-label (`brandColor`, `logoUrl`) | **Prisma `School`** | System → Branding |
| Seller / merchant legal (offer, contacts, MCC) | **Prisma seller + Campus `/legal/*`** | Per-campus compliance |
| Lesson packages, prices, PSPs | **Billing / Prisma** | Never Payload |
| In-app Campus UI strings | **Code / i18n** (long-term); thin Campus CMS only until Phase D | Do not block hub |
| Transactional email templates | **`@be/email-templates`** | Different lifecycle |
| Connect matching / fees | **Nest + Prisma** | Later |

**Anti-pattern:** Payload as a shared product database for Campus + Connect entities.

---

## 4. Information architecture (URLs)

| Path | Purpose |
|------|---------|
| `/` | Redirect → `/{defaultLocale}` (v1: `/uk`) |
| `/{locale}` | Ecosystem home — product cards from `products` |
| `/{locale}/campus` | Campus product landing + primary CTA |
| `/{locale}/connect` | Connect landing or “coming soon” |
| `/{locale}/pricing` | Company / SaaS narrative (not tenant package catalog) |
| `/{locale}/legal/terms` | Company terms |
| `/{locale}/legal/privacy` | Company privacy |
| `/{locale}/legal/cookies` | Cookie / consent copy (if needed) |
| `/cms-admin` | Payload admin on **`apps/cms`** (no locale prefix) |
| `/payload-api` | Payload REST on **`apps/cms`** (hub consumes via `CMS_URL`) |

`{locale}` is any code in `site-settings.enabledLocales` (validated against Platform `SUPPORTED_LOCALES`). Examples over time: `/uk`, `/en`, `/pl`, `/de` — not a fixed two-route tree.

**SEO:** `hreflang` for **every enabled** locale on public pages; canonical per locale.

**Visitor flow:**

1. Land on `arvilio.app` → localized home  
2. Pick Campus or Connect (or future product card)  
3. CTA opens product host (`NEXT_PUBLIC_CAMPUS_URL`, later Connect URL) — shared Platform auth when cookie domain is `.arvilio.app`  
4. Deep product work stays on Campus / Connect — not on hub  

---

## 5. Payload content model (v1)

### 5.0 Admin menu (by brand)

One Payload instance; **admin sidebar grouped by brand**, not flat orphans:

| Admin group | Contents |
|-------------|----------|
| **Shared** | `users`, `media` (cross-brand) |
| **Hub** | `brand-kit`, `site-settings`, `products`, `pages`, `redirects` |
| **Campus** | `campus-content` (**Content**), `campus-global` (**Global**), `campus-nav` (**Nav**), `campus-tours` (**Tours**) |
| **Connect** | Prep global `connect-prep` (**Overview**) until Phase E |

API slugs stay `campus-*` so Campus HTTP clients do not break; only `admin.group` / labels change.

### 5.1 Global `brand-kit` (Hub umbrella)

**Only** the Arvilio company brand (hub chrome, default OG, company legal). **Not** per-product logos — those live on `products`.

| Field | Type | Notes |
|-------|------|-------|
| `logoMark` | upload → media | Icon / mark |
| `logoWordmark` | upload | Full logo |
| `logoOnDark` | upload | Optional inverse |
| `favicon` | upload | |
| `ogDefaultImage` | upload | Default Open Graph (fallback when page/product has no `ogImage`) |
| `primaryColor` | text (hex) | Hub chrome defaults |
| `accentColor` | text (hex) | |
| `socialLinks` | array `{ platform, url }` | |
| `companyLegalName` | text | Company entity — **≠** Campus seller `legalName` |
| `supportEmail` | email | Company support |

### 5.2 Collection `products` (multi-product registry)

| Field | Type | Notes |
|-------|------|-------|
| `slug` | text unique | `campus`, `connect`, future slugs |
| `status` | select | `live` \| `coming_soon` \| `hidden` |
| `sortOrder` | number | Home card order |
| `name`, `tagline`, `description`, `hero` | localized | Copy tab |
| `ctaLabel` | localized | |
| `ctaPath` | text | Path on product host, e.g. `/signup` |
| `ctaBaseEnv` | select | Which env base URL: `campus` \| `connect` \| `custom` |
| `ctaCustomBase` | text | If `custom` |
| **Brand tab** | | Product-owned — same theme DNA, **own** identity |
| `icon` | upload | Small mark for home cards |
| `logo` | upload | Primary product logo (light bg) |
| `logoOnDark` | upload | Logo for dark backgrounds |
| `primaryColor`, `accentColor` | text hex | Tint product landing (`--product-primary` / `--product-accent`) |
| **SEO tab** | | Per-product SEO (shared document SEO fields) |
| `seoTitle`, `seoDescription` | localized | |
| `ogImage` | upload | Falls back to `brand-kit.ogDefaultImage` |
| `canonicalPath`, `noIndex`, `noFollow` | | Optional canonical + robots |

Home renders products where `status ≠ hidden`. **Adding a future product** = new document (+ optional `apps/<slug>`) — no home layout rewrite.

CTA resolution:

```text
base = env(NEXT_PUBLIC_CAMPUS_URL | NEXT_PUBLIC_CONNECT_URL | ctaCustomBase)
url  = base + ctaPath + optional UTM
```

### 5.3 Collection `pages`

| Field | Type | Notes |
|-------|------|-------|
| `slug` | text | e.g. `home`, `pricing`, `legal-terms` |
| `title`, `body` | localized | Lexical |
| `seoTitle`, `seoDescription` | localized | Admin collapsible **SEO** |
| `ogImage` | upload | Falls back to `brand-kit.ogDefaultImage` |
| `canonicalPath`, `noIndex`, `noFollow` | | Same shared document SEO as products |

Used for flexible sections and legal bodies; product-specific marketing can live on `products` or dedicated page slugs.

### 5.4 Collection `media`

Shared uploads for brand-kit, products, pages.

### 5.5 Global `site-settings`

| Field | Type | Notes |
|-------|------|-------|
| `defaultLocale` | select | Must be ∈ `enabledLocales` |
| `enabledLocales` | select hasMany | ⊆ Platform `SUPPORTED_LOCALES` |
| `connectCtaEnabled` | checkbox | Soft flag until Connect ships |
| **SEO tab** | | Full Hub SEO defaults |
| `siteName`, `titleTemplate`, `defaultSeoDescription` | | Titles / fallbacks |
| `publicBaseUrl` | text | Canonical / sitemap / JSON-LD origin |
| `twitterHandle`, `twitterCardDefault`, `facebookAppId` | | Social |
| `robotsIndexDefault`, `robotsDisallow[]`, `robotsTxtExtra` | | robots.txt |
| `sitemapEnabled` | checkbox | Hub `sitemap.xml` |
| `googleSiteVerification` / `bingSiteVerification` | text | Webmaster |
| `websiteJsonLdEnabled`, `searchActionUrl` | | Organization + WebSite JSON-LD |

Payload `localization.locales` is generated from / kept in sync with Platform allowlist; hub only **publishes** the subset in `enabledLocales`.

**Document SEO** (shared helper `payload/fields/seo.ts` on `pages`, `products`, `campus-content`):

| Field | Notes |
|-------|--------|
| `seoTitle`, `seoDescription` | Localized |
| `ogImage`, `twitterImage` | → Brand kit / Campus Global OG fallback |
| `canonicalPath`, `breadcrumbLabel` | Canonical + breadcrumb |
| `noIndex`, `noFollow` | Robots flags |
| `sitemapInclude`, `sitemapPriority`, `sitemapChangeFrequency` | Sitemap |
| `jsonLdType` (+ `faqItems` on pages) | Structured data |

**Collection `redirects` (Hub):** `fromPath`, `toPath`/`toUrl`, `statusCode`, `enabled` — Hub middleware.

**Campus Global SEO tab** mirrors Hub site defaults (+ GSC/Bing) for Campus public routes.

### 5.6 Explicitly out of Payload

Tenant branding, seller/MCC, packages, payments, users, Connect leads/placements, Control Plane fleet data.

---

## 6. i18n rules (extensible UI locales)

| Rule | Detail |
|------|--------|
| Codes | ISO 639-1 (`uk`, `en`, `pl`, `de`, …). Platform allowlist SoT: [`packages/shared/types/src/lib/locale.ts`](../packages/shared/types/src/lib/locale.ts) `SUPPORTED_LOCALES` |
| Ship set vs capacity | **v1 ship set** = locales we seed and QA (`uk`, `en`). **Allowlist** grows when we are ready to support a locale end-to-end — do not add codes without translations |
| Default | `site-settings.defaultLocale` (v1: `uk`) |
| Fallback | requested → `en` (if enabled) → `defaultLocale` → first `enabledLocales` entry |
| hub publish set | `site-settings.enabledLocales` ⊆ Platform allowlist |
| Payload | Field-level **localization** for every allowlisted locale; admin UI languages follow Payload packs we install |
| Next | App Router `[locale]` segment; middleware rejects locales outside `enabledLocales` |
| Product apps | Own i18n timelines; hub does not unblock full Campus UI catalogs |
| Adding a locale | (1) append to `SUPPORTED_LOCALES`, (2) enable in `site-settings`, (3) translate Payload content, (4) QA — **no URL redesign** |

### 6.1 UI locale ≠ learning language

These are **different axes**. Do not conflate them in CMS, routing, or product code.

| Axis | Meaning | Source of truth |
|------|---------|-----------------|
| **UI / marketing locale** | Language of the website / app chrome (`/de/...`, `User.locale`) | `SUPPORTED_LOCALES` + cms `enabledLocales` |
| **Learning language** | Subject the learner studies (English, German, Spanish, …) | Prisma `Language` + `StudentLearningLanguage` |

Examples:

- Ukrainian UI (`/uk`) selling Campus that teaches **English** — normal today.
- Later: German UI + Campus teaching **German** (or English) — same IA; learning language comes from the catalog, not from the URL locale.

**Rules for new features:**

- Campus / Connect must **not** hard-code “product = English only” in copy, curriculum, or matching filters.
- Marketing hub may describe multiple learning languages in localized copy; it **does not** store the language catalog in Payload.
- Native language for definitions (`User.nativeLanguage`) is also catalog-based — separate from UI locale.

See wiki [[entities/language]] / [`docs/llm-wiki/wiki/entities/language.md`](./llm-wiki/wiki/entities/language.md).


---

## 7. Config & logos — two layers

| Layer | Where | Who edits |
|-------|--------|-----------|
| **Company brand kit** | Payload `brand-kit` in cms | Marketing / founder via CMS |
| **Campus tenant white-label** | Prisma `School.brandColor` / `logoUrl` | School admin (System → Branding) |
| **Runtime env** | `NEXT_PUBLIC_CAMPUS_URL`, `NEXT_PUBLIC_CONNECT_URL`, `CMS_URL`, `HUB_ORIGIN`, `PAYLOAD_SECRET`, `PAYLOAD_DATABASE_URL` / `DATABASE_URL` | Deploy |

After Phase D: Campus **must not** read Payload for school chrome. hub **displays** company logos from cms `brand-kit`.

---

## 8. Multi-product convenience

| Step | Action |
|------|--------|
| New product idea | Nest module(s) + optional `apps/<name>` (ecosystem plan) |
| Marketing | Create `products` doc (`slug`, status, localized copy, CTA) |
| Home | Auto-includes if not `hidden` |
| Control Plane | Separate operator UI — not marketing CMS |

Optional **Phase F:** public read of `brand-kit` (HTTP/CDN) for email footers or other surfaces that need **company** logos — still never tenant data.

---

## 9. Phased delivery

### Phase A — Document & freeze (this doc)

- [x] Lock hub + cms Payload ownership, i18n, brand-kit, product registry
- [x] Stop adding **new** marketing-only collections to Campus Payload
- [x] Prefer Prisma for any new tenant/compliance fields (already: seller profile)

### Phase B — Scaffold `apps/hub` + `apps/cms`

- [x] Create `apps/hub` Next App Router (dev port **4400**) — public site only
- [x] Create `apps/cms` Payload host (dev port **4410**): `brand-kit`, `products`, `pages`, `media`, `site-settings`
- [x] Localization from Platform allowlist; hub routes under `[locale]` for every enabled locale
- [x] Seed v1 ship set `uk` + `en`; architecture ready for more locales without IA change
- [x] cms `/cms-admin` + `/payload-api`; hub reads via `CMS_URL`
- [x] Root `.env` + `dev:hub` / `dev:cms` turbo scripts
- [ ] Independent deploy like Campus/Platform

### Phase C — Seed & CTAs

- [x] Seed `brand-kit`, `products` (`campus` live, `connect` coming_soon), key `pages` for **v1 ship set** (`uk`+`en`)
- [x] Wire Campus CTA to `NEXT_PUBLIC_CAMPUS_URL`
- [x] `hreflang` for all enabled locales + basic SEO

### Phase D — Decouple Campus

- [x] Inventory Campus Payload usage; migrate only brand/marketing worth keeping
- [x] Replace Campus CMS reads with code/i18n defaults (`campus-ui-catalog` + HTTP to `apps/cms`)
- [x] Remove Campus `(payload)`, `withPayload`, `/cms-admin`
- [x] Deprecate Payload `school-branding`; Prisma remains tenant branding SoT
- [x] Update Campus proxy/route-policy

### Phase E — Connect launch on hub

- [ ] Flip `products/connect` to `live`; set `NEXT_PUBLIC_CONNECT_URL`
- [ ] `site-settings.connectCtaEnabled`
- [ ] Still no Connect business data in Payload

### Phase F — Optional shared brand consume

- [ ] Public brand-kit read API or static export for other surfaces
- [ ] Optional help/docs collection (still not product data)

---

## 10. Non-goals

- Microservices split
- Moving Campus merchant `/offer` / `/legal/*` to hub
- Control Plane as page editor (link-out only, later)
- Shipping every UI locale or full Campus translation catalogs as part of hub scaffold
- Using Payload for packages, payments, matching, or the **learning-language** catalog
- Treating URL locale as the subject taught

---

## 11. Success criteria

- Add a future product card **without** changing home layout code (CMS-only)
- Switch among **enabled** UI locales with documented fallbacks (v1: uk ↔ en; later more without IA change)
- Change company logo/colors in CMS **without** redeploying Campus
- Clear boundary: company CMS vs tenant Prisma vs product apps; **UI locale ≠ learning language**
- Campus builds **without** Payload after Phase D
- Docs/wiki describe hub vs Campus vs Connect vs Control Plane

---

## 12. Implementation touch list (when coding)

| Area | Action |
|------|--------|
| `apps/hub` | Public marketing Next app (no Payload) |
| `apps/cms` | Payload company CMS |
| `apps/campus` payload/* | Migrate then remove (Phase D) |
| Root `package.json` / turbo | `dev:hub`, `dev:cms` |
| `.env.example` | `CMS_URL`, `NEXT_PUBLIC_CAMPUS_URL`, Payload secrets, optional Connect URL |
| Wiki | [[concepts/payload-cms]], overview, tech-stack |

---

## 13. Relation to older Payload docs

| Doc | Status |
|-----|--------|
| This file | **Authoritative v2 plan** |
| [`superpowers/specs/2026-06-09-payload-cms-design.md`](./superpowers/specs/2026-06-09-payload-cms-design.md) | Superseded — Campus embed was v1 |
| [`superpowers/plans/2026-06-09-payload-cms.md`](./superpowers/plans/2026-06-09-payload-cms.md) | Historical implementation of embed |

New CMS / marketing work follows **this** plan only.
