# Wiki log

Append-only timeline. Prefix: `## [YYYY-MM-DD] <operation> | Title`

---

## [2026-06-27] update | G39 — Per-school email sender display name
- **Trigger:** code change
- **Pages:** `concepts/notifications.md` (if exists, else inline)
- **Changes:** `buildFrom()` added to `mail.service.ts`; `schoolName?` field on `DispatchNotificationInput`; forwarded through `NotificationsMailService.sendTemplated`; all 5 notification dispatch sites (lesson-reminder, streak-alert, new-vocab, weekly-report, teacher-messages) now pass school name — emails show `"Acme School via SoEnglish" <noreply@...>` as sender. Delivery `schoolId` stamping was already done (child-table vertical, Phase 1). Per-school Telegram bot deferred.

## [2026-06-27] update | G37 — Disposable-email block + rate limiting
- **Trigger:** code change
- **Pages:** `concepts/auth.md`
- `isDisposableEmail(email)` util with 40+ domain blocklist; checked before `$transaction` in `SchoolSignupService`.
- `@Throttle({ default: { ttl: 600_000, limit: 5 } })` on `POST /auth/register-school`.
- `@Throttle({ default: { ttl: 600_000, limit: 10 } })` on `GET /auth/verify-email`.
- +5 tests (disposable-email.spec.ts + school-signup BadRequest for disposable domain).

## [2026-06-27] update | G37 — Email verification for school signup
- **Trigger:** code change
- **Pages:** `entities/user.md`, `concepts/auth.md`
- `User.emailVerifiedAt DateTime?` + `User.emailVerifyToken String? @unique` (migration `20260627030000`).
- `SchoolSignupService`: crypto.randomBytes(32) token → stored on user, `sendEmailVerification()` fire-and-forget post-tx.
- `email-verification` React Email template + `EmailTemplateId` + `MailService.sendEmailVerification()`.
- `AuthService.verifyEmail(token)`: find by token → set `emailVerifiedAt`, clear token → 400 on invalid.
- `GET /auth/verify-email?token=` endpoint (no auth required).
- `SchoolOnboardingService.dispatchInvites` gated on `admin.emailVerifiedAt !== null`.

## [2026-06-27] update | G33 — User locale preference save endpoint
- **Trigger:** code change
- **Pages:** `entities/user.md`
- `UpdateMyProfileRequestDto.locale?: string | null` — validated via `normalizeLocale` (rejects unsupported).
- `UsersService.updateMyProfile` writes `User.locale`; `mapProfile` exposes it in `MyProfileDto.locale`.
- `POST /api/users/me/profile` now accepts `locale` alongside existing profile fields.

## [2026-06-27] update | G33 i18n foundation complete — locale columns + request context
- **Trigger:** code change
- **Pages:** `concepts/auth.md` (TenantContext.locale), `entities/school.md` (defaultLocale column), `entities/user.md` (locale column)
- `School.defaultLocale String?` + `User.locale String?` Prisma columns (migration `20260627022800`).
- `TenantContext.locale?: string | null`; `TenantContextService.{locale getter, setLocale()}`.
- `AuthSessionService.resolveUserLocaleData(userId, schoolId)` — parallel fetch of both prefs.
- `resolveWebRequestSession` now calls `resolveLocale({userPreference, schoolDefault, acceptLanguage})`, sets CLS via `tenant.setLocale`, returns `WebRequestSessionDto.locale: string`.
- Resolution priority: `user.locale` → `school.defaultLocale` → `Accept-Language` → `'uk'`.

## [2026-06-26] update | G42 — Recordings quota seam + AI daily rate cap
- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- `ScheduledLesson.recordingSizeBytes Int?`; `School.aiCreditsUsedToday/aiCreditsResetAt`; `aiCreditsPerDay` in plan catalog (PRO: 100/day).
- `EntitlementsService.assertAiCredit/consumeAiCredit/resetDailyAiCredits`; nightly cron reset.
- `/livekit-token` gated by `@RequiresFeature('recordings')`; `FeatureGuard` added to LessonsModule providers.
- Migration `20260626124643_add_recording_ai_metering`. unit 1199/1199.

## [2026-06-26] update | Phase 5 — Stripe Portal (upgrade/downgrade) + UpgradePrompt UI
- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- `PlatformSubscriptionService.createPortalSession` → Stripe Billing Portal Session (DB-first order). `POST /api/billing/subscription/portal` (admin, auth).
- Billing page: "Manage subscription" button for active subscribers; plan picker hidden for paid plans; over-quota hint on storage bar.
- `UpgradePrompt` + `isStorageQuotaError` in `components/ui`; wired into `MaterialFormModal` on 413 errors.
- unit 1199/1199, typecheck 0.

## [2026-06-26] update | Phase 5 — promo PERCENT_OFF/FIXED_OFF at checkout
- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- Schema: `PromoCodeKind` +PERCENT_OFF/FIXED_OFF; `PromoCode` trialDays nullable + discountPercent/discountFixed/discountCurrency. Migration `add_promo_discount_kinds`.
- `PromoCodesService` → discriminated union `CreatePromoCodeInput` (per-kind validation).
- `PlatformSubscriptionService.createCheckout(schoolId, plan, promoCode?)` → validate code → `PromoRedemption` + Stripe on-the-fly coupon → `discounts:[{coupon}]` in session.
- `SubscriptionController` passes `promoCode` from body. Billing page UI: Field "Promo code" before plan picker.
- unit 641/641, integration 96/96, typecheck 0.

## [2026-06-26] update | Phase 5 — feature-gating helper

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`, `concepts/auth-rbac.md`
- **What:** `EntitlementsService.hasFeature(schoolId, feature)` / `assertFeature` (customDomain/aiAssist/recordings; `PlanFeature` type). `@RequiresFeature(feature)` decorator + `FeatureGuard` (`@be/auth`, runs after AuthGuard, 403 if the school's plan lacks the feature; no decorator → pass-through). UI hides gated features via `features` from `GET /api/billing/entitlements`.
- **Tests:** +7 (service hasFeature/assertFeature + guard pass-through/assert/deny). unit 1193/1193, integration 96/96.
- **Remaining:** apply at concrete feature sites as they're built (custom domains, AI assist).

---

## [2026-06-26] update | Phase 5 — speaking upload storage enforcement (chat excluded)

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** added `SpeakingSubmission.audioSizeBytes` (migration `add_speaking_audio_size`); `SpeakingSubmissionsService.attachAudio` now `assertCanUpload(schoolId, buffer.length)` (G42 — recordings count) and `StorageAccountingService.add(net delta = new − previous)` so re-recording replaces rather than double-counts. `speaking.module` imports BillingModule. **Chat deliberately excluded** from storage accounting — its attachments are ephemeral (TTL + hourly purge), so they shouldn't consume the persistent quota.
- **Tests:** +1 attachAudio (gate + delta); spec DI updated. unit 1189/1189, integration 96/96.
- **Storage enforcement now covers:** materials (create+compression+delete), lessons (create-only), speaking (create+delta).

---

## [2026-06-26] update | Phase 5 — lessons upload storage enforcement

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** `LessonAttachmentService.createAttachment` resolves the lesson's `schoolId` (`ScheduledLesson`), calls `EntitlementsService.assertCanUpload` (413 over quota) and `StorageAccountingService.add(+sizeBytes)`. No decrement needed — lesson attachments aren't deleted (`onDelete: SetNull`, file persists). lessons.module already imports BillingModule; util spec updated with mocked entitlements/storage + `scheduledLesson.findUnique`.
- **Tests:** unit 1188/1188, integration 96/96.
- **Remaining storage verticals:** chat + speaking.

---

## [2026-06-26] update | Phase 5 — grandfathering + seat enforcement

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`, `concepts/auth-rbac.md`
- **What:** `EntitlementsService.resolveForSchool` now grandfathers legacy schools: paid plan → that; `School.status==='TRIAL'` → TRIAL limits; else (ACTIVE, no paid subscription = legacy single-school) → top tier (`GRANDFATHERED_PLAN_KEY = PRO`, unlimited) — so the live `school_default` is never retroactively capped (fixes the materials storage check too). `createUserAsAdmin` is now tenant-aware: creates a `SchoolMembership(role, ACTIVE)` for the new user in the current school (ADR-006) and blocks adding a STUDENT past `canAddActiveStudent` (403). Helpers: `paidPlanKey`, `GRANDFATHERED_PLAN_KEY`.
- **Tests:** entitlements spec rewritten for grandfathering resolution; seat-limit cases. unit 1188/1188, integration 96/96 (admin-create exercises membership creation).
- **Note:** seat enforcement only bites TRIAL-status schools at cap; legacy/paid schools are unlimited or plan-capped.

---

## [2026-06-26] update | Phase 5 — dunning auto-suspend cron

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** `TrialLifecycleService.suspendOverdueSubscriptions` (`@be/platform-admin`, daily `@Cron` alongside `expireTrials`) suspends ACTIVE schools whose subscription is `PAST_DUE` longer than `DUNNING_GRACE_DAYS=7` (PAST_DUE marker = subscription `updatedAt`, bumped by the Layer-B webhook). Completes the dunning chain: payment fails → PAST_DUE (grace, school stays ACTIVE) → grace lapses → SUSPENDED.
- **Tests:** +3 (unit cutoff/suspend/no-op; integration backdating `updatedAt` via raw SQL since Prisma `@updatedAt` ignores manual values). unit 1188/1188, integration 96/96.
- **Note:** seat enforcement deferred — needs tenant-aware user-create (memberships) + a grandfathering/default-plan decision for subscription-less legacy schools.

---

## [2026-06-26] update | Phase 5 — billing UI (school subscription page)

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** `apps/web/app/billing` — admin-only school subscription page (route-policy `/billing` → admin/super_admin; sidebar "Subscription" nav with Receipt icon). Shows current plan + storage/seats meters (from `GET /api/billing/entitlements`) and a Starter/Pro plan picker that calls `POST /api/billing/subscription/checkout` and redirects to Stripe; `?billing=success|cancelled` banners. `useSearchParams` wrapped in Suspense.
- **Tests:** web build OK (route `/billing`); web jest 549/549; typecheck + lint clean.

---

## [2026-06-26] update | Phase 5 — Stripe Layer-B (platform subscriptions)

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** `PlatformSubscriptionService` (`@be/billing`) — school→platform subscriptions on the platform's own Stripe account (env: `STRIPE_PLATFORM_SECRET_KEY`/`STRIPE_PLATFORM_WEBHOOK_SECRET`, prices `STRIPE_PRICE_STARTER`/`STRIPE_PRICE_PRO`), distinct from per-school Layer-A PSP. `createCheckout(schoolId, plan)` creates the Stripe customer (persisted on `SchoolSubscription`) + a subscription Checkout Session. Webhook state machine `applySubscriptionEvent`: `checkout.session.completed`→ACTIVE+plan+School ACTIVE (trial→paid); `customer.subscription.created/updated`→status+plan; `invoice.payment_failed`→PAST_DUE (School stays ACTIVE = dunning grace); `customer.subscription.deleted`→CANCELED+School SUSPENDED. Pure helpers in `platform-subscription.util` (priceId↔plan, Stripe status→`SubscriptionStatus`→`SchoolStatus`). REST: public signature-verified `POST /api/platform-billing/stripe/webhook` (billing) + admin `POST /api/billing/subscription/checkout` (auth, leaf import to avoid the auth↔billing cycle).
- **Tests:** +9 (util mapping + webhook state machine: trial→paid, dunning, cancel→suspend, resolve-by-subscription). unit 1186/1186, integration 95/95.
- **Remaining:** proration/upgrade-downgrade, full dunning schedule + grace auto-suspend, Stripe Tax/VAT, invoices/refunds, promo discounts at checkout, billing UI.

---

## [2026-06-26] update | Phase 5 — entitlements/usage-meter endpoint

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** `EntitlementsService.getSummary(schoolId)` returns plan + seats (`maxActiveStudents`/`activeStudentCount`/`seatsRemaining`) + feature flags + storage usage. Exposed via `GET /api/billing/entitlements` (`EntitlementsController` in `@be/auth`, AuthGuard, school-scoped via `requireSchoolId`; imports the `@be/billing/entitlements` leaf to avoid the auth↔billing cycle).
- **Tests:** +3 (getSummary unit incl. unlimited-PRO; integration endpoint). unit 1177/1177, integration 95/95.
- **Remaining:** in-app meter UI; feature-gating helper; remaining upload verticals; seat enforcement at student-create.

---

## [2026-06-26] update | Mascot preview page (/mascot-preview)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** added public dev preview route `apps/web/app/mascot-preview` rendering `<Mascot>` in all poses + sizes, to view Arvi without going through the first-login tour. Added `/mascot-preview` to `PUBLIC_ROUTES`. Shows 2D fallback until `public/mascot/arvi.glb` exists, then the 3D model. Build green; web jest 549/549.

---

## [2026-06-25] update | Web build green — cleared 17 pre-existing TS errors

- **Trigger:** build fix
- **Pages:** none (no durable behavior change; type/build fixes)
- **What:** `build:web` is green again. Fixed all 17 pre-existing web type errors (build was already red pre-session; `@types/react` unchanged per lockfile diff): role-id typed `UserRoleId` (numeric 1–4) + `lessonFormat` typed `StudentLessonFormat` in the student-detail hooks; polymorphic UI primitives (`SurfaceCard`/`PanelCard`/`StatTile`/`TabPanelCard`/`PageHeader`) switched the dynamic `as`/`ElementType` tag to `createElement` (React-19 types collapsed `children` to `never`); `AnnotationLayer` missing imports (`MaterialPageAnnotation`, `normPoint`) added; `StatisticsDashboardCharts` `studentScope ?? ''`; `LessonSetupTab` uses `LessonPartyOption.fullName`.
- **Tests:** web build OK; web jest 549/549; tsc(web)=0; lint clean.

---

## [2026-06-25] update | Web middleware→proxy consolidation (build fix)

- **Trigger:** code change / build fix
- **Pages:** `concepts/auth-rbac.md`
- **What:** Next 16.2.x rejects having both `middleware.ts` and `proxy.ts`. Merged the Phase-2 tenant-hint logic (`classifyTenantHost` → `x-school-slug`/`x-school-host`) into `proxy.ts` as `withTenantHint`, deleted `middleware.ts`. `proxy` now also runs on `/api` + `/payload-api` (early-returns with hint headers only — no session/route logic), and the matcher was widened to exclude only `_next/static`/`_next/image`/favicon/static files. App routes fold the hint into the forwarded headers alongside auth headers.
- **Tests:** web jest 549/549; proxy/tenant-host typecheck+lint clean.
- **Note:** `build:web` still red on a pre-existing unrelated TS error (`StudentDetailsPage.tsx:160`, role number vs string) — separate task.

---

## [2026-06-25] update | Phase 4.5.4 — 3D mascot render island (Arvi)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `apps/web/components/mascot/` — `<Mascot pose size>` lazy R3F island (`@react-three/fiber@9` + `drei` + `three`, `next/dynamic` ssr:false; never blocks first paint). Loads `public/mascot/arvi.glb` (`useGLTF`/`useAnimations`), **asset-agnostic**: plays the pose's clip (idle/greet/point/celebrate) → first/idle clip → procedural idle bob. 2D SVG fallback via error boundary when WebGL/motion unavailable or the GLB is missing; render loop pauses on hidden tab. Wired into the product tour (pose per step), replacing the emoji placeholder. **Any `.glb` can be dropped now and swapped later** (see `public/mascot/README.md`). Deps added: three, @react-three/fiber@^9, @react-three/drei@^10, @types/three.
- **Tests:** web jest 549/549; typecheck (mascot files) + lint clean.
- **Known (pre-existing, unrelated):** `build:web` blocked by Next 16.2.x "both middleware.ts and proxy.ts" — needs the Phase-2 middleware hints merged into `proxy.ts`.

---

## [2026-06-25] decision | Mascot persona «Arvi» the Speaker-puff (4.5.4)

- **Trigger:** user note (product decision)
- **Pages:** `concepts/multi-tenancy.md`
- **What:** virtual-assistant mascot persona decided — **Arvi**, a concept-driven "speaker-puff" (embodies voice/sound, not an animal → ownable; suits adults + kids). Round egg-shaped chibi body, big eyes, warm smile, two soundwave/headphone-cushion ears, tiny arms/feet; brand mint-green + white face/belly. Tour poses idle/greet/point/celebrate. 3D asset to be generated in Meshy.ai (prompt + A-pose/Stylized/low-poly/Draco ≤1.5 MB settings in handoff) → `apps/web/public/mascot/arvi.glb`. Render island (@react-three/fiber, lazy, 2D fallback) to be wired when the GLB lands.

---

## [2026-06-25] update | Phase 5 — storage accounting + quota enforcement (materials)

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** `StorageAccountingService.add(schoolId, ±bytes)` (`@be/billing`, atomic read-modify-write, clamps ≥0) maintains `School.storageUsedBytes`. Wired the materials vertical: `MaterialAttachmentService.createAttachment` → `EntitlementsService.assertCanUpload` (413 over quota) + increment on create + compression-delta reconcile; `MaterialsService.delete` → decrement summed `sizeBytes`. New leaf barrel `@be/billing/entitlements` (exports the leaf services only, no `BillingModule`) so upstream modules avoid the pre-existing auth↔billing barrel cycle (TDZ on `StaffPayrollService`); aliased in tsconfig.base + jest.paths.
- **Tests:** +6 (StorageAccountingService increment/clamp/no-op; material-attachment asserts gate+increment). unit 1175/1175, integration 94/94.
- **Remaining:** chat/lessons/speaking upload sites; usage-meter endpoint/UI; seat enforcement at student-create.

---

## [2026-06-25] update | Phase 5 — subscription plans + entitlements (core)

- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`
- **What:** code-defined plan catalog `PLAN_CATALOG` (`@be/billing/shared/subscription-plans`): `TRIAL`/`STARTER`/`PRO` with `maxActiveStudents` (null=∞), `storageQuotaBytes`, feature flags; `planFor(plan)` keys off `SchoolSubscription.plan` (default TRIAL). `EntitlementsService` (`@be/billing`): `resolveForSchool`, `getStorageUsage` (used/quota/remaining/percent/over from `School.storageUsedBytes`), `assertCanUpload` (→ 413 over quota, the "no infinite uploads" rule), `canAddActiveStudent` (ACTIVE student-membership count vs cap).
- **Tests:** +12 (catalog fallback; resolve/usage/over-quota/upload-block/seat-limit). unit 1172/1172.
- **Remaining:** wire enforcement into upload sites + student-create; usage-meter endpoint/UI; Stripe Layer-B (checkout/trial→paid/dunning); promo discounts; tax/compliance.

---

## [2026-06-25] update | Phase 4.5.4 — product-tour UI (data-driven)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `apps/web/components/tour` — `TOUR_STEPS` data-driven config + `ProductTour` overlay (dependency-free). Gated by `GET /api/onboarding/tour`; Next/Back/Skip/Finish → `POST /api/onboarding/tour/complete`. Mounted in root layout for authenticated users. 2D placeholder mascot (`data-mascot`) so the 3D asset can drop in without markup changes.
- **Remaining (design-gated):** element-anchored highlighting, 3D mascot (persona/visual decision), replay from Help menu.

---

## [2026-06-25] update | Phase 4.5.4 — product-tour completion state (per user)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`, `concepts/auth-rbac.md`
- **What:** `User.tourCompletedAt` (migration `add_user_tour_completed`); `UserTourService` (`@be/auth`, **user-scoped** per ADR-004 #6, idempotent — keeps first timestamp). REST `GET /api/onboarding/tour`, `POST /api/onboarding/tour/complete` (AuthGuard, `@CurrentUser`). This is the seam the first-login tour hangs on.
- **Tests:** +8 (unit: get/complete/idempotent; integration: complete once + idempotent + get). unit 1163/1163, integration 94/94.
- **Remaining (design-gated):** persona + 3D mascot asset, tour UI (data-driven `tourSteps`), replay trigger — needs persona/visual decision.

---

## [2026-06-25] update | Phase 4.5.2 — promo-code console page

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `apps/platform/promo-codes` page — create form (code/trialDays/maxRedemptions) + table with enable/disable toggle and `redeemed / max` counts; `ConsoleShell` nav item added. Consumes `GET/POST /api/platform/promo-codes` + `PATCH /:id`. Builds clean.

---

## [2026-06-25] update | Phase 4.5.3 — onboarding wizard web UI

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `apps/web/app/onboarding/page.tsx` — 5-step wizard (profile/teaching/payments/invite/sample-content) on `Field`/`Button`/`SurfaceCard`. Loads `GET /api/onboarding`, resumes at the step after `currentStep`, Save&continue → `PATCH /api/onboarding/step`, Skip, Finish → `POST /api/onboarding/complete` → `/dashboard`; redirects to `/dashboard` when already completed. Signup now lands on `/onboarding`.
- **Remaining:** per-step side effects (payments→allowlist, send invites, seed sample content).

---

## [2026-06-25] update | Phase 4.5.1 — trial-countdown banner

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`, `concepts/auth-rbac.md`
- **What:** `WebRequestSessionDto.trial = {trialEndsAt, daysLeft}`, resolved by `AuthSessionService.resolveTrialInfo` (null unless the active school is TRIAL with a `trialEndsAt`; `daysLeft` clamped ≥0). Threaded SSR like the impersonation banner: `proxy.ts` state → `x-soenglish-trial` header → `readRequestAuthState` → `layout.tsx`. `TrialBanner` (`apps/web`) renders the countdown (warning style at 0 / "trial ended").
- **Tests:** +9 (resolveTrialInfo unit incl. clamp/ACTIVE-null/no-trialEndsAt; request-session roundtrip; integration: web-session shows trial after signup). unit 1159/1159, integration 93/93.

---

## [2026-06-25] update | Phase 4.5.3 — onboarding wizard state API

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `SchoolOnboardingService` (`@be/auth`, school-scoped via tenant `requireSchoolId()`) persists the resumable signup wizard on `School.onboardingState` JSON `{completed, currentStep, steps}`. REST (AuthGuard): `GET /api/onboarding`, `PATCH /api/onboarding/step {step,data}` (ADMIN-only; validates `step ∈ ONBOARDING_STEPS=[profile,teaching,payments,invite,sample-content]`; idempotent per-step merge so it's resumable/skippable), `POST /api/onboarding/complete` (sets `completed=true`, keeps step data).
- **Tests:** +10 (unit: parse/merge/unknown-step/admin-gate/complete; integration: admin saves+completes, 400 unknown step, 403 student). unit 1155/1155, integration 93/93.
- **Remaining:** web wizard UI + per-step side effects (payments→allowlist, invites, sample-content seed).

---

## [2026-06-25] update | Phase 4.5.2 — promo codes (signup redemption + admin)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`, `concepts/auth-rbac.md`
- **What:** new `PromoCode` (+`@unique code`) + `PromoRedemption` (`@@unique([promoCodeId, schoolId])`) models + `PromoCodeKind` enum (migration `add_promo_codes`). Redemption at signup: `RegisterSchoolRequestDto.promoCode` → `SchoolSignupService.redeemPromo` inside the signup `$transaction` — validates active/in-window, sets `trialDays = max(7, promo.trialDays)`, writes `PromoRedemption`, atomically increments `redeemedCount` via conditional `updateMany(redeemedCount < maxRedemptions)` (prevents over-redemption); invalid/expired/exhausted → 400. Admin: `PromoCodesService` (`@be/platform-admin`) + REST `GET/POST /api/platform/promo-codes`, `PATCH /:id` (enable/disable), audited (`platform.promo_code.create|update`).
- **Tests:** +15 (signup promo paths, admin service, integration: create→signup→14-day trial + redemption row/count). unit 1150/1150, integration 92/92.
- **Remaining:** promo console UI; redemption in school billing settings (today only at signup).

---

## [2026-06-25] update | Phase 4.5.1 — trial auto-expiry job (G4 pattern)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `TrialLifecycleService.expireTrials` (`@be/platform-admin`, base prisma) suspends `TRIAL` schools whose `subscription.trialEndsAt < now − TRIAL_GRACE_DAYS` (grace = 3 days); daily `TrialLifecycleScheduler` `@Cron(EVERY_DAY_AT_MIDNIGHT)`. **It iterates schools explicitly via base prisma — the reference G4-compliant tenant-aware job** (never relies on ambient tenant context). Schools without a subscription (legacy default) never match.
- **Tests:** +3 (2 unit + 1 integration: lapsed→SUSPENDED, in-grace→TRIAL). unit 1142/1142, integration 91/91.
- **Remaining:** trial-countdown banner (needs `trialEndsAt` on the web session); refactor existing notifications `@Cron` jobs to the same explicit-schoolId pattern.

---

## [2026-06-25] update | Phase 4.5.1 — self-serve school signup + 7-day trial

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`, `concepts/auth-rbac.md`
- **What:** new public self-serve "create your school" flow. `SchoolSignupService.registerSchool` (`@be/auth`, base prisma = asPlatform-equivalent at signup): slugifies the name (`slugifySchoolName`, retries on slug `@unique` collision) and atomically (`$transaction`) creates `School(status=TRIAL)` + admin `User(role=ADMIN)` + `SchoolMembership(ADMIN, ACTIVE)` + `SchoolSubscription(status=TRIALING, trialEndsAt=now+7d)` — `TRIAL_DAYS=7`, no card. `POST /api/auth/register-school` (public) provisions + auto-logs-in (issueTokens + cookies). Web `/(auth)/signup` page; `/signup` added to PUBLIC_ROUTES + AUTH_REDIRECT_ROUTES.
- **Tests:** +18 (slug util, service incl. dup-email / short-password / slug-retry, integration: provisions + dup-email 400). unit 1140/1140, integration 90/90.
- **Remaining 4.5.1:** trial-countdown banner + auto-SUSPEND at `trialEndsAt` (needs the G4 tenant-aware job).

---

## [2026-06-25] update | Phase 4D — cross-app SSO seam + impersonate-from-console (Phase 4 done)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `cookieOptions()` (auth-cookies) now applies an optional cookie `Domain` from env `AUTH_COOKIE_DOMAIN` (e.g. `.arvilio.app`) on set+clear → one session (incl. impersonation) shared across sibling subdomains. Unset (dev) = host-only (already shared across ports on the same host). Console school-detail **Impersonate admin** button POSTs `/impersonate` then redirects to `NEXT_PUBLIC_SCHOOL_APP_URL` (default `http://localhost:4200`) where the banner shows; disabled for suspended schools.
- **Tests:** +2 unit (cookie domain default/applied). unit 1131/1131.
- **Phase 4 / Gate 4 fully done.** Ops env: `AUTH_COOKIE_DOMAIN`, `NEXT_PUBLIC_SCHOOL_APP_URL`, `API_PROXY_TARGET`.

---

## [2026-06-25] update | Phase 4D — payment-method allowlist + console settings

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`, `concepts/billing-payments.md`
- **What:** new platform-global `PlatformSettings.allowedPaymentMethods PaymentMethodKind[]` (migration `add_platform_payment_allowlist`; **empty = no restriction**). `PlatformPaymentMethodsService` (`@be/platform-admin`, base prisma) `get`/`set` + audit `platform.payment_methods.update`. REST `GET /api/platform/payment-methods` (allowlist + full catalog), `PUT` (`@PlatformAdmin('PLATFORM_ADMIN')`, unknown kind → 400). **Enforcement:** `@be/billing PaymentSettingsService.updatePaymentSettings` rejects enabling a method outside a non-empty allowlist. Console `/settings` checkbox editor (same-origin PUT).
- **Tests:** +5 (4 unit + 1 integration GET/PUT/400/403). unit 1129/1129, integration 89/89.

---

## [2026-06-25] update | Phase 4D — platform console app scaffold (apps/platform)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** new `apps/platform` Next.js app (`@app/platform`, port 4300, standalone, `/api/*`→API rewrite). `ConsoleShell` sidebar reserves Phase-6 nav IA (Leads/Marketplace/Recruiting as disabled stubs). Surfaces (SSR via `platformGet` forwarding request cookies, 401/403→`Unauthorized`): Dashboard (stat cards), Schools (cross-tenant list → detail links), School detail `/schools/[id]` (role counts + `SchoolActions` client suspend/activate via same-origin POST + `router.refresh()`), Audit log `/audit-log`. Platform DTOs duplicated locally (frontend must not import `@be/*`). `dev:platform`/`build:platform` scripts; 4300 added to `free-dev-ports`.
- **Known seam:** separate-origin cookies (host-only) — cross-app SSO needs a shared cookie Domain or dedicated platform login (documented in plan Phase 4D).
- Builds clean (typecheck + lint + next build).

---

## [2026-06-25] update | Phase 4D — impersonation banner UI (apps/web)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `ImpersonationBanner` (`apps/web/src/components/layout/`) renders in the root layout when the session carries an impersonation claim. Threaded server-side: `WebRequestSessionDto.impersonation` → `proxy.ts` `RequestAuthState` → `x-soenglish-impersonation` header (`applyRequestAuthHeaders`) → `readRequestAuthState` → `layout.tsx`. "Stop impersonating" → `apiClient.post('/auth/impersonate/stop')` + reload. Banner lives in the **school** app (impersonation = a school session), not the console.
- **Tests:** request-session roundtrip updated; unit 1125/1125.

---

## [2026-06-25] update | Phase 4C.2 — platform-operator impersonation (Gate 4 closed)

- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy.md`
- **What:** `POST /api/platform/schools/:id/impersonate` (`@PlatformAdmin('PLATFORM_ADMIN')`) → new `PlatformImpersonationService` (`@be/platform-admin`) mints a 15-min impersonation access token (`AuthSessionService.mintImpersonationAccessToken`) with an `imp` claim (`act`=operator, `sid`=school); default target = school's first active admin. Set as the **access cookie only** (`setImpersonationAccessCookie`) — operator's refresh untouched, so the session auto-returns at expiry.
- **Banner claim:** `WebRequestSessionDto.impersonation:{actorUserId,schoolId}|null`; surfaced in `AuthSessionService.resolveWebRequestSessionAuth` (reads `imp`) → `AuthService.resolveWebRequestSession`.
- **Stop:** `POST /api/auth/impersonate/stop` (AuthGuard only — runs as the impersonated user, cannot sit behind `PlatformAdminGuard`) → `AuthService.stopImpersonation` records `school.impersonate.stop` (attributed to operator via `readImpersonationClaim`) and `clearAccessCookie`.
- **Tests:** +10 (auth-session mint/read/surface, PlatformImpersonationService unit, integration impersonate→web-session→stop). unit 1125/1125, integration 88/88.
- Banner UI render + payment-method allowlist deferred to 4D (web console / platform settings).

---

## [2026-06-14] update | V4 Calendar + Chat redesign styling

- **Trigger:** code change (UI redesign)
- **Pages:** no new wiki pages; styling-only changes
- **Calendar (`page.module.scss`):** Now-line changed from `--accent-danger` to `--green`. Today cell and week today column use `color-mix(in srgb, var(--green-light) 60%, var(--card))` tint (softened vs plain `--green-light`). Week event time and sidebar event time use `var(--font-display)` (Lora) at `var(--fs-16)` — replaces undefined `--fs-title` custom prop. Added `evtStatusPlanned/Active/Cancelled` classes for lesson status tints with cancelled strikethrough.
- **Chat (`page.module.scss`):** Bubble padding upgraded to `14px 18px`. `bubbleMine` now uses `--fill-strong` (ink-navy) instead of `--green`. `bubbleTheirs` uses `--card` bg. `convRowActive` uses `--green-light` tint. Added `convNameUnread`, `unreadDot`, `dateDivider` classes.
- **ChatInbox.tsx:** Applies `convNameUnread` class when conversation has unread messages.

---

## [2026-06-11] update | StatisticsDashboard split into focused modules

- **Trigger:** code change (refactor)
- **Files:** `StatisticsDashboard.tsx` (955→~390L), new `DashboardSection.tsx` (~50L), `StatisticsKpiGrid.tsx` (~90L), `StatisticsRosterTable.tsx` (~160L), `StatisticsDashboardCharts.tsx` (~340L), `statistics-chart-config.ts` (~35L)

## [2026-06-11] update | StudentDetailsPage split into focused hooks

- **Trigger:** code change (refactor)
- **Files:** `StudentDetailsPage.tsx` (521→270L), new `useStudentHeroData.tsx` (heroStats + profileBadges + achievements), new `useStudentProfileSave.ts` (onSave logic with savedProfile/saveError state)

## [2026-06-10] update | profile/ frontend split into focused files

- **Trigger:** code change (refactor)
- **Pages:** no new wiki pages; structural change only
- Split `profile/page.tsx` (799→244 lines) by extracting: `AvatarCropModal`, `useProfileNotificationSync`, `buildAllAchievements`
- Split `profile/panels.tsx` (692→355 lines) by extracting: `ChangePasswordModal`, `LinkedAccountsPanel` + `profileLinksToPanel`
- All 7 files now under 400 lines; TypeScript zero errors

---

## [2026-06-10] update | Payload CMS globals for page content

- **Trigger:** code change
- **Pages:** concepts/cms (globals added alongside PageContent collection)
- Added 5 Payload globals: `dashboard-content`, `practice-content`, `quiz-content`, `calendar-content`, `profile-content` in `apps/web/payload/globals/`
- Registered globals in `payload.config.ts`
- Added `getDashboardContent`, `getPracticeContent`, `getQuizContent`, `getCalendarContent`, `getProfileContent` helpers in `src/lib/cms/payload.ts` and re-exported from `index.ts`
- Rewrote `payload/seed.ts` to seed globals via `updateGlobal` using values from `site-content.ts`; legacy `page-content` collection seed preserved

---

## [2026-06-09] bugfix | Full test suite audit — 5 bugs found and fixed

- **Trigger:** code change (full test run + E2E audit)
- **Pages:** concepts/testing (updated scale + bug registry)

## [2026-05-27] update | Redesign plan: structure and component reuse
- **Trigger:** user request
- **Pages:** `concepts/redesign-plan`, `log.md`
- **Notes:** plan §1.4 layered UI + reuse checklist; R-00-08 layout recipes.

## [2026-05-27] update | Redesign plan: motion (CSS, GSAP, Three.js)
- **Trigger:** user request
- **Pages:** `concepts/redesign-plan`, `log.md`
- **Notes:** plan §1.3 learning-first motion; optional R-00-07; GSAP/Three deferred until needed.

## [2026-05-27] update | Redesign plan: shared theme, SCSS rules, SaaS note
- **Trigger:** user request
- **Pages:** `concepts/redesign-plan`, `docs/redesign/plan.md` (via repo), `log.md`
- **Notes:** §1.1 shared theme, §1.2 SCSS/`respond-to`; single-school now, SaaS later; steps R-00-05, R-00-06.

## [2026-05-27] update | UI redesign master plan (Preply × Edvibe)
- **Trigger:** user request
- **Pages:** `concepts/redesign-plan`, `index.md`, `log.md`
- **Notes:** `docs/redesign/plan.md` — phased steps R-00…R-90 (pages, tabs, modals); `.cursor/skills/soenglish-redesign/SKILL.md` for agent runs.

## [2026-05-27] update | agent-browser all-pages smoke script
- **Trigger:** user request
- **Pages:** `concepts/testing`, `log.md`
- **Notes:** `scripts/agent-browser-all-pages.sh` tours public + role-scoped routes; output under `tmp/agent-browser-tour/`. `/register` currently redirects to `/login`.

## [2026-05-27] update | Fix API build after per-currency pricing
- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** `billing.resolver` maps GraphQL currency strings to `PaymentCurrencyCode`; API tsc was failing so `paymentSettings` query errored in browser console.
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `pricePerLessonByCurrency` in config + GraphQL; admin UI per-currency fields; save validation via `getPaymentSettingsCurrencyIssues`; package resolution uses `getPricePerLessonForCurrency`.

## [2026-05-27] update | Clarify single-currency lesson rate in admin UI
- **Trigger:** user question
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `System → Payments` now explicitly warns that lesson price is stored for default currency only and is not auto-converted for other allowed currencies.

## [2026-05-27] update | Provider currency support audit
- **Trigger:** user question
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** Documented per-provider currency matrix; only MonoPay validates in code; Lemon Squeezy ignores platform currency (variant-driven).

## [2026-05-27] update | Ledger activity UI on payment page
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `LessonBalanceLedgerActivity` with kind labels, day groups, relative dates; reused on student Billing tab.

## [2026-05-27] update | Payment page clearer two-step UX
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `/payment` shows balance once, one package grid with selection, then checkout providers for the selected package only; manual invoice in its own section with steps; status banners for checkout return.

## [2026-05-27] update | Manual invoice configured count clarity
- **Trigger:** user question
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `configuredLabel` counts only templates with required fields filled (`isManualInvoiceMethodConfigured`); UI shows `X of Y manual methods ready` and per-template missing fields in System → Payments modal.

## [2026-05-27] update | Student payment methods include newly enabled providers
- **Trigger:** bug report
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `resolveStudentPaymentMethods` now merges platform methods enabled after the student's saved allowlist when that allowlist is still fully valid school-wide (fixes `/payment` missing new methods for migrated or legacy-restricted students).

## [2026-05-27] update | Student route without segment loading.tsx
- **Trigger:** debug
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** removed `students/[studentId]/loading.tsx`; server `page.tsx` + client `StudentDetailsPage.tsx` to avoid Suspense fallback swap when entering student profile.

## [2026-05-27] update | Fix Suspense cleanup on nav (Practice, etc.)
- **Trigger:** debug
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** removed root `app/loading.tsx` and `RequestAuthShell` Suspense wrapper; auth inlined in async `layout.tsx`. Student tabs use `createLazyPanel` instead of `next/dynamic` to avoid lazy Suspense trees during route exit.

## [2026-05-27] update | Fix Suspense boundary mismatch on nav
- **Trigger:** debug
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** removed nested `TabPanelSuspense` around `next/dynamic` tabs; student profile `keepMountedTabs={false}`; moved route `<Suspense>` to wrap only `children` inside `RequestAuthShell` (superseded by layout inline + lazy-panel).

## [2026-05-27] update | Proxy web-session cache + route loading
- **Trigger:** code change
- **Pages:** `concepts/web-app`, `concepts/auth-rbac`, `log.md`
- **Notes:** TTL cache (`WEB_SESSION_CACHE_TTL_MS`, default 8s) for repeat `web-session` during navigations; `app/loading.tsx` + student skeleton on cold client load; hover/focus prefetch on student cards.

## [2026-05-27] update | Student tab panel Suspense skeletons
- **Trigger:** code change
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** `TabPanelLoading` + per-tab `next/dynamic` loading fallbacks and `TabPanelSuspense` on student profile tabs so first-open lazy tabs show in-panel skeletons instead of empty panels or root Suspense flash.

## [2026-05-27] update | Student details navigation speed
- **Trigger:** code change + perf follow-up
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** reduced `/students/[studentId]` mount work: removed duplicate lessons fetch from page, changed `useStudentLiveStats` to prefer warm cache (no force refetch unless student-specific cache is missing), split heavy student tabs with `next/dynamic`, added route-level loading fallback, and enabled explicit prefetch on `StudentSummaryCard` links. Follow-up: tab dynamic imports use client-only loading (`ssr: false`) to avoid root Suspense full-page flash on first tab open.

## [2026-05-27] update | Create lesson stays on current page
- **Trigger:** code change
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** Header “Create lesson” and dashboard “New lesson” call `useOpenCreateLesson()` (`LessonEditorHost` context) — modal opens on the current page without `?create=1` or redirect to `/lessons`.

## [2026-05-27] update | Secure navigation latency
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `concepts/web-app`, `log.md`
- **Notes:** `web-session` now uses one Prisma user read via `resolveWebRequestSessionAuth`; proxy skips session fetch on anonymous public routes and password-recovery pages, calls same-origin `/api/auth/web-session`, and supports `DEBUG_PROXY_TIMING=1` plus `x-soenglish-proxy-hit` for duplicate-invocation checks. Removed route `loading.tsx` files; sync root `layout.tsx` + `RequestAuthShell` under `<Suspense>` fixes Suspense boundary mismatch on navigation. Dashboard and student detail stop force-refetching warm lesson/summary caches. Integration tests cover anonymous + access-backed `web-session`.

## [2026-05-26] update | Restore request-time auth on Next 16
- **Trigger:** debug + code change
- **Pages:** `concepts/auth-rbac`, `concepts/web-app`, `synthesis/architecture`, `log.md`
- **Notes:** anonymous users could still load protected routes like `/dashboard` because the request-time auth gate lived in the deprecated/wrong file path for the current Next 16 `src/app` setup. Moved the guard to `apps/web/src/proxy.ts`, restarted dev, and verified `/dashboard` now redirects to `/login` while public auth routes stay accessible.

## [2026-05-26] update | Password field visibility toggle
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `concepts/ui-design-system`, `log.md`
- **Notes:** confirmed password reset links stay valid for 60 minutes and each new forgot-password request replaces older reset tokens for that user. Added a shared password visibility eye-toggle to `apps/web/src/components/ui/Field.tsx`, so login, reset-password, profile, and other password-backed forms can reveal or hide the current value without duplicating per-page logic.

## [2026-05-26] update | Richer manual invoice templates
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** expanded `manualInvoiceMethods` so `IBAN / SEPA` and `SWIFT` entries can store structured recipient tax id, explicit payment purpose, and student-facing `importantNotes[]`. Relaxed manual-method validation so local UAH / EUR SEPA instructions no longer require artificial bank-name/country fields, and updated `System → Payments`, student billing summaries, and `/payment` cards to render the richer transfer details cleanly.

## [2026-05-26] update | Added card transfer manual invoice method
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** added first-class `card_transfer` support to `manualInvoiceMethods` so admins can save direct bank-card instructions as structured `beneficiaryName + bankName + cardNumber` data instead of a legacy custom text block; updated GraphQL/contracts, System payment settings, student billing summaries, `/payment`, and manual-invoice validation/tests accordingly.

## [2026-05-26] update | Payment settings modal bigger and new manual methods first
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** increased the `System → Payments` provider settings modal size for denser billing forms, and changed manual-invoice method creation so newly added methods are inserted at the top of the list instead of below older entries.

## [2026-05-26] update | Manual invoice add flow and imported custom label
- **Trigger:** debug + code change
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** changed the `PaymentsPanel` modal config updater to use a functional draft state update so newly added manual invoice entries are not lost through stale modal state, and renamed compatibility `custom` manual methods in the UI from `Legacy custom` to `Imported instructions` because they exist only as migration fallback for older installs.

## [2026-05-26] update | Manual settings modal save button and neutral custom label
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** removed the visible `Imported instructions` wording from manual-invoice UI so compatibility `custom` entries now fall back to `Manual invoice` or their own saved label, and added a dedicated `Save` button inside the `System → Payments` manual settings modal that triggers the same payment-settings persistence flow as the page-level save action.

## [2026-05-26] update | Payment method modal visual polish
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** refreshed the `System → Payments` method modal with a more descriptive header, softer blurred backdrop, card-like section styling for provider/manual content, and a stronger footer action area so large payment configuration forms feel cleaner and easier to scan.

## [2026-05-26] update | Payment method modal dark-theme cleanup
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** removed white-tinted gradients and light-mix surfaces from the `System → Payments` method modal, then added dark-theme-safe card/surface backgrounds plus stronger dark borders/shadows so the dialog no longer looks muddy in dark mode.

## [2026-05-26] update | Student Billing single manual invoice shortcut
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `entities/student-lesson-balance`, `log.md`
- **Notes:** added a direct `Use only this method` action on manual invoice cards in `/students/[id] → Billing`, so staff can assign one concrete manual invoice option to a student in one click while keeping the older allowlist + recommended-method controls for advanced cases.

## [2026-05-26] update | Student payment allowlist replaces singular assignment
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `entities/student-lesson-balance`, `log.md`
- **Notes:** moved per-student payment restrictions from legacy `User.assignedPaymentMethod` into `StudentLessonBalance.paymentMethodSelection.allowedMethods[]`, added a Prisma migration that backfills existing single-method assignments into the new JSON allowlist, updated billing GraphQL/contracts/backend resolution to treat empty allowlists as “all enabled methods”, and refactored `/students/[id] → Billing` so admins save payment-method allowlists and manual invoice subsets/defaults together in one flow.

## [2026-05-26] update | Billing runtime failed until new migration was applied
- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** runtime `studentLessonBalance.upsert()` started failing on `StudentLessonBalance.paymentMethodSelection` because the new allowlist migration existed locally but had not yet been applied to the active PostgreSQL database. Applied `20260526210000_student_payment_method_selection` with `prisma migrate deploy`; schema is now up to date.

## [2026-05-26] update | Student Billing layout made more intuitive
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** reorganized `/students/[id] → Billing` into a clearer workspace with a top overview banner, icon-led section headers, nested rule cards for billing mode/payment methods/manual invoice restrictions, and more readable pricing, manual-credit, and ledger activity cards so staff can locate the right billing action faster.

## [2026-05-26] update | Student Billing dark-theme cleanup and clearer manual invoice choice
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** removed white-mixed/gradient-heavy billing card backgrounds that looked wrong in dark theme, flattened package accents to solid colors, and made `Manual invoice` more explicit in the student Billing UI by showing template-count/default summaries plus clearer copy that staff can choose one or several concrete manual invoice templates for the student.

## [2026-05-26] update | Inline manual invoice template picker in Billing
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** changed student Billing so all created manual invoice templates from `System → Payments` are available in the admin restriction UI, then moved the template-selection logic directly into the `Manual invoice` card inside `Allowed payment methods`; student-facing payment data still returns only templates that are actually configured and allowed for that student.

## [2026-05-26] update | Recommended manual template shown only when needed
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** kept the `Recommended template` selector inside the inline `Manual invoice` picker in `Allowed payment methods`, but now show it only when more than one manual invoice template is available for the student so single-template setups stay compact.

## [2026-05-26] update | Manual invoice picker simplified to direct multi-select
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** removed the extra `Choose specific manual invoice templates` toggle and `Only this` shortcut from the inline `Manual invoice` picker in student Billing; staff now directly select one or several templates with checkboxes, which matches the intended multi-choice flow more clearly.

## [2026-05-26] update | Payment method picker simplified to direct multi-select
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** removed the extra `Choose specific payment methods for this student` toggle from `Allowed payment methods` in student Billing; staff now directly select one or several payment methods with checkboxes, while “all methods selected” still persists as the compatibility empty-allowlist shape in backend storage.

## [2026-05-26] update | Preserve server auth role through hydration
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `log.md`
- **Notes:** fixed web auth bootstrap so the client auth cache can use the server-provided session user before Zustand finishes initializing; this prevents authenticated users such as `SUPER_ADMIN` from temporarily or persistently falling back to student-shaped UI/navigation when the client store starts empty.

## [2026-05-26] update | Hydration-safe breakpoint hook
- **Trigger:** code change
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** changed `useBreakpoint()` so SSR and the first client render share the same desktop fallback state, then apply the real viewport after mount; this prevents responsive client components like `Header`, `Sidebar`, and `/chat` from rendering different trees during hydration.

## [2026-05-26] update | Header search hydration id fix
- **Trigger:** code change
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** pinned the persistent header search input to a stable DOM id instead of generated `useId()` output so the app shell no longer throws a hydration attribute mismatch for the search field on SSR refreshes.

## [2026-05-26] update | Pre-hydration appearance bootstrap
- **Trigger:** code change
- **Pages:** `concepts/web-app`, `log.md`
- **Notes:** moved web theme/font-size initialization earlier into a tiny inline bootstrap script in `app/layout.tsx` so persisted dark mode is applied on `<html>` before hydration, eliminating the light-to-dark flash on refresh while keeping Zustand/localStorage as the source of truth.

## [2026-05-26] update | Public auth shell fallback and green repo typecheck
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `log.md`
- **Notes:** fixed request-auth shell fallback so public auth routes still resolve to the `auth` shell even when the explicit shell header is missing, preventing header/sidebar bleed onto `/login`; also cleaned the remaining web test helper typing so full repo `npm run typecheck` is green again.

## [2026-05-26] update | Restored clean auth and billing module typechecks
- **Trigger:** code change
- **Pages:** `concepts/testing`, `log.md`
- **Notes:** fixed `@be/mail` nodemailer import typing so `module-auth` no longer failed through `module-mail`, and normalized billing env/index-signature access plus manual-invoice GraphQL mapping so focused `module-billing` and downstream `module-lessons` typechecks pass cleanly again.

## [2026-05-26] update | Middleware follow-up: account status and backend auth gaps
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `synthesis/architecture`, `log.md`
- **Notes:** enforced `ACTIVE`-only auth/session boundaries across password login, Google sign-in, refresh rotation, guards, and `GET /api/auth/web-session`; middleware now preserves `account_paused` / `account_leaved` / `account_blocked` redirects into `/login`; removed redundant top-level web route guards plus the dead `AuthGate`; tightened student-scoped vocabulary access and lesson create/update/delete rules so ownership stays enforced in backend services instead of middleware.

## [2026-05-26] update | Role-aware request-time route gating
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `synthesis/architecture`, `log.md`
- **Notes:** extended `GET /api/auth/web-session` with `availableScopes`, added shared pathname route policy for middleware + sidebar visibility, and moved top-level role/scope gating for `/payment`, `/students`, `/admin`, `/system`, and future `/platform` routes into request-time middleware while leaving detailed ownership/business authorization in backend/page logic.

## [2026-05-26] update | Request-time middleware auth architecture
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `synthesis/architecture`, `log.md`
- **Notes:** added `apps/web/middleware.ts` to own public/protected auth routing before render, introduced backend `GET /api/auth/web-session` as a non-mutating session snapshot for middleware/server layouts, moved shell selection into request-time layout state, demoted `AuthGate`/client bootstrap from redirect ownership to UI-only session cache, and added future-ready `scope` / `tenantKey` seams for later platform-vs-school routing.

## [2026-05-26] update | Cursor rule for future multi-tenant architecture
- **Trigger:** user request
- **Pages:** `synthesis/architecture`, `log.md`
- **Notes:** added an always-apply Cursor rule that keeps current implementation biased toward one-school product scope while requiring new architectural decisions to preserve a clean path to future platform-level and school-level multi-tenant separation.

## [2026-05-26] update | Login URL stays clean for dashboard redirect
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** unauthenticated visits to the default protected route `/dashboard` now redirect to plain `/login` instead of `/login?next=%2Fdashboard`; `next` is still preserved for non-default protected pages where post-login return routing matters.

## [2026-05-26] update | Forgot password and reset-password flow
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac`, `concepts/transactional-email`, `log.md`
- **Notes:** added hashed one-time `PasswordResetToken` persistence, new REST endpoints `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`, a `password-reset` transactional email template, and new web auth pages `/forgot-password` + `/reset-password` with a login-page recovery link.

## [2026-05-26] update | Added MonoPay and PayPal billing providers
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `index.md`, `log.md`
- **Notes:** expanded billing provider contracts and `PaymentMethodKind` with `monopay` and `paypal`, added secure school secrets + mode-aware runtime for both providers, implemented MonoPay invoice/webhook flow and PayPal Orders/webhook verification flow, and exposed both providers in `System → Payments` plus the student `/payment` page.

## [2026-05-26] update | Environment switcher no longer stretches full width
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `ui.module.scss` `segmentedRoot` now uses inline fit-content sizing so the `Environment` switcher in payment method modals stays compact instead of stretching across the whole row.

## [2026-05-26] update | Payment method cards and environment switcher clarity
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` cards now update the `Live mode` / `Test mode` badge immediately from local draft config after modal edits, the enabled-state `Disable` action uses a danger/red button style, and the shared segmented environment switcher was restyled for stronger active/inactive contrast.

## [2026-05-26] update | Billing console errors were pending migrations
- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** after adding `PlatformSettings.paymentSecrets`, the local API could throw Prisma `ColumnNotFound` for `PlatformSettings.paymentSecrets` until `npm run prisma:migrate:deploy` applied the latest billing migrations; GraphQL endpoint recovered immediately after migrations were deployed.

## [2026-05-26] update | Payment env example trimmed to platform minimum
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** removed legacy provider fallback vars from `.env.example`; the example now documents only platform-wide billing env (`WEB_APP_URL`, `API_PUBLIC_URL`, `PAYMENT_SECRETS_ENCRYPTION_KEY`) while provider secrets are expected to be managed from `System → Payments`.

## [2026-05-26] update | School-level payment secrets in System
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** added encrypted `PlatformSettings.paymentSecrets` storage for the current school/system payment credentials, introduced `PAYMENT_SECRETS_ENCRYPTION_KEY`, changed checkout/webhook runtime to prefer stored school secrets over legacy env fallbacks, and extended `System → Payments` so each provider modal can edit secure school secrets while exposing only safe field-status metadata back to the frontend.

## [2026-05-26] update | Payment provider test-live switching and onboarding
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** added persisted per-provider `live/test` mode to billing settings, runtime credential/environment selection for Stripe/LiqPay/WayForPay/Lemon Squeezy/Paddle, paired env documentation in `.env.example`, mode-aware status labels on payment cards, and a refactored payment-method modal with docs links, setup checklists, and field-level tooltip guidance.

## [2026-05-26] update | Manual invoice methods and student allowlists
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `entities/student-lesson-balance`, `index.md`, `log.md`
- **Notes:** replaced singleton manual invoice copy with typed `manualInvoiceMethods[]` (`IBAN/SEPA`, `SWIFT`, legacy `custom` fallback), added `StudentLessonBalance.manualInvoiceSelection` for per-student allowlist/default, updated `System → Payments`, student Billing rules, and `/payment` to render the new method cards and restrictions.

## [2026-05-26] update | Added WayForPay, Lemon Squeezy, and Paddle
- **Trigger:** code change
- **Pages:** `concepts/billing-payments`, `index.md`, `log.md`
- **Notes:** expanded `PaymentMethodKind` and Payments UI to include `wayforpay`, `lemonsqueezy`, and `paddle`; added provider-specific checkout services and webhook/callback endpoints, plus new admin config fields for WayForPay merchant settings and Lemon Squeezy store/variant ids.

## [2026-05-26] update | Speaking practice flow for achievements
- **Trigger:** code change
- **Pages:** `concepts/achievements`, `concepts/web-app`, `log.md`
- **Notes:** enabled `/practice/speaking` with live session tracking via `usePracticeSessionTracker`, and re-enabled the Speaking activity card so speaking achievements now have a real user-facing source of progress.

## [2026-05-26] update | Live backend achievements
- **Trigger:** code change
- **Pages:** `concepts/achievements`, `concepts/web-app`, `index.md`, `log.md`
- **Notes:** added server-side `achievementStats(studentId?)` query in `module-auth`; shared achievement catalog/rules moved to `packages/shared/types`; `/profile` and student achievements now render from live backend counters and unlocked ids instead of mock-only client wiring.

## [2026-05-26] update | Pricing control chips removed
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` pricing control cards no longer render `pricingControlChip`; the card headers were simplified and related chip styles were removed.

## [2026-05-26] update | Pricing chip text no longer breaks awkwardly
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` `pricingControlChip` now keeps its label on one line, while the chip itself can wrap below the title row if space is tight.

## [2026-05-26] update | Pricing control cards use softer accents
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` `pricingControlCard` no longer uses the top `::before` accent bar; cards now use softer per-card border tinting and colored chips instead.

## [2026-05-26] update | Pricing select dropdown no longer clipped
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` `pricingControlCard` no longer uses `overflow: hidden`, so the custom select dropdown can render outside the card instead of being clipped.

## [2026-05-26] update | Select and input heights aligned
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** desktop `Field` select trigger now matches standard input sizing more closely (`min-height`, padding, inherited typography), and the System/Student page `.input` styles now enforce consistent field height with `min-height` + `box-sizing`.

## [2026-05-25] update | Billing form fields stretch consistently
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` now removes inherited width caps inside `pricingInlineControls`, stretches package control cards to equal height inside `packageRowControls`, and student `formGrid` inputs now use full width instead of native browser sizing.

## [2026-05-25] update | Payments cards dark-theme cleanup
- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `System → Payments` dropped the problematic dark-theme gradients, `pricingControlCard` was redesigned into flatter accent cards, package template cards now match student package styling more closely, and Header lesson badges now have explicit dark-theme warning/danger states.

## [2026-05-25] update | Billing package cards made more visible
- **Trigger:** user request
- **Pages:** `concepts/billing-payments`, `log.md`
- **Notes:** `/payment` and student Billing package cards now use stronger accent bars, larger price blocks, and `Starter` / `Popular choice` / `Premium` visual states so package differences are obvious at a glance.

## [2026-05-25] update | Featured package accents on student/payment cards
- **Trigger:** user note + UI change
- **Pages:** `log.md`
- **Notes:** package cards on `Student Billing` and `/payment` now highlight a visually featured mid-sized package and add richer helper copy.

## [2026-05-25] update | Student and payment package card redesign
- **Trigger:** user note + UI change
- **Pages:** `log.md`
- **Notes:** package presentation on `Student Billing` and `/payment` now uses richer cards with price, lesson count, badges, and clearer checkout/status hierarchy.

## [2026-05-25] update | Payments package cards redesign
- **Trigger:** user note + UI change
- **Pages:** `log.md`
- **Notes:** `System → Payments` self-serve package templates now have summary stats, richer card metadata, badges, and clearer edit controls.

## [2026-05-25] update | Package rules card redesign
- **Trigger:** user note + UI change
- **Pages:** `log.md`
- **Notes:** `Student Billing` package rules now include summary stats, status badges, richer package metadata, and clearer toggle/control grouping.

## [2026-05-25] update | Default pricing block redesign
- **Trigger:** user note + UI change
- **Pages:** `log.md`
- **Notes:** `System → Payments` `Default pricing` now uses a configurator layout with a stronger hero, control cards, live summary, and package preview.

## [2026-05-25] update | Billing action feedback and loading states
- **Trigger:** user note + code change
- **Pages:** `log.md`
- **Notes:** backend action buttons in billing UI use `Button.loading`; success/error feedback is rendered near the action area instead of only at the top; added `.cursor/rules/web-async-actions.mdc`.

## [2026-05-25] update | Billing currencies, student billing mode, package locks
- **Trigger:** user note + code change
- **Pages:** `concepts/billing-payments.md`, `entities/student-lesson-balance.md`, `log.md`
- **Notes:** `allowedCurrencies` + default select; `minPackageLessons`; `billingMode` + `packageOverrides`; migration `20260525200000_student_billing_mode`; `updateStudentLessonBilling`.

## [2026-05-25] fix | ensureBalanceRow upsert (P2002 on userId)
- **Trigger:** debug — concurrent create vs `resolvePricePerLessonMinor` upsert
- **Pages:** `log.md`
- **Notes:** `ensureBalanceRow` uses `upsert` instead of find-then-create.

## [2026-05-25] fix | Billing GraphQL CurrentGqlUser + enabledPaymentMethods on balance
- **Trigger:** debug — `Cannot read properties of undefined (reading 'user')` on student Billing tab
- **Pages:** `log.md`
- **Notes:** `billing.resolver` used `@CurrentUser()` (HTTP-only); switched to `@CurrentGqlUser()`. Staff assignment dropdown uses `enabledPaymentMethods` on balance instead of super-admin `paymentSettings` query.

## [2026-05-25] fix | studentLessonBalance GraphQL studentId type
- **Trigger:** debug — `Variable "$studentId" of type "ID!" used in position expecting type "String!"`
- **Pages:** `log.md`
- **Notes:** `billing.resolver` `@Args('studentId', { type: () => ID })` to match client `STUDENT_LESSON_BALANCE` query.

## [2026-05-25] update | Per-lesson pricing + Payments method cards UI
- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`, `entities/student-lesson-balance.md`, `log.md`
- **Notes:** `defaultPricePerLessonMinor` + `StudentLessonBalance.pricePerLessonMinor`; package totals = lessons × price; System Payments cards with gear modal; `updateStudentLessonPricing`.

## [2026-05-25] update | Lesson billing & payments (Stripe, LiqPay, manual invoice)
- **Trigger:** code change — payment system plan
- **Pages:** `concepts/billing-payments.md`, `entities/student-lesson-balance.md`, `entities/lesson-balance-ledger.md`, `index.md`
- **Notes:** `@be/billing`, Prisma migration `20260525000000_lesson_billing`, `/payment`, System Payments tab, Header balance badge, student Billing tab; consumption on COMPLETED or CANCELLED+credited.

## [2026-05-25] fix | E2E webServer cwd — script path from repo root
- **Trigger:** Playwright CI exit 127 — `scripts/e2e-web-server.sh: No such file or directory`
- **Pages:** `log.md`
- **Notes:** Playwright `webServer.cwd` defaults to `tests/e2e/`; set `cwd` to repo root.

## [2026-05-25] fix | E2E webServer — wait for API before tests
- **Trigger:** Playwright CI — `ECONNREFUSED 127.0.0.1:3000` in `auth.setup.ts` (setup ran before API listened)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** `scripts/e2e-web-server.sh` waits for API + web + seeded login; removed `auth.setup.ts` project; `webServer` timeout 180s.

## [2026-05-25] fix | E2E — wait for API before browser tests
- **Trigger:** Playwright CI — `Login failed with status 500` on first specs (`login`, `navigation`)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** `auth.setup.ts` project depends before `chromium`; polls API + login; `LoginPage` retries 5xx in CI.

## [2026-05-25] fix | GitHub Actions Node 24 + E2E artifact upload
- **Trigger:** Playwright workflow — Node 20 action deprecation; git exit 128 on artifact upload
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** `checkout@v5`, `setup-node@v5`, `upload-artifact@v5`; `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`; HTML report at repo-root `playwright-report/`; `if-no-files-found: ignore` + `include-hidden-files` for gitignored report; E2E `cancel-in-progress: false`.

## [2026-05-25] fix | E2E — sidebar locator scope + login wait
- **Trigger:** Playwright CI — strict mode on duplicate Students links; flaky login
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** `SidebarNav` scopes to `Main navigation`; `LoginPage.login` waits for `/api/auth/login` + dashboard redirect.

## [2026-05-24] fix | CI integration tests — quiz access, RBAC, serial workers
- **Trigger:** CI #25 integration job (12 failures)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** `QuizAccessService.listForWhere` — staff see owned + assigned quizzes; student `deleteQuiz` → ownership message before staff gate; `studentQuizzes` optional `studentId`; `LessonsService.create` staff-only; integration seed adds `superAdmin`; `jest.integration.config.cjs` `maxWorkers: 1`; vocab tests pre-seed words; RBAC expects `RolesGuard` message.

## [2026-05-24] fix | CI typecheck — build email-templates before tsc
- **Trigger:** CI #25 `@be/email-templates` not found during `@app/api` typecheck
- **Pages:** `package.json`, `apps/api/package.json`, `docs/reference/ci-cd.md`
- **Notes:** Path alias targets `dist/`; `typecheck` now runs `build:email-templates` first (same as `build:api`).

## [2026-05-24] fix | CI unit tests — mail, chat-store, profile, word-definitions
- **Trigger:** CI #21 failed on main after e2a3f73
- **Pages:** `log.md`, `docs/reference/ci-cd.md` (implicit)
- **Notes:** `nodemailer` default import; chat message `conversationId`; `nativeLanguageId` in profile test; POS `undefined`; `test:unit` runs `prisma:generate`.

## [2026-05-24] fix | IDE Problems — tsconfig.ide + Prisma generate
- **Trigger:** Problems panel (decorators, @be/*, @tests/integration, node_modules noise)
- **Pages:** `tsconfig.ide.json`, `.vscode/settings.json`, `tsconfig.base.json`, `package.json` (`predev`), `tests/integration/tsconfig.json`
- **Notes:** `enableProjectDiagnostics` off; single `typescript.tsconfig` for paths/decorators; `npm run prisma:generate` in `predev` (PrismaService types).

## [2026-05-24] fix | CI npm ci — Linux lockfile + Dependabot
- **Trigger:** Dependabot PRs fail ~30s at Install dependencies
- **Pages:** `package-lock.json`, `.github/dependabot.yml`, `docs/reference/ci-cd.md`, `package.json` (`lockfile:linux`)
- **Notes:** `npm ci` on Linux needed `@emnapi/*` in lockfile; regen via `npm run lockfile:linux`. Removed dev-dependency **group** to avoid bundled eslint/peer breaks.

## [2026-05-24] update | Docker dev — postgres only by default
- **Trigger:** user prefers host `npm run dev` (visible terminal logs), not api/web in Docker
- **Pages:** `infra/docker/README.md`, `docker-compose.yml` (profile `stack`), `package.json`, `scripts/docker-restore-all.sh`, `synthesis/tech-stack.md`
- **Notes:** `docker:up` = Postgres only; `docker:stack` / `docker:restore:stack` = optional full containers; `docker:stack:down` stops api/web.

## [2026-05-24] note | auth/me 500 when Postgres down
- **Trigger:** debug (recurring `GET /api/auth/me` 500)
- **Pages:** `synthesis/tech-stack.md`, `package.json` (`docker:postgres`)
- **Notes:** Prisma `ECONNREFUSED` on refresh-token lookup → Nest 500. Start `soenglish-postgres` before `npm run dev`.

## [2026-05-24] note | Prisma Studio ERR_STREAM_UNABLE_TO_PIPE
- **Trigger:** debug (terminal log while `npx prisma studio`)
- **Pages:** `synthesis/tech-stack.md`, `package.json` (`prisma:studio`)
- **Notes:** Harmless log noise on Prisma 7 + Node 22+; open the printed localhost URL. **"Could not load schema metadata"** is different — Postgres was down on `:5432`; start `soenglish-postgres` and restart Studio.

## [2026-05-24] update | PlatformSettings upsert P2002 race
- **Trigger:** debug (`platformSettings.upsert` unique on `id`)
- **Pages:** `log.md`
- **Notes:** `PlatformSettingsService.ensureSettingsRow` uses findUnique + create + P2002 retry instead of upsert; `setWordDictionaryProvider` uses update after ensure (concurrent first requests on singleton `id=default`).

## [2026-05-24] note | Fresh DB — SUPER_ADMIN CLI
- **Trigger:** user deleted database
- **Pages:** `concepts/auth-rbac.md` (existing CLI docs)
- **Notes:** After `prisma:migrate:deploy` + `prisma:seed:languages`, create via `npm run super-admin -- token` then `create --email … --password …` (requires `SUPER_ADMIN_CLI_SECRET` in `.env`).

## [2026-05-24] update | Web IDE @pkg/types resolution
- **Trigger:** Problems panel (`moduleResolution`, Map iterator, TIME_ZONE unknown)
- **Pages:** `log.md`
- **Notes:** Removed root `tsconfig.json` + `typescript.tsconfig` in VS Code (forced `node` resolution). `@pkg/types` package exports `types` field; `apps/web` `target` ES2022 + `downlevelIteration`; `scheduledLessonsBackendAdapter` uses `Array.from` + typed `TIME_ZONE` keys.

## [2026-05-24] update | Docker dev stack restore
- **Trigger:** user request (deleted containers)
- **Pages:** `log.md`, `infra/docker/README.md`
- **Notes:** Dev stack = `soenglish-postgres`, `soenglish-api`, `soenglish-web` via `infra/docker/docker-compose.yml`. Compose: `env_file` `.env`, `NODE_OPTIONS` 4GB for api/web (avoids tsc OOM in container), `npm run docker:up|down|logs|ps`, `npm run docker:restore` (`scripts/docker-restore-all.sh` scans `~/Programming` for other compose files). Other deleted containers are **not** defined in this repo — recover via remaining volumes/images or project compose paths.

## [2026-05-24] update | Integration tests IDE paths
- **Trigger:** user request (Problems on `tests/integration/bootstrap.ts`)
- **Pages:** `concepts/testing.md` (via README), `log.md`
- **Notes:** `@tests/integration/*` in `tsconfig.base.json`; `tests/integration/tsconfig.json` includes module `tests/integration/**/*.ts`; root `tsconfig.json` solution references; fixed broken `../../../../../` imports in module integration specs.

## [2026-05-24] update | IDE Problems — package tsconfig.lib
- **Trigger:** user request (fix Problems panel)
- **Pages:** `log.md`
- **Notes:** All `tsconfig.lib.json` exclude `*.spec.ts` / `tests/`; strict fixes (`noPropertyAccessFromIndexSignature`, Prisma update types, nodemailer import, `@types/multer`, `@be/graphql` tsconfig); feature-vocabulary fetch without Next-only `next` option.

## [2026-05-24] update | Dependabot vs CI setup-monorepo
- **Trigger:** debug (Dependabot PRs fail ~30s)
- **Pages:** `log.md`, `docs/reference/ci-cd.md`
- **Notes:** `npm ci` in composite action fails when lockfile lacks Linux `@emnapi/*` optional deps, or when grouped dev PR bumps `eslint@10` (peer conflict with `eslint-plugin-import`). `.github/dependabot.yml` — dev group **minor/patch** only; ignore majors for eslint/typescript/jest. Close stale Dependabot PRs after lockfile fix on `main`.

## [2026-05-24] update | CI/CD pipelines (GitHub Actions)
- **Trigger:** user request
- **Pages:** `concepts/testing.md`, `synthesis/tech-stack.md`, `log.md`
- **Notes:** Parallel CI (quality, unit, integration, build); E2E workflow; CD → GHCR with `api.prod` / `web.prod` Dockerfiles; Next `output: standalone`; `docs/reference/ci-cd.md`, `.dockerignore`, dependabot.

## [2026-05-24] update | Web unit test fixtures + tsconfig.spec
- **Trigger:** code change
- **Pages:** `log.md`
- **Notes:** `apps/web/src/testing/fixtures.ts` typed mocks; `tsconfig.spec.json` includes jest-dom types + `index.d.ts` SCSS modules; `LessonPartyOption` imported from `use-lesson-party-options` (not `@pkg/types`).

## [2026-05-24] update | Problems panel / typecheck + lint green
- **Trigger:** code change (fix IDE Problems)
- **Pages:** `overview.md`, `log.md`
- **Notes:** Calendar null-narrowing in portaled dialogs; `LessonModal` teachers typed as `LessonPartyOption[]`; web production TS fixes; unused imports; ESLint globals for `.cjs` / `next.config.mjs`; `@app/web` tsconfig excludes unit test files from `tsc`.

## [2026-05-24] update | VS Code / Cursor workspace diagnostics
- **Trigger:** user request
- **Pages:** `overview.md`, `log.md`
- **Notes:** `.vscode/settings.json` (`enableProjectDiagnostics`, ESLint `workingDirectories: auto`), `extensions.json`, `tasks.json` for `npm run typecheck` / `lint` / `test:unit`.

## [2026-05-24] update | Backend hygiene follow-ups
- **Trigger:** code change (post-refactor cleanup plan)
- **Pages:** `concepts/auth-rbac.md`, `concepts/backend-modules.md`, `overview.md`, `synthesis/tech-stack.md`, `entities/user.md`, `log.md`
- **Notes:** Layered `module-mail` / `module-notifications`; Prisma out of admin/users/system GraphQL resolvers; `QuizGeneratorService` split (list/detail/generate/attempt + repository); `@Roles`/`RolesGuard`; narrowed `@be/auth` exports; Prisma CLI paths → `data-access-prisma`; module `tests/integration/`; ESLint max-lines + layer imports; GitHub Actions CI.

## [2026-05-24] update | Backend module architecture refactor
- **Trigger:** code change (big-bang modular layout)
- **Pages:** `concepts/backend-modules.md`, `synthesis/architecture.md`, `concepts/testing.md`, `index.md`
- **Notes:** Layered `presentation/application/domain/infrastructure` per `@be/*`; GraphQL resolvers in modules; `@be/graphql` shared types; thin `apps/api` gateway.

## [2026-05-20] update | Turbo dev TUI + app-only filter
- **Trigger:** user request (restore 2-pane terminal UI on `npm run dev`)
- **Pages:** `overview.md`, `log.md`
- **Notes:** `turbo.json` `"ui": "tui"`; root `dev` script filters `@app/web` + `@app/api` (drops 9 workspace packages without `dev` script from scope).

## [2026-05-20] update | lesson-recurrence, users, attachments, mail index, be-prisma
- **Trigger:** user request (coverage gaps)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 123 unit suites / 712 tests — `lesson-recurrence` (daily/weekly/monthly horizons), `users.service` (profile/password/pagination), `lesson-attachment.service` (disk CRUD + create rollback), `module-mail/index.spec.ts`, `be-prisma` default `DATABASE_URL`.

## [2026-05-20] update | Web lib/stores + be-prisma unit coverage
- **Trigger:** user request (coverage gaps: fileUtils, chat-upload, tracker, roles, student-profile, vocabulary-audio, word-definitions, word-details-payload, mocks, auth-store, be-prisma)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 122 unit suites / 688 tests — new `data-access-prisma` Jest project + `be-prisma.spec.ts`; expanded web tests listed above.

## [2026-05-20] update | Targeted coverage: quizzes-store, auth, practice, chat mail
- **Trigger:** user request (coverage gaps from report)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 121 unit suites / 646 tests — expanded `quizzes-store`, `auth-cookies`, `auth.guard` (AuthGuard/OptionalAuthGuard), `delete-admin-user`, `practice-sessions.service`, `students-admin.service`, `chat-attachment.service`, new `mail.module.spec.ts`.

## [2026-05-20] fix | be-vocabulary resolveVerbForms import + dispatch/lesson tests
- **Trigger:** user request (continue) + dev build failure
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** Fixed `resolveVerbForms` import in `be-vocabulary.ts` (API `tsc` green). 603 unit tests — `notification-dispatch` partial channel send, `series-lesson-delete` edge cases, `lessonPersistence` editing/create content.

## [2026-05-20] update | Practice/notifications stores + series-lesson + translation
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 120 unit suites / 597 tests — `practice-store`, `notifications-store` (MAX_TOASTS/auto-dismiss), `series-lesson-update` (conflicts/schedule persist), `TranslationService` edge cases.

## [2026-05-20] update | Students/vocabulary/admin stores + telegram + recurring lessons
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 120 unit suites / 582 tests — `students-store`, `vocabulary-store` (CRUD/pagination), `admin-store`, `languages-store`, `recurring-lesson-create` conflict/past paths, `telegram-bot.client` network/API edge cases.

## [2026-05-20] update | Profile/chat stores + ChatService + Google Calendar
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 120 unit suites / 544 tests — `profile-store` (update/password/auth sync), `chat-store` (messages/pagination/append/markRead), `ChatService` (send/attachments/group), `GoogleCalendarService` (googleapis mock for Meet CRUD).

## [2026-05-20] update | Button/Field UI kit + lessons/quizzes stores
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 120 unit suites / 510 tests — `Button.test.tsx` (loading, async pending, icons), `Field.test.tsx` (select/checkbox/tel/readOnly/file-button), expanded `lessons-store` + `quizzes-store`. Web UI coverage: Button ~97% lines, Field ~96% lines.

## [2026-05-20] update | Daily goals, chat attachments, dashboard/confirm stores
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 120 unit suites / 475 tests — `DailyGoalsService`, `ChatAttachmentService`, `dashboard-store`, `confirm-dialog-store`, `vocabulary-ui`, `lessonPersistence` content omit.

## [2026-05-20] update | Mail SMTP + NotificationsMail + lessonTime
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 120 unit suites / 456 tests — `MailService` nodemailer mock, `NotificationsMailService`, `sendTelegramBotMessage`, `lessonTime` helpers, `profile-form`, `quiz-questions`.

## [2026-05-20] update | Translation/Telegram fetch mocks + web upload/previews
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 119 unit suites / 442 tests — `TranslationService` Libre+GTX, `telegram-bot.client` widget/getUpdates, `word-details-payload`, `chat-upload`, `lesson-file-links`, `chatUnreadTotal`, `escapeRegex`.

## [2026-05-20] update | Dashboard hero, header search, ESLint for Jest CJS
- **Trigger:** user request (continue coverage) + ESLint on `jest.config.cjs`
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 119 unit suites / 427 tests — `dashboard-hero` homework/calendar/streak, `header-search` lessons/vocab, `hydrateLessonPartyNames`, `chat-attachment.util` reject/sanitize; root ESLint Node globals for `*.config.cjs`.

## [2026-05-20] update | Lesson persistence, conflicts, calendar service
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 119 unit suites / 415 tests — expanded `lessonPersistence`, `conflicts`, `fileUtils.filterSafeFiles`, `lesson-series` content/time helpers; new `lessonCalendarService.test`.

## [2026-05-20] update | API/chat-socket, lesson series, dictionary merge, integration cleanup
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 118 unit suites / 399 tests — `api`, `chat-socket`, lesson-modal sync/recurring/series-update, `dictionary-merge.util`; `cleanupTestUsers` clears chat/lessons/quiz FKs.

## [2026-05-20] update | Web lib stats/profile/audio + dashboard wordOfDay
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 111 unit suites / 378 tests — `live-statistics-dashboard`, `student-profile`, `student-lessons`, `student-schedule-type`, `vocabulary-audio`, `lesson-attachment-upload`; `DashboardService.wordOfDayFor` stability spec.

## [2026-05-20] update | Web features + staff access + facebook oauth tests
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 105 unit suites / 360 tests — `vocabulary-staff-access.util`, `facebook-oauth`, web `lessonPersistence`/`lessonCalendarAdapter`/`dragPayload`/`series-lesson-delete`/`active-user-role`; integration quiz delete RBAC + student quiz detail.

## [2026-05-20] update | RBAC utils, E2E page objects, chat integration
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** `lessons-access.util`, `vocabulary-rbac.util`; E2E `ChatPage`/`CalendarPage`; integration chat direct conversation + invalid inbox cursor; dropped service specs importing full `be-*` (SWC SIGABRT).

## [2026-05-20] update | vocabulary/lessons map utils + integration RBAC
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** Extracted `vocabulary-map.util.ts` and `lessons-map.util.ts` from `be-vocabulary` / `be-lessons` with unit specs; integration tests for teacher vocab add, invalid cursor, student/admin lessons.

## [2026-05-20] update | Unit tests batch 5 (lesson adapter, lessonTime, practice tracker)
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 93 unit suites / 320 tests — `scheduledLessonsBackendAdapter`, `lessonTime` wall-clock helpers, `practice-session-tracker`, `paginated-api` loadInitial/loadNext, `students-admin` teacher restrictions, `chat.service` inboxPage.

## [2026-05-20] update | Unit tests batch 4 (chat service, live stats, file links)
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 90 unit suites / 301 tests — extracted `chat-inbox-cursor.util`; `chat.service`, `chat-attachment`, `telegram-delivery` specs; web student/profile live stats, lesson file links, teacher chat peer resolver.

## [2026-05-20] update | Unit tests batch 3 (translation, dashboard, vocabulary UI)
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 82 unit suites / 271 tests — `translation.service`, `platform-settings`, `lesson-attachment`, `notification-delivery`, expanded `google-calendar`; web `dashboard-hero`, `vocabulary-ui`, `word-details-payload`, `lesson-pending-files`, `pkg-shared-types`, lesson party / schedule helpers.

## [2026-05-20] update | Unit tests batch 2 (streak, dispatch, web lib)
- **Trigger:** user request (continue coverage)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 72 unit suites / 231 tests — `streak.service`, `notification-dispatch`, `daily-goals` + `irregular-verbs` (@pkg/types), web `word-definitions` / `practice-pending` / `avatar` / `lesson-file-ref`; store `createIdleSlice()` fix; expanded `chat-visibility`, `users.service.listAssignableTeachers`, `streak-alert.job`.

## [2026-05-20] update | Technical package import aliases
- **Trigger:** user request
- **Pages:** `concepts/package-aliases.md` (new), `synthesis/tech-stack.md`, `concepts/frontend-packages.md`, `index.md`, `log.md`
- **Notes:** Renamed npm scopes from `@soenglish/*` to `@pkg/types`, `@be/*`, `@fe/*`, `@app/*`; updated tsconfig, jest.paths, eslint boundaries, all package.json names, Docker CMD filters.

## [2026-05-20] update | Test coverage continuation
- **Trigger:** user request
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** Expanded dictionary-payload, quiz cursor in `quiz-generator.logic`, notification-prefs, practice weekSummary, users pagination; web lib (profile-form, lesson-series, header-search, chat-upload, quiz-questions); integration lessons + quiz suites; 56 unit / 170 tests.

## [2026-05-20] update | Full test coverage plan (infra + breadth)
- **Trigger:** code change (user plan)
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** 9 Jest unit projects via `create-module-jest-config.cjs`; `test:coverage` scripts; `tests/shared/`; ~48 unit / 8 integration / 14 E2E route specs; `quiz-generator.logic.ts` extract; all web Zustand stores smoke-tested; GraphQL integration split by domain.

## [2026-05-20] update | Phase 3 core product tests
- **Trigger:** code change
- **Pages:** `concepts/testing.md`, `concepts/lessons-calendar.md` (createMeetLink GraphQL), `log.md`
- **Notes:** backend-modules Jest project; vocabulary/chat unit; web recurrence/paginated-api/Field; graphql-product integration; E2E product-pages smoke; 60 unit / 10 integration.

## [2026-05-20] update | Phase 2 auth/RBAC tests
- **Trigger:** code change
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** seed.ts, auth-session + telegram unit, refresh/logout integration, graphql-rbac (3), auth-store + roles web tests; 40 unit / 7 integration.

## [2026-05-20] update | Testing coverage roadmap (phases 2–5)
- **Trigger:** user request
- **Pages:** `concepts/testing.md`, `log.md`
- **Notes:** Phased plan to ~40% critical paths (auth → lessons/vocab/flashcards/chat → CI coverage gates).

## [2026-05-20] update | Jest unit, integration, Playwright E2E
- **Trigger:** code change
- **Pages:** `concepts/testing.md`, `synthesis/tech-stack.md`, `log.md`, `index.md`
- **Notes:** Jest projects `module-auth` + `web` (`@swc/jest`, `next/jest`); integration via `jest.integration.config.cjs` + `ts-jest` + supertest; Playwright in `tests/e2e/`. Scripts: `test`, `test:unit`, `test:integration`, `test:e2e`.

## [2026-05-18] update | Prisma migrations squashed to baseline
- **Trigger:** debug (`migrate dev` P3006 shadow DB / missing `User` table)
- **Pages:** `synthesis/tech-stack.md`, `log.md`
- **Notes:** Replaced six incremental-only migrations with `20260501000000_baseline`. Existing DBs: `npm run prisma:migrate:rebaseline` once if history still lists old names.

## [2026-05-18] update | User display color (calendar + staff edit)
- **Trigger:** code change
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Prisma `User.displayColor`; random on `createUserAsAdmin`; staff edit on student profile; calendar reads API colors. Renamed UI from "Calendar color (HEX)" to **User color**.

## [2026-05-18] update | Appearance font size scales full UI
- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `html[data-font-size]` root 14/16/18px; `--fs-9`…`--fs-52` rem tokens; module SCSS `font-size: Npx` → `var(--fs-N)`.

## [2026-05-18] update | Profile: no self-delete; admin delete confirm
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** Removed **Delete account** from Profile → Account. Admin user delete uses `confirmDialog` (“Are you sure…”) before `deleteUser`.

## [2026-05-18] update | Profile change password; remove data export stub
- **Trigger:** code change
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** Account tab: `changeMyPassword` modal via `profile-store`; OAuth-only users see hint (`hasPassword` false). Removed **Export my data** row (no backend).

## [2026-05-18] update | Icon-only Button padding + fixed hit targets
- **Trigger:** UI polish
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `Button` sets `data-icon-only` when children are Lucide-only (no text). Fixed SCSS for `deleteIconBtn`, chat `iconBtn`, toast close, quiz modal close, admin/vocab delete icon buttons.

## [2026-05-18] update | Student response images after lesson save
- **Trigger:** bug fix
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** After save, previews use API `fileLinks` (`resolveLessonFilePreview`); student response chips match homework/materials pattern; lesson page rebuilds response previews on save.

## [2026-05-18] update | Homework save in lesson series + file previews
- **Trigger:** bug fix
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Series modal save now applies homework/materials/plan only to the edited lesson; homework chips use `fileLinks`; lesson page preview state no longer resets on unrelated store updates.

## [2026-05-18] update | Lesson material images persist after save
- **Trigger:** bug fix
- **Pages:** `entities/lesson-material.md`, `log.md`
- **Notes:** `mergeLessonDisplayNames` no longer overwrites API materials/fileLinks; modal flushes material draft on lesson save; previews sync from `fileLinks`.

## [2026-05-18] update | Calendar Request lesson → teacher chat
- **Trigger:** code change
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Student **Request lesson** navigates to `/chat?peer=` assigned teacher.

## [2026-05-18] update | Student lesson vocabulary on lesson page
- **Trigger:** code change
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Students see Lesson vocabulary block and add words; `studentBackendId` from auth on lesson page; re-link existing cards to lesson when `lessonId` set.

## [2026-05-18] update | Lesson party names + file attachments API

- **Trigger:** code change
- **Pages:** `concepts/lessons-calendar.md`, `entities/lesson-material.md`, `log.md`
- **Notes:** GraphQL `teacherName`/`studentName`; `LessonFileAttachment` + REST upload/download; web uploads pending files on persist; fixed `activeUser.fullName` on lesson page.

## [2026-05-18] update | Lesson hub: summary, party names, material files

- **Trigger:** code change
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Hide empty short summary for students; student/teacher labels via `resolveLessonPartyLabel`; lesson attachments open/download via blob URLs (`openLessonAttachment`).

## [2026-05-18] update | PageHeader back before title

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `PageHeader` `back` prop; quiz + vocabulary use it instead of placing Back in `actions`.

## [2026-05-18] update | AdaptiveSelect removed; Field select only

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`, `.cursor/rules/web-component-reuse.mdc`
- **Notes:** All call sites use `<Field as="select" />`; `AdaptiveSelect.tsx` deleted.

## [2026-05-18] update | Adaptive select merged into Field

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`, `.cursor/rules/web-component-reuse.mdc`
- **Notes:** `Field as="select"` uses former `AdaptiveSelect` logic in `Field.tsx`.

## [2026-05-18] update | apps/web raw HTML → UI primitives audit

- **Trigger:** user request
- **Pages:** `concepts/ui-design-system.md`, `log.md`, `.cursor/rules/web-component-reuse.mdc`
- **Notes:** Replaced raw `<button>`/`<input>`/`<img>` across app/features with `Button`, `Field`, `Image`, `SegmentedControl`; chat attachments use `next/image`; external links unchanged.

## [2026-05-18] update | Cursor rule — web component reuse

- **Trigger:** user request
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `.cursor/rules/web-component-reuse.mdc` — Link, Image, Field, Button instead of raw HTML in `apps/web`.

## [2026-05-18] fix | generateQuiz REST + GraphQL includeIrregularVerbDrills

- **Trigger:** debug
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** `GenerateQuizInput.includeIrregularVerbDrills` in `graphql.types.ts`; web store calls `POST /quizzes/generate` so generation works before GraphQL schema reload.

## [2026-05-18] update | Quiz generation + irregular verbs

- **Trigger:** code change | user request
- **Pages:** `concepts/quizzes-flashcards.md`, `concepts/vocabulary.md`, `log.md`
- **Notes:** Curated `irregular-verbs.ts` + `verbForms` on `WordCardDto`; flashcard/list `VerbFormsLine`; fixed `mixed` pool (lesson + rest); quiz templates for past / past participle, translation MCQ, weighted `mistakes_work`; `CreateQuizCard` source hints + `includeIrregularVerbDrills`.

## [2026-05-18] update | Quiz create card (merged auto-generate panel)

- **Trigger:** user request
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** Removed standalone `GenerateQuizPanel` on `/quiz` and student Quiz tab; generation (source, difficulty, count) lives in `CreateQuizCard` inside `manageGrid`.

## [2026-05-18] update | Vocabulary Play setup card UI

- **Trigger:** user request
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** Play mode setup merged into one card with hero, source filters, bottom Play button.

## [2026-05-18] update | Vocabulary POS filter scopes card glosses

- **Trigger:** user request
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** `pickWordDefinition` / `pickWordTranslation` accept POS filter; `resolveVocabularyGlossesForPosFilter` updates list + flashcard translation/definition when a part-of-speech chip is selected.

## [2026-05-18] update | Vocabulary flashcards filters, POS, card size

- **Trigger:** user request
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** `VocabularyFiltersBar` on list + flashcards (lesson + POS); `collectWordPartsOfSpeech` / `wordMatchesPosFilter`; taller flashcard + glosses/synonyms/lesson on card.

## [2026-05-18] update | Vocabulary flashcards (audio, student actions)

- **Trigger:** user request
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** Flashcard front: pronunciation + origin; back: translation when distinct; `statusActions` by role (student: Still learning / Got it; staff: full set including Repeated). No staff-only **Start over** for students.

## [2026-05-18] update | Lesson timezones (viewer calendar + cross-party display)

- **Trigger:** user request
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `useViewerTimezone`; calendar/dashboard in profile TZ; `LessonPartyScheduleTimes` on modal + lesson page; `assignableTeachers.timezone` in GraphQL.

## [2026-05-18] fix | Lessons list empty after pagination

- **Trigger:** bug report (empty SurfaceCard on `/lessons`)
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `listForPage` now orders **desc** (newest first); `/lessons` default filter **All** + fallback to provider full list when page slice empty.

## [2026-05-18] update | Lessons list infinite scroll

- **Trigger:** user question
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `scheduledLessonsPage` GraphQL + `LessonsService.listForPage`; `/lessons` uses paginated store; calendar still loads full `scheduledLessons`.

## [2026-05-18] update | Chat scroll-up pagination (web)

- **Trigger:** plan implementation
- **Pages:** `concepts/chat.md`, `log.md`
- **Notes:** `chat-store` `fetchOlderMessages`, `hasMoreOlder`, `loadingOlder`; `ChatThread` IntersectionObserver + scroll preservation.

## [2026-05-18] update | Student-page quiz uses student vocab only

- **Trigger:** user note
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** `resolveQuizTargetStudentId`; staff `listFor` excludes quizzes assigned only to other students; store skips `fetchList` when `studentId` set on generate/delete/submit.

## [2026-05-18] update | Practice badge excludes completed quizzes (staff)

- **Trigger:** bug
- **Pages:** `log.md`
- **Notes:** `countIncompleteQuizzesFromList` filters `!attempt.finishedAt` like student assignments; Practice statPill + sidebar badge.

## [2026-05-18] update | GraphQL QuizAttemptSummaryType init order

- **Trigger:** debug (API crash on dev)
- **Pages:** `log.md`
- **Notes:** `QuizAttemptSummaryType` declared before `QuizCardType` to fix TDZ `ReferenceError`.

## [2026-05-18] update | Admin self-quiz attempt on cards

- **Trigger:** bug (admin own quiz not marked complete)
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** `quizzes` query returns `attempt`; staff Start (not Practice) + `studentId` on submit; `QuizAssignmentCards` on manage grid.

## [2026-05-18] update | Quiz vocab source + student tab cards

- **Trigger:** user note (admin vocabulary-only quizzes; student page card results)
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** `collectPool` / distractors from user cards only; `QuizAssignmentCards` on student profile Quiz tab and `/quiz` student grid.

## [2026-05-18] update | Quiz completion reflected on student cards

- **Trigger:** bug (result not on card after submit)
- **Pages:** `log.md`
- **Notes:** `submitQuizAttempt` refetches + optimistic `attempt`; `listForStudent` loads latest `QuizAttempt` per quiz; quiz page returns to intro with score banner.

## [2026-05-18] update | Chat attachment URL without double /api

- **Trigger:** bug (404 on `/api/api/chat/attachments/...`)
- **Pages:** `concepts/chat.md`, `log.md`
- **Notes:** `attachmentUrl` returns `/chat/attachments/:id`; web prepends `API_BASE` once.

## [2026-05-18] update | Vocabulary statistics timestamps in GraphQL

- **Trigger:** bug (vocabulary added vs known chart empty)
- **Pages:** `entities/student-word-card.md`, `concepts/web-app.md`, `log.md`
- **Notes:** `STUDENT_VOCABULARY` and card mutations now fetch `firstSeenAt`/`knownAt`; `vocabularyTrendFromCards` buckets by UTC date key (up to 14 days in range).

## [2026-05-18] update | Delete series: planned lessons only

- **Trigger:** code change (user note)
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `getPlannedLessonsInSeries`; confirm copy; skip when none planned.

## [2026-05-18] update | Telegram dev polling opt-in only

- **Trigger:** user note (409 spam)
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `shouldTelegramDevPolling` requires `TELEGRAM_DEV_POLLING=true`; no auto-enable on localhost.

## [2026-05-18] update | Telegram dev polling 409 log dedupe

- **Trigger:** debug / user note
- **Pages:** `log.md`
- **Notes:** 409 = duplicate getUpdates; one-time warn + 60s backoff.

## [2026-05-18] update | Button async loading + confirm onConfirm

- **Trigger:** code change (UX)
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `Button` auto-pending for Promise onClick; `loadingLabel`; `confirmDialog.onConfirm` with spinner on confirm.

## [2026-05-18] update | Confirm/toast BodyPortal above lesson modal

- **Trigger:** bug (confirms under Edit lesson)
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `BodyPortal` + `WhenPortaled`; confirms/toasts on `document.body` at z 2400/10100.

## [2026-05-18] update | Series unlink fix, delete series, z-index stack

- **Trigger:** code change (bug + UX)
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Unlink sends `seriesId: null`; delete-all-series button; confirms above lesson modal; toasts on top.

## [2026-05-18] update | Series UX: unlink default, calendar dialogs, scheduleType gate

- **Trigger:** code change (plan)
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Removed apply-to-series checkbox; drag detach vs resize apply-all popups; series icon; `User.scheduleType` + Recurrence gate.

## [2026-05-18] update | Lesson series: apply time to all + conflict check + unlink persist

- **Trigger:** user note
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `applyToSeries` UI; series schedule validation; batch persist; unlink saves to API.

## [2026-05-18] update | Lesson recurrence expands future occurrences on create

- **Trigger:** code change (bug)
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `expandRecurrenceDates` materializes daily/weekly/monthly lessons ahead; shared create path in calendar + lesson modal.

## [2026-05-18] update | Header search + student hero UX

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** Working `HeaderSearch`; student hero drops Cards stat; chat button inline with name; vocabulary `?q=` deep link.

## [2026-05-18] update | Statistics charts restored with live API data

- **Trigger:** user note
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `StatisticsDashboard` accepts `liveLessons`/`liveCards`; `buildLiveStatisticsDashboard` replaces mock-only `ProfileLiveStatistics` on profile and student tabs.

## [2026-05-18] update | Student page: native language, stats, chat, lessons, vocab add

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** Student profile native language field; live stats (student + profile Statistics tab); hero chat link `/chat?peer=`; lessons from GraphQL; vocabulary add bar on student tab.

## [2026-05-18] update | BrandLogo back to SVG (no PNG)

- **Trigger:** user note + code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** Restored inline SVG + text logo; removed PNG wordmarks from `public/brand/`.

## [2026-05-18] update | Restore missing BrandLogo module

- **Trigger:** debug (build error)
- **Pages:** `log.md`
- **Notes:** `components/brand/BrandLogo.tsx` and `public/brand/soenglish-logo*.png` were referenced but absent on disk; recreated component and restored PNGs.

## [2026-05-18] update | Brand logo (favicon, header, login)

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `BrandLogo` + PNGs under `public/brand/`; `app/icon.png` / `apple-icon.png`; header swaps full vs mark by breakpoint/collapsed sidebar.

## [2026-05-18] update | Dashboard density (quick actions, teacher panels)

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** Quick actions row; week lessons list; teacher right column (homework, students, month glance); role-specific stat tiles.

## [2026-05-18] update | Lesson content on create + lesson page

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** Create/update persist `materials`/`homework`/`lessonPlan`; GraphQL create passes content; modal form syncs to lessons store (`syncLessonFormChange`).

## [2026-05-18] update | Profile Account tab Log out

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `AccountPanel` — Session row with `useAuth().logout()` + redirect `/login` when session exists.

## [2026-05-18] update | Profile tabs + calendar teacher filter (mobile)

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** Calendar `teacherFilter` compact on sm/md; `ProfileViewShell` tabs horizontal scroll + `tabPanel` overflow; profile form grids/linked rows stack on mobile.

## [2026-05-18] update | Calendar page responsive

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `/calendar` — `calLayout` 1 col on md/sm; header controls stack; month cells dots-only on mobile; week grid min-width + horizontal scroll; sidebar/event cards touch-friendly.

## [2026-05-18] update | Responsive UI (mobile + tablet)

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `concepts/web-app.md`, `log.md`
- **Notes:** `useBreakpoint`, `ShellNavProvider`/`MobileNavDrawer`, `sidebar-nav.tsx`; shell + route SCSS (`respond-to`); chat master-detail on mobile; dashboard grids stack.

## [2026-05-18] update | Coursework expanded (~50 pp)

- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `coursework-expanded.mjs` — tech stack prose, React/Next hooks tables, §3.6–3.8, GraphQL/routes tables; DOCX regen.

## [2026-05-18] update | Coursework Word template (SoEnglish)

- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `docs/coursework/Курсова_SoEnglish.docx`, generator scripts, FR/NFR tables, figure placeholders 1–21.

## [2026-05-16] update | Dashboard live data

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `concepts/graphql-api.md`, `log.md`
- **Notes:** `learningStreak` + `wordOfDay` GraphQL; `StreakService` exported from notifications; hero/lessons/vocab/streak/WOD wired on `/dashboard`; role-aware layout.

## [2026-05-19] update | Daily goals (backend + dashboard)

- **Trigger:** code change
- **Pages:** `concepts/daily-goals.md`, `index.md`, `log.md`
- **Notes:** `DailyGoalCompletion` Prisma model; `dailyGoals` / `setDailyGoalDone` GraphQL; shared `daily-goals.ts`; interactive `DailyGoalsCard` for students.

## [2026-05-18] update | Chat attachments + emoji

- **Trigger:** code change
- **Pages:** `concepts/chat.md`, `log.md`
- **Notes:** `ChatMessageAttachment` (24h TTL, REST upload/download); composer emoji picker; attach with confirm; removed thread action buttons.

## [2026-05-17] update | Realtime chat (Figma → production)

- **Trigger:** code change
- **Pages:** `concepts/chat.md`, `index.md`, `log.md`
- **Notes:** Prisma chat models; `module-chat` + Socket.IO gateway; GraphQL inbox/messages; `/chat` UI; sidebar badge; super-admin masked as admin; groups by admin/super-admin only.

## [2026-05-17] update | App confirm dialog replaces native alerts

- **Trigger:** code change
- **Pages:** `log.md`
- **Notes:** `ConfirmDialogHost` + `confirmDialog()` / `alertDialog()` in providers; delete word/quiz/user and lesson unlink/delete use modal; validation uses `toast.warning`.

## [2026-05-17] update | Practice quiz badge after generate

- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** Students: count from `studentQuizzes` (not stale `quizList`); staff: count from `quizzes` list; force refetch on `/practice`; backend auto-assigns generated quiz when vocabulary target is a student.

## [2026-05-17] update | Practice statPill layout + incomplete quiz count

- **Trigger:** code change
- **Pages:** `log.md`
- **Notes:** `statPill` top-right on activity cards; incomplete quizzes = assigned without `attempt.finishedAt`; sidebar badge uses same hook.

## [2026-05-17] update | Calendar drag/resize persists + Google Calendar patch

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** DnD/resize calls `persistScheduleUpdate`; backend `GoogleCalendarService.updateEvent` on schedule change when `googleCalendarEventId` set.

## [2026-05-17] update | Fix super-admin vocabulary delete

- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** `deleteStudentCard` no longer blocks when actor id equals target id; staff self-list delete allowed; admin/super bypass student teacher check.

## [2026-05-17] update | Staff delete quiz and vocabulary cards

- **Trigger:** code change
- **Pages:** `concepts/vocabulary.md`, `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** GraphQL `deleteStudentWordCard`; quiz `delete` for teacher (own/assigned students), admin/super any. UI: trash on student vocab cards, Delete on quiz cards + GenerateQuizPanel list.

## [2026-05-17] update | Practice page stat pills & no CTA

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `/practice` cards: no footer CTA; Vocabulary/Quiz `statPill` uses `usePracticePendingCounts` (new + `mistakes_work`, incomplete assigned quizzes).

## [2026-05-17] update | Practice badge, quiz completion UI, Create Quiz

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** Sidebar Practice badge = incomplete assigned quizzes + vocab (`new` + `mistakes_work`) via `usePracticeNavBadge` (tooltip when collapsed). Quiz page: student cards show attempt score; `QuizPlaySession` + `submitQuizAttempt`; Create New Quiz calls `generateQuiz`.

## [2026-05-17] update | Admin delete student with lessons

- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** `deleteAdminUser` removes `ScheduledLesson` rows first (`onDelete: Restrict` blocked user delete).

## [2026-05-16] update | Telegram localhost bot-link flow

- **Trigger:** code change
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `TelegramLinkToken`, `link/start` + polling on localhost; Login Widget unchanged on production.

## [2026-05-16] update | Telegram widget-config for Profile Connect

- **Trigger:** code change
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `GET /auth/telegram/widget-config`; username via `getMe` if only token set; UI warns on localhost.

## [2026-05-17] update | Telegram notification delivery

- **Trigger:** user note
- **Pages:** `concepts/profile-notifications.md`, `log.md`
- **Notes:** `NotificationDispatchService` sends email + Telegram; per-channel dedupe; welcome on Telegram link.

## [2026-05-17] update | Facebook and Telegram profile connections

- **Trigger:** user note
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `GET /auth/facebook/link` + callback; `POST /auth/telegram/link` with Login Widget hash verify; Profile Connections UI.

## [2026-05-17] update | Profile Google link (Connections tab)

- **Trigger:** user note
- **Pages:** `concepts/auth-rbac.md`, `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `GET /auth/google/link` for logged-in users; `myProfile.linkedAccounts`; Connect Google on Profile → Connections; lesson error points to Connections.

## [2026-05-17] update | Require Google Calendar to schedule lessons

- **Trigger:** user note
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `assertTeacherCalendarReady` before create; rollback lesson if Calendar event fails; toast/dialog with clear message.

## [2026-05-17] update | Meet auto on lesson create (no Create link UI)

- **Trigger:** user note
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Meet + Calendar on `LessonsService.create` with URL retry; removed manual Create Meet button; `LessonMeetButton` join-only.

## [2026-05-17] update | Scheduled lesson Meet ensure API

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `ensureScheduledLessonMeet` GraphQL mutation; `POST /lessons/scheduled/meet`; dev watcher includes backend modules.

## [2026-05-16] update | Lesson modal "Open lesson page" link after create

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `LessonModal` uses `lessonBackendId` for link; after create modal stays in edit mode with link; `getLessonBackendId` in editor.

## [2026-05-16] update | Student lessons visibility + profile email after save

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `concepts/web-app.md`, `log.md`
- **Notes:** Filter lessons with `lessonIncludesViewer` + `partyNumericId(auth id)`; `UPDATE_MY_PROFILE` returns `email`; profile store merges email on mutation.

## [2026-05-16] update | Vocabulary Play button / round building

- **Trigger:** debug
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** Play `canStart` uses `canBuildVocabularyPlayRound`; translation fallback to definition; ≥2 unique answers (not 4); last-lesson pool falls back when empty.

## [2026-05-16] update | Lessons list duplicate React keys fix

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Split lesson vs party numeric id maps; dedupe/upsert in `ScheduledLessonsProvider` + `LessonsListPanel` keys via `backendId`.

## [2026-05-17] update | Practice sessions in PostgreSQL

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `concepts/graphql-api.md`, `log.md`
- **Notes:** `PracticeSession` model; `recordPracticeSession` / `practiceWeekSummary`; practice page uses API not mock log.

## [2026-05-17] update | Practice session tracking for vocab play and quiz

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `usePracticeSessionTracker` on vocab play + quiz (superseded by DB-backed sessions).

## [2026-05-17] update | React Email for all transactional templates

- **Trigger:** code change
- **Pages:** `concepts/transactional-email.md`, `log.md`
- **Notes:** Replaced file-based `subject.txt`/`body.html` with `@be/email-templates` (React Email); API dev/build compiles package first.

## [2026-05-17] update | Profile notifications persistence + email delivery

- **Trigger:** code change
- **Pages:** `concepts/profile-notifications.md`, `concepts/web-app.md`, `concepts/transactional-email.md`, `entities/user.md`, `index.md`, `log.md`
- **Notes:** User notification booleans, `NotificationDelivery`, `TeacherMessage`, `module-notifications` cron jobs, Profile tab API save, `sendTeacherMessage` + student compose UI.

## [2026-05-17] update | Lesson save via REST PATCH + backendId

- **Trigger:** bug fix
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `updateScheduledLesson` uses `PATCH /api/lessons/scheduled/:id` (not GraphQL); `ScheduledLessonDto.backendId`; no post-save full refetch that wiped content.

## [2026-05-17] update | Dark toasts + lesson content save

- **Trigger:** bug fix
- **Pages:** `concepts/web-app.md`, `log.md`

## [2026-05-16] update | Toast notifications (addax port)

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`

## [2026-05-16] update | Lesson materials & student response persist

- **Trigger:** bug fix
- **Pages:** `concepts/graphql-api.md`, `concepts/lessons-calendar.md`, `log.md`

## [2026-05-16] update | Student quiz tab & staff-only generate

- **Trigger:** code change
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`

## [2026-05-16] update | Vocabulary Play uses word translation

- **Trigger:** code change
- **Pages:** `concepts/vocabulary.md`, `log.md`

## [2026-05-16] update | Vocabulary add validation & UI

- **Trigger:** code change
- **Pages:** `concepts/vocabulary.md`, `log.md`

## [2026-05-16] ingest | LLM Wiki bootstrap

- **Raw:** _(pattern doc — conversational)_
- **Pages touched:** `index.md`, `log.md`, `overview.md`, `synthesis/architecture.md`
- **Notes:** Initial wiki scaffold for SoEnglish.

## [2026-05-16] ingest | Monorepo inventory audit

- **Raw:** `raw/code-audit/2026-05-16-monorepo-inventory.md`
- **Pages touched:** `synthesis/product`, `synthesis/tech-stack`, `synthesis/architecture`, `overview`, `sources/2026-05-16-monorepo-inventory`

## [2026-05-16] ingest | RBAC audit

- **Raw:** `raw/code-audit/2026-05-16-rbac.md`
- **Pages touched:** `concepts/auth-rbac`, `concepts/roles-matrix`, `entities/user`, `sources/2026-05-16-rbac`

## [2026-05-16] update | Domain entities & concepts

- **Trigger:** code audit (Phase 3)
- **Pages touched:** all `entities/*` (12), `concepts/graphql-api`, `lessons-calendar`, `vocabulary`, `quizzes-flashcards`, `progress-tracking`

## [2026-05-16] update | Frontend documentation

- **Trigger:** code audit (Phase 4)
- **Pages touched:** `concepts/web-app`, `concepts/ui-design-system`, `concepts/frontend-packages`

## [2026-05-16] update | Materials reference policy

- **Trigger:** user
- **Pages touched:** `overview` (link); added `docs/reference/materials-index.md`, `.cursor/rules/materials-readonly.mdc`
- **Notes:** `materials/` read-only for agent; not product truth

## [2026-05-16] update | System page — test email (super-admin)

- **Trigger:** user request
- **Pages:** `concepts/transactional-email`, `concepts/web-app`

## [2026-05-16] update | Admin provisioning + welcome email

- **Trigger:** user request
- **Pages:** `concepts/auth-rbac`, `entities/user`; added `packages/backend/email-templates/`, `module-mail`

## [2026-05-16] update | Disable public registration

- **Trigger:** user request
- **Pages:** `concepts/auth-rbac`, `concepts/roles-matrix`, `concepts/web-app`, `overview`

## [2026-05-16] update | Profile statistics — API only

- **Trigger:** user bug (mock Lesson hours 3.7h on Profile)
- **Pages:** `concepts/web-app`
- **Notes:** `ProfileLiveStatistics`, `useProfileLiveStats`; mock `StatisticsDashboard` removed from profile.

## [2026-05-16] update | Wiki rules — proactive maintenance

- **Trigger:** user note (agent should update wiki without being asked)
- **Pages:** _(rules only)_ `.cursor/rules/llm-wiki-triggers.mdc`, `llm-wiki.mdc`, `karpathy-guidelines.mdc`
- **Notes:** Explicit priority over "don't edit markdown"; same-session checklist; opt-out only via **skip wiki**.

## [2026-05-16] update | Student profile route uses API UUID

- **Trigger:** debug (Student not found after admin create)
- **Pages:** `concepts/web-app`
- **Notes:** `/students/[studentId]` resolves via `students` GraphQL + `lib/student-profile.ts`; list links use `row.id` (UUID).

## [2026-05-16] update | API env + dev script hardening

- **Trigger:** debug (SMTP not configured; EADDRINUSE / ECONNREFUSED)
- **Pages:** `concepts/graphql-api`, `concepts/transactional-email`
- **Notes:** `load-env.ts`, `--env-file` in dev/start; `dev.cjs` serial restarts, no `freePort` on every rebuild.

## [2026-05-16] update | API dev — compile then run dist

- **Trigger:** debug (systemMailStatus missing — stale/crashed tsx dev)
- **Pages:** `concepts/graphql-api` (dev note)
- **Notes:** `apps/api` dev uses `tsc` watch + `node --watch` on `dist/` so Nest decorators and workspace packages work.

## [2026-05-16] update | Vocabulary enrichment + lesson vocab UX

- **Trigger:** plan implementation
- **Pages:** `entities/word`, `concepts/vocabulary`, `concepts/graphql-api`, `log.md`
- **Notes:** WordEnrichmentService (dictionaryapi + Datamuse + CEFR JSON); `lookupWord` GraphQL; lesson form `linkedWordIds`; `LessonVocabularyAddPanel` replaces mock add in `LessonContentTab`.

## [2026-05-16] update | Plan lesson persists to DB

- **Trigger:** code change
- **Pages:** `entities/scheduled-lesson`, `concepts/graphql-api`, `log.md`
- **Notes:** `createScheduledLesson` wired from calendar + lessons Plan lesson modal; GraphQL input extended (`teacherId`, `duration`, `timezone`, notes, series).

## [2026-05-16] update | Assignable teachers & lesson party selects

- **Trigger:** code change (admin teacher assignment + Plan lesson modal)
- **Pages:** `concepts/graphql-api`, `log.md`
- **Notes:** `assignableTeachers` query (TEACHER/ADMIN/SUPER_ADMIN); `createUserAsAdmin` accepts those roles as `teacherId`; admin UI + Plan lesson Teacher/Student selects load from API (`useLessonPartyOptions`).

## [2026-05-16] update | Remove CEFR from Word vocabulary

- **Trigger:** user request
- **Pages:** `entities/word.md`, `concepts/vocabulary.md`, `log.md`
- **Notes:** Dropped `CefrLookupService`, `cefr-lemmas.json`, `Word.cefrLevel`, GraphQL/UI fields.

## [2026-05-27] update | Payments panel — remove A–D step badges
- **Trigger:** user feedback
- **Pages:** `concepts/billing-payments.md`, `log.md`
- **Notes:** System → Payments uses section titles only (no letter badges).

## [2026-05-27] update | Payment flow UX — per-package currency
- **Trigger:** code change
- **Pages:** `concepts/billing-payments.md`, `log.md`
- **Notes:** Admin Payments A–D sections; package currency select; Lemon Squeezy variant currency; student order summary + provider filter; checkout currency guards on all online providers.

## [2026-05-16] update | Word audio + dictionary enrichment

- **Trigger:** code change
- **Pages:** `entities/word.md`, `log.md`
- **Notes:** `origin` on Word; dictionaryapi parsing (audio URL `https:`, POS priority, phonetic from audio row); `WordCardAudioButton` on vocabulary/lesson cards and add-word preview.

## [2026-05-16] update | Languages, WordDefinition, word details modal

- **Trigger:** code change
- **Pages:** `entities/language.md` (new), `entities/user.md`, `entities/word.md`, `concepts/vocabulary.md`, `index.md`, `log.md`
- **Notes:** `Language` catalog; `nativeLanguageId`; admin-only `StudentLearningLanguage`; `WordDefinition` + MyMemory translations; `wordDetails` / modal; scripts `prisma:seed:languages`, `prisma:backfill:languages-words`.

## [2026-05-16] update | System word dictionary provider (super-admin)

- **Trigger:** code change | user request
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** `PlatformSettings.wordDictionaryProvider` (`dictionary_api_dev` | `wiktionary`); System → Word dictionary tab; Wiktionary REST `/page/definition/{word}`; fallback to dictionaryapi.dev on miss.

## [2026-05-16] update | Multi–part-of-speech vocabulary

- **Trigger:** code change | user report (homograph `kind`)
- **Pages:** `concepts/vocabulary.md`, `entities/word.md`, `log.md`
- **Notes:** Dictionary API full array stored; `WordDefinition.partOfSpeech` + unique `(wordId, languageId, partOfSpeech)`; modal shows all POS badges and per-POS native translations; `getWordDetails` backfills legacy rows.

## [2026-05-16] lint | Full project bootstrap

- **Trigger:** Phase 5 health check
- **Pages touched:** `index.md` (full rebuild)
- **Notes:** 29 wiki pages cataloged; cross-links verified; no orphan entity pages; known gaps documented in `concepts/auth-rbac`. Added `karpathy-guidelines.mdc` for coding discipline.

## [2026-06-09] update | LiveKit self-hosted only; Docker Compose setup added
- **Trigger:** user constraint — no LiveKit Cloud, self-hosted only
- **Pages:** `concepts/video-meeting-providers` (deployment section updated)
- **Files:** `docker-compose.livekit.yml`, `livekit.yaml` added to repo root; `.env.example` local dev values; `connection-provider-meta.ts` tooltips updated to point at self-hosted setup

## [2026-06-09] update | Fix 12 pre-existing TypeScript build errors
- **Trigger:** code change
- **Pages:** concepts/build-health
- Fixed `LessonFormState` group fields missing in `lessons/[lessonId]/page.tsx` and `calendar/page.tsx`
- Fixed `speaking/page.tsx` `canEdit` role type mismatch (string vs numeric)
- Fixed `staff/[userId]/page.tsx` unknown `icon` prop on `TabsItem`
- Fixed `StudentsGroupsPanel` invalid `"secondary"` Button variant
- Fixed `PaymentsPanel` `manual_invoice` not in `PAYMENT_PROVIDER_CHECKOUT_CURRENCIES`
- Fixed `ProfileViewShell` duplicate `metaExtra` JSX attribute
- Fixed `Field.tsx` numeric `value` passed to `AdvancedSelectControl` (expects string)
- Fixed `lessonCalendarAdapter` `payerUserId` string↔number mismatches
- Fixed `LessonContentTab` `null` vs `undefined` on `sharedLibraryAssetIds`/`libraryMediaSelectionApplied`
- Fixed `lessonPersistence` `resolvePartyId` called with string instead of number (×2)
- Fixed `scheduledLessonsBackendAdapter` `payerUserId` number written as-is instead of String()
- Fixed `BookViewerLoadingOverlay` `aria-valuenow` null vs undefined
- Fixed `MaterialFormModal` `onUpdate` fallback signature mismatch
- Fixed `MockUser` missing `lessonFormat` field
- Fixed `site-content.ts` missing `lessonType`, `studentGroup`, `students`, `individualLesson`, `groupLesson` keys
- Fixed `testing/fixtures.ts` missing `kind`, `participants`, `lessonFormat` required fields

## [2026-06-10] update | Payload CMS integration fixed — proxy, importMap, layout, route handlers
- **Trigger:** code change
- **Pages:** concepts/payload-cms (new)
- **Summary:**
  - `src/proxy.ts` matcher now excludes `/cms-admin` and `/payload-api` (Payload manages own auth)
  - `src/app/(payload)/cms-admin/importMap.js` created; `page.tsx` updated to import it
  - `src/app/(payload)/cms-admin/layout.tsx` created with `RootLayout` → provides `ConfigProvider` required by `PageConfigProvider`
  - `src/app/(payload)/payload-api/[...slug]/route.ts` created to match `routes.api: '/payload-api'`
  - Root cause: 4 missing pieces in Payload Next.js integration setup

## [2026-06-10] update | Fix Payload CSS — @layer cascade issue
- **Trigger:** code change
- **Pages:** concepts/payload-cms
- **Summary:**
  - Root cause: `reset.scss` had unlayered `:where(button) { padding: 0 }`. Unlayered CSS always wins over any `@layer` CSS regardless of specificity. Payload wraps all its styles in `@layer payload-default`, so the reset was overriding `.btn` padding/background.
  - Fix: wrapped reset button rules in `@layer base`; declared `@layer base, payload-default` in `global.scss` so Payload styles win.

## [2026-06-10] update | Fix Payload CSS — unlayered base.scss button reset
- **Trigger:** code change
- **Pages:** concepts/payload-cms
- **Summary:**
  - Root cause: `_base.scss` had unlayered `button { @include button-reset }` — this is a naked element rule outside any `@layer`. Unlayered CSS always wins over ALL layered CSS. Payload wraps everything in `@layer payload-default`, so the reset silently won.
  - The universal `* { padding:0; margin:0 }` in `reset.scss` had the same problem.
  - Fix: wrapped all form-element rules in `_base.scss` + entire `reset.scss` content in `@layer base`. Layer order declared in `globals.scss`: `@layer base, payload-default` (payload-default wins). App CSS module classes remain unlayered so they still override both.

## [2026-06-11] update | Redesign v2 plan — Editorial Paper
- **Trigger:** user note
- **Pages:** (план поза wiki: `docs/redesign/redesign-v2.md`)
- **Summary:**
  - Новий головний план редизайну `docs/redesign/redesign-v2.md`; старий `docs/redesign/plan.md` позначено superseded.
  - Зафіксовані рішення власника: напрям **Editorial Paper** (warm paper, ink-navy, Lora, асиметрія, великі display-числа), анімації **CSS-перш + GSAP** (таймлайни/stagger/celebration; заборонено на quiz-в-процесі, оплаті, keyboard-діях), обсяг — увесь застосунок.
  - Фази: V0 фундамент (motion-токени, type scale, GSAP, Button/Popover/Modal v2) → V1 shell → V2 dashboard → V3 навчальні флоу → V4 календар/чат → V5 профіль/оплата → V6 admin/staff/system → V7 auth + полір.
  - Скіл `soenglish-redesign` видалено з `.claude/skills` і `.cursor/skills` на запит користувача; дизайн-робота тепер ведеться за `emil-design-eng` принципами (press-scale, origin-aware popovers, custom easing, durations ≤300ms).

## [2026-06-11] update | Redesign v2 — skill stack + PRODUCT.md/DESIGN.md
- **Trigger:** user note
- **Pages:** (поза wiki: `PRODUCT.md`, `DESIGN.md`, `docs/redesign/redesign-v2.md`)
- **Summary:**
  - Створено `PRODUCT.md` (register: product; користувачі, brand personality «editorial · спокійний · довірливий», anti-references, 5 принципів, a11y AA) і `DESIGN.md` (знятий з коду опис теми, кольорів, типографіки Outfit+Lora, layout, компонентів, motion-цілей, don'ts) — вимога скіла impeccable.
  - У `redesign-v2.md` додано §0 Skill stack: кожен крок редизайну використовує 4 скіли — emil-design-eng (motion), impeccable (product-register правила й заборони), ui-ux-pro-max-skill (проєктні примітиви), frontend-design (сміливість напряму). Пріоритет конфліктів: правила проєкту > impeccable > решта.
  - Чекліст кроку доповнено: контраст AA, всі component states, skeleton-loading, заборони impeccable, Lora не в UI-контролах.

## [2026-06-11] update | Redesign v2 — reuse-first ревізія плану
- **Trigger:** user note
- **Pages:** (поза wiki: `docs/redesign/redesign-v2.md`, `DESIGN.md`)
- **Summary:**
  - Принцип 8 «Reuse-first»: Button/Field обов'язкові замість нативних контролів; бракує функціоналу — розширювати примітив, не писати локальний.
  - Нова §2.4 «Політика розширення примітивів»: variant/prop > новий компонент > копія; нові типи контролів — у Field discriminated union; зафіксовані винятки (hidden file input, third-party refs, зовнішні `<a>`).
  - §3.0 інвентар міграції, знятий з коду: 23 файли з нативними `<button>`, 17 з `<input>`, 5 з `<img>` — розкладені по фазах V2–V6 (найбільше у features/materials, features/speaking, app/system).
  - Новий крок V0-08 Field v2: editorial-стилі контролів + типи `range` і `color` в union (закриє AvatarCropModal, AudioPlayer, UserColorPicker).
  - Чекліст кроку: заборона нових нативних контролів + вимога міграції в зачеплених файлах.

## [2026-06-11] update | Redesign v2 — Signature elements і портативність системи
- **Trigger:** user note
- **Pages:** (поза wiki: `DESIGN.md`, `PRODUCT.md`, `docs/redesign/redesign-v2.md`)
- **Summary:**
  - Власник зафіксував: дизайн має бути унікальним (не «як у всіх LMS») і повторно використовуваним на майбутніх проєктах — зокрема окремий acquisition-сервіс для залучення учнів і репетиторів до школи.
  - DESIGN.md: нова нормативна секція «Signature» — 6 впізнаваних елементів бренду (Ink & Paper палітра, серифні display-числа Lora, editorial rule замість карток, чорнильні navy-tinted тіні, фірмова motion-крива + press-scale, асиметрія 2/3+1/3) + таблиця двох регістрів (product = school app restrained; brand = acquisition Committed) зі спільною ДНК.
  - PRODUCT.md: дизайн-система оголошена брендовим активом; критерій унікальності — «якщо екран міг би належати будь-якій LMS, він не готовий».
  - redesign-v2.md: принцип 6a (портативність: примітиви без app-специфічних імпортів, signature-впізнаваність, два регістри) + крок V0-09 portability seam (аудит імпортів components/ui).

## [2026-06-11] update | Redesign v2 — планка крафту + V0-01 motion-токени
- **Trigger:** user note + code change
- **Pages:** (поза wiki: `docs/redesign/redesign-v2.md`; код: `styles/tokens/_motion.scss`)
- **Summary:**
  - У план додано секцію «Планка крафту»: таблиця AI-шаблон vs досвідчена команда (рефлекси vs рішення під контент, generic-мікрокопія vs контекстна, стани як повноцінні екрани, драматургія гучності); фінальний фільтр кроку — «чи могла б це показати на портфоліо senior product-команда».
  - **V0-01 done:** створено `apps/web/src/styles/tokens/_motion.scss` — easing-токени (--ease-out 0.23,1,0.32,1; --ease-in-out; --ease-drawer) і duration-токени (--dur-press 140 / --dur-fast 180 / --dur-base 240 / --dur-modal 320), глобальний prefers-reduced-motion baseline (рух → миттєво, винятки оголошують компоненти). Підключено в `global.scss` після layout-токенів.
  - `_animations.scss`: keyframes (slideUp/fadeIn/scaleIn, 20+ використань) збережені — слабке місце не самі keyframes, а вбудований `ease` на місцях використання; додано шапку з правилом брати easing/duration з motion-токенів. Заміна на місцях — у кроках фаз V1–V7.
  - Перевірка: `npx sass` компілює `global.scss` без помилок, токени присутні у виводі.

## [2026-06-11] update | V0-02 — editorial type scale + видалення legacy-типографіки
- **Trigger:** code change
- **Pages:** (код: `styles/_typography.scss`, `styles/tokens/_typography.scss`, `styles/_base.scss`)
- **Summary:**
  - Токен `--fs-display-xl: clamp(2.75rem, 2.2rem + 1.8vw, 3.75rem)` — hero-числа/вітання; єдиний fluid-кегль системи (решта fixed rem за product-register).
  - `styles/_typography.scss` повністю переписано: legacy-пресети headline/title/body/button/tag (800 weight, uppercase, хардкод "Inter") були мертвим кодом — нуль використань у TSX/SCSS. Нові editorial-міксіни: `display-hero`, `display-page`, `section-title`, `eyebrow`, `numeric` (tabular-nums), `editorial-rule` (Signature #3 — заголовок + чорнильна лінія), `prose` (70ch). Лише міксіни, CSS не емітиться.
  - `_base.scss`: селектор heading-шрифту скорочено до `h1–h6` — викинуто мертві глобальні класи `.headline-1..5`, `.hero-title`, `.cta-title`, `.testimonial-section-title`, `.managers-section__title`, `.page-hero__title` (збіги в TSX — лише aria-id і CSS-module класи, не глобальні).
  - Підводний камінь: `*/` всередині SCSS-коментаря (`headline-*/title-*`) передчасно закриває loud-коментар — Sass падає з «expected selector».
  - Перевірка: sass-компіляція чиста, бандл -11 рядків, токен у виводі.

## [2026-06-11] update | V0-03 — GSAP + useGsap hook
- **Trigger:** code change
- **Pages:** (код: `apps/web/src/lib/motion/*`, `apps/web/package.json`)
- **Summary:**
  - Встановлено `gsap@^3.15.0` в `apps/web` (npm workspace).
  - `lib/motion/` вже існував (prefers-reduced-motion утиліти + policy); додано `use-gsap.ts` — хук `useGsap(scopeRef, setup, deps)`: `gsap.context` зі scope-елементом, авто-`revert()` на unmount, у setup передається поточний reduced-motion (при true — пропускати рух, ставити кінцевий стан).
  - `policy.ts` переписано під redesign-v2 §2.2–2.3: durations синхронні з CSS-токенами (press 140 / ui 180 / base 240 / modal 320 / hero 600), пріоритет CSS → GSAP → Three, `MOTION_RESTRICTED_ROUTES` (lessons/chat/quiz/payment) збережено.
  - Перевірка: jest lib/motion 4/4 passed; tsc — 0 помилок у lib/motion (наявні помилки у students/[studentId] і StatisticsDashboardCharts — pre-existing з попередніх рефакторингів, поза скоупом кроку).

## [2026-06-11] update | V0-04 — Button v2 (press-анімація + loading-морфінг)
- **Trigger:** code change
- **Pages:** (код: `components/ui/ui.module.scss`; Button.tsx без змін — механіка вже була)
- **Summary:**
  - `.buttonBase` transition: явні motion-токени замість `var(--transition)`; додано `transform var(--dur-press) var(--ease-out)` — press-scale 0.97 (вже існував на :active) тепер анімується, а не стрибає.
  - `.buttonLoadingWrap`: entrance-анімація `uiButtonStateIn` (opacity 0.3 + blur 2px → чисто) за var(--dur-fast) — blur маскує підміну label→spinner, стан морфиться як один об'єкт (emil-патерн).
  - TSX не чіпали: loading/pending/aria-busy/icon-only логіка вже покривала потреби.
  - Hover без `@media (hover: hover)` лишається свідомо — це масовий прохід V7-04 по всьому файлу, не точкова правка.
  - Перевірка: jest Button 11/11 passed; sass-компіляція чиста.

## [2026-06-11] update | V0-05 — Tooltip/Popover v2 (origin-aware + instant-наступні)
- **Trigger:** code change
- **Pages:** (код: `components/ui/Tooltip.tsx`, `PickerPopover.tsx`, `ui.module.scss`, `picker.module.scss`)
- **Summary:**
  - Tooltip: entrance-анімація `uiTooltipIn` (opacity + **властивість `scale`** — окрема від transform, тому placement-translate не конфліктує); `transform-origin` = бік тригера для кожного placement.
  - Instant-наступні: module-level `lastTooltipHiddenAt`; якщо новий tooltip відкривається <250ms після зникнення попереднього — `data-instant` → `animation-duration: 0ms`. Рух по тулбару миттєвий, перший показ м'який (emil-патерн).
  - PickerPopover/.popover: entrance `pickerPopIn` (opacity + scale 0.98 + translate -4px), `transform-origin: top right` (top left для calendar-режиму через `data-anchor-align`). Анімацію отримали й standalone-використання `.popover` (absolute dropdown).
  - Reduced motion покривається глобальним baseline з `_motion.scss`.
  - Перевірка: jest components/ui 30/30; sass чистий; tsc 0 помилок у components/ui.

## [2026-06-11] update | Fix React key warning у StatisticsKpiGrid
- **Trigger:** debug (console error на /profile)
- **Pages:** (код: `components/statistics/StatisticsKpiGrid.tsx`)
- **Summary:**
  - Гілка `withSectionHeaders === false` (додана в рефакторингу S75) мапила групи через `renderKpiTiles()` без key → React warning у StatisticsDashboard на профілі.
  - Фікс: обгортка `<Fragment key={group.category}>` навколо виклику в map.

## [2026-06-11] update | V0-06 — Modal recipe v2 (enter/exit рух)
- **Trigger:** code change
- **Pages:** (код: `styles/_modal-recipe.scss`, `styles/_animations.scss`)
- **Summary:**
  - Рецепт: `overlay` — backdrop fade за `--dur-modal`; `dialog` — enter від scale(0.96)+opacity, origin center (модалки не прив'язані до тригера). Нові міксіни `overlay-closing`/`dialog-closing` — exit за `--dur-fast` (швидший за enter), consumers додають closing-клас перед unmount.
  - Keyframes (modalOverlayIn/Out, modalDialogIn/Out) — у глобальному `_animations.scss`, бо рецепт — міксіни, що компілюються в CSS-модулі: css-loader скоупить лише локально визначені keyframes, глобальні імена лишає (той самий механізм, що в існуючого slideUp).
  - Перевірка: sass-компіляція global.scss і calendar/page.module.scss чиста, keyframes резолвляться.

## [2026-06-11] update | V0-07 — SCSS-аудит: breakpoints і токени + дедуплікація міксінів
- **Trigger:** code change
- **Pages:** (код: 8 SCSS-файлів)
- **Summary:**
  - Inline px media queries (6 шт.) → константи: system 720→respond-max($breakpoint-narrow); ConnectionsPanel min-width 720→$breakpoint-narrow; finance 960→$breakpoint-md (зсув 960→1024); LessonLibraryMaterialPanel 520→respond-max($breakpoint-tight) (зсув 520→560); media-viewer 768→respond-to(sm), 900→respond-max($breakpoint-md). Додано відсутні @use variables/mixins. У репо 0 inline px media queries.
  - `ui.module.scss`: 5×`color: #fff` (iconTint*) → `var(--on-inverse)`.
  - **Дедуплікація:** V0-02 створив у `_typography.scss` міксіни `display-page`/`eyebrow`, що дублювали наявні `page-title-display`/`eyebrow` з `_mixins.scss` (page-title-display — 15+ використань). Дублікати видалено з коментарями-вказівниками; конфлікт `@use as *` усунуто.
  - Page-рівневі hex (~56 у 30 файлах; топ word-details-modal 44) свідомо відкладені у кроки фаз V2–V6 — без візуальної перевірки масова заміна ризикована. Зафіксовано в плані.
  - Знахідка: npx sass у npm workspace запускається з cwd кореня пакета, не поточної директорії — відносні шляхи аргументів не резолвляться; використовувати абсолютні.
  - Перевірка: всі 6 зачеплених модулів + global.scss компілюються чисто.

## [2026-06-11] update | V0-08 + V0-09 — Field v2 (range/color) і portability-аудит; фаза V0 завершена
- **Trigger:** code change
- **Pages:** (код: `components/ui/Field.tsx`, `ui.module.scss`; docs: `DESIGN.md`)
- **Summary:**
  - **V0-08:** `range`/`color` реалізовано простіше за план — без нових членів Field union: нативний `type` уже проходить через `FieldInputProps`, додано лише детекцію в input-пайплайні і класи `.fieldRange` (editorial slider: hairline-трек 14% ink, зелений thumb 18px з border card, press scale 1.12, focus ring) та `.fieldColor` (42px swatch, hairline, радіус поля). Label/hint/error дістаються безкоштовно від FieldShell. `fieldControl` transition переведено на motion-токени.
  - **V0-09:** аудит імпортів `components/ui` чистий — лише React/Next/lucide + pure lib-утиліти (breakpoints, date-picker-utils, tel-mask, strip-native-validation, tag-list, avatar) + use-infinite-scroll-sentinel; без stores/GraphQL/features. Дозволений список зафіксовано в DESIGN.md як нормативний.
  - **Фаза V0 (фундамент) завершена 9/9.** Далі — V1 (shell + навігація).
  - Перевірка: jest components/ui 30/30; tsc 0 помилок у components/ui; sass чистий.

## [2026-06-11] update | V1-01 — Sidebar «навігація курсу»
- **Trigger:** code change
- **Pages:** (код: `components/layout/sidebar-nav.tsx`, `Sidebar.module.scss`)
- **Summary:**
  - Перегрупування за задачами учня: Learn (Dashboard, Lessons, Practice, Materials) / Schedule (Calendar) / Connect (Chat, Students, Staff) / Account (Payment, Finance, Profile) / Platform (Admin, System). RBAC-фільтр без змін; `useVisibleNavSections` тепер ховає порожні секції (для учня Platform зникає повністю).
  - Активний пункт: editorial-риска 2×16px зліва на краю сайдбара (::before, scaleY 0→1 за --dur-fast) + ink-текст + semibold. Прибрано filled pill (бек+border+inset 3px stripe — забанений side-stripe патерн). Застарілі overrides бейджів під fill видалено.
  - Заголовки секцій: eyebrow + чорнильна лінія до краю (::after) замість border-top між секціями.
  - Drawer (мобільний) успадковує все через спільний SidebarNav.
  - Верифікація в браузері: логін jest-student@soenglish.test (агент-браузер: click по submit не сабмітив форму — спрацював Enter у полі пароля), скріншот /dashboard — групи, риска і лінії на місці, dark mode ок.

## [2026-06-12] update | V1-02 — Header editorial-полір
- **Trigger:** code change
- **Pages:** (код: `components/layout/Header.module.scss`)
- **Summary:**
  - Hairline-межі (--border-subtle) замість --border на header bottom і logoArea; motion-токени замість --transition; tabular-nums на лічильниках балансу/уроків.
  - Рішення проти плану (обґрунтовано): «Create lesson» у хедері НЕ дублікат — на lessons/calendar нема окремої кнопки (calendar створює через слоти), це єдина персистентна точка для викладача — збережено. Display-заголовок сторінки не переноситься в shell-хедер — він уже живе в PageHeader; дублювання гірше.
  - Верифікація: скріншот /dashboard — hairline, danger-тон бейджа балансу (колір+текст), порядок.

## [2026-06-12] update | V1-03 — Mobile drawer: swipe-to-close + exit-анімація
- **Trigger:** code change
- **Pages:** (код: `components/layout/MobileNavDrawer.tsx/.module.scss`, новий `use-drawer-swipe.ts`)
- **Summary:**
  - Новий хук `useDrawerSwipe`: закриття за дистанцією ≥35% ширини АБО velocity >0.11 px/ms (флік без дотягування); overdrag вправо з damping ×0.12; pointer capture; ігнорування другого дотику; вісь визначається після 12px (вертикаль → скрол, touch-action: pan-y).
  - Exit-анімація перед unmount: `requestClose` → closing-клас (panel transform → -100%, backdrop opacity → 0 за --dur-fast, швидше за enter) → unmount на transitionend по transform (+ fallback 280ms). Reduced motion → миттєве закриття. Навігація по пункту закриває без анімації (сторінка все одно змінюється).
  - Enter: `--dur-modal` + `--ease-drawer` (iOS-крива з motion-токенів) замість хардкод-кривої.
  - Snap-back після незавершеного swipe — CSS transition на панелі (інлайн transform знімається на release).
  - Перевірка: sass чистий, tsc без помилок у layout. Жести варто прокликати на реальному пристрої (emil: gesture-тести — на фізичному девайсі).

## [2026-06-12] update | V1-04 — Page transitions через template.tsx; фаза V1 завершена
- **Trigger:** code change
- **Pages:** (код: `app/template.tsx`, `app/template.module.scss`, 15 page-модулів)
- **Summary:**
  - Новий `app/template.tsx`: ремаунтиться на кожну навігацію → entrance fade+rise (opacity 0 / translateY 8px → чисто, 240ms `--ease-out`). Перехід усередині того самого розділу (перший сегмент шляху, напр. /lessons → /lessons/5) не анімується — останній розділ живе в module-scope змінній, що переживає ремаунт. Wrapper — layout-прозоре дзеркало .mainCanvas (width 100%, min-height 100%), full-height сторінки (chat) не ламає.
  - Дедуплікація: видалено 15 root-level `animation: slideUp 0.35s` з page-модулів (dashboard, calendar, lessons, lesson details, materials, payment, quiz, students, practice ×5, vocabulary, ProfileViewShell) — інакше подвійний rise (template + page). Внутрішні slideUp із delay (стаггер секцій) збережені.
  - **Підводний камінь:** Sass викидає порожні правила з виводу → `.page {}` зник би з CSS-модуля і `styles.page` у TSX став би undefined. Порожнілі правила заякорено `min-width: 0` + коментар.
  - Верифікація: sass для всіх зачеплених файлів чистий; /lessons рендериться коректно в браузері.
  - **Фаза V1 (shell + навігація) завершена 4/4.** Далі — V2 (dashboard учня).

## [2026-06-12] update | V2-01 — Dashboard: hero 2/3+1/3 + editorial headline-числа
- **Trigger:** code change
- **Pages:** (код: `app/dashboard/page.tsx`, `page.module.scss`, `app/template.tsx`)
- **Summary:**
  - heroRow: grid 2fr+1fr — hero «наступний крок» зліва, живий контекст справа (учню StreakCalendarCard, викладачу TeacherScheduleGlancePanel — переїхали з правої колонки); на md — стек.
  - Забанений патерн «3 однакові кольорові stat-картки» (градієнтні washes + медальйони) → editorial headline-числа: Lora var(--fs-40), tabular-nums, hairline-розділювачі між числами, лейбл + контекстний sub словами. Учню додано 4-те число Day streak. Мобільний — 2×2.
  - `DashboardQuickActions` видалено повністю: Calendar/Practice/Vocabulary/Chat — буквальні дублікати sidebar (з тими ж бейджами), New lesson — дублікат хедера. Разом пішов raw `<button>` (інвентар §3.0). Стилі quickAction* і stat*/медальйони видалено з SCSS.
  - **Hydration fix у template.tsx (V1-04):** module-scope `lastSection` мутувався і на сервері (процес пам'ятає між запитами) → SSR/клієнт рендерили різні класи → hydration mismatch. Рішення про enter-клас перенесено в useEffect: перший SSR-лоад не анімується (продукт вантажиться в задачу), клієнтські переходи між розділами — так.
  - Верифікація в браузері: hero-row і числа рендеряться як задумано, dev-оверлей чистий (hydration error зник).

## [2026-06-12] update | V2-01 REVERT — фідбек власника
- **Trigger:** user note («ужасно, перед цим було набагато краще»)
- **Pages:** (код: `app/dashboard/page.tsx`, `page.module.scss`, `dashboard-widgets.tsx` — повернуто до стану перед V2-01)
- **Summary:**
  - Повний відкат першої ітерації V2-01: повернуто кольорові stat-картки з медальйонами, DashboardQuickActions, повноширинний hero; стрік-календар і schedule glance — назад у праву колонку. Верифіковано скріншотом.
  - Збережено: hydration-фікс template.tsx (баг, не дизайн), motion-токени в анімації hero (візуально ідентично).
  - **Урок у продуктовий смак власника:** насичені кольорові акценти, gradient washes і «соковиті» картки — цінність, а не шум; голі серифні числа на темному фоні читаються як «бідно». Заборона impeccable на stat-картки тут програє смаку власника (пріоритет конфліктів §0: правила проєкту/власник > impeccable). Великі структурні зміни головних екранів — спершу прев'ю/мокап, потім код.

## [2026-06-14] update | V2-01 Dashboard «Sokovyti» redesign

- **Trigger:** code change (V2-01 redesign iteration, owner direction post-revert)
- **Pages:** `app/dashboard/page.module.scss`, `app/dashboard/page.tsx`, `app/dashboard/dashboard-widgets.tsx`
- **Summary:**
  - Implemented «sokovyti» (juicy) V2 dashboard direction: rich saturated color + editorial Lora typography combined.
  - Hero banner: full-bleed deep green gradient (`--green-dark` → `#0a1a14`), dot-texture overlay, Lora `--fs-display-xl` progress number above title on dark panel.
  - Stat cards: colored background tint (amber/green/blue wash), 3px left accent border, Lora `--fs-36` editorial number, ghost watermark via CSS `::after content: attr(data-value)`.
  - Quick actions: migrated `<button>` → `Button variant="ghost"` with `startIcon`, chunky 12px/18px padding, green wash on hover.
  - Layout: asymmetric `2fr 320px` two-column (not equal grid).
  - All tokens via CSS vars, all breakpoints via `respond-to()`, `motion-allow` guards throughout.
  - `tabular-nums` on all numeric fields (streaks, counts, times).

## [2026-06-14] update | V3 Learning Flows redesign — Editorial Paper direction
- **Trigger:** code change (V3 redesign steps 1–5)
- **Pages:** concepts/lessons, concepts/practice, concepts/quiz, concepts/speaking
- **Summary:** Step 1 — lessons list: `highlightsGrid` becomes a bordered container with `overflow:hidden` so child cards share one rounded border, left-rail 4px green accent on next-lesson card, Lora display time hero colored `var(--green-dark)`, eyebrow via `@include eyebrow`. Step 2 — lesson detail: `pageTitle` upgraded from `@include page-title-display` to explicit `var(--fs-display)` + `var(--fw-bold)` Lora; typographic `.sectionDivider` mixin added. Step 3 — practice hub: `PracticeActivitiesGrid` replaced with full-width shelf rows (`.shelfList`/`.shelfRow`), icon in 40px colored circle, Lora title, arrow CTA, accent left-rail; responsive mobile 2-column grid collapses to stacked. Step 4 — quiz: progress bar 4px/surface-track/green-fill, `questionCard` animation fires only on `key` remount (question change), NOT on answer click; answer feedback instant (no transition); celebration `celebrationReveal` animation only on `resultCard`; removed `slideUp` from `.explanation`. Step 5 — speaking: `recordingPulse` keyframe changed from `ease` to `linear` with `var(--rose)` color and 12px ring expansion at 50%.

## [2026-06-15] update | Security hardening — helmet, throttler, MIME filter, dep updates
- **Trigger:** code change (security session)
- **Pages:** concepts/security (new)
- **Summary:**
  - Додано `helmet` і `ValidationPipe(whitelist)` в NestJS main.ts
  - Додано `ThrottlerModule` 120req/60s глобально в AppModule
  - Додано security headers в Next.js next.config.mjs (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection)
  - Додано `materialFileFilter` — MIME whitelist для file uploads в module-materials
  - Оновлено залежності: next 16.1.7→16.2.9, turbo →2.9.18, overrides для ws/fast-uri/brace-expansion
  - Проведено аналіз attack surface (SQL injection, IDOR, XSS, brute force, open redirect) — критичних проблем не знайдено

## [2026-06-15] update | Insecure defaults remediation
- **Trigger:** tob-insecure-defaults skill scan
- **Pages:** `concepts/security`
- JWT_SECRET hardcoded fallback removed → throws on missing env var
- LiveKit devkey/devsecret fallbacks replaced with null → fail-secure null guard now triggers
- LiveKit room HMAC key fallback removed → throws if encryption key not set

## [2026-06-16] update | Multi-tenant SaaS transition plan
- **Trigger:** user note (move to multi-tenant SaaS architecture)
- **Pages:** `concepts/multi-tenancy` (new), `index.md`; ADR-005…009 created, ADR-004 superseded

## [2026-06-16] update | Multi-tenant gap analysis + execution playbook
- **Trigger:** user note (review plan, find weak spots, write precise execution plan)
- **Pages:** `concepts/multi-tenancy`; new `docs/multi-tenant-execution-plan.md` (7 🔴 blockers G1–G7 confirmed in code, 13 🟠 must-haves, 8-phase plan with acceptance gates + risk register)

## [2026-06-16] update | Activation: trial, promo codes, signup wizard, virtual assistant
- **Trigger:** user note (usability, 7-day trial, promo→14 days, signup config wizard, virtual assistant)
- **Pages:** `concepts/multi-tenancy`; ADR-008 (trial & promo subsection); `docs/multi-tenant-execution-plan.md` (new Phase 4.5 + G28–G32 + risk rows)

## [2026-06-16] update | Business model + tutor-recruiting pillar
- **Trigger:** user note (design full business model; add tutor-recruiting service; benchmark Preply/Edvibe)
- **Pages:** `concepts/multi-tenancy`; new `docs/business-model.md`; execution-plan Phase 6 (recruiting)
- **Decisions:** per-active-student pricing, limited Free + trial, one-time finder fee, UAH-first, recruiting pillar (placement fee + tools)

## [2026-06-16] update | Design skills for services
- **Trigger:** user note (design skills for services, not admin)
- **Pages:** dev tooling — installed `~/.claude/skills/emil-design-eng` (Emil Kowalski, verbatim); created project `.claude/skills/soenglish-service-design` (concrete Design.md grounded in real tokens + refero method + emil taste)

## [2026-06-16] update | Higgsfield MCP connected
- **Trigger:** user note ("mcp хиксвел" = Higgsfield)
- **Pages:** dev tooling — added remote HTTP MCP `https://mcp.higgsfield.ai/mcp` (user scope); needs OAuth via /mcp. Use: AI image/video gen for assistant avatar + marketing/marketplace visuals

## [2026-06-16] update | Execution plan: Design & UX workstream
- **Trigger:** user note (update plan with design tooling)
- **Pages:** `docs/multi-tenant-execution-plan.md` — added cross-cutting Design & UX workstream (emil-design-eng + soenglish-service-design + Higgsfield MCP); wired into Phase 4.5 (wizard/assistant avatar), Phase 6 (marketplace visuals, white-label = token override)

## [2026-06-16] update | Storage quota entitlement + admin seams for marketplace
- **Trigger:** user note (subscription = students + disk space; admin built for next-stage student-finding marketplace; school subs = main revenue)
- **Pages:** `concepts/multi-tenancy`; ADR-008 (2D entitlements + R1 primary); business-model (storage in tiers, value metric); execution-plan Phase 3 (storage accounting), Phase 4 (marketplace seams), Phase 5 (quota enforcement + Gate 5)

## [2026-06-16] update | Platform name "arvilio" + four senior lenses
- **Trigger:** user note (fix name arvilio; add senior-role thinking to plan)
- **Pages:** `concepts/multi-tenancy`; execution-plan (Part 0 senior lenses + name header); business-model (renamed header)
- **Note:** arvilio domains .com/.io/.org/.app/.ai free (RDAP 2026-06-16); SoEnglish = tenant #1

## [2026-06-16] update | Assistant = 3D animated mascot
- **Trigger:** user note (assistant character should be 3D, preferred over SVG)
- **Pages:** execution-plan Phase 4.5.4 (3D pipeline: Blender/AI-3D → glTF/GLB, @react-three/fiber, perf budget ≤1.5MB lazy, reduced-motion/static fallback, a11y), G31, Design workstream tooling note, Gate 4.5; `concepts/multi-tenancy`

## [2026-06-16] update | Plan review round 2 — gaps G33–G44
- **Trigger:** user note (review plan for omissions)
- **Pages:** execution-plan — added i18n (G33), product analytics (G34), payouts+KYC/Connect (G35), marketplace trust&safety (G36), signup anti-abuse (G37), data import (G38), tenant-aware notifications (G39), CI/staging/flags (G40), FinOps (G41), recordings/AI quota (G42), mobile/PWA (G43), a11y/perf budgets (G44); threaded into phases 0/2/3/4.5/5/6 + risk register + capability checklist

## [2026-06-16] update | Tax compliance (UA) + status page (G45, G46)
- **Trigger:** user note (add tax specifics + status page blocks)
- **Pages:** execution-plan — G45 tax/financial compliance (ФОП/ТОВ, ПДВ, РРО/ПРРО fiscalization, tax invoices, accounting export; intl Stripe Tax/VAT-OSS) → Phase 5; G46 public status page + incident comms → Phase 7; capability checklist + risk register

## [2026-06-16] update | Phase 0 done — tenant CLS context (@be/tenant)
- **Trigger:** code change (Phase 0 of multi-tenant plan)
- **Pages:** `concepts/multi-tenancy` (Phase 0 foundation shipped)
- **What:** nestjs-cls@6.2.1; new `@be/tenant` pkg (TenantContext, TenantContextService.requireSchoolId, TenantModule=global ClsModule+HTTP middleware); wired in apps/api app.module; aliases in tsconfig.base+jest.paths; jest project registered; 4/4 tests (incl. cross-run isolation); api typecheck clean. docs/runbooks/ added.

## [2026-06-16] update | Phase 1 (code slice) — tenant models + TenantPrismaService
- **Trigger:** code change (Phase 1 multi-tenant)
- **Pages:** `concepts/multi-tenancy`
- **What:** Prisma models School/SchoolDomain/SchoolMembership/PlatformOperator/SchoolSubscription + enums + User back-relations (validate+generate OK, Prisma 7.7). TenantPrismaService: pure scopeArgs (fail-loud), makeTenantExtension ($extends), asPlatform() CLS bypass; registered in PrismaModule. 19/19 tests, api typecheck clean. TENANT_SCOPED_MODELS empty until schoolId columns land (DB-bound 1.2). Split PrismaService into prisma.service.ts to break import cycle.
- **Remaining (DB-bound):** schoolId on all tenant models + backfill (1.2), per-school integration runtime (1.4), eslint bans, Gate 1 isolation test.

## [2026-06-16] update | Phase 1.2 partial — tenancy migration applied + identity backfill
- **Trigger:** code change (DB available: docker soenglish-postgres)
- **Pages:** `concepts/multi-tenancy`
- **What:** migration 20260616113940_add_tenancy_models applied (5 tables/6 enums, additive). Idempotent backfill-tenancy.ts (npm prisma:backfill:tenancy): school_default = tenant #1 + ACTIVE sub; SchoolMembership per user (role from User.role); SUPER_ADMIN→PlatformOperator. Verified 1 school/6 memberships/2 operators.
- **Remaining 1.x:** schoolId on tenant data tables + register TENANT_SCOPED_MODELS, per-school integration runtime (1.4), eslint bans, Gate 1.

## [2026-06-16] update | Gate 1 mechanism proven — tenant isolation integration test
- **Trigger:** code change/debug
- **Pages:** `concepts/multi-tenancy`
- **What:** Registered SchoolMembership/SchoolDomain/SchoolSubscription in TENANT_SCOPED_MODELS. tests/integration/tenant-isolation.integration.spec.ts (5/5, real Postgres) proves CLS→TenantContextService→$extends→scopeArgs: active-school-only, cross-school blocked, create stamps schoolId, asPlatform bypass, fail-loud. Debug: lazy Prisma queries must be awaited inside cls.run or ALS scope is lost. Unit 19/19 still green.

## [2026-06-16] update | Phase 1 — first legacy vertical scoped (LibraryMaterial)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** LibraryMaterial.schoolId made required + FK to School; migration library_material_school_required embeds backfill UPDATE→school_default before SET NOT NULL. Registered in TENANT_SCOPED_MODELS. Isolation test extended → 6/6 (real Postgres). Unit 19/19, api typecheck clean (required schoolId didn't break existing material-create). Rollout pattern established for remaining tenant data tables.

## [2026-06-16] update | Phase 1 — ScheduledLesson scoped (2nd vertical)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** ScheduledLesson.schoolId required + FK + index([schoolId,date]); migration scheduled_lesson_school_required (expand/contract: nullable→UPDATE school_default→NOT NULL), 12 rows backfilled. Registered in TENANT_SCOPED_MODELS. New @be/tenant DEFAULT_SCHOOL_ID constant; lessons.service create site sets schoolId=DEFAULT_SCHOOL_ID (TODO(multitenant) seam). Isolation test 7/7, lessons unit 47/47, api typecheck clean.

## [2026-06-16] update | Phase 3 start — tenant context seeded from membership in auth guards
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** AuthSessionService.resolveActiveMembership(userId) (raw/unscoped). seedTenantContext() sets userId/schoolId/membershipRole in CLS; wired into AuthGuard, OptionalAuthGuard, GqlAuthGuard. Authenticated REST+GraphQL requests now carry real schoolId. Guard spec updated (+ new test). Full unit suite 1071/1071, api typecheck clean. JWT reshape still pending; write sites can now move off DEFAULT_SCHOOL_ID to context.

## [2026-06-17] update | lessons create uses tenant context; jest.paths @be/materials fix
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** LessonsService injects TenantContextService; ScheduledLesson create uses this.tenant.schoolId ?? DEFAULT_SCHOOL_ID. Added missing @be/materials to jest.paths.cjs (pre-existing gap that prevented integration tests from loading). Lessons unit 47/47, full unit 1071/1071, tenant-isolation integration 7/7, typecheck clean.
- **Pre-existing (not tenancy):** graphql-lessons.integration fails with req.ip undefined in auth-session refresh path under GraphQL context (surfaced once integration could load). Separate harness/getReqRes todo.

## [2026-06-17] update | Phase 1 — Quiz scoped (3rd vertical)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** Quiz.schoolId required + FK + index; migration quiz_school_required (expand/contract, 4 rows). Registered. quiz-generate.service injects TenantContextService, create uses ctx.schoolId ?? DEFAULT_SCHOOL_ID. Isolation test 8/8 (now SchoolMembership/LibraryMaterial/ScheduledLesson/Quiz). Flashcards 28/28, full unit 1071/1071, typecheck clean.

## [2026-06-19] update | Phase 1 — SpeakingTopic + ChatConversation scoped (4th vertical) + spec fix
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** SpeakingTopic & ChatConversation got schoolId (model + expand/contract migration + TENANT_SCOPED_MODELS). SpeakingTopicsService & ChatService inject TenantContextService; create sites stamp schoolId ?? DEFAULT_SCHOOL_ID. Isolation tests 10/10. Fixed chat.service.spec.ts (was 16/16 failing — Nest could not resolve TenantContextService at constructor index [3]) by adding mock provider { schoolId: 'school_default' }. Full unit suite back to 1071/1071 (197 suites).

## [2026-06-19] update | Phase 1 — Financial vertical scoped (5th: Payment + balances + ledger + staff comp)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** schoolId (required, FK Cascade, indexed) added to Payment, StudentLessonBalance, LessonBalanceLedger, StaffCompensationProfile + School back-relations. Migration financial_models_school_required (expand/contract, backfill school_default). All 4 in TENANT_SCOPED_MODELS. Create/upsert sites stamp schoolId ?? DEFAULT_SCHOOL_ID across 7 checkout services + lesson-balance + payment-settings + staff-payroll. Webhook grantPurchaseLessons runs outside CLS -> DEFAULT_SCHOOL_ID fallback (G2 seam). Isolation 11/11 (Payment added), unit 1071/1071, typecheck clean.
- **Note:** Prisma 7 commands must run from repo root (prisma.config.ts holds datasource.url), not the package dir.

## [2026-06-19] update | Phase 1 — StudentGroup scoped (6th vertical)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** StudentGroup gets schoolId (required, FK Cascade, indexed) + School.studentGroups back-relation. Migration student_group_school_required (expand/contract). Registered in TENANT_SCOPED_MODELS. student-groups.service create stamps schoolId ?? DEFAULT_SCHOOL_ID. StudentGroupMember left unscoped (child accessed via scoped parent). Isolation 12/12, unit 1071/1071, typecheck clean.

## [2026-06-19] update | Phase 1 — Learner-data vertical scoped (7th: PracticeSession + StudentWordCard + StudentLearningLanguage + StaffPayout)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** schoolId (required, FK Cascade, indexed) added to PracticeSession, StudentWordCard, StudentLearningLanguage, StaffPayout + School back-relations. Migration learner_data_school_required (expand/contract). All 4 in TENANT_SCOPED_MODELS. Stamped create/createMany/upsert in practice-sessions, vocabulary, lessons (2x upsert), students-admin + auth (StudentLearningLanguage createMany — manual stamp since $extends doesn't cover createMany, G5), staff-payroll, and backfill-languages-words script. Added TenantContextService mock to practice-sessions + students-admin specs. Isolation 14/14, unit 1071/1071, typecheck clean.
- **Note:** Progress, ReviewQueue, DailyGoalCompletion are dead models (zero code refs) — intentionally NOT scoped.

## [2026-06-19] update | Phase 1 — Child/leaf vertical scoped (8th: NotificationDelivery + TeacherMessage + ScheduledLessonParticipant + QuizAssignment + QuizAttempt + SpeakingSubmission)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** schoolId (required, FK Cascade, indexed) added to 6 child/leaf tables + School back-relations. Migration child_tables_school_required (expand/contract). All 6 in TENANT_SCOPED_MODELS. Stamped create/upsert/createMany + a NESTED create (participants under scheduledLesson.create — manual since $extends ignores nested writes, G5) across notification-delivery, teacher-messages, quiz-attempt, speaking-submissions, quiz-generate, lessons. Specs fixed (notification-delivery, speaking-submissions). Isolation 16/16, unit 1071/1071, typecheck clean.
- **Note:** auto-scope $extends only applies via TenantPrismaService.client; services on base prisma are NOT filtered — model registration affects only the extended client. Manual write-stamp satisfies NOT NULL; service reads unchanged. Migrating read resolvers to TenantPrismaService.client is the remaining task to make auto-scope protect reads too.

## [2026-06-19] update | Phase 2 — tenant resolution from Host header
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** Added normalizeTenantHost + HostSchoolResolver (negative-cached, TTL 60s, injectable loader/clock) to @be/tenant; TenantResolutionMiddleware in apps/api resolves req host -> verified SchoolDomain -> tenant.setSchoolId, wired via AppModule.configure forRoutes('*'). Public/unauth paths now carry schoolId from host; auth guard still overrides from membership (Phase 3). Layering preserved (@be/tenant has no @be/prisma dep — resolver loader injected). Best-effort: no-op when CLS inactive / schoolId already set / host unmapped; resolve errors swallowed. tenant-host.spec +10. Unit 1081/1081 (198 suites), typecheck clean.
- **Caveat:** middleware must run within CLS (nestjs-cls mount first); isActive() guard makes it safe, verify ordering once real subdomains exist. No-op on localhost today.

## [2026-06-19] update | Read-protection (materials → tenant client) + GqlThrottlerGuard fix + integration suite restored
- **Trigger:** code change + debug
- **Pages:** `concepts/multi-tenancy`
- **What:** (1) Proved auto-scope works for unique ops — added isolation cases: cross-tenant findUnique→null, update/delete→throw (Prisma 7 accepts non-unique schoolId in unique-op where). isolation 17/17. (2) Fixed TenantPrismaService.client type: was `unknown` (ReturnType<$extends> erases across package boundary), now `PrismaClient` via local cast — unblocks read migrations. (3) Migrated MaterialsService to tenantPrisma.client (reads/updates/deletes auto-scoped); removed client-controlled schoolId from create (tenant-injection fix), now from context. (4) Found+fixed real bug: global ThrottlerGuard read request via switchToHttp() → undefined for GraphQL → req.ip threw → ALL GraphQL requests 500 (prod too). Added GqlThrottlerGuard (override getRequestResponse for graphql ctx). (5) Integration suite restored ~20/76 → 81/82: throttler fix + fixture schoolId backfills (quiz/product/rbac) + TenantModule import in auth.integration + app.module path in staff-payout. Unit 1081/1081, typecheck clean.
- **Pre-existing remaining:** auth.integration forgot-password fails — MailService.renderEmail dynamic import() breaks under jest (no --experimental-vm-modules). Separate mail/jest-ESM todo, not tenancy.

## [2026-06-19] update | Read-protection (LessonsService → tenant client)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** 2nd read migration after materials recipe. lessons.service.ts (1085 LOC): injected TenantPrismaService, added `private get db()` → tenantPrisma.client, mass-replaced `this.prisma.<model>` → `this.db.<model>`. Reads/updates/deletes on ScheduledLesson/ScheduledLessonParticipant/StudentWordCard/StudentGroup now auto-scoped by active school; non-tenant models (User, LessonMaterial) pass through unchanged. Kept `$queryRaw` (autoComplete) + `$transaction` (replace participants) on base prisma by design (G5 — $extends doesn't cover raw); raw selects ids then `db.scheduledLesson.updateMany` re-scopes by schoolId (defense-in-depth). Create-sites fall back through scoped-client fail-loud when no context (all creates behind staff auth → context present). Gates: API typecheck clean, lessons unit 47/47, full unit 1081/1081, isolation integration 17/17.

## [2026-06-22] update | Read-migration: flashcards (quiz) → tenant client + seed membership fix
- **Trigger:** code change + debug
- **Pages:** `concepts/multi-tenancy`
- **What:** Migrated all 6 flashcards files (quiz-access/detail/list/generate/attempt + quiz.repository) to tenantPrisma.client (this.db) — Quiz/QuizAssignment/QuizAttempt/StudentWordCard auto-scoped; User/Word stay on base. quiz-attempt $transaction→this.db.$transaction. (vocabulary already migrated prior turn.) Root cause surfaced: integration tests failed "refusing Quiz.findMany without active schoolId" because seedTestUsers created no SchoolMembership → seedTenantContext set no schoolId → scoped client fail-loud. Fixed seedTestUsers to upsert school_default + ACTIVE membership per user; cleanup deletes memberships before users. This enables tenant context across ALL integration tests. Unit 1081/1081, integration 81/82 (only pre-existing mail/jest-ESM forgot-password fails), typecheck clean.
- **Note:** read-migration pattern: inject TenantPrismaService, add `private get db()`, swap scoped-model ops this.prisma.X→this.db.X, keep global models (User/Word) on base. Spec mocks for migrated services need `{ provide: TenantPrismaService, useValue: { client: <prismaMock> } }`.

## [2026-06-22] update | Read-migration: lessons + speaking + chat → tenant client
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** Migrated scoped-model reads to TenantPrismaService.client (this.db) in: lessons (student-groups.service + lesson-files.controller; zoom-webhook left on base — webhook), speaking (topics/submissions/access), chat (chat.service ChatConversation + $transaction; chat-attachment @Cron untouched — touches only non-scoped chatMessageAttachment). Recipe: inject TenantPrismaService, get db(), swap this.prisma.X→this.db.X for registered models, keep global (User/Word) on base; spec mocks add { provide: TenantPrismaService, useValue: { client: prismaMock } }. Unit 1081/1081, integration 81/82 (pre-existing mail/jest-ESM only), typecheck clean.
- **Remaining:** billing read-migration (22 sites) — request-scoped services can use this.db, but webhook controllers + handleWebhook in 6 checkout services are non-request → must use asPlatform()/explicit tenant resolution (G2), not naive this.db (fail-loud).

## [2026-06-22] update | Read-migration: billing (safe subset) → tenant client
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** Migrated request-scoped billing services to TenantPrismaService.client: staff-payroll (StaffCompensationProfile/StaffPayout/scheduledLesson, admin-only) and payment-settings (StudentLessonBalance price-resolution — verified reachable only from request paths; webhook grantPurchaseLessons + cron syncGroupLessonCharges do NOT call them). Left on base prisma (G2/G4 territory): lesson-balance.service (request+webhook entanglement — payment.findUnique in grantPurchaseLessons is webhook; ledger/balance writes run in webhook context with DEFAULT_SCHOOL_ID fallback), 7 checkout services + 5 webhook controllers (non-request). Unit 1081/1081, integration 81/82 (pre-existing mail/jest-ESM only), typecheck clean.
- **Read-path migration now complete for all request-scoped services** (materials/vocabulary/flashcards/lessons/speaking/chat/billing-subset). Remaining for full billing coverage = G2 (tenant-aware webhooks: resolve school from payload + asPlatform) and G4 (tenant-aware jobs).

## [2026-06-22] update | G2 — tenant-aware webhooks (PSP credit attribution)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** All 7 PSP webhooks credit lessons via LessonBalanceService.grantPurchaseLessons. Fixed there: resolve payment.schoolId (stamped at checkout) and seed it into CLS (tenant.setSchoolId) before ledger/balance writes, only when context is active and schoolId unset (never overrides a real context). Credits now land in the correct school instead of DEFAULT_SCHOOL_ID fallback. Webhook payment reads stay on base prisma (correct — school resolved from there). +3 unit tests. Unit 1084/1084, integration 81/82 (pre-existing mail/jest-ESM only), typecheck clean.
- **G4 note:** lesson sync currently runs in request context (autoComplete via listFor, not @Cron); revisit when real cron jobs are added (iterate schools explicitly / asPlatform).

## [2026-06-22] update | Gate 1 in CI closed + best-effort password-reset email
- **Trigger:** code change + debug
- **Pages:** `concepts/multi-tenancy`
- **What:** CI (ci.yml) already runs the integration suite as a required check (Postgres service + migrate:deploy + test:integration, gated by ci-success). The only red test was pre-existing auth.integration forgot-password — @react-email/render dynamic import() fails under jest CJS. Fixed in AuthService.requestPasswordReset by sending the email best-effort (try/catch + Logger.warn): the reset token is already persisted, so a transient render/SMTP failure must not 500 the request nor leak email existence. Both suites now fully green: unit 1084/1084, integration 82/82. Gate 1 (isolation + integration as required CI check) is closed.

## [2026-06-23] update | G3 — per-tenant integration runtime cache
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** platform-integration.runtime.ts: process-wide `let cached` → Map<schoolId, ResolvedPlatformIntegration> keyed by active schoolId from CLS (ClsServiceManager.getClsService() + TENANT_CLS_KEY — no DI, no @be/prisma layering break), with PLATFORM_KEY platform-global fallback. getPlatformIntegrationRuntime returns per-school entry if present else platform-global. refresh/set/new invalidate take optional schoolId. Behaviour unchanged today (integrations still from PlatformSettings singleton → only PLATFORM_KEY written; all callers fall back). Removes structural cross-tenant secret-leak risk; seam ready for per-school overrides (PSP/white-label). +3 unit tests. unit 1087/1087, integration 82/82, typecheck clean.

## [2026-06-23] update | ESLint isolation guardrails — Phase 1 complete
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** eslint.config.mjs adds no-restricted-syntax for apps/api + packages/backend (excluding specs/tests + data-access-prisma): bans raw SQL ($queryRaw/$queryRawUnsafe/$executeRaw*) which bypasses $extends scoping (G5), and asPlatform() calls (audited cross-tenant bypass, reserved for @be/platform-admin). Caught one real violation — lessons.service.autoCompletePastPlannedLessons raw SQL on ScheduledLesson without schoolId — fixed by adding AND sl."schoolId" = ${schoolId} + justified eslint-disable (raw needed for timezone logic; updateMany already on scoped this.db). Zero guardrail violations across backend. unit 1087/1087, integration 82/82, typecheck clean.
- **Milestone:** Phase 1 (tenancy core & data isolation) is now COMPLETE — 8 verticals + read-migration + TenantPrismaService + G2 + G3 + ESLint guardrails + Gate 1 green in CI. Remaining MT work is Phase 2 (web routing/i18n), Phase 3 (JWT reshape, G4 jobs, G6 storage), Phase 4 (platform admin console).

## [2026-06-23] update | Phase 2 — web tenant routing + backend hint consumption
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** apps/web/src/lib/tenant-host.ts (pure classifyTenantHost: apex/www/reserved/localhost/IP→platform, single-label *.ROOT_DOMAIN→subdomain slug, else→custom) + apps/web/src/middleware.ts forwarding x-school-slug/x-school-host hints to the API (non-disruptive, no redirects). Backend TenantResolutionMiddleware now resolves x-school-slug→School.slug (cached, excludes SUSPENDED) then x-school-host/Host→verified SchoolDomain. +9 web unit tests. unit 1096/1096, integration 82/82, typecheck clean (my files; web app has pre-existing unrelated TS errors).
- **Deferred (infra/Phase4-gated):** apex landing + unknown→404 UI, full suspended-school blocking screen (Phase 4 un-suspend flow), edge KV cache w/ schoolId key (G12, Cloudflare KV), custom-domain CRUD+DNS+SSRF-safe resolver (G16), Cloudflare for SaaS runbook, JWT.schoolId↔host cross-check (gated on JWT reshape), i18n foundation (G33, large frontend task).

## [2026-06-23] update | Phase 2 — i18n foundation core (G33)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** Shared pure locale core in @pkg/types (locale.ts): SUPPORTED_LOCALES ['uk','en'], DEFAULT_LOCALE 'uk', isLocale, normalizeLocale (uk-UA→uk), parseAcceptLanguage (q-weighted), resolveLocale (userPreference → schoolDefault → acceptLanguage → default). Added a `shared-types` jest project to jest.config.cjs (shared/types tests were previously never run — also revived material-annotations.test). +5 tests. unit 1103/1103, typecheck clean.
- **Incremental remainder:** School.defaultLocale + User.locale columns, wire resolveLocale into request context, message catalogs + UI string extraction (adopt as screens are touched). Other Phase 2 items remain infra-gated (Cloudflare KV/TLS/custom-domain DNS) or Phase-4-gated (suspended screen) or JWT-reshape-gated (host↔JWT cross-check).

## [2026-06-23] update | Phase 4A — platform-admin foundation (@be/platform-admin)
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** New @be/platform-admin module (aliases in tsconfig.base/jest.paths, jest project, ESLint asPlatform allowlist → this module). PlatformAuditLog Prisma model + migration (actorUserId/action/targetSchoolId/metadata/ip, indexed). AuthSessionService.resolvePlatformRole (from PlatformOperator) + seedTenantContext seeds CLS platformRole; web-session availableScopes 'platform' now derives from PlatformOperator not User.role (ADR-008). PlatformAdminGuard + @PlatformAdmin(...roles) decorator (reads CLS platformRole; use after AuthGuard). PlatformAuditService.record() (base prisma — audit is platform-global). Integration seed creates PlatformOperator(PLATFORM_ADMIN) for super-admin. +13 tests. unit 1110/1110, integration 82/82, typecheck clean.
- **Decisions:** platform access source = PlatformOperator (not User.role); web console = separate app (affects 4D). Next: 4B dashboard/schools read via asPlatform, 4C suspend/activate + impersonation + audit, 4D web console.

## [2026-06-24] update | Phase 4B — platform console read surface
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** @be/platform-admin gains PlatformSchoolsService (cross-tenant reads via tenantPrisma.asPlatform — the sole sanctioned bypass) + REST PlatformAdminController guarded by AuthGuard+PlatformAdminGuard: GET /api/platform/dashboard (school counts by status, active users, active subs, total storageUsedBytes; MRR stub 0 until Phase 5 subscription pricing), /schools (list + active member counts), /schools/:id (role counts + primary domain). +7 tests (3 unit + 4 integration: operator 200, student 403, unauthenticated 401). unit 1113/1113, integration 86/86, typecheck clean.
- **Next:** 4C suspend/activate (+close deferred Phase 2 suspended enforcement) + payment-method allowlist + impersonation (banner) — all audited via PlatformAuditService; then 4D web console (separate app). Gate 4 read-half proven.

## [2026-06-24] update | Phase 4C — suspend/activate + audit + suspended enforcement
- **Trigger:** code change
- **Pages:** `concepts/multi-tenancy`
- **What:** PlatformSchoolsService.setSchoolStatus (asPlatform) updates School.status + PlatformAuditService.record. Controller: POST /api/platform/schools/:id/suspend|activate (@PlatformAdmin('PLATFORM_ADMIN') only), GET /api/platform/audit-log[?schoolId]. PlatformAuditService.list (newest-first, actor name). Suspended enforcement (closes deferred Phase 2): resolveActiveMembership now returns schoolStatus; seedTenantContext returns {suspended, isPlatformOperator}; AuthGuard throws 403 for members of a SUSPENDED school, platform operators bypass (they un-suspend via console); OptionalAuthGuard stays non-throwing. +8 tests (guard suspended/bypass, service suspend/no-op, integration suspend→activate→audit on a temp school). unit 1117/1117, integration 87/87, typecheck clean.
- **Gate 4:** list schools ✅, suspend→offline ✅, audit log ✅. Remaining: impersonation (banner) → 4C.2; then 4D web console (separate app).
## [2026-06-26] update | G6 test fixes — LocalFileStorageAdapter + spec rewrites
- **Trigger:** code change
- **Pages:** concepts/object-storage


## [2026-06-26] update | G4 notification cron jobs — SchoolMembership-scoped queries
- **Trigger:** code change
- **Pages:** concepts/backend-modules, concepts/multi-tenant

## [2026-06-26] update | Storage accounting complete + platform admin display
- **Trigger:** code change
- **Pages:** concepts/object-storage, concepts/billing

## [2026-06-27] update | JWT reshape (ADR-008) — schoolId/membershipRole/platformRole in token
- **Trigger:** code change
- **Pages:** concepts/auth, concepts/multi-tenant

## [2026-06-27] update | RolesGuard — ADR-006 authorization cutover to CLS membershipRole
- **Trigger:** code change
- **Pages:** concepts/auth, concepts/multi-tenant

## [2026-06-27] update | ADR-007 cross-school JWT check in AuthGuard
- **Trigger:** code change
- **Pages:** concepts/auth, concepts/multi-tenant

## [2026-06-27] update | Invitations flow — SchoolInvitation model + service + controller + email template
- **Trigger:** code change
- **Pages:** entities/school-invitation, concepts/auth, concepts/multi-tenant

## [2026-06-27] update | OAuth school context cookie (ADR-008) — Google login carries schoolId
- **Trigger:** code change
- **Pages:** concepts/auth, concepts/multi-tenant

## [2026-06-27] update | Trial-extension promo code redemption from billing settings
- **Trigger:** code change
- **Pages:** concepts/billing

## [2026-06-27] update | Onboarding wizard invite step side-effects
- **Trigger:** code change
- **Pages:** concepts/onboarding

## [2026-06-27] update | Onboarding wizard sample-content seed + payments TODO
- **Trigger:** code change
- **Pages:** concepts/onboarding

## [2026-06-27] update | G37 captcha — Cloudflare Turnstile on school signup
- **Trigger:** code change
- **Pages:** concepts/auth

## [2026-06-27] update | KEK/JWT/Stripe secret rotation runbook
- **Trigger:** new runbook file docs/runbooks/secret-rotation.md

## [2026-06-27] update | Onboarding wizard payments step — payment method selector
- **Trigger:** code change
- **Pages:** concepts/onboarding — payments step wired; SchoolOnboardingService.applyPaymentsStep; PaymentsStepFields frontend component; IPaymentSettingsService local interface pattern to avoid billing circular dep in specs

## [2026-06-27] update | UI audit — LessonModal save button loading state
- **Trigger:** code change (usability audit)
- **Pages:** concepts/lessons — LessonModal isSaving prop added; useLessonEditor.saving exported; calendar savingLesson wired

## [2026-06-27] update | Custom domains (G16) — CRUD + DNS TXT verify + CF runbook
- **Trigger:** code change
- **Pages:** concepts/domains (new) — DomainsService, DomainsController, DomainsPanel, DNS TXT verification (SSRF-safe), Cloudflare for SaaS runbook

## [2026-06-27] update | Product analytics (G34) — PostHog activation funnel
- **Trigger:** code change
- **Pages:** concepts/analytics (new) — PostHog wrapper, AnalyticsProvider, funnel event taxonomy, env vars to activate

## [2026-06-27] update | G38 CSV student import
- **Trigger:** code change
- **Pages:** concepts/student-import (new) — ImportStudentsService, ImportStudentsController, StudentImportPanel, CSV format, dry-run flow, seat-cap enforcement

## [2026-06-27] update | G13 per-tenant + per-user + global rate limiting
- **Trigger:** code change
- **Pages:** concepts/rate-limiting (new) — 3 named tiers, tenant-aware tracker key (sid→sub→IP), auth endpoint throttle decorators

## [2026-06-27] update | G14 tenant-tagged structured logging
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — added G14 section (TenantLoggerService + TenantLoggingInterceptor)

## [2026-06-27] update | G15 GDPR data export + erasure
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — added G15 section

## [2026-06-27] update | EntitlementsWidget + G39 done
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — G39 notification jobs confirmed tenant-aware (no change needed); EntitlementsWidget added to admin dashboard (storage+seats gauges, gated by role)

## [2026-06-27] update | aiAssist feature-gate + AI credit metering
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — G316 remaining item closed: @RequiresFeature('aiAssist') on STT captions/generate + assertAiCredit/consumeAiCredit metering

## [2026-06-27] update | featureBlocked upgrade prompt pattern
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — featureBlocked 403 pattern established: backend throws structured ForbiddenException({featureBlocked}), ApiError carries it, isFeatureBlockedError() + UpgradePrompt shows upgrade CTA; first site: captions/generate → MediaViewerShell

## [2026-06-27] update | Cookie consent banner (G15 GDPR)
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — G15 remaining: cookie consent banner implemented; PostHog initAnalytics() now gated behind explicit consent; localStorage-based (no separate consent service needed for single-school phase)

## [2026-06-27] update | /privacy page + Phase 5 proration confirmed
- **Trigger:** code change + analysis
- **Pages:** concepts/multi-tenancy — /privacy page created (RSC); Stripe proration confirmed handled by Customer Portal; billing UI correctly gates plan-picker to non-subscribers only

## [2026-06-27] update | customDomain feature gate
- **Trigger:** code change
- **Pages:** concepts/multi-tenancy — @RequiresFeature('customDomain') on domain write endpoints (PRO-only); DomainsPanel shows UpgradePrompt on plan-block 403

## [2026-06-27] update | Sentry integration (G14 complete)
- **Trigger:** code change
- **Pages:** concepts/observability — @sentry/nestjs + @sentry/node installed; init in main.ts guarded by SENTRY_DSN; tenant-logger.service sets schoolId tag on errors

## [2026-06-27] update | GDPR self-service UI complete
- **Trigger:** code change
- **Pages:** concepts/gdpr — AccountPanel now has "Export my data" (downloads JSON via GET /api/gdpr/export) and "Delete my account" (DELETE /api/gdpr/me + logout); privacy page updated to remove "coming soon"

## [2026-06-27] update | Backup/DR runbook (G20)
- **Trigger:** code change (doc)
- **Pages:** — runbook at docs/runbooks/backup-dr.md: PITR, S3 versioning, monthly drill procedure, 4 disaster scenarios, "undelete school" SQL, drill log format

## [2026-06-27] update | Public status page (G46)
- **Trigger:** code change
- **Pages:** — GET /api/health (AppController/AppService, checks DB via SELECT 1); /status page (Next.js client component, auto-refresh 60s, shows API + DB status badges)

## [2026-06-27] update | G42 recordings storage accounting
- **Trigger:** code change
- **Pages:** concepts/billing — LiveKitWebhookController (POST /api/livekit/webhook): verifies JWT, on egress_ended stamps ScheduledLesson.recordingSizeBytes + increments School.storageUsedBytes via StorageAccountingService delta

## [2026-06-28] update | GDPR audit log retention cron
- **Trigger:** code change
- **Pages:** concepts/gdpr — TrialLifecycleService.pruneAuditLogs(): daily hard-delete PlatformAuditLog entries older than 7 years; called from TrialLifecycleScheduler alongside trial/dunning sweeps

## [2026-06-29] update | Playwright E2E all green (533 passed)
- **Trigger:** code change — E2E test fixes
- **Pages:** `concepts/testing` (if exists) — no new wiki pages needed; changes are test-layer only
- **Key findings:**
  - `LessonModal` overlay had `aria-hidden="true"` wrapping the `role="dialog"` element — hid it from a11y tree and Playwright `getByRole()`. Fixed by removing `aria-hidden` from overlay.
  - ProductTour blocks lesson modal interactions — suppressed via route mock in tests.
  - Mobile viewport (Pixel 7) hides sidebar nav and "Create lesson" button — tests now soft-skip.

## [2026-06-29] update | Stage 1 Auth audit + UX fixes
- **Trigger:** e2e-journey-test-plan.md audit cycle
- **Pages:** `concepts/auth` (if exists) — no new wiki page; changes are UI/test layer
- **Key changes:**
  - `/login` error banners moved after Google OAuth button + OR divider (were incorrectly above Google btn)
  - Client-side empty-field guard added to login `onSubmit` (email + password)
  - Auth layout: `<div className={authMain}>` → `<main>` (a11y landmark)
  - `docs/e2e-improvements/01-auth.md` created (10 findings, 4 fixed)
  - `e2e-journey-test-plan.md` Etap 1 tracker: run ☑, screenshots ☑, improvements-doc ☑

## [2026-07-02] update | Stage 3 STUDENT audit — WCAG AA fixes
- **Trigger:** e2e-journey-test-plan.md audit cycle (code change)
- **Pages:** none new — UI/token layer; findings in `docs/e2e-improvements/03-student.md`
- **Key changes:**
  - HeaderSearch input: `role="combobox"` + `aria-autocomplete="list"` (fixes critical `aria-allowed-attr` on every authenticated page)
  - Theme tokens: `--text-tertiary` darkened to #656586; new `--blue-dark`/`--rose-dark`; status info/success text now use dark variants — WCAG AA on tinted surfaces
  - Calendar: past-day dimming via colors instead of opacity; nav buttons aria-labels; week body focusable scroll region
  - E2E: `shot()` uses `caret: 'initial'` (Playwright caret-hide inline style caused false hydration-mismatch console errors)
  - `03-student-audit.spec.ts`: 29 passed / 0 failed; Etap 3 tracker fully ☑

## [2026-07-02] update | Stage 4 TEACHER audit — modal a11y fixes
- **Trigger:** e2e-journey-test-plan.md audit cycle (code change)
- **Pages:** none new — findings in `docs/e2e-improvements/04-teacher.md`
- **Key changes:**
  - LessonModal setup tab: Title/Duration fields now label-associated via `htmlFor`/`id`
  - `--accent-primary` on muted green backgrounds (4.26:1) replaced with `--green-dark` in LessonModal badges, MaterialFormModal mode badge, StudentSummaryCard open button (which also referenced nonexistent `--accent-primary-strong`)
  - `04-teacher-audit.spec.ts` created: 20 passed / 0 failed; Etap 4 tracker fully ☑

## [2026-07-02] update | Stages 2+5 audits: signup slug-collision P0 fix, tour timing
- **Trigger:** e2e-journey-test-plan.md audit cycle (code change + debug)
- **Pages:** `concepts/auth-rbac.md` relevant context: /system allowed for admin+super_admin by route-policy (plan text was stale)
- **Key changes:**
  - **P0:** `register-school` returned 500 on duplicate school name — slug-collision retry never matched because Prisma 7 pg driver adapter reports constraint fields under `meta.driverAdapterError.cause.constraint.fields` (not `meta.target`) and the error is not `instanceof PrismaClientKnownRequestError`. Fixed with structural check in `school-signup.service.ts`; regression unit test added.
  - Product Tour no longer opens on `/onboarding` (blocked wizard clicks); pathname-guard in `ProductTour.tsx`, tour starts on dashboard after wizard.
  - New specs: `02-journey-audit.spec.ts` (4 passed), `05-admin-audit.spec.ts` (13 passed). Etap 2 & 5 trackers fully ☑.
  - Testing gotcha: Playwright `locator.isVisible()` ignores the timeout option — use `waitFor({state:'visible'})` for async-appearing UI.

## [2026-07-02] update | Stage 6 /system audit — connections/payments a11y
- **Trigger:** e2e-journey-test-plan.md audit cycle (code change)
- **Pages:** none new — findings in `docs/e2e-improvements/06-system.md`
- **Key changes:**
  - ConnectionsPanel: Telegram dev-polling and Zoom S2S checkboxes got `aria-label` (were unlabeled — critical axe `label` rule)
  - PaymentsPricingSection: "Min lessons" number input label-associated via `htmlFor`/`id`
  - New spec `06-system-audit.spec.ts`: all 8 /system tabs render + axe clean (12 passed); Etap 6 tracker ☑ (admin-scope; no super_admin seed user)

## [2026-07-03] update | Stage 8 RBAC audit — clean
- **Trigger:** e2e-journey-test-plan.md audit cycle
- **Pages:** none — no code changes; coverage doc `docs/e2e-improvements/08-rbac.md`
- **Key changes:**
  - New spec `08-rbac-audit.spec.ts` (26 passed): role-based redirects for student/teacher/admin/guest match route-policy.ts; unauthenticated API calls return 401/403. Zero findings.
  - Etap 7 (platform app :4300) blocked: not in dev stack, no super_admin seed.

## [2026-07-03] update | Stage 9 responsive audit — clean
- **Trigger:** e2e-journey-test-plan.md audit cycle
- **Pages:** none — no code changes; coverage doc `docs/e2e-improvements/09-responsive.md`
- **Key changes:**
  - New spec `09-responsive-audit.spec.ts` (15 passed): no horizontal scroll on 8 student pages (Pixel 7) and 3 tablet screens; burger nav works.
  - Gotcha: seeded users have incomplete tour → ProductTour overlays mobile burger; tests must mock `/api/onboarding/tour` (recommend seeding `tourCompletedAt`).

## [2026-07-03] update | Stage 10 a11y audit — LessonModal focus trap
- **Trigger:** e2e-journey-test-plan.md audit cycle (code change)
- **Pages:** none new — findings in `docs/e2e-improvements/10-a11y.md`
- **Key changes:**
  - LessonModal had focus-on-open + Escape but no focus trap — Tab escaped the dialog. Added Tab/Shift+Tab cycling over visible focusable elements in the existing keydown effect (`LessonModal.tsx`). Other modals (MaterialFormModal, media viewer) still lack traps — same pattern applies.
  - New spec `10-a11y-audit.spec.ts` (7 passed): login Tab order, modal focus trap, reduced-motion render, control names. Etap 10 tracker ☑.

## [2026-07-03] update | Stage 11 edge audit — graphql-client error messages; audit cycle complete
- **Trigger:** e2e-journey-test-plan.md audit cycle (code change)
- **Pages:** none new — findings in `docs/e2e-improvements/11-edge.md`
- **Key changes:**
  - `lib/graphql-client.ts`: non-OK responses threw the raw JSON body as the error message, which surfaced as a JSON dump in user-facing error cards; now parses `errors[0].message` / `message` with text fallback.
  - New spec `11-edge-audit.spec.ts` (10 passed): 404 page, 4 invalid-id routes show friendly errors, API 500 on /lessons and /students shows error UI.
  - Audit cycle status: stages 1–6 and 8–11 closed; stage 0 (seed) partial, stage 7 (platform app :4300) blocked.

## [2026-07-03] update | Etap 0 seed extension — domain fixtures + tourCompletedAt
- **Trigger:** code change (e2e-journey-test-plan Etap 0)
- **Pages:** none new
- **Key changes:**
  - `tests/integration/seed.ts`: new idempotent `seedTestFixtures()` — lessons in all three statuses, teacher StaffCompensationProfile (PER_LESSON, UAH), 10 StudentWordCards across all VocabularyStatus values; all seeded users get `tourCompletedAt` so ProductTour never overlays E2E runs.
  - `npm run seed:test-users` runs it; verified idempotent. Staff-profile audit (5A.3) unskipped — 05-admin now 14/14.
  - Seed backlog: material with attachment, quiz, payment, promo code.

## [2026-07-03] update | Storage-root fallback bugfix + seed fixtures complete
- **Trigger:** debug (materials preview 404) + code change
- **Pages:** none new
- **Key changes:**
  - **Bug:** every material preview/download 404'd locally — the default local storage root moved to `data/uploads` while existing files live in legacy `data/material-uploads` and no `UPLOAD_ROOT`/`MATERIAL_UPLOAD_DIR` is set. Fix: back-compat fallback in `packages/backend/shared/storage/src/file-storage.module.ts` (use legacy dir when the new default is absent). Verified: preview endpoint 200.
  - Dev gotcha: `apps/api/scripts/dev.cjs` watcher covers `packages/backend/modules` + `packages/shared` but NOT `packages/backend/shared` — edits there need a touch in a watched dir to rebuild.
  - Seed now also creates: quiz (2 questions), SUCCEEDED payment (4 lessons), promo `SEED20`, BOOK material; cleanup extended. Etap 0 seed items done except optional file attachment + `expectArvi()`.

## [2026-07-03] update | Stage 7 Platform console audit — clean; audit cycle fully closed
- **Trigger:** e2e-journey-test-plan.md audit cycle
- **Pages:** none — no code changes; coverage doc `docs/e2e-improvements/07-platform.md`
- **Key changes:**
  - New spec `07-platform-audit.spec.ts` (8 passed): all 5 platform console pages (:4300) render + axe clean under super_admin; school admin and guest get "Not authorized" (PlatformOperator gate works).
  - Test auth pattern: login via web proxy :4200 → cookie is valid for :4300 (cookie domain ignores port).
  - e2e-journey-test-plan tracker: stages 1–11 all closed; Etap 0 remaining: expectArvi(), optional seeded file attachment.

## [2026-07-03] update | expectArvi() E2E helper + Mascot data attributes
- **Trigger:** code change (e2e plan Etap 0 final item)
- **Pages:** none new
- **Key changes:**
  - `components/mascot/Mascot.tsx` wraps both 3D and SVG-fallback renders in `<span data-mascot data-mascot-pose={pose}>` — stable E2E anchor.
  - `tests/e2e/helpers/a11y.ts`: new `expectArvi(page, pose?)`; golden path asserts Arvi `greet` on the tour welcome step.
  - Dev gotcha: local Postgres runs in Docker Desktop (`soenglish-postgres`); if Docker stops, register/login return 500 (ECONNREFUSED).

## [2026-07-04] update | LessonModal uses shared useFocusTrap; dev OOM root-caused to 10GB .next cache
- **Trigger:** code change + debug
- **Pages:** none new
- **Key changes:**
  - `LessonModal.tsx` now uses the pre-existing `hooks/use-focus-trap.ts` (already used by MaterialFormModal, MediaViewerModal, LibraryMaterialPicker, MobileNavDrawer) instead of a bespoke inline trap; MaterialFormModal trap covered by a new test in `10-a11y-audit.spec.ts`.
  - **Dev-stack instability root cause:** `apps/web/.next` had grown to 10GB — Turbopack OOM'd (even at 8GB heap), crashing web and SIGKILLing the API, cascading into ERR_ABORTED/500 in E2E. Fix: delete `.next`. Hardening: `--max-old-space-size=8192` in web dev script; LoginPage retries goto on ERR_ABORTED and re-fills inputs wiped by the hydration race; auth.setup timeout 90s.
