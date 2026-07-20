---
tags: [architecture, multi-tenant, saas, planning]
updated: 2026-07-11
---

# Multi-Tenancy (SaaS transition plan)

> Status: **shipped in code** for Phases 0–5, 4.5 (core), and 7 (code). **Phase 6 marketplace/recruiting deferred post-launch** (schema seams + console nav stubs only). Code wins on conflict; this page tracks live architecture.
>
> **Working platform name: `arvilio`** (domains `.com/.io/.org/.app/.ai` free, fixed 2026-06-16). Current `Arvilio` codebase = first school/tenant on arvilio.
> Plan execution applies four senior lenses (Architect / UI-UX / FullStack / Security) — see `docs/multi-tenant-execution-plan.md` Part 0.
> **Ecosystem / Control Plane strategy:** [`docs/arvilio-ecosystem-control-plane.md`](../../../arvilio-ecosystem-control-plane.md) — modular monolith, evolve `apps/platform` into Arvilio Control Plane, products as Nest modules.

Arvilio has transitioned from a single-school product to a multi-tenant SaaS foundation with per-school subdomains/custom domains, a platform admin console, and three-layer billing. See ADRs [[../../../adr/ADR-005-multi-tenant-data-isolation]] … ADR-009.

## Current state (2026-07-09)

- **`School` + tenant models** — `School`, `SchoolDomain`, `SchoolMembership`, `PlatformOperator`, `SchoolSubscription` in Prisma; `schoolId` on all tenant-scoped models via `TENANT_SCOPED_MODELS` + `TenantPrismaService`.
- **Parent-scoped children** — `QuizQuestion`, `ChatMessage`, `StudentGroupMember`, etc. carry **no** `schoolId`; isolation is via scoped parent FK (documented in `tenant-scope.ts`).
- **CLS tenant context** — `@be/tenant` (`TenantContextService`) seeds `schoolId`/`membershipRole` from JWT + membership on every authenticated request.
- **JWT** — `{ sub, schoolId?, membershipRole?, platformRole? }`; host JWT cross-check (ADR-007).
- **Routing** — Next `middleware.ts` + `TenantResolutionMiddleware` (subdomain slug + custom domain).
- **Platform admin** — `apps/platform` Control Plane: Campuses (API `/schools`), Users (`/users`), suspend/activate, impersonation, audit log, promo codes, payment-method allowlist. Campuses/Users/members/audit lists use cursor pages + infinite scroll (`PlatformPageDto`). Campus detail shows owner (earliest active ADMIN), admins, member stats, and filtered members table; **subscription country editor lives inside the Campus panel**. **Full-bleed shell**; Lucide nav; `PageStack` / `PageGrid`. Session cookies: **`arvilio_pat` / `arvilio_prt`**. Dark theme + Light/Dark/System toggle. **Dashboard** (`GET /platform/dashboard`) returns KPIs plus `mrrMinor` (ACTIVE subs × plan `amountMinor`), `userStats`, `billingHealth`, `trialsEndingSoon`, `recentCampuses`, `recentAudit`.
- **Activation** — self-serve signup, 7/14-day trial + promo codes, onboarding wizard, element-anchored product tour (`navHref` + `data-tour-nav` spotlight).
- **Billing** — entitlements, storage/seat meters, `@RequiresFeature`, Stripe subscription checkout + promo codes.
- **Isolation gate** — `tests/integration/tenant-isolation.integration.spec.ts` (17/17) required in CI.

## Target decisions

| Concern | Decision | ADR |
|---------|----------|-----|
| Data isolation | Shared DB + shared schema + row-level `schoolId`; `TenantPrismaService` auto-scopes queries; `asPlatform()` audited escape hatch | ADR-005 |
| Tenant config | Per-school config (payments, integrations, payout, methods) on `School` | ADR-005 |
| Identity | **One global `User`** (email globally unique) + `SchoolMembership { userId, schoolId, role }`; role moves off `User` | ADR-006 |
| Dictionary | **Shared platform-wide** — `Language`/`Word`/`WordDefinition` stay unscoped | ADR-006 |
| Routing | `slug.arvilio.app` + custom domains via `SchoolDomain`; Next middleware classifies host→tenant hint | ADR-007 |
| Custom-domain TLS | **Cloudflare for SaaS** (app stores hostname→schoolId + verify state only) | ADR-007 |
| Sessions | JWT `{ sub, schoolId, membershipRole, platformRole? }`; auth never trusts host alone | ADR-008 |
| Operators | `PlatformOperator { userId, role }` axis separate from membership; `@PlatformAdmin()` guard | ADR-008 |
| Billing | 3 layers: A student→school, B school→platform subscription, C platform commission | ADR-008 |
| Admin console | `@be/platform-admin` module, platform domain only, cross-tenant + impersonation + audited | ADR-009 |
| Activation | 7-day trial (no card) → promo code extends to 14 days; post-signup config wizard; first-login tour with Arvi mascot + sidebar spotlight | ADR-008, plan Phase 4.5 |

## Implementation status

- **Phase 0 ✅** — `@be/tenant` CLS, runbooks scaffold, ADR-005…009.
- **Phase 1 ✅** — `TenantPrismaService`, 8 data verticals scoped, Gate 1 green in CI, ESLint guardrails, per-school integration runtime cache.
- **Phase 2 ✅** — web middleware, backend host resolution, JWT/host cross-check, custom domains (DNS verify), i18n foundation.
- **Phase 3 ✅** — JWT reshape, invitations, tenant-aware webhooks/jobs, object storage + storage accounting, notifications (email; Telegram/push deferred Phase 6).
- **Phase 4 ✅** — platform admin console MVP + impersonation banner.
- **Phase 4.5 ✅** — signup/trial/promo, wizard, product tour, anti-abuse, CSV import, PostHog funnel, **Arvi B7** (`useArvi` / `ArviSlot`). See [[concepts/arvi]].
- **Execution plan CLOSED (2026-07-10):** Phases 0–5 + 7 done; Phase 6 marketplace/recruiting deferred post-launch by design. Remaining `[~]` = legal/pen-test/staging/CWV/optional GLB polish — not open phase checklist.
- **Phase 5 ✅** — entitlements, feature gating, Stripe subscription + promo checkout. **[~] deferred:** tax/invoices (G45 legal).
- **Phase 6 [~] deferred post-launch** — `StudentAcquisitionLead` + `PlatformLedger` schema seams only; marketplace/recruiting/payouts/trust-and-safety not built.
- **Phase 7 ✅ (code)** — observability, rate limits, GDPR export/erasure, status page, backup runbook. **[~] deferred:** pen-test, scale (replicas/partitioning), first restore drill.

## Parent-scoped child models

These tables intentionally have **no** `schoolId` column. Isolation flows through the tenant-scoped parent:

| Child | Parent scope |
|-------|----------------|
| `QuizQuestion`, `QuizAnswer` | `Quiz.schoolId` |
| `ChatParticipant`, `ChatMessage`, `ChatMessageAttachment` | `ChatConversation.schoolId` |
| `StudentGroupMember` | `StudentGroup.schoolId` |
| `SpeakingTopicAssignment` | `SpeakingTopic.schoolId` |
| Attachment children | `LibraryMaterial.schoolId` |

Source: `packages/backend/data-access/data-access-prisma/src/lib/tenant-scope.ts`.

## G15 — GDPR data export + erasure ✅

- **`GdprService`** (`@be/auth`): export + anonymize erasure; REST user + platform-admin endpoints.
- Cookie consent banner, `/privacy` page, audit-log retention cron (7 years).
- **[~] deferred:** DPA (legal), erasure email confirmation.

## G14 — Tenant-tagged observability ✅

- **`TenantLoggerService`** + **`TenantLoggingInterceptor`** — structured logs with `schoolId`/`userId`/`requestId`.
- Sentry wired when `SENTRY_DSN` set.
- **[~] deferred:** per-tenant dashboards + SLA alerts (external monitoring).

## Critical invariant

Cross-tenant data leakage = data breach between schools. An **isolation e2e test** (token of school A cannot read school B) is a mandatory release gate (Gate 1 in CI). The only legitimate cross-tenant access is `@be/platform-admin` via the audited `asPlatform()` hatch.

> **⚠️ Isolation gap fixed 2026-07-04:** `UsersService` list queries on global `User` must filter via `SchoolMembership` — base Prisma does not auto-scope `User`. Checklist: any resolver listing users by role must use `schoolMemberships.some({ schoolId, status: 'ACTIVE' })`.

## Deferred (post-launch)

| Item | Notes |
|------|-------|
| Phase 6 marketplace | Discovery, leads, commission ledger services, Stripe Connect payouts |
| G45 tax/fiscalization | Legal decision — UA ПДВ/РРО + Stripe Tax abroad |
| Dedicated staging env | G40 partial — CI fixtures exist |
| Pen-test + restore drill | Gate 7 ops exercises |
| Core Web Vitals budgets | G44 partial — axe + keyboard E2E done |

## Related

- [[security]] — fail-secure env, AES-GCM secret storage (per-school KEK acceptable)
- [[auth-rbac]], [[roles-matrix]] — role model with platform-operator axis
- [[billing-payments]] — Layer A today; Layers B/C added
- `docs/multi-tenant-execution-plan.md` — full phased checklist
- `docs/arvilio-ecosystem-control-plane.md` — Campus / Connect naming, Control Plane, monolith
- [[synthesis/product]] — product thesis aligned to ecosystem names
