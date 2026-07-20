# ADR-008: Platform vs School Operators, Tenant-Aware Sessions, and Three-Layer Billing

- **Status:** proposed
- **Date:** 2026-06-16
- **Authors:** Arvilio engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-005, ADR-006

## Context

Multi-tenancy introduces two new concerns the current design does not separate:

1. **Operator axis.** Today roles are `STUDENT/TEACHER/ADMIN/SUPER_ADMIN` on `User`. There is no distinction between *platform* operators (Arvilio staff who see all schools) and *school* operators (a school's own admins). `SUPER_ADMIN` must not be conflated with a platform operator.

2. **Billing.** All money today is one layer (student → school via `Payment`/`StudentLessonBalance`). SaaS needs three layers (ADR-004 rule #3).

The JWT payload is currently `{ sub: userId }` only — no tenant or operator context.

## Decision

### Sessions / roles
1. JWT payload becomes `{ sub, schoolId, membershipRole, platformRole? }`. `schoolId` is the **active** membership (ADR-006). Old tokens lacking `schoolId` are invalidated; refresh issues the new shape gracefully. `JWT_SECRET` is already required (no dev fallback).
2. New **`PlatformOperator { userId, role }`** with `PlatformRole` (`PLATFORM_ADMIN`/`PLATFORM_SUPPORT`/`PLATFORM_BILLING`) — a separate axis from `SchoolMembership` role. A new `@PlatformAdmin()` guard protects the platform console (ADR-009); school admin surfaces use membership role `ADMIN` + the tenant guard.
3. OAuth/Telegram link flows carry `schoolId` in the state cookie (callbacks land on the platform domain).

### Billing — three layers
| Layer | Who pays | Entities |
|-------|----------|----------|
| A. Student → School | learner pays school for lessons | existing `Payment`, `StudentLessonBalance`, now `schoolId`-scoped |
| B. School → Platform | school's "open a school" subscription | new `SchoolSubscription` (plan, status, Stripe customer/subscription id, trial end); entitlements via `School.status` |
| C. Platform commission | platform-sourced students | new `StudentAcquisitionLead` (attribution lead→enrollment→schoolId) + `PlatformCommissionLedger` |

- Layer B uses a **platform-level Stripe account**, distinct from each school's own Stripe keys (which stay in `School.paymentSecrets` per ADR-005). One checkout must never be built that cannot split tenant settlement later.
- **Layer B (school subscription) is the primary revenue.** R2/R3 marketplace & recruiting fees are upside; the platform admin console (ADR-009) is built with seams for that next stage but does not depend on it for the core business.
- **Entitlements are two-dimensional:** active-student cap **and** a per-school **storage quota** (`School.storageQuotaBytes` vs `storageUsedBytes`). Over-quota uploads are blocked with an upgrade/add-on prompt — schools cannot upload materials indefinitely (object storage is a real COGS). Enforcement detail in `docs/multi-tenant-execution-plan.md` Phase 3 + Phase 5.
- Non-payment / suspended subscription → `School.status = SUSPENDED` → blocked at middleware (ADR-007).

### Trial & promo codes (activation)
- Every school starts on a **7-day free trial** (`SchoolSubscription.status=TRIALING`, `trialEndsAt=now+7d`), **no card required**. At expiry → grace → `SUSPENDED`.
- A **promo-code system** (`PromoCode` + `PromoRedemption`, one redemption per school, atomic transactional redemption) extends the trial to **14 days**. `PromoCode.kind` is designed to also carry subscription discounts (`PERCENT_OFF`/`FIXED_OFF`) later — do not hard-code it to trial-only.
- Trial state and promo redemption are part of the activation flow (signup wizard); see `docs/multi-tenant-execution-plan.md` Phase 4.5.

## Consequences

### Positive
- Platform staff vs school staff cleanly separated; least-privilege for support/impersonation.
- Three money flows are isolatable; commission attribution is data-recoverable.

### Negative
- Token reshape forces a refresh cycle for active sessions.
- Two Stripe integration contexts (platform-level and per-school) to maintain.

### Neutral
- Layer C (marketplace/commission) can ship after Layers A/B; the lead/attribution tables should exist early so attribution is never reconstructed from logs.

## Compliance

```bash
# Platform Stripe must not reuse a school's stored secret
grep -rn "SchoolSubscription\|PlatformCommissionLedger" packages/backend --include="*.ts"
# JWT payload should carry schoolId
grep -rn "jwt.sign\|sub:" packages/backend/modules/module-auth --include="*.ts"
```

## Links

- Related ADRs: ADR-004 (rule #3), ADR-005, ADR-006, ADR-009
