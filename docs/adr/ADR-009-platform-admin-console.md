# ADR-009: Platform Admin Console

- **Status:** proposed
- **Date:** 2026-06-16
- **Authors:** Arvilio engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-005, ADR-008

## Context

The platform operators need a console to see everything happening across all schools and to manage platform-level configuration (including which payment methods/providers are available). The existing `apps/campus/src/app/admin` (user management) and `app/system` (settings panels) are the *school* admin surfaces and are tenant-scoped. There is no cross-tenant operator surface today.

## Decision

1. **Separate surface** served only on the platform domain (`admin.arvilio.app` or `arvilio.app/platform`), gated by `@PlatformAdmin()` (ADR-008). It is **not** reachable from a school subdomain.

2. **New backend module `@be/platform-admin`** with GraphQL resolvers under `@PlatformAdmin()`. This is the **only** module permitted to use the `asPlatform()` cross-tenant escape hatch of `TenantPrismaService` (ADR-005); every cross-tenant read/write is audited.

3. **Console scope (MVP → full):**
   - Dashboard: school counts (active/trial/suspended), MRR, aggregate active students/teachers, new leads.
   - Schools: list + detail (status, domains, subscription, data volume, activity); suspend/activate/impersonate.
   - Subscriptions/billing: Stripe state, overdue, manual adjustments, commission ledger (Layer C).
   - Leads/marketplace: inbound students, assignment to schools, commission attribution.
   - **Payment methods/providers**: manage which methods are available platform-wide (schools enable a subset); platform default dictionary/translation/video providers.
   - Audit/observability: cross-tenant action log ("see everything happening").
   - Impersonation: enter a school as support, with audit trail and a visible banner.

4. **Impersonation** issues a scoped, short-lived, audited session into the target school; it never silently elevates a school admin to platform operator.

## Consequences

### Positive
- One place to operate the whole platform; provider/method management centralized.
- Cross-tenant access is confined to one audited module, limiting blast radius.

### Negative
- The `asPlatform()` escape hatch is a high-value target — needs strict guard coverage and audit logging.

### Neutral
- Console depth grows in phases; the audit log and impersonation should exist from the MVP so operator actions are always attributable.

## Compliance

```bash
# asPlatform() escape hatch must only appear in the platform-admin module
grep -rn "asPlatform(" packages/backend --include="*.ts" | grep -v "module-platform-admin"
```

## Links

- Related ADRs: ADR-005, ADR-007, ADR-008
