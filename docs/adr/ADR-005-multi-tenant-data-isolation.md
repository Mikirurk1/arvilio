# ADR-005: Multi-Tenant Data Isolation (Shared DB, Row-Level `schoolId`)

- **Status:** proposed
- **Date:** 2026-06-16
- **Authors:** Arvilio engineering
- **Supersedes:** ADR-004
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-001, ADR-002, ADR-004

## Context

Arvilio is moving from a single-school product to a commercial multi-tenant SaaS where many schools operate independently, with subdomains and custom domains, plus a platform admin console and (later) a student marketplace with commission. ADR-004 committed to "build for one school today, leave seams"; this ADR activates the transition and supersedes that posture.

Today the schema has **no tenant boundary**: there is no `School` model (only one stray optional `schoolId` on `LibraryMaterial`), and `PlatformSettings` is a singleton (`id @default("default")`) that mixes genuinely platform-wide config with per-school config (payment methods/secrets, SMTP, integrations, staff payout defaults).

Three isolation strategies were considered:
1. **DB-per-tenant** — strongest isolation, but expensive to migrate the existing single DB, blocks cross-tenant analytics needed by the platform admin console, heavy ops.
2. **Schema-per-tenant** — middle ground, still complicates migrations and cross-tenant queries.
3. **Shared DB + shared schema + row-level `schoolId`** — cheapest migration from current state, enables platform-wide analytics, requires disciplined query scoping.

## Decision

Use **shared database, shared schema, row-level `schoolId`** isolation.

1. Add a `School` model as the tenant anchor. Move per-school config off `PlatformSettings` onto `School` (payment config/secrets, integration config/secrets, staff payout defaults, enabled payment methods). `PlatformSettings` keeps only genuinely platform-wide config (default dictionary provider, global feature flags).

2. Add `schoolId` to **every tenant-scoped table** (`User`*, `ScheduledLesson`, `LibraryMaterial`, `Quiz`, `SpeakingTopic`, `ChatConversation`, `Payment`, `StudentLessonBalance`, `LessonBalanceLedger`, `StaffCompensationProfile`, etc.). Composite indexes lead with `schoolId`. Genuinely global catalogs (`Language`, `Word`, `WordDefinition` — see ADR-006) stay unscoped.

3. **`TenantPrismaService`** — a Prisma client extension that automatically injects `where: { schoolId }` into every query for tenant-scoped models. This is the primary defense against cross-tenant data leakage; resolvers must not use the raw Prisma client for tenant data. A single explicit `asPlatform()` escape hatch (audited) is the only way to run cross-tenant queries, reserved for the platform admin module (ADR-009).

4. **Migration of existing data:** create one `school_default` row, backfill `schoolId = school_default` on all existing rows, then make `schoolId` `NOT NULL`. The current production school becomes tenant #1.

## Consequences

### Positive
- Lowest-cost migration path from the current single DB.
- Platform-wide analytics/admin console can query across tenants natively.
- Automatic query scoping removes per-resolver IDOR risk.

### Negative
- A bug in `TenantPrismaService` or any raw-client bypass is a cross-tenant breach — requires an isolation e2e test as a release gate.
- Larger, hotter indexes (mitigated by `schoolId`-leading composite indexes).

### Neutral
- `School.status` (`ACTIVE`/`TRIAL`/`SUSPENDED`) becomes the entitlement switch consumed by routing (ADR-007) and billing (ADR-008).

## Compliance

```bash
# Tenant-scoped resolvers must not use the raw Prisma client directly
grep -rn "prisma\." packages/backend/modules --include="*.resolver.ts"

# Every new tenant model should declare a schoolId-leading index
grep -rn "schoolId" packages/backend/data-access/data-access-prisma/prisma/schema.prisma
```

## Links

- Related ADRs: ADR-004 (superseded), ADR-006, ADR-007, ADR-008, ADR-009
- Wiki: `concepts/security`, future `concepts/multi-tenancy`
