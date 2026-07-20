---
tags: [concept, i18n, campus, cms]
updated: 2026-07-19
---

# Campus i18n (CMS-backed)

Campus static UI chrome is localized **uk + en** via company CMS (`apps/cms`), not an embedded Payload in Campus.

**SoT split:** Payload owns strings / page bodies / nav structure / tour copy. Prisma/Nest owns users, lessons, billing, chat, vocab, school secrets. Catalog `@pkg/types` `campus-ui-catalog` = seed + code fallback only.

## URL locale

**Default locale `en` is unprefixed.** Non-default locales use a path prefix.

| Path | Behavior |
|------|----------|
| `/login`, `/dashboard` | English (default) |
| `/uk/login`, `/uk/dashboard` | Ukrainian — rewrite to unprefixed app route |
| `/en/…` | 307 → same path without `/en` (not canonical) |
| Cookie `arvilio_locale=uk` + bare path | Redirect → `/uk/…` |

Locale switcher: EN → bare URL; UK → `/uk/…`. On switch it **writes the `arvilio_locale` cookie** to the chosen locale before navigating, so switching to the default (unprefixed) locale isn't bounced back by a stale cookie in `proxy.ts`. Also best-effort persists `User.locale` (GraphQL, caught).


## Resolution (display)

1. URL locale segment if present (`/uk/…`)
2. Cookie `arvilio_locale`
3. On a **bare URL with no cookie**, an authenticated user is redirected to their **explicit** preference `WebRequestSessionDto.preferredLocale` (= `User.locale` → `School.defaultLocale`, clamped to `School.enabledLocales`) when it is non-default. **`Accept-Language` is intentionally excluded here** so browser language never rewrites a typed canonical URL. Otherwise the bare URL stays `DEFAULT_LOCALE` (`en`).

Backend `resolveWebRequestSession` still exposes a full display locale on `WebRequestSessionDto.locale` (chain `User.locale` → `School.defaultLocale` → `Accept-Language` → `DEFAULT_LOCALE`, then `clampLocaleToEnabled(…, School.enabledLocales)`), plus `preferredLocale` (explicit-only, for the redirect) and the school set on `WebRequestSessionDto.enabledLocales`. Campus proxy forwards `x-arvilio-locale` from the URL when present.

## School-scoped locale settings (G33)

Each school picks a **default UI locale** and the **set of offered locales** (subset of platform `SUPPORTED_LOCALES`). Platform stays the master allowlist; a school only narrows it.

| Layer | Where |
|-------|-------|
| Data | `School.defaultLocale` + `School.enabledLocales String[]` (Prisma) |
| Helpers | `sanitizeEnabledLocales`, `resolveSchoolDefaultLocale`, `clampLocaleToEnabled` (`@pkg/types` `locale.ts`) |
| API | `GET /school/locale` (public) + `PATCH /school/locale` (admin) → `SchoolLocaleController` / `SchoolLocaleService` (`module-auth`) |
| Admin UI | `apps/campus/src/app/system/LanguagesSection.tsx` (rendered inside System → General) |
| Switcher gating | `LocaleSwitcher` self-sources via `useSchoolLocales()` (`GET /school/locale`) when no `enabledLocales` prop; `resolveSwitcherLocales` = enabled ∩ allowlist |

Invariant: `enabledLocales ⊆ SUPPORTED_LOCALES`, and `defaultLocale ∈ enabledLocales` (else falls back to platform default / first enabled). Empty `enabledLocales` inherits the shipped set (`uk`, `en`).

## Keys

Convention: `area.element.name` — catalog in `@pkg/types` `campus-ui-catalog` (`CAMPUS_UI_STRINGS`).

**CMS storage:** **Content** (one Payload doc per screen) + **Global** (shared chrome). Keys stay `area.element.name`. Placement via `campusContentPlacementFromKey` (`@pkg/types` `campus-content-map`). Runtime `getCampusStringMap` merges Global + all Content `strings[]` for `t()`.

Helpers: `stripLocalePrefix`, `withLocalePrefix`, `replaceLocaleInPath`, `LOCALE_COOKIE` in `@pkg/types` `locale.ts`.

## Runtime

| Piece | Path |
|-------|------|
| HTTP helpers (server) | `apps/campus/src/lib/cms/campus-cms.ts` |
| Client barrel | `apps/campus/src/lib/cms/index.ts` (no `next/headers`) |
| Provider / `t()` | `apps/campus/src/lib/cms/useCampusI18n.tsx` |
| Pages | `getCampusPage` → privacy / legal terms / payment-refund |
| Nav | `useCampusNavSections` + `CAMPUS_NAV_SEED` fallback |
| Tours | `ProductTour` fetches `/cms-proxy/tours` + `mergeTourCopy` by `stepId` |
| Proxy URL locale | `apps/campus/src/proxy.ts` |
| Same-origin proxies | `/cms-proxy/{strings,pages,nav,tours}` |
| Switcher | `LocaleSwitcher` — trigger + listbox; labels from `LOCALE_META` / `getLocaleMeta` (`@pkg/types`) |
| Lesson modal / series copy | `apps/campus/src/lib/cms/lesson-modal-copy.ts` |
| Seed | `npm run seed:campus-ui -w @app/cms` |
| Content migrate (one-shot) | `npm run migrate:campus-content -w @app/cms` |

Missing CMS keys never blank the UI — code fallbacks always merge under CMS values.


## Related

- [[concepts/payload-cms]]
- [[concepts/web-app]]

## Leftovers audit (2026-07-11)

See `docs/tmp-i18n-leftovers-inventory.md` — Playwright crawl of remaining EN chrome (~605 strings). Global chrome + P0 dashboard/payment/lessons/profile locale chrome wired; deeper page bodies still pending.

## Page-by-page Payload audit plan (2026-07-12)

Program doc: [`docs/campus-i18n-payload-page-audit-plan.md`](../../../campus-i18n-payload-page-audit-plan.md) — scalable locale switcher (trigger + searchable menu) + per-route Playwright screenshot → leftover analysis → Payload extract prompts (P0–P2).

**Progress:** Switcher S1+S2; P0.1–P0.19 done (P0.18/19 aliases skipped); Wave P1 done (P1.4 redirect skip). **Wave P2 complete** — P2.1–P2.6 (`/admin` … `/mascot-preview`). Leftovers on `/system`: PSP credential field labels, weekday payout options, setup-guide body, PSP brands + API provider descriptions.
