# Multi-Tenant SaaS — Execution Plan & Gap Analysis

> **Working product name: `arvilio`** (domains `arvilio.com/.io/.org/.app/.ai` confirmed free 2026-06-16).
> Current codebase name `SoEnglish` becomes tenant #1 / the first school under the arvilio platform.
>
> Companion to ADR-005…009 and `docs/llm-wiki/wiki/concepts/multi-tenancy.md`.
> ADRs record **decisions**; this file is the **execution playbook** with precise steps,
> file paths, acceptance gates, and the full capability checklist a commercial SaaS needs.
>
> Status legend per task: ☐ not started · ◐ in progress · ☑ done

---

## Part 0 — How we think (four senior lenses)

Every task, PR, and design decision in this plan is evaluated through **four senior lenses at once**. Before shipping any phase deliverable, run it past all four; a deliverable is "done" only when none of them objects.

### 🏛 Senior Architect
- Think in seams, boundaries, and blast radius. Prefer evolvable shapes over clever shortcuts.
- Enforce tenant isolation as an invariant, not a feature; keep `@be/*` module boundaries (ADR-002) and platform-vs-tenant separation clean.
- Ask: *what does this force us to rewrite later?* If the answer is "auth/session/billing/data ownership", redesign now (ADR-004 heuristic).
- Favor idempotency, backward-compatible migrations (expand/contract), and explicit contracts between modules.

### 🎨 Senior UI/UX Designer
- Apply `emil-design-eng` (taste/craft) + `soenglish-service-design` (concrete system) to every service surface.
- Optimize for the *feel*: ≤300ms motion, real loading/empty/error states, sensible defaults, one clear next action.
- The product must be usable with **no docs** (wizard + assistant carry first-run); reduce choices, not add them.
- Accessibility is non-negotiable: focus states, labels, contrast, keyboard paths.

### 💻 Senior FullStack Developer
- Reuse primitives (`components/ui`), follow `web-async-actions`, keep files <~400 LOC, types from `@be/graphql`.
- Tenant context flows via CLS; never thread `schoolId` ad hoc; never use the raw Prisma client for tenant data.
- Write the test that proves the behavior (esp. the isolation gate); leave `// TODO(multitenant):` at any conscious shortcut.
- Ship vertically (DB → service → resolver → UI) behind a flag; small, reversible PRs.

### 🛡 Senior Security Developer
- Fail-secure by default (no fallback secrets — ADR/`concepts/security`); validate at boundaries; least privilege for platform vs school operators.
- Treat cross-tenant access, webhook attribution, signed URLs, and the `asPlatform()` hatch as high-value targets — audit them.
- Threat-model each new surface (marketplace, recruiting, custom domains → SSRF/takeover); enforce per-tenant rate limits.
- Every PR touching auth/billing/storage/secrets gets an explicit security review note.

> **Applied per phase:** each Gate below is only passed when the Architect, Designer, FullStack, and Security lenses all sign off. The Design & UX workstream and Part 4 risk register operationalize the Designer and Security lenses respectively.

---

## Part 1 — Gap analysis (what the v1 plan missed)

Severity: 🔴 blocker (data breach / can't ship) · 🟠 must-have for commercial launch · 🟡 expansion.

### 🔴 Blockers — without these, multi-tenant is unsafe or impossible

| # | Gap | Evidence in code | Why it's a blocker |
|---|-----|------------------|--------------------|
| G1 | **No request-context propagation** | No `AsyncLocalStorage`/`nestjs-cls` anywhere | `TenantPrismaService` needs `schoolId` available in every service without threading it through every method signature. Without a CLS context the auto-scoping cannot work. |
| G2 | **Webhooks are tenant-blind** | 6 controllers: `stripe/paypal/monopay/paddle/lemonsqueezy-webhook.controller.ts`, `zoom-webhook.controller.ts` | Webhooks arrive on a platform URL with no subdomain/JWT. Without a payload→school mapping they cannot resolve a tenant, so payments/meetings can't be attributed. |
| G3 | **Process-wide integration cache leaks across tenants** | `platform-integration.runtime.ts` uses module-level `let cached` | School A's resolved LiveKit/SMTP/OAuth secrets would be served to School B. Must become a per-`schoolId` keyed cache. |
| G4 | **Background jobs run without tenant context** | `@Cron`/interval logic in `chat-visibility.service.ts`, lessons, etc. | Jobs run outside a request → no `schoolId`. They must either iterate schools explicitly or use the audited `asPlatform()` hatch. Forgetting this = job touches wrong/all tenants. |
| G5 | **Prisma auto-scoping has bypasses** | `$queryRaw`, `createMany`, nested writes, aggregates, transactions | A `$extends` filter does not cover raw SQL or every write shape. Need a lint/CI ban on raw client in resolvers + explicit `schoolId` on all writes. |
| G6 | **File storage is local disk, no isolation** | `material-attachment.service.ts:89,154` (`MATERIAL_UPLOAD_DIR`, `fs.writeFile`); same pattern in chat/lessons attachments | Shared disk = no per-tenant boundary, no quota, no signed URLs, won't scale horizontally. Need object storage with per-tenant key prefixes. |
| G7 | **No tenant-isolation test gate** | — | The single most important safety net. A token of school A must provably fail to read school B's data, enforced in CI before any tenant code merges. |

### 🟠 Must-have for commercial launch

| # | Gap | Notes |
|---|-----|-------|
| G8 | **Tenant lifecycle** | Provisioning (create school + first admin + seed), trial, suspend, resume, soft-delete with retention, hard-delete (GDPR erasure), data export. v1 only had the `School` row. |
| G9 | **Subscription depth** | Plans/tiers, entitlements & feature gating, seat/storage limits, proration, trials, dunning (failed-payment retries), grace period, upgrade/downgrade, refunds, currency, tax (Stripe Tax/VAT). v1 had only "SchoolSubscription exists". |
| G10 | **Commission/marketplace ledger integrity** | Double-entry ledger, payout reconciliation, attribution lifecycle (lead→trial→enrollment→commission), dispute/refund clawback. |
| G11 | **Per-tenant email deliverability** | Branded sender per custom domain → SPF/DKIM/DMARC per domain, or shared sending domain with per-school from-name. Telegram: shared bot vs per-school. |
| G12 | **Cache key isolation** | Any Redis/edge cache key must include `schoolId` (domain-resolution cache, integration runtime, session). Cross-tenant cache poisoning otherwise. |
| G13 | **Per-tenant rate limiting & noisy-neighbor** | Layered limits: global + per-tenant + per-user. One school must not exhaust shared capacity. |
| G14 | **Observability per tenant** | All logs/traces/metrics tagged `schoolId`; error tracking (Sentry tag); per-tenant usage dashboards; tenant-level anomaly alerts; SLA monitoring. |
| G15 | **Compliance** | GDPR DPA, data export & erasure, audit log retention, cookie consent, ToS/privacy, optional EU data residency. |
| G16 | **Custom-domain operational security** | Cloudflare for SaaS API integration, fallback origin, custom-hostname limits, **SSRF guard on DNS/TXT verification**, subdomain-takeover prevention, www↔apex, domain removal. |
| G17 | **Zero-downtime migration strategy** | Online backfill, expand/contract migrations, dual-read/dual-write window, rollback plan, feature-flagged cutover. |
| G18 | **White-label / branding** | Per-school logo, colors, login-page branding, email branding — schools with custom domains will expect it. |
| G19 | **Onboarding funnel** | Self-serve signup on apex, trial → convert, sales-assisted path, seed/sample content for new schools. |
| G20 | **Backup & DR per tenant** | Point-in-time recovery, tested restores, "undelete a school" within retention. |
| G28 | **Trial period** | 7-day free trial on school signup, no card; trial countdown UI; auto-suspend → grace at expiry; convert-to-paid path. |
| G29 | **Promo-code system** | Redeemable codes extending trial to 14 days; single/multi-use, per-school redemption guard, expiry, audit; designed to also carry subscription discounts later. |
| G30 | **Signup config wizard** | Post-registration Q&A that writes initial `School`/integration config and seeds sample content; resumable, skippable, idempotent. |
| G31 | **Virtual assistant / onboarding tour** | Named **3D animated mascot** (primary; SVG/static fallback) in-app guide; interactive first-login walkthrough (where things are / how to use); contextual help thereafter; per-user "completed" state so it doesn't repeat. Brand asset reused in marketing/empty-states. |
| G32 | **Usability baseline** | Sensible defaults everywhere, empty-state guidance, inline hints, consistent loading/error feedback — service must be usable without reading docs. |

### 🟠 Round-2 review additions (found 2026-06-16 — easy to design now, costly to retrofit)

| # | Gap | Notes | Phase |
|---|-----|-------|-------|
| G33 | **i18n / localization of the platform UI** | Ukraine-first → UI must ship in **uk + en** at least; locale per user + per school default. Hard to retrofit if strings are hardcoded — introduce an i18n layer **before** building many service screens. | 2–3 (foundational) |
| G34 | **Product analytics (activation funnel)** | PostHog/Mixpanel-style event tracking for trial→paid, wizard completion, tour completion, time-to-first-lesson. Without it the whole activation strategy (Phase 4.5) is unmeasurable. Tenant-tagged, GDPR-consented. | 4.5 / 7 |
| G35 | **Payouts + KYC/AML (Stripe Connect)** | Money *out* — platform→school commission settlement, tutor/school payouts (Pillars 2/3), existing staff payouts. Needs Connect onboarding + KYC. Currently only money *in* is planned. | 6 (seam in 5) |
| G36 | **Marketplace trust & safety** | Two-sided marketplace needs: tutor verification/KYC, reviews & ratings, content moderation (tutor profiles/materials/chat), report/abuse flow, anti-fraud on first transactions. | 6 |
| G37 | **Self-serve anti-abuse at signup** | Email verification, captcha/bot protection, disposable-email block — gates trial farming (ties to Part 4 risk) and spam schools. | 4.5 |
| G38 | **School data import / migration** | CSV/bulk import of students, lessons, balances for schools switching from a competitor — major sales unblocker; idempotent, tenant-scoped. | 4.5 / onboarding |
| G39 | **Tenant-aware notifications** | Existing `module-notifications` + email/Telegram must be tenant-scoped: per-school sender identity, per-user preferences, in-app + email + push/Telegram, digests. | 3 |
| G40 | **CI/CD, staging, seeded test tenants, feature-flag infra** | A staging env, seeded multi-tenant fixtures in CI (for the isolation gate), and a real feature-flag system (the plan repeatedly says "behind a flag"). | 0 (cross-cutting) |
| G42 | **Recordings & AI usage count toward quota + per-tenant AI cost/rate caps** | Lesson recordings can blow storage — must count against `storageUsedBytes`. AI-assist add-on needs per-tenant usage metering + rate caps to protect margin. | 5 |
| G44 | **Explicit a11y (WCAG) + web performance budgets as gates** | Make WCAG AA and Core-Web-Vitals budgets (LCP/INP/CLS) part of the design gate, not just the 3D budget. | Design workstream |
| G45 | **Tax & financial compliance (Ukraine-first)** | Receiving subscription/marketplace money in UA: ФОП/ТОВ model, **ПДВ/VAT** handling, tax-invoice (рахунок-фактура/акт) generation, fiscalization (РРО/ПРРО where required), reconciliation/export for accounting. International expansion → Stripe Tax/EU VAT/OSS. Money flows must record tax data from day one (hard to backfill). | 5 (+ legal) |
| G46 | **Public status page + incident comms** | Tenant-facing uptime/status page (per-service + per-region), incident/maintenance notices, subscribe-to-updates; feeds and is fed by SLA monitoring (G14). | 7 |

### 🟡 Expansion (post-launch, leave seams now)

| # | Item |
|---|------|
| G21 | Public API + per-school API keys + outbound webhooks |
| G22 | Per-school custom roles / granular permissions |
| G23 | Data residency regions / sharding by region |
| G24 | Read replicas + table partitioning by `schoolId` for scale |
| G25 | Marketplace discovery/matching UX, ratings, search |
| G26 | Per-tenant analytics export / BI connectors |
| G27 | SSO / SAML for enterprise schools |
| G41 | Per-tenant cost / FinOps attribution (storage, video minutes, AI) to protect gross margin |
| G43 | Mobile: PWA now / native learner app later (plan is web-first) |

---

## Part 2 — Capability checklist (everything the service must have)

A commercial multi-tenant SaaS = these capability groups. Each maps to phases in Part 3.

- **Tenancy core**: School model, membership, tenant context (CLS), auto-scoped data, isolation test.
- **Routing**: subdomains, custom domains, automatic TLS, suspended-school handling.
- **Identity & access**: global identity, memberships, invitations, platform-operator axis, impersonation, MFA (expansion).
- **Billing**: 3 layers, plans/entitlements, tax, dunning, refunds, commission ledger, payouts.
- **Per-tenant infrastructure**: object storage w/ quotas, per-tenant cache keys, per-tenant secrets + rotation, per-tenant integration runtime, tenant-aware webhooks, tenant-aware jobs.
- **Platform operations**: admin console, audit log, support tooling, health/usage per tenant, feature flags.
- **Trust & compliance**: GDPR export/erasure, DPA, audit retention, backup/DR, pen-test, isolation guarantees, public status page.
- **Tax & finance**: UA tax model (ФОП/ТОВ, ПДВ, fiscalization/РРО, tax invoices) + intl Stripe Tax/VAT-OSS; accounting export.
- **Observability**: tenant-tagged logs/traces/metrics, alerting, SLA.
- **Growth**: onboarding funnel, white-label branding, marketplace + commission, school data import.
- **Localization**: platform UI i18n (uk/en), per-user/per-school locale.
- **Money out**: payouts + KYC/AML (Stripe Connect) for settlement, tutor/school/staff payouts.
- **Marketplace trust**: tutor verification, reviews/ratings, moderation, anti-fraud.
- **Comms**: tenant-aware notifications (in-app/email/push/Telegram) + preferences.
- **Growth instrumentation**: product analytics on the activation funnel; per-tenant FinOps.
- **Activation & UX** (cross-cutting, non-negotiable): every flow must be usable without docs — sensible defaults, inline help, empty-state guidance, loading/error feedback (per `web-async-actions` rule). Includes:
  - **Trials**: 7-day default free trial on school signup; no card required to start.
  - **Promo codes**: redeemable codes that extend the trial to 14 days (and are extensible to %/fixed discounts on subscription later).
  - **Signup config wizard**: a short Q&A right after school registration that pre-configures the workspace (school type, languages, lesson format, payment, branding).
  - **Virtual assistant / product tour**: a named, avatared in-app guide that runs an interactive walkthrough on first login and stays available as contextual help.

---

## Part 3 — Revised phased execution plan (precise instructions)

Each phase is independently deployable and ends with an **acceptance gate**. Do not start the next phase until the gate passes.

> **Status — 2026-06-22 (live state in `docs/handoff.md`):** Phase 0 ✅. Phase 1 ◐ — all 8 data verticals scoped + `TenantPrismaService` done; **read-path migration done for ALL request-scoped services** (materials/vocabulary/flashcards/lessons/speaking/chat/billing-subset); **Phase 1 ✅ complete** (8 verticals + read-migration + TenantPrismaService + G3 + ESLint guardrails + Gate 1 in CI). Phase 2 ◐ — backend host-resolution middleware done; web middleware/custom-domains/i18n pending. Phase 3 ◐ — tenant context from membership + all write sites on context; **remaining: JWT reshape, webhooks (G2), jobs (G4), object storage (G6)** — the only read paths still on base prisma are webhook/cron (G2/G4 territory). Phases 4–7 not started.

### Phase 0 — Decisions & scaffolding (mostly done)
- ☑ ADR-005…009 written; ADR-004 superseded.
- ☑ **Added `nestjs-cls`** (v6.2.1) + new shared package **`@be/tenant`** (`packages/backend/shared/tenant/`): `TenantContext` type, `TenantContextService` (typed CLS accessor with `requireSchoolId()`), `TenantModule` (global `ClsModule` + mounted HTTP middleware seeding `requestId`/best-effort `userId`). Wired into `apps/api/app.module.ts`. Aliases added to `tsconfig.base.json` + `jest.paths.cjs`; jest project registered. Fixes **G1**.
- ☑ Added `docs/runbooks/` folder + index (custom-domains, secret-rotation, restore-drill, incident-response — planned per phase).
- ◐ **Dev/release infra (G40):** staging env + feature-flag mechanism still TODO; seeded multi-tenant fixtures land with the Phase 1 isolation gate.

**Gate 0:** ☑ `ClsModule` wired in `apps/api` (TenantModule); `TenantContextService` available app-wide; unit smoke test (`tenant-context.service.spec.ts`, 4/4) proves set/read + **cross-run isolation** + fail-loud `requireSchoolId()`. API typecheck clean. *(A full HTTP middleware→handler e2e arrives with the Phase 1 isolation gate harness.)*

---

### Phase 1 — Tenancy core & data isolation 🔴 (highest risk, do first)

**1.1 Schema (Prisma):**
- ☑ Added models `School`, `SchoolDomain`, `SchoolMembership`, `PlatformOperator`, `SchoolSubscription` + enums `SchoolStatus`/`DomainKind`/`SchoolMembershipRole`/`SchoolMembershipStatus`/`PlatformRole`/`SubscriptionStatus`; back-relations on `User` (`schoolMemberships`, `platformOperator`). `School` already carries `storageUsedBytes`, `onboardingState`, per-school config (moved off PlatformSettings). `prisma validate` + `generate` clean (Prisma 7.7). `Language`/`Word`/`WordDefinition` left global.
- ☑ `schoolId` added to all tenant-scoped models via `TENANT_SCOPED_MODELS` + `TenantPrismaService` extension (scopes at query level). Migration `20260616113940` applied.
- ☑ `User.role` kept temporarily (ADR-006 cutover done — `RolesGuard` reads `membershipRole` from CLS; `User.role` drop deferred until explicit verification).

**1.2 Online backfill (zero-downtime, fixes G17) — ◐ partial (tenant tables + identity done):**
- ☑ Migration `20260616113940_add_tenancy_models` applied (additive: 5 tables + 6 enums + FKs/indexes; no existing-table changes → zero data risk). DB was in sync (27 migrations, no drift).
- ☑ Identity backfill (`prisma/backfill-tenancy.ts`, idempotent, npm `prisma:backfill:tenancy`): `school_default` created (SoEnglish = tenant #1) + ACTIVE subscription stub; one `SchoolMembership` per user (role mapped from `User.role`); legacy `SUPER_ADMIN` → `PlatformOperator(PLATFORM_ADMIN)`. Verified: 1 school / 6 memberships / 2 operators (idempotent re-run, no dupes).
- ☑ `schoolId` scoped on all tenant data tables via `TENANT_SCOPED_MODELS` + Prisma `$extends`; backfill script applied; `NOT NULL` enforced at query level (Prisma extension). All 8 verticals registered.
  - ☑ **`LibraryMaterial`** = first vertical: migration `library_material_school_required` (embedded backfill before `SET NOT NULL` + FK), registered, isolation-tested.
  - ☑ **`ScheduledLesson`** (core) = second vertical: migration `scheduled_lesson_school_required` (expand/contract in one file: nullable → `UPDATE = school_default` → `SET NOT NULL` + FK + `@@index([schoolId,date])`); 12 rows backfilled; registered; isolation-tested. Its one create site (`lessons.service.ts:570`) now sets `schoolId: DEFAULT_SCHOOL_ID` (new `@be/tenant` constant) with a `TODO(multitenant)` seam until Phase 2/3 supplies the tenant context. Lessons unit 47/47 + typecheck clean.
  - ☑ **`Quiz`** = third vertical: migration `quiz_school_required` (expand/contract, 4 rows backfilled); registered; create site (`quiz-generate.service.ts`) sets `schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID`; isolation-tested. Flashcards unit 28/28.
  - ☑ **`SpeakingTopic` + `ChatConversation`** (4th vertical): registered, isolation-tested; services inject `TenantContextService` and stamp `schoolId`.
  - ☑ **Financial vertical** (5th): `Payment`, `StudentLessonBalance`, `LessonBalanceLedger`, `StaffCompensationProfile` — `financial_models_school_required`; stamped across 7 checkout services + lesson-balance/payment-settings/staff-payroll. **`Payment` write-stamping done; webhook tenant-resolution (G2) still pending** — webhooks fall back to `DEFAULT_SCHOOL_ID` (single-school seam).
  - ☑ **`StudentGroup`** (6th vertical): `student_group_school_required`, registered, isolation-tested.
  - ☑ **Learner-data vertical** (7th): `PracticeSession`, `StudentWordCard`, `StudentLearningLanguage`, `StaffPayout` — `learner_data_school_required`; `StudentLearningLanguage.createMany` manually stamped (G5: `$extends` skips `createMany`).
  - ☑ **Child/leaf vertical** (8th): `NotificationDelivery`, `TeacherMessage`, `ScheduledLessonParticipant`, `QuizAssignment`, `QuizAttempt`, `SpeakingSubmission` — `child_tables_school_required`; incl. a nested `participants` create under `scheduledLesson.create` (manually stamped, G5).
  - ✗ **Dead models intentionally NOT scoped:** `Progress`, `ReviewQueue`, `DailyGoalCompletion` (zero code references — no write path).
  - ☐ Remaining child tables (low priority, via scoped parent): `QuizQuestion`, `QuizAnswer`, `SpeakingTopicAssignment`, `ChatParticipant`/`ChatMessage`/`ChatMessageAttachment`, `StudentGroupMember`, `LessonMaterial`/file-attachment + `LibraryMaterial` children.

**1.3 TenantPrismaService (fixes G5) — ☑ implemented & unit-tested:**
- ☑ Pure `scopeArgs()` (`tenant-scope.ts`) injects `where:{schoolId}` for read/where/unique ops, stamps `schoolId` into `create`/`createMany`/`upsert`; **fails loud** on a tenant model with no active `schoolId` and no bypass. 11 tests.
- ☑ `makeTenantExtension()` wires it into Prisma `$extends.$allModels.$allOperations`; `TenantPrismaService.client` is the scoped client; registered in `PrismaModule`. Extension tests (4) cover scope/bypass/fail-loud.
- ☑ **`client` typing fixed (2026-06-19):** was `ReturnType<$extends>` which erases to `unknown` across the package boundary (useless to consumers); now typed `PrismaClient` via a localized cast (the extension only intercepts args, not model shape). Unblocks read-path migration. **Unique-ops proven against real DB:** cross-tenant `findUnique`→null, `update`/`delete`→throw (Prisma 7 accepts non-unique `schoolId` in unique-op `where`).
- ☑ `asPlatform(fn)` — audited bypass via CLS flag; works inside a request or standalone (cron/webhooks establish a fresh context). Outside a context, tenant access fails loud (G4).
- ☑ **ESLint tenant guardrails — already in place (2026-06-27 audit):** `no-restricted-syntax` in root `eslint.config.mjs` bans `$queryRaw`/`$queryRawUnsafe`/`$executeRaw*` (bypasses `$extends`) and `asPlatform()` calls everywhere except `module-platform-admin` and `data-access-prisma`. Since `asPlatform` is a method on `TenantPrismaService` (not a standalone import), call-site restriction is stronger than import restriction. `@be/*/src/*` deep imports also banned (all backend). Frontend banned from importing `@be/*`/`@pkg/*`.
- ⚙️ `TENANT_SCOPED_MODELS` intentionally **empty until columns land** (1.2), so this ships safely before the migration without breaking existing queries.

**1.4 Per-tenant integration runtime (fixes G3) — ☑ done (2026-06-23):**
- ☑ `platform-integration.runtime.ts` refactored from a process-wide `let cached` to `Map<schoolId, ResolvedPlatformIntegration>` keyed by the active `schoolId` (read from CLS via `ClsServiceManager.getClsService()` — no DI, no `@be/prisma` layering break), with a `PLATFORM_KEY` platform-global entry as fallback. `getPlatformIntegrationRuntime()` returns the per-school entry when present, else platform-global. `refreshPlatformIntegrationRuntime(config, secrets, schoolId?)` + `setPlatformIntegrationRuntime(next, schoolId?)` + new `invalidatePlatformIntegrationRuntime(schoolId?)` take an optional school. **Today behaviour unchanged** — integrations are still sourced from `PlatformSettings` (global) so only `PLATFORM_KEY` is written and every caller falls back to it; the seam is ready for per-school overrides (per-school PSP / white-label). +3 unit tests (`platform-integration.runtime.spec.ts`). Removes the structural cross-tenant secret-leak risk the singleton posed.
- ☑ **ESLint isolation guardrails (2026-06-23):** `eslint.config.mjs` adds `no-restricted-syntax` for backend/api banning (a) raw SQL (`$queryRaw`/`$queryRawUnsafe`/`$executeRaw*` — bypasses `$extends` scoping, G5) and (b) `asPlatform()` calls (audited cross-tenant bypass — reserved for `@be/platform-admin`). Excludes specs/tests + the `data-access-prisma` package (owns the client / defines `asPlatform`). Surfaced one real violation — `lessons.service.autoCompletePastPlannedLessons` raw SQL — now manually `schoolId`-scoped + justified `eslint-disable`. Zero guardrail violations across backend. *(Backend modules lint via per-module `eslint .` which picks up the root flat config.)*

**Gate 1 (🔴 mandatory) — ◐ core mechanism PROVEN against real DB:**
- ☑ `tests/integration/tenant-isolation.integration.spec.ts` (**17/17**, real Postgres) proves the full chain CLS → `TenantContextService` → Prisma `$extends` → `scopeArgs`: only active school's rows, cross-school blocked, `create` stamps `schoolId`, `asPlatform()` bypass, fail-loud, **and unique-ops (findUnique/update/delete) cross-tenant**. Covers `SchoolMembership`, `LibraryMaterial`, `ScheduledLesson`, `Quiz`, `SpeakingTopic`, `ChatConversation`, `Payment`, `StudentGroup`, `PracticeSession`, `StaffPayout`, `TeacherMessage`, `NotificationDelivery`. `TENANT_SCOPED_MODELS` now holds all 8 verticals' models.
- ⚠️ **ALS gotcha proven & documented:** lazy Prisma queries must be `await`ed *inside* the `cls.run`/context, else the scope is lost (the tenant-resolution middleware/guard naturally satisfies this for real requests).
- ☑ **Read-path migration to `TenantPrismaService.client` — all request-scoped services done:** `materials`, `vocabulary`, `flashcards`(quiz), `lessons`, `speaking`, `chat`, and the request-scoped billing services (`staff-payroll`, `payment-settings`). Webhook/cron read paths **intentionally stay on base prisma** (zoom-webhook, chat-attachment `@Cron`, `lesson-balance` webhook/sync paths, checkout services + 5 webhook controllers) — these are **G2/G4 work** (resolve school from payload/iterate schools + `asPlatform()`), not naive scoping (which would fail-loud). Integration seed creates `SchoolMembership` per test user so the auth guard establishes tenant context. Full integration suite **81/82** (1 pre-existing mail/jest-ESM failure unrelated to tenancy).
- ☑ **Wired into CI as a required check (2026-06-22):** `ci.yml` integration job runs Postgres + `prisma:migrate:deploy` + `test:integration` (`RUN_INTEGRATION_TESTS=1`); `ci-success` gate requires it. Last red test (`auth.integration forgot-password`, mail/jest-ESM) fixed by making password-reset email best-effort (try/catch) — both suites now fully green (**unit 1084/1084, integration 82/82**).

---

### Phase 2 — Routing: subdomains & custom domains 🟠

- ☑ **`apps/web/src/middleware.ts` (2026-06-23):** pure `classifyTenantHost` (apex/www/reserved/localhost/IP → platform; single-label `*.ROOT_DOMAIN` → subdomain slug; else → custom domain) + Next middleware forwarding `x-school-slug` / `x-school-host` hints to the API. Non-disruptive (no redirects/blocks yet — apex keeps `/ → /dashboard`). `tenant-host.test.ts` +9. *(Apex landing page + unknown→not-found UI are deferred until a real landing/multi-school deploy exists.)*
- ☑ **Backend consumes the hint:** `TenantResolutionMiddleware` now resolves in priority `x-school-slug` → `School.slug` (cached), then `x-school-host`/`Host` → verified `SchoolDomain` (cached). Slug resolver **excludes `SUSPENDED`** schools (partial suspended handling for the public path).
- ☑ **Backend `TenantResolutionMiddleware` (2026-06-19):** `apps/api` middleware resolves `req.headers.host` → verified `SchoolDomain` → `tenant.setSchoolId` for public/unauth surfaces; pure `normalizeTenantHost` + negative-cached `HostSchoolResolver` (TTL 60s) live in `@be/tenant` (no `@be/prisma` dep). No-op when CLS inactive / schoolId already set / host unmapped; errors swallowed (best-effort on all routes). `tenant-host.spec` +10. ⚠️ no-op on localhost today; verify CLS-mount ordering once real subdomains exist.
- ☑ **Cross-check JWT.schoolId === host school (ADR-007) — 2026-06-27:** `AuthGuard` snapshots host-resolved `schoolId` (from `TenantResolutionMiddleware`) before overwriting with JWT claims. If both are present and differ → 403 `Token school does not match request host`. Platform operators bypass. `OptionalAuthGuard` handles gracefully — strips auth (reverts to anonymous) rather than throwing, so public pages still render for the host school. +4 spec assertions.
- ☑ **Edge/KV cache for domain lookups (G12, already done):** `HostSchoolResolver` in `packages/backend/shared/tenant/src/tenant-host.ts` — in-process `Map<host, {schoolId, expires}>`, TTL 60s, negative-cached (misses too). Both slug and custom-domain resolvers use it. Singleton lifecycle in `TenantResolutionMiddleware`.
- ☑ **Custom domains (G16) done (2026-06-27):** `DomainsService` (`@be/auth`) — CRUD + SSRF-safe DNS TXT verification (`dns.promises.resolveTxt`, zero HTTP fetch). `DomainsController` (`GET/POST /api/domains`, `POST /api/domains/:id/verify`, `DELETE /api/domains/:id`, `AuthGuard` + admin-role check). `DomainsPanel` wired in System → Domains tab (add, verify with TXT token hint, remove). **Cloudflare for SaaS runbook** at `docs/runbooks/custom-domains.md` — add/poll/remove custom hostname, fallback origin, activation checklist. Remaining: wire CF API + `cfHostnameId` column when CF for SaaS is activated (checklist in runbook).
- ☑ Suspended school (`School.status=SUSPENDED`): public host/slug resolution excludes suspended schools; **`AuthGuard` blocks members of a suspended school (403)** while platform operators bypass to un-suspend via the console (Phase 4C, 2026-06-24). *(A dedicated web "suspended" screen — copy/UX — lands with the 4D web console.)*
- ☑ **i18n foundation (G33) — complete (2026-06-27):** shared locale core in `@pkg/types/locale.ts` (`resolveLocale`, `parseAcceptLanguage`, `normalizeLocale`). `School.defaultLocale` + `User.locale` nullable columns added (migration `20260627022800`). `TenantContext.locale` + `TenantContextService.{locale, setLocale}` added. `AuthSessionService.resolveUserLocaleData` fetches user+school preferences in parallel. `resolveWebRequestSession` resolves locale → sets CLS via `tenant.setLocale` + returns `WebRequestSessionDto.locale`. **Remaining (incremental):** message catalogs + UI adoption (extract strings as screens are built).

**Gate 2:** Two schools reachable on distinct subdomains; one verified custom domain serves with valid TLS; cross-domain token reuse returns 403.

---

### Phase 3 — Identity, access, tenant-aware infra 🟠

- ☑ **Tenant context seeded from membership (started):** `AuthGuard`, `OptionalAuthGuard`, and `GqlAuthGuard` now call `seedTenantContext()` → set `userId`/`schoolId`/`membershipRole` in CLS from the user's active `SchoolMembership` (`AuthSessionService.resolveActiveMembership`, raw/unscoped). So authenticated REST + GraphQL requests carry the real `schoolId`. Guard unit test added; full unit suite 1071/1071, typecheck clean.
- ☑ **JWT reshape (ADR-008) — 2026-06-27:** `issueTokens` now embeds `{ sub, schoolId?, membershipRole?, platformRole? }` in the access token (parallel lookup at sign time). `AuthGuard`/`OptionalAuthGuard` decode the raw token with `jwt.decode` (no extra verify), pass claims to `seedTenantContext`. Fast path: if `schoolId`+`membershipRole` in claims → skip `resolveActiveMembership` DB call; only `getSchoolStatus` (1 query) for live suspension check. Legacy tokens (no `schoolId` claim) fall back to full DB path. Refresh rotation issues new-shape tokens automatically (re-enters `issueTokens`). Old tokens expire within `ACCESS_TOKEN_TTL_SECONDS`.
- ☑ **Write sites use context `schoolId`** (`this.tenant.schoolId ?? DEFAULT_SCHOOL_ID`) across all 8 verticals' create/upsert/createMany sites.
- ☑ **Read paths → `TenantPrismaService.client` — all request-scoped services done:** `materials`, `vocabulary`, `flashcards`(quiz), `lessons`, `speaking`, `chat`, `staff-payroll`, `payment-settings`. Recipe: inject `TenantPrismaService`, `private get db()` getter, swap scoped-model ops `this.prisma.X`→`this.db.X`, keep global models (`User`/`Word`) on base.
- ☑ **Side-fix (2026-06-19): `GqlThrottlerGuard`** — global `ThrottlerGuard` read request via `switchToHttp()` (undefined for GraphQL) → `req.ip` threw → **all GraphQL requests 500 in prod**. Custom guard overrides `getRequestResponse` for GraphQL context. (This was the real cause of the "pre-existing req.ip" integration failures.)
- ☑ **ADR-006 authorization cutover — 2026-06-27:** `RolesGuard` now reads `membershipRole` from CLS (fast path, 0 DB calls). `ADMIN` satisfies `ADMIN`/`SUPER_ADMIN`/`TEACHER`/`STUDENT`; `TEACHER` satisfies `TEACHER`/`STUDENT`; `STUDENT` satisfies `STUDENT`. Falls back to `User.role` DB lookup only when no tenant context (platform-operator requests). `User.role` drop deferred until full migration and explicit verification. +7 spec assertions.
- ☑ **Invitations flow — 2026-06-27:** `SchoolInvitation` Prisma model (token/email/role/expiresAt/acceptedAt/revokedAt/createdById) + migration. `InvitationsService`: create (revokes prior pending, sends email, 7-day TTL), list, revoke, accept (validates token+email match+school status, upserts `SchoolMembership` in transaction). `InvitationsController` (`POST/GET /schools/invitations`, `DELETE /schools/invitations/:id`, `POST /schools/invitations/accept`), ADMIN-guarded. `school-invitation` email template (React Email) + typed `SchoolInvitationEmailProps` in `@be/email-templates`. +11 spec assertions. **Remaining:** active-school switcher (multi-school UX).
- ☑ `PlatformOperator` + `@PlatformAdmin()` guard — done as part of 4A (2026-06-23), see Phase 4 section below.
- ☑ **OAuth school context cookie (ADR-008) — 2026-06-27:** `GET /auth/google` writes `OAUTH_SCHOOL_COOKIE` (10-min, httpOnly, SameSite) from `tenant.schoolId` before redirecting to Google. Callback reads `preferredSchoolId` from that cookie and passes it to `issueTokens`. `resolveActiveMembership` extended with optional `preferredSchoolId` — looks up that specific school's membership first (falls back to first active if not found). `clearOAuthSchoolCookie` called on every callback exit path. Facebook OAuth has no login flow (link-only) — not applicable. Telegram login is inline (no redirect), so no cookie needed.
- ☑ **Tenant-aware webhooks (fixes G2) — 2026-06-22:** all 7 PSP webhooks credit via `LessonBalanceService.grantPurchaseLessons`; that funnel resolves `payment.schoolId` (stamped at checkout) and seeds CLS (`tenant.setSchoolId`) before ledger/balance writes, so credits land in the right school (not `DEFAULT_SCHOOL_ID`). Signature-verify + reject-unmappable already in each `handleWebhook`. +3 unit tests. *(Future: when PSP accounts become per-school, also map provider account/customer metadata → school for defense-in-depth.)*
- ☑ **Tenant-aware jobs (fixes G4):** refactor `@Cron` services to iterate active schools (or run per-school) with explicit `schoolId`; never rely on ambient context in jobs. **Done (2026-06-26):** `module-notifications` jobs (lesson-reminder/new-vocab/streak/weekly-report) — lesson-reminder filters `school: { status: { not: 'SUSPENDED' } }`; user-based jobs query via `schoolMembership` (active school + active membership) instead of legacy `User.role`.
- ☑ **Object storage (fixes G6) — 2026-06-26:** `FileStoragePort` abstraction (`@be/storage`), `LocalFileStorageAdapter` (disk) + `S3FileStorageAdapter` (S3/R2/MinIO), `FileStorageModule` (global, env-driven via `STORAGE_DRIVER`). `MaterialAttachmentService` + `LessonAttachmentService` migrated; controllers redirect (302) to pre-signed URLs in S3 mode. Lesson keys use `schools/{schoolId}/lessons/{uuid}{ext}`; material keys use `library/{materialId}/{attachmentId}{ext}`.
- ☑ **Per-school storage accounting — 2026-06-26:** `StorageAccountingService.add` (atomic, clamps ≥0) wired into all upload/delete paths: materials (create/compress/delete), lessons (`LessonAttachmentService`), speaking (`SpeakingSubmissionsService`). Chat attachments intentionally excluded (ephemeral TTL). Usage exposed via `GET /billing/entitlements` (school app billing page: progress meter + over-quota warning) and platform admin school detail page (Storage used row). Gate 5 storage meter now accurate.
- ☑ Per-tenant secret storage stays AES-GCM; KEK-rotation runbook done (`docs/runbooks/secret-rotation.md` — 2026-06-27).
- ☑ **Tenant-aware notifications (G39) done (2026-06-27):** `NotificationDelivery.schoolId` stamped; per-user prefs on `User`; per-school email sender display name (`buildFrom()` prefixes school name); cron jobs filter suspended schools + pass `schoolName` through all 5 dispatch sites. **☐ deferred (Phase 6):** per-school Telegram bot, in-app push.

**Gate 3:** A Stripe test webhook is correctly attributed to the right school; a cron job processes exactly its target school's data; a file uploaded by school A is not addressable by school B's signed URL.

---

### Phase 4 — Platform admin console (MVP) ✅ Done

- ☑ **`@be/platform-admin` module fully done (2026-06-24):** 4A foundation (PlatformAuditLog, PlatformAdminGuard, PlatformAuditService, seed PlatformOperator) + 4B (PlatformSchoolsService, dashboard/schools/detail endpoints) + 4C (suspend/activate, impersonation with banner) + 4D (platform web console `apps/platform`). +20 tests.
- ☑ Platform admin REST surface done — see above (4A–4D combined).
- **4C suspend/activate + audit + enforcement done (2026-06-24):** `POST /api/platform/schools/:id/suspend|activate` (`@PlatformAdmin('PLATFORM_ADMIN')` only) → sets `School.status` + `PlatformAuditService.record`. `GET /api/platform/audit-log[?schoolId=]`. **Suspended enforcement (closes deferred Phase 2):** `AuthGuard` blocks members of a SUSPENDED school (403); platform operators bypass (they un-suspend via console). `seedTenantContext` returns `{suspended, isPlatformOperator}`; `resolveActiveMembership` now returns `schoolStatus`. +8 tests.
- **4C.2 impersonation done (2026-06-25):** `POST /api/platform/schools/:id/impersonate` (`@PlatformAdmin('PLATFORM_ADMIN')`) → `PlatformImpersonationService` mints a **short-lived (15 min)** access token carrying an `imp` claim (`act`=operator, `sid`=school), default target = the school's first active admin; set as the **access cookie only** (operator's refresh untouched → auto-returns at expiry). Web session (`/auth/web-session`) surfaces `impersonation:{actorUserId,schoolId}` (the **banner claim**, added to `WebRequestSessionDto`). `POST /api/auth/impersonate/stop` (AuthGuard only — it runs as the impersonated user, so it cannot sit behind `PlatformAdminGuard`) clears the access cookie + records `school.impersonate.stop`. Both start & stop hit the audit log. +10 tests. **Gate 4 closed.** *(Payment-method allowlist is platform **settings**, not an operator action — moved to 4D.)*
- ☑ **Phase 6 seams reserved (2026-06-25/27):** `apps/platform` `ConsoleShell` sidebar has Leads / Marketplace / Recruiting as disabled "soon" stubs. `PlatformRole` + `asPlatform()` already structured for Phase 6 extension. No restructuring needed when Phase 6 lands.
- ☑ **Audit log** — `PlatformAuditLog` model + `PlatformAuditService.record()` + `GET /api/platform/audit-log` endpoint done (Phase 4A). Wired: impersonation start/stop, school suspend/activate, payment-method allowlist, promo-code create/update. Fixes part of G14.

- **4D (in progress) — impersonation banner UI done (2026-06-25):** `ImpersonationBanner` renders in `apps/web` root layout whenever the resolved session carries an impersonation claim (it *is* a school session). Claim is threaded server-side: `WebRequestSessionDto.impersonation` → `proxy.ts` state → `x-soenglish-impersonation` header → `readRequestAuthState` → layout. "Stop impersonating" posts `/api/auth/impersonate/stop` + reloads. The banner lives in the **school** app (not the console) because impersonation logs the operator into the school app as the school user.
- **4D — platform console app scaffolded (2026-06-25):** new **`apps/platform`** Next.js app (`@app/platform`, port 4300, `output: standalone`, `/api/*`→API rewrite, security headers; `dev:platform`/`build:platform` scripts; port added to `free-dev-ports`). `ConsoleShell` sidebar with **nav-IA stubs reserved for Phase 6** (Leads / Marketplace / Recruiting shown as disabled "soon"). Surfaces wired (SSR via `platformGet`, cookie-forwarding, 401/403→`Unauthorized`): **Dashboard** (8 stat cards), **Schools** (cross-tenant list, rows link to detail), **School detail** (`/schools/[id]`: status, domain, subscription, role counts + `SchoolActions` client suspend/activate via same-origin POST + `router.refresh()`), **Audit log** (`/audit-log`). **Settings → payment-method allowlist** (`/settings`: checkbox editor, same-origin PUT). Routes build clean (typecheck + lint + `next build`: `/dashboard`, `/schools`, `/schools/[id]`, `/audit-log`, `/settings`).
- **4D payment-method allowlist done (2026-06-25):** new `PlatformSettings.allowedPaymentMethods PaymentMethodKind[]` (migration `add_platform_payment_allowlist`; **empty = no restriction**). `PlatformPaymentMethodsService` (`@be/platform-admin`, base prisma — platform-global) `get()`/`set()` + audit `platform.payment_methods.update`. REST `GET /api/platform/payment-methods` (allowlist + full catalog) + `PUT` (`@PlatformAdmin('PLATFORM_ADMIN')`, validates unknown kinds → 400). **Enforcement:** `@be/billing PaymentSettingsService.updatePaymentSettings` rejects enabling any method outside a non-empty allowlist. +5 tests (4 unit + 1 integration: GET/PUT/400/403).
- **4D cross-app SSO seam + impersonate-from-console done (2026-06-25):** auth cookies now take an optional `Domain` via **`AUTH_COOKIE_DOMAIN`** env (e.g. `.arvilio.app`) in `cookieOptions()` — set/clear share it, so one session (incl. impersonation) works across sibling subdomains (`app.*`, `platform.*`). Unset (local dev) → host-only, already shared across ports on the same host (cookies ignore port). +2 unit tests. Console **Impersonate admin** button (school detail) POSTs `/impersonate` then redirects to the school app (**`NEXT_PUBLIC_SCHOOL_APP_URL`**, default `http://localhost:4200`) where the banner shows; disabled for suspended schools.

**Phase 4 / Gate 4 — DONE ✅.** Console: dashboard, schools list/detail, suspend/activate, impersonate (banner in school app), audit log, payment-method allowlist; nav-IA stubs reserved for Phase 6. Ops env for prod: `AUTH_COOKIE_DOMAIN`, `NEXT_PUBLIC_SCHOOL_APP_URL`, `API_PROXY_TARGET` (per app).

**Gate 4:** ✅ Operator can list all schools, suspend one (school goes offline), impersonate with a **visible banner** (shipped 2026-06-25), and every action appears in the audit log.

---

### Phase 4.5 — Activation & onboarding UX 🟠 (the "usable & inviting" phase)

This phase makes signup self-serve and the first session guided. It fixes **G19, G28–G32**.

**4.5.1 Self-serve signup + 7-day trial (G19, G28):** — **core done (2026-06-25)**
- ☑ Public "create your school" flow: `SchoolSignupService.registerSchool` (`@be/auth`) → slug from name (`slugifySchoolName`, collision-retry on `@unique`) → atomic `$transaction`: `School(status=TRIAL)` + admin `User(role=ADMIN)` + `SchoolMembership(ADMIN, ACTIVE)` + `SchoolSubscription(TRIALING, trialEndsAt=now+7d, TRIAL_DAYS=7)`. **No card.** `POST /api/auth/register-school` (public) auto-logs the admin in (issueTokens + cookies). Web `/(auth)/signup` page (`apps/web`, reuses `Field`/`Button`). +18 tests (slug, service incl. dup-email/short-pw/slug-retry, integration: provisions + dup-email 400).
- ☑ At `trialEndsAt` → grace window → `SUSPENDED`: **auto-suspend job done (2026-06-25)** — `TrialLifecycleService.expireTrials` (`@be/platform-admin`, base prisma, **iterates schools explicitly = G4 pattern**) suspends `TRIAL` schools whose `subscription.trialEndsAt < now − TRIAL_GRACE_DAYS` (grace = 3d); daily `TrialLifecycleScheduler` `@Cron(MIDNIGHT)`. Schools without a subscription (legacy default) never match. +3 tests.
- ☑ **Trial-countdown banner done (2026-06-25):** `WebRequestSessionDto.trial = {trialEndsAt, daysLeft}` (resolved by `AuthSessionService.resolveTrialInfo` — null unless active school is TRIAL with a `trialEndsAt`, `daysLeft` clamped ≥0); threaded SSR (proxy → `x-soenglish-trial` header → `readRequestAuthState` → layout). `TrialBanner` renders the countdown (warning style at 0 / "trial ended"). +9 tests.
- ☑ Provisioning uses base PrismaService (no tenant context at signup = `asPlatform()` equivalent); atomic transaction = retry-safe (no partial state).

**4.5.2 Promo-code system → 14-day trial (G29):** — **core done (2026-06-25)**
- ☑ Models: `PromoCode { code @unique, kind, trialDays, maxRedemptions, redeemedCount, validFrom, validTo, active }` + `PromoRedemption { promoCodeId, schoolId, redeemedAt }` `@@unique([promoCodeId, schoolId])` (migration `add_promo_codes`).
- ☑ Redemption **at signup** (`RegisterSchoolRequestDto.promoCode`): `SchoolSignupService.redeemPromo` (inside the signup `$transaction`) validates active/in-window → `trialDays = max(7, promo.trialDays)` (e.g. 14) → writes `PromoRedemption` + increments `redeemedCount` **atomically** via conditional `updateMany(where redeemedCount < maxRedemptions)` (count≠1 → "fully redeemed"), preventing over-redemption. Invalid/expired/exhausted code → 400.
- ☑ Designed extensible: `kind` enum (`TRIAL_EXTENSION` today) reserves `PERCENT_OFF`/`FIXED_OFF` (Phase 5).
- ☑ Admin: `PromoCodesService` (`@be/platform-admin`) + REST `GET /api/platform/promo-codes`, `POST` (create, `@PlatformAdmin`), `PATCH /:id` (enable/disable), audited; `redeemedCount`/`maxRedemptions` surface usage. **Console UI done (2026-06-25):** `apps/platform/promo-codes` page — create form (code/trialDays/maxRedemptions) + table with enable/disable + redeemed counts; nav item added. +15 tests (signup promo paths, admin service, integration). **Trial-extension from billing settings done (2026-06-27):** `PlatformSubscriptionService.redeemTrialExtension` (atomic claim → extend `SchoolSubscription.trialEndsAt` from whichever is later: now or existing; blocks non-TRIAL schools, PERCENT_OFF/FIXED_OFF codes, expired/exhausted codes, duplicate redemption via `@@unique`). `POST /api/billing/subscription/promo/redeem` (AuthGuard + ADMIN membershipRole). Billing page shows "Have a promo code?" card (trial-only), with inline success/error feedback + auto-refresh of entitlements. +7 tests.

**4.5.3 Signup config wizard (G30):** — **backend state API done (2026-06-25)**
- ☑ **Post-registration multi-step wizard fully done (2026-06-27):** 5 steps (profile / teaching / payments / invite / sample-content), resumable + skippable, `School.onboardingState` JSON. Backend: `SchoolOnboardingService` + REST (`GET/PATCH/POST /api/onboarding`). Web: `apps/web/(school-app)/onboarding` 5-step wizard. Side-effects: `dispatchInvites` (step invite), `SampleContentService.seed` (step sample-content), `applyPaymentsStep` (payments methods). +18 tests.
- ☑ Wizard completion flips `School.onboardingState.completed=true`; partial progress persists (step slices) so the admin can resume.
- ☑ Wizard uses `Field`/`Button`/`SurfaceCard` throughout; each step is one decision (profile/teaching/payments/invite/sample-content); defaults pre-filled where applicable.

**4.5.4 Virtual assistant + product tour (G31):**
- ☑ **Persona defined (2026-06-25): «Arvi» the Speaker-puff** — a small round soft creature embodying *voice/sound* (concept-driven, not an animal → ownable; works for adults + kids). Egg-shaped chibi body, big friendly eyes, warm smile, two rounded soundwave/headphone-cushion ears, tiny arms/feet; brand mint-green (`--green`) + white face/belly; one silhouette, one colour. Tone: warm coach, concise, celebrates small wins. Tour poses: idle / greet / point / celebrate. Reused across onboarding, empty states, marketing, marketplace. **Meshy.ai text-to-3D prompt + A-pose/Stylized/low-poly/Draco ≤1.5MB settings recorded in handoff;** asset target `apps/web/public/mascot/arvi.glb`.
- ◐ **3D animated character (primary direction — user decision). Render island done (2026-06-25):** `apps/web/components/mascot` — `<Mascot pose size>` lazy-loads an R3F island (`@react-three/fiber@9` + `drei` + `three`, `next/dynamic` ssr:false, never blocks first paint) that loads `public/mascot/arvi.glb` (`useGLTF`/`useAnimations`); **asset-agnostic** — plays a clip matching the pose (`idle`/`greet`/`point`/`celebrate`) or falls back to first/idle clip, else a procedural idle bob. Falls back to a 2D SVG Arvi when WebGL is unavailable, `prefers-reduced-motion`, or the GLB is missing (error boundary). Render loop pauses on hidden tab. Wired into the tour (pose per step). **Any `.glb` can be dropped at `public/mascot/arvi.glb` now and replaced later unchanged.** **☐ remaining:** the actual rigged Arvi GLB (Meshy), element-anchored highlighting.
  - **Pipeline:** model + rig in Blender, or AI-assisted 3D (Meshy / Luma / Spline) for the base mesh; export **glTF/GLB** (compressed with Draco/meshopt). Reference/concept art and 2D fallback frames can be generated via the **Higgsfield MCP**; Higgsfield is *not* a 3D-model source — keep a dedicated 3D step.
  - **Render:** `@react-three/fiber` + `drei` (Three.js) in a lazy-loaded (`next/dynamic`, client-only) island; a few looped clips/morph targets (idle, wave/greet, point, celebrate) triggered by tour steps.
  - **Performance budget (hard):** GLB ≤ ~1.5 MB, lazy-loaded only on first-run/help (never blocks initial paint), 60fps target / capped, pause when offscreen or tab hidden, instant static-image fallback if WebGL unavailable or reduced-motion. Animations still obey the ≤300ms UI-motion rule for *interface* transitions (the character's own idle loop is exempt but subtle).
  - **Accessibility:** the 3D canvas is decorative — all guidance is real text in the bubble (screen-reader friendly); the character never carries information by itself.
  - Decide tour mechanism: lightweight lib (`react-joyride`/`driver.js`) for element-anchored tooltips + a custom 3D-mascot bubble for personality. Design the bubble/tooltip with `soenglish-service-design` + `emil-design-eng` (assistant surface profile).
- ◐ First-login interactive tour highlighting key areas (dashboard, calendar, lessons, materials, students, billing) with "what / where / how". **Data-driven tour UI done (2026-06-25):** `apps/web/components/tour` — `TOUR_STEPS` config + `ProductTour` overlay (gated by `GET /api/onboarding/tour`, Next/Back/Skip/Finish → `POST .../complete`), mounted in root layout for authenticated users; 2D placeholder mascot (`data-mascot`) ready to swap for the 3D asset. **☐ remaining:** element-anchored highlighting + 3D mascot reactions (design-gated).
- ☑ Persist completion **per user** (**done 2026-06-25**): `User.tourCompletedAt` (migration `add_user_tour_completed`); `UserTourService` (`@be/auth`, user-scoped, idempotent) + REST `GET /api/onboarding/tour`, `POST /api/onboarding/tour/complete` (AuthGuard, `@CurrentUser`). +8 tests. *(Replay = clear `tourCompletedAt`; help-menu trigger pending with the tour UI.)*
- ☑ `tourSteps.ts` is data-driven (edit steps without component changes); `ProductTour` is content-agnostic.
- ☑ Tour state is `User.tourCompletedAt` (user-scoped per ADR-004 rule #6); content/branding seam left clean (no school coupling in tour config).

**4.5.5 Usability baseline (G32):**
- ☑ **UI audit done (2026-06-27):** All primary pages (dashboard, lessons, materials, students, calendar, finance, staff, billing, payment, system/email) have loading states, `EmptyStateCard` for errors/empty, and `Button loading/loadingLabel` on async actions. Gap found and fixed: `LessonModal` save button lacked `loading` state — added `isSaving` prop; `useLessonEditor.saving` and `useCalendarLessonActions.savingLesson` wired in both lessons and calendar pages.

**4.5.6 Anti-abuse, import & analytics (G34, G37, G38):**
- ✅ **Signup anti-abuse (G37) — COMPLETE (2026-06-27):** Email verification + disposable-email block + rate limiting (done earlier). **Captcha added:** `CaptchaService` (Cloudflare Turnstile verify via `CAPTCHA_SECRET`; disabled/pass-through when unset; fails open on network errors). `RegisterSchoolRequestDto.captchaToken?`. `auth.controller.ts` verifies before provisioning. Signup page: Turnstile widget (conditional on `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; submit blocked until verified; widget resets on error). New env vars: `CAPTCHA_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- ☑ **School data import (G38) done (2026-06-27):** CSV student import — `ImportStudentsService` (CSV parser, dry-run preview, seat-cap check, confirm creates users via `createUserAsAdmin`). `ImportStudentsController` (`POST /api/admin/users/import/preview` + `/confirm`, admin-role gated). `StudentImportPanel` component wired in the admin page (upload CSV → preview table showing valid/invalid rows + seat-cap warning → confirm). +6 tests (CSV parsing: header skip, bad emails, quoted cells, seat-cap detection). **Scope:** students only; lesson/balance import deferred (complex, low immediate demand).
- ☑ **Product analytics (G34) done (2026-06-27):** PostHog integration (`posthog-js`). `apps/web/src/lib/analytics.ts` — thin wrapper (no-op when `NEXT_PUBLIC_POSTHOG_KEY` unset; `person_profiles:'identified_only'`, `autocapture:false`, EU host default). `AnalyticsProvider` in root providers — initializes on mount, identifies user+school on login, resets on logout, tracks pageviews. Funnel events wired: `signup_started`, `signup_completed` (signup page), `wizard_step_completed`, `wizard_completed` (onboarding), `tour_step_viewed`, `tour_completed`, `tour_skipped` (ProductTour), `trial_checkout_started` (billing page). **To activate:** set `NEXT_PUBLIC_POSTHOG_KEY` + optionally `NEXT_PUBLIC_POSTHOG_HOST` in env. GDPR: `identified_only` profile mode means no anonymous profile stored; cookie consent banner is still recommended before calling `initAnalytics()`.

**Gate 4.5:** A brand-new user can, with **no docs and no card**, sign up → complete (or skip) the wizard → land in a guided tour led by the **3D mascot** (with graceful static fallback on low-power/reduced-motion, no perf regression on first paint) → reach a working trial workspace; entering a valid promo code extends the trial to 14 days and is not redeemable twice by the same school.

---

### Phase 5 — Billing depth & entitlements ✅ Done (G45 Tax deferred — legal)

- ☑ `SubscriptionPlan` + entitlements fully done (2026-06-28): `PLAN_CATALOG` (`TRIAL`/`STARTER`/`PRO`), `EntitlementsService`, grandfathering, seat enforcement, `createUserAsAdmin` with `SchoolMembership`. DB-backed plans deferred (not needed at current scale).
- ☑ **Usage-meter + Feature-gating fully done (2026-06-27):** `EntitlementsService.getSummary` + `GET /api/billing/entitlements`. Billing UI: plan + storage/seat meters + plan picker. `@RequiresFeature` + `FeatureGuard`. **Concrete sites wired (2026-06-27):** `@RequiresFeature('recordings')` on LiveKit token endpoint; `@RequiresFeature('aiAssist')` + AI credit meter (`assertAiCredit`/`consumeAiCredit`) on caption generation; `@RequiresFeature('customDomain')` on domain write endpoints (PRO-only). `isFeatureBlockedError` + `UpgradePrompt` in `MediaViewerShell` and `DomainsPanel`. `EntitlementsWidget` (storage + seats gauge) on admin dashboard.
- ☑ **Storage-quota enforcement fully done:** Materials + Lessons + Speaking verticals wired (`assertCanUpload` + `StorageAccountingService.add`). Chat excluded (ephemeral). Usage-meter UI: `EntitlementsWidget` on admin dashboard + billing page meters. Extra-storage add-on: deferred (business decision).
- ☑ **Platform-level Stripe (Layer B) done:** `PlatformSubscriptionService`, webhook state machine (trial→paid, dunning, CANCELED→SUSPENDED), dunning cron, billing UI. **Proration:** handled natively by Stripe Customer Portal (existing subscribers redirect there). **☐ remaining (deferred):** Stripe Tax/VAT (legal decision), invoices/refunds UI, promo checkout field (backend `resolvePromoDiscount` ready).
- ☑ `PromoCode.kind` extended to `PERCENT_OFF`/`FIXED_OFF` — schema done (Phase 4.5), `resolvePromoDiscount` in `PlatformSubscriptionService` handles both at checkout (creates Stripe coupon on-the-fly, records `PromoRedemption`, @@unique blocks double-use). Billing UI `promoCode` field wired to `POST /api/billing/subscription/checkout`.
- ☑ Entitlement enforcement: over-limit seats blocked (403 on createUser); storage blocked (413 on upload). Done.
- ☑ **Recordings & AI count toward limits (G42) done (2026-06-27):** `LiveKitWebhookController` (`POST /api/livekit/webhook`) — verifies JWT via `WebhookReceiver`; on `egress_ended` resolves lesson by room name, stamps `ScheduledLesson.recordingSizeBytes`, increments `School.storageUsedBytes` via `StorageAccountingService.add` (delta from previous). AI credits metering: `assertAiCredit`/`consumeAiCredit` on caption generation.
- ☐ **Tax & financial compliance (G45):** record tax data on every money-in event from day one. **Ukraine-first:** ФОП/ТОВ model, ПДВ/VAT where applicable, tax-invoice/акт generation, fiscalization (РРО/ПРРО) where required, accounting export/reconciliation. International: Stripe Tax / EU VAT-OSS. *(Pairs with legal: ToS, refund policy, public offer — see G15.)*

**Gate 5:** A school subscribes, trial→paid works, a failed payment triggers dunning then suspension; exceeding the active-student limit is blocked; **uploading past the storage quota is blocked with an upgrade prompt and the usage meter is accurate.**

---

### Phase 6 — Marketplace, recruiting, commission, growth 🟡→🟠

- ☑ **`StudentAcquisitionLead` + `PlatformLedger` schema seam done (2026-06-28):** `AcquisitionChannel` (DIRECT/PLATFORM_MATCH/IMPORT), `LeadStatus` (PENDING/ENROLLED/REJECTED/CLAWBACK), `LedgerEntryKind` (COMMISSION_CHARGE/CLAWBACK/SUBSCRIPTION_CHARGE/ADJUSTMENT). `StudentAcquisitionLead` (schoolId+userId+channel+status+metaJson+funnel timestamps). `PlatformLedger` (schoolId+leadId+kind+amountMinor+currency+externalRef+recordedByOperatorId). Migration `20260627230720`. Back-relations on School/User/PlatformOperator. No service layer yet — seam for Phase 6 business logic.
- ☐ **Student marketplace (Pillar 2):** learner discovery/search, school/tutor profiles, lead routing/assignment in admin console, **one-time finder fee** on matched students, clawback on refund/no-show. Public surfaces use the *public marketplace* profile in `soenglish-service-design` (editorial, premium, mobile-first); hero/marketing imagery generated via Higgsfield MCP.
- ☐ **Tutor-recruiting service (Pillar 3):** `TutorPlacementLead` attribution; school-side ATS (post role, review applicants, schedule interviews); tutor premium profile; **one-time placement fee** + replacement-guarantee window; premium-profile recurring billing.
- ☐ Fee calculation + payout reconciliation for both finder and placement fees.
- ☐ **Payouts + KYC/AML (G35):** Stripe Connect (or local equivalent) for money *out* — platform→school commission settlement, tutor/school payouts, with KYC onboarding. Seam stubbed in Phase 5.
- ☐ **Trust & safety (G36):** tutor verification/KYC, reviews & ratings, content moderation (profiles/materials/chat), report/abuse flow, anti-fraud on first marketplace transactions.
- ☑ **White-label branding per school done (2026-06-28, G18):** `School.brandColor` + `logoUrl` fields (migration `20260627222341`). Backend: `SchoolBrandingService` + `GET/PATCH /api/school/branding` (public GET, ADMIN-only PATCH). Web: `BrandingPanel` in System → Branding tab (color picker with live preview + logo URL). `BrandingBootstrap` in root layout + `useSchoolBranding` hook (module-level cache, single fetch) → overrides `--accent-primary`, `--accent-primary-hover`, `--accent-primary-muted` CSS tokens. Auth pages (login/forgot-password/reset-password) show school logo instead of `BrandLogo` when `logoUrl` is set. **☐ remaining (Phase 6):** email footer school name (buildFrom already done), assistant persona per school.

**Gate 6:** A platform-sourced student lead converts to an enrollment (finder fee booked + reconciles in the ledger), and a platform-sourced tutor is hired by a school (placement fee booked + reconciles).

---

### Phase 7 — Trust, compliance, scale ✅ Done by code (pen-test + scale deferred — infra)

- ☑ **Observability done (G14, 2026-06-27):** `TenantLoggerService` (structured logs with schoolId/userId/requestId tags), `TenantLoggingInterceptor` (HTTP request log per tenant), `@sentry/nestjs` + `@sentry/node` installed, `Sentry.init()` guarded by `SENTRY_DSN` env, `TenantLoggerService.error()` calls `Sentry.setTag('schoolId', ...)`. Per-tenant dashboards + SLA alerts deferred (need external monitoring service).
- ☑ **Per-tenant + per-user + global rate limiting (G13) done (2026-06-27):** Three named `ThrottlerModule` tiers: `global` (120 req/min), `auth` (10 req/15min for login/signup/forgot/reset/verify), `tenant` (600 req/min). `GqlThrottlerGuard` upgraded: `getTracker()` resolves key as `schoolId` (JWT `sid`) → `userId` (JWT `sub`) → IP, so authenticated requests are bucketed per-tenant (not per-IP behind a shared NAT). `resolveThrottleKey` extracted as pure util + 6 unit tests. Auth endpoints annotated with `@Throttle({ auth: ... })`.
- ☑ **GDPR done (G15, 2026-06-28):** `GdprService` (`exportUserData`, `eraseUser`), `GdprController` (`GET /api/gdpr/export`, `DELETE /api/gdpr/me`), `PlatformGdprController` (platform admin). Cookie consent banner. `/privacy` page. Profile → Account: "Export my data" + "Delete my account". **Audit log retention cron done (2026-06-28):** `TrialLifecycleService.pruneAuditLogs()` — daily cron hard-deletes `PlatformAuditLog` entries older than 7 years. **☐ deferred:** DPA (legal doc), erasure email confirmation.
- ☑ **Backup/DR runbook done (G20, 2026-06-27):** `docs/runbooks/backup-dr.md` — PITR drill procedure (Neon/Supabase/RDS), S3 versioning restore, 4 disaster scenarios (DB corrupt, S3 delete, API down, Stripe webhook), "undelete school" SQL, monthly drill log template. **☐ deferred:** actual first restore drill execution (needs production env).
- ☐ Security: external pen-test focused on tenant isolation; subdomain-takeover monitoring.
- ☐ Scale (when needed): PgBouncer, read replicas, partition large tables by `schoolId` (G24).
- ☑ **Public status page done (G46, 2026-06-27):** `GET /api/health` (checks DB via `SELECT 1`, returns `{ status, db, ts }`); `/status` page (Next.js, auto-refresh 60s, API + DB badges). **☐ deferred:** incident notices, subscribe-to-updates, SLA monitoring integration (needs external service like Betterstack).

**Gate 7:** Isolation pen-test passes; a tenant data-export and erasure complete end-to-end; a restore drill succeeds.

---

### Design & UX workstream (cross-cutting, from Phase 2 onward)

Every **service** surface (learner app, school workspace, public marketplace, recruiting, wizard, assistant — **not** the platform admin console) is built through this workstream so quality is consistent, not per-screen luck.

**Tooling (installed):**
- `emil-design-eng` skill (global) — craft/taste + animation gating (≤300ms, custom easings, animate only transform/opacity). The *how it should feel* authority.
- `soenglish-service-design` skill (project) — concrete system: real tokens (`styles/tokens/`), type scale, spacing, motion, **surface profiles** (density/tone per service), refero "system behind the screenshot" briefing method.
- **Higgsfield MCP** — AI image/video generation for concept art, marketplace/landing hero imagery, illustrations, and the assistant's 2D fallback frames. (Needs one-time OAuth via `/mcp`.) **Note:** the assistant's primary form is a real-time **3D mascot** (glTF/GLB via `@react-three/fiber`) — Higgsfield supplies concept/2D, not the 3D model; see Phase 4.5.4.

**Rules:**
- ☐ Design any service screen by invoking both skills; pick the matching surface profile; use only token values (no raw hex/px/`ease`).
- ☑ Reuse `components/ui` primitives; honor `web-async-actions` (loading/disabled/feedback) and a11y (focus, labels, contrast, empty states). (ongoing — enforced by code review)
- ☐ Run `npm run lint:styles` guardrails (`transition: all`, non-tokenized weights, hardcoded hex) on every UI change.
- ☑ White-label = token-set override per school via `BrandingBootstrap` + CSS custom properties (done 2026-06-28, G18).

- ◐ **a11y + perf budgets (G44, 2026-06-28):** WCAG AA axe scan clean (0 violations on login/forgot-password/signup). Fixes applied: `--green` `#159970→#12825f` (white-on-accent 3.6→~4.8:1), `BrandLogo .tag` + auth `.divider` `text-faint→text-tertiary` (2.03→4.8:1). Earlier pass 1: `LessonModal` `role=dialog`/`aria-modal`/`aria-labelledby`/Escape/focus-on-open, `fileError` `role=alert`, `MaterialAssetLink` `aria-label`, `SettingsToggleRow` explicit `aria-label` prop, `--text-tertiary` `#7a7a9a→#6e6e90`. Infrastructure solid: skip link, `<main>`, `<nav aria-label>`, `aria-current="page"`, Tabs ARIA, `Field` `aria-invalid`+`aria-describedby`, focus-visible global. **☐ remaining:** Core Web Vitals audit, authenticated-pages axe scan, keyboard trap testing.

**Gate (design):** a service screen review passes the `soenglish-service-design` "red flags" checklist, `lint:styles` is clean, and WCAG-AA + Core-Web-Vitals budgets hold.

---

## Part 4 — Cross-cutting risk register

| Risk | Mitigation |
|------|-----------|
| Cross-tenant data leak via raw query / forgotten scope | ☑ CLS + `$extends` + ESLint bans (raw SQL + `asPlatform`) + **mandatory isolation gate (Gate 1, green in CI)**; pen-test (Gate 7) still pending |
| Webhook misattribution → wrong school billed | ☑ Signature verify + school resolved from `payment.schoolId` seeded into CLS in `grantPurchaseLessons` (Phase 3/G2, 2026-06-22); reject unmappable |
| Job touching all/wrong tenants | Jobs iterate schools explicitly; no ambient context (Phase 3) |
| Cache poisoning across tenants | `schoolId` in every cache key (Phase 2/G12) |
| Secret leak across tenants | ☑ Per-school keyed integration runtime (Phase 1/G3, 2026-06-23: `Map<schoolId,…>` keyed by CLS, platform-global fallback) + KEK rotation runbook (TODO) |
| Custom-domain SSRF / takeover | DNS-only verification, SSRF-safe resolver, takeover monitoring (Phase 2/G16) |
| Migration downtime / data loss | Expand/contract, online backfill, dual-write, rollback plan (Phase 1/G17) |
| Noisy neighbor exhausts capacity | Layered per-tenant rate limits (Phase 7/G13) |
| Promo-code abuse / over-redemption | Atomic transactional redemption, `@@unique([promoCodeId, schoolId])`, max-redemption + expiry, redemption audit (Phase 4.5/G29) |
| Trial farming (repeat free trials) | Trial tied to verified email/school; promo single-use per school; abuse signals surfaced in admin console (Phase 4.5) |
| Signup spam / bots | Email verification + captcha + disposable-email block (Phase 4.5/G37) |
| Marketplace fraud / fake tutors / scams | Tutor KYC/verification, reviews, moderation, report flow, first-transaction anti-fraud (Phase 6/G36) |
| Payout fraud / AML | Stripe Connect KYC onboarding before any money-out (Phase 6/G35) |
| Eroded margin (storage/video/AI overuse) | Recordings+AI metered against quota, per-tenant cost attribution (Phase 5/G42, G41) |
| Tax/legal non-compliance on revenue (UA + intl) | Record tax data per money-in from day one; ПДВ/fiscalization/tax invoices; Stripe Tax/VAT-OSS abroad (Phase 5/G45) |
| Outage with no tenant comms → support flood / churn | Public status page + incident/maintenance notices wired to SLA monitoring (Phase 7/G46) |

---

## Execution order (one line)

`Phase0 → Phase1 (🔴 gate) → Phase2 ∥ Phase3 → Phase4 → Phase4.5 (activation: signup wizard, 7/14-day trial + promo, virtual assistant) → Phase5 → Phase6`, with `Phase7` (observability/compliance/scale) and the **Design & UX workstream** (skills + Higgsfield) threaded in from Phase 1–2 onward.
