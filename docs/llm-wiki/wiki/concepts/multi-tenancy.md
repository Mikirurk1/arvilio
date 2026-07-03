---
tags: [architecture, multi-tenant, saas, planning]
updated: 2026-06-16
---

# Multi-Tenancy (SaaS transition plan)

> Status: **planned** (ADR-005…009 `proposed`). No tenant code shipped yet — this page records the agreed target architecture. Code wins on conflict; update here as phases land.
>
> **Working platform name: `arvilio`** (domains `.com/.io/.org/.app/.ai` free, fixed 2026-06-16). Current `SoEnglish` codebase = first school/tenant on arvilio.
> Plan execution applies four senior lenses (Architect / UI-UX / FullStack / Security) — see `docs/multi-tenant-execution-plan.md` Part 0.

SoEnglish is transitioning from a single-school product to a multi-tenant SaaS with per-school subdomains/custom domains, a platform admin console, and three-layer billing. See ADRs [[../../../adr/ADR-005-multi-tenant-data-isolation]] … ADR-009.

## Current state (pre-transition)

- **No `School`/tenant model** — only a stray optional `schoolId` on `LibraryMaterial`.
- `PlatformSettings` is a singleton (`id @default("default")`) mixing platform-wide and per-school config.
- JWT payload = `{ sub: userId }` — no tenant context.
- No Next.js `middleware.ts` (no host-based tenant resolution).
- Roles `STUDENT/TEACHER/ADMIN/SUPER_ADMIN` on `User`; no platform-operator axis.

## Target decisions

| Concern | Decision | ADR |
|---------|----------|-----|
| Data isolation | Shared DB + shared schema + row-level `schoolId`; `TenantPrismaService` auto-scopes queries; `asPlatform()` audited escape hatch | ADR-005 |
| Tenant config | Move per-school config (payments, integrations, payout, methods) off `PlatformSettings` onto `School` | ADR-005 |
| Identity | **One global `User`** (email globally unique) + `SchoolMembership { userId, schoolId, role }`; role moves off `User` | ADR-006 |
| Dictionary | **Shared platform-wide** — `Language`/`Word`/`WordDefinition` stay unscoped | ADR-006 |
| Routing | `slug.soenglish.app` + custom domains via `SchoolDomain`; Next **`proxy.ts`** (formerly `middleware.ts`) classifies host→tenant hint (`x-school-slug`/`x-school-host`) | ADR-007 |
| Custom-domain TLS | **Cloudflare for SaaS** (app stores hostname→schoolId + verify state only) | ADR-007 |
| Sessions | JWT `{ sub, schoolId, membershipRole, platformRole? }`; auth never trusts host alone | ADR-008 |
| Operators | `PlatformOperator { userId, role }` axis separate from membership; `@PlatformAdmin()` guard | ADR-008 |
| Billing | 3 layers: A student→school, B school→platform subscription, C platform commission | ADR-008 |
| Admin console | `@be/platform-admin` module, platform domain only, cross-tenant + impersonation + audited | ADR-009 |
| Activation | 7-day trial (no card) → promo code extends to 14 days; post-signup config wizard; first-login tour led by a **3D animated mascot** (glTF/GLB via react-three-fiber; SVG/static fallback) | ADR-008, plan Phase 4.5 |

## Implementation status

- **Phase 0 ✅ shipped** — `@be/tenant` (`packages/backend/shared/tenant/`): per-request CLS context via `nestjs-cls`. `TenantContextService` is the typed accessor (`requireSchoolId()` fails loud) that Phase 1's `TenantPrismaService` reads to auto-scope queries. `TenantModule` (global) is wired in `apps/api`.
- **Phase 1 ◐ in progress** — tenant models in `schema.prisma`; **migration `add_tenancy_models` applied** to the dev DB; **idempotent identity backfill** (`backfill-tenancy.ts`): `school_default` = tenant #1, memberships per user, SUPER_ADMIN→PlatformOperator. `TenantPrismaService` in `@be/prisma` (`scopeArgs` + `makeTenantExtension` `$extends` + `asPlatform()`), registered in `PrismaModule`. **Gate 1 mechanism PROVEN** by `tests/integration/tenant-isolation.integration.spec.ts` (5/5, real Postgres) on registered models (`SchoolMembership`/`SchoolDomain`/`SchoolSubscription`). Remaining: `schoolId` on legacy data tables + register them, migrate resolvers to `TenantPrismaService`, per-school integration runtime (1.4), ESLint bans, full Gate 1 in CI.
  - ⚠️ ALS gotcha: lazy Prisma queries must be awaited inside the `cls.run`/request context or the tenant scope is lost.
- **Phase 4 (admin console MVP) ✅** — `@be/platform-admin` (ADR-009): dashboard + cross-tenant schools read/detail via `asPlatform()`; suspend/activate (`School.status`) with `PlatformAuditService`; suspended-school enforcement in `AuthGuard` (members 403, operators bypass). **4C.2 impersonation ✅ (Gate 4 closed):** `POST /api/platform/schools/:id/impersonate` → `PlatformImpersonationService.mint`s a 15-min access token with an `imp` claim (`act`=operator, `sid`=school) set as the **access cookie only** (operator's refresh stays → auto-returns at expiry); `WebRequestSessionDto.impersonation` carries the banner claim; `POST /api/auth/impersonate/stop` (AuthGuard only) clears it + audits `school.impersonate.stop`. **4D (in progress):** impersonation **banner UI** renders in `apps/web` root layout (claim threaded `WebRequestSessionDto.impersonation`→`proxy.ts`→`x-soenglish-impersonation` header→layout; "Stop impersonating"→`/api/auth/impersonate/stop`). Platform **console app** `apps/platform` scaffolded (Next, port 4300): `ConsoleShell` (nav-IA stubs for Phase-6 Leads/Marketplace/Recruiting) + Dashboard, Schools (list→detail), School detail (`/schools/[id]`, role counts + `SchoolActions` suspend/activate), Audit log (`/audit-log`) — SSR `platformGet`, cookie-forwarding, 401/403→Unauthorized. Payment-method allowlist (`PlatformSettings.allowedPaymentMethods`, console Settings; enforced in `@be/billing`). **Cross-app SSO seam done:** `cookieOptions()` applies an optional cookie `Domain` from `AUTH_COOKIE_DOMAIN` (e.g. `.arvilio.app`) so one session works across sibling subdomains; unset = host-only (dev, shared across ports). Console **Impersonate admin** button → `/impersonate` → redirect to `NEXT_PUBLIC_SCHOOL_APP_URL` (banner shows in school app). **Phase 4 / Gate 4 complete.**
- **Phase 4.5.1 (signup + trial) ◐** — self-serve `POST /api/auth/register-school` (`SchoolSignupService`, `@be/auth`) atomically provisions `School(TRIAL)` + admin + `SchoolMembership(ADMIN)` + `SchoolSubscription(TRIALING, +7d)`, auto-login; web `/(auth)/signup`. **Trial auto-expiry (G4 job):** `TrialLifecycleService.expireTrials` (`@be/platform-admin`) suspends trials past `trialEndsAt + 3d` grace, daily `@Cron`; the reference for G4 explicit-schoolId jobs. **Promo codes (4.5.2):** `PromoCode`/`PromoRedemption` models; redemption at signup (`SchoolSignupService.redeemPromo`, atomic, `trialDays = max(7, promo.trialDays)`); admin CRUD `GET/POST /api/platform/promo-codes` + `PATCH /:id`. **Onboarding wizard (4.5.3):** `SchoolOnboardingService` (`@be/auth`) persists `School.onboardingState` JSON; REST `GET /api/onboarding`, `PATCH /api/onboarding/step` (ADMIN, idempotent per-step), `POST /api/onboarding/complete`. **Trial banner (4.5.1):** `WebRequestSessionDto.trial` (`AuthSessionService.resolveTrialInfo`) → SSR `x-soenglish-trial` header → `TrialBanner` countdown. Web wizard UI (`apps/web/app/onboarding`) consumes the API (resumable 5-step, signup → `/onboarding`). Promo console page (`apps/platform/promo-codes`). **Tour state (4.5.4):** `User.tourCompletedAt` + `UserTourService` + `GET/POST /api/onboarding/tour[/complete]` (user-scoped). Data-driven tour UI (`apps/web/components/tour`: `TOUR_STEPS` + `ProductTour` overlay, gated by the tour-state API, 2D placeholder mascot). 3D mascot **«Arvi»** render island done (`apps/web/components/mascot`: lazy R3F `<Mascot>`, loads `public/mascot/arvi.glb`, asset-agnostic, 2D SVG fallback, wired into tour). Remaining: the rigged Arvi GLB (Meshy), wizard step side-effects, element-anchoring.

## G15 — GDPR data export + erasure ✅ (2026-06-27)

- **`GdprService`** (`@be/auth`): `exportUserData` (DSAR — all PII as JSON, strips `passwordHash`); `eraseUser` (anonymize: email/displayName/avatarUrl/phone/telegram/bio replaced, tokens + OAuth deleted, status→LEAVED; financial/audit rows kept for retention).
- REST: `GET /api/gdpr/export` + `DELETE /api/gdpr/me` (user-scoped). `GET /api/platform/gdpr/export/:userId` + `DELETE /api/platform/gdpr/erase/:userId` (platform admin).
- Remaining for full GDPR: cookie-consent banner, DPA agreement flow, audit-log retention policy (max N years), automated export-as-ZIP (email delivery), data-retention cron for expired anonymous accounts.

## G14 — Tenant-tagged observability ✅ (2026-06-27)

- **`TenantLoggerService`** (`@be/tenant`) — injectable logger that appends `{schoolId, userId, requestId}` from CLS to every log line as a JSON suffix. Drop-in for `new Logger(...)` in any tenant-scoped service. Global provider in `TenantModule`, exported.
- **`TenantLoggingInterceptor`** (`apps/api`) — global `APP_INTERCEPTOR`; logs every HTTP + GraphQL request with method/path/status/ms + tenant tags. 5xx→`error`, 4xx→`warn`, 2xx→`log`.
- Sentry: deferred until `SENTRY_DSN` + `@sentry/nestjs` are added (wire `setTag('schoolId', ...)` in `SentryInterceptor` at that point).

## Migration order

1. **Phase 1** — `School`/`SchoolDomain` models, `schoolId` backfill (`school_default`), `TenantPrismaService`. *(highest risk; do first)*
2. **Phase 2/3** (parallel) — Next middleware + subdomains; tenant-aware JWT + global identity/memberships.
3. **Phase 4** — platform admin console MVP (schools, impersonate, payment methods).
   **Phase 4.5** — activation: self-serve signup + 7/14-day trial + promo codes, config wizard, virtual assistant tour.
4. **Phase 4** — billing Layer B subscriptions; custom domains + TLS.
5. **Phase 4 (C) + Phase 6** — commission/marketplace leads; full per-tenant observability.

## Critical invariant

Cross-tenant data leakage = data breach between schools. An **isolation e2e test** (token of school A cannot read school B) is a mandatory release gate. The only legitimate cross-tenant access is `@be/platform-admin` via the audited `asPlatform()` hatch.

## Business model (see `docs/business-model.md`)

Three product pillars + revenue streams:
1. **SaaS** (school→platform, **primary revenue**) — priced **per active student + storage quota** (Edvibe-style), Ukraine-first UAH, limited Free tier, 7/14-day trial. Over-quota uploads blocked (no infinite material uploads). Admin console built with seams for the next-stage student-finding marketplace.
2. **Student marketplace** — **one-time finder fee** on platform-sourced students (no ongoing tax, unlike Preply).
3. **Tutor-recruiting service** — one-time placement fee + recruiting tools/premium tutor profile.

Decisions resolved 2026-06-16: per-active-student pricing, limited freemium, one-time finder fee, UAH-first, recruiting pillar added.

## Related

- [[security]] — fail-secure env, AES-GCM secret storage (per-school KEK acceptable)
- [[auth-rbac]], [[roles-matrix]] — role model that gains the platform-operator axis
- [[billing-payments]] — Layer A today; Layers B/C added
