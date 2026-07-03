# ADR-004: Single-School Now, Tenant-Ready Later

- **Status:** superseded by [ADR-005](ADR-005-multi-tenant-data-isolation.md)
- **Date:** 2026-06-15
- **Authors:** SoEnglish engineering
- **Supersedes:** —
- **Superseded-by:** ADR-005
- **Amends:** —
- **Depends-on:** ADR-001, ADR-002, ADR-003

## Context

SoEnglish currently serves one school. The product roadmap targets a multi-tenant SaaS platform where multiple schools can operate independently, and eventually a marketplace layer where the platform routes learners to partner schools and earns a commission.

Building full multi-tenancy now would triple the implementation effort with no immediate user-facing value. However, designing without awareness of the future shape risks an irreversible architecture (e.g., auth assumptions, data ownership, billing structure) that would require a ground-up rewrite when the second school onboards.

The `.cursor/rules/future-multitenant-architecture.mdc` file captures the product vision in detail. This ADR converts those guidelines into concrete architectural constraints.

## Decision

Build for one school today. Leave explicit, low-cost seams for multi-tenancy. Never make a design choice that would force a rewrite of auth, session shape, billing ownership, or core data ownership when tenant 2 arrives.

### Scope classification (required before implementing new features)

Every new feature in auth, billing, settings, storage, or admin must be classified:

| Scope | Meaning | Examples |
|-------|---------|---------|
| Platform-wide | Exists once across all schools | Subscription billing, student marketplace, commission ledger |
| School-scoped (tenant) | Belongs to one school | Lessons, vocabulary, chat, teacher roster, pricing, Stripe keys |
| User-scoped | Belongs to one person | Profile, notification preferences, OAuth tokens |

### Concrete rules

1. **No platform singletons for school-scoped data.** School configuration, Stripe credentials, lesson pricing, and teacher assignments must be associatable with a `School` record — even if today there is only one row.

2. **Do not fold platform learner and school-enrolled learner into one identity without an attribution link.** If the platform later routes a student to a school, the enrollment event must carry enough data to recover which channel sourced the student (for commission). Design new student-creation flows with a nullable `sourceChannel` or `leadId` field from the start.

3. **Three money layers are expected eventually:**
   - Student → School (lesson payment, managed by school)
   - School → Platform (subscription)
   - Platform → School commission deduction (on platform-sourced students)
   Do not implement a single checkout that cannot split settlement later. Billing code should be isolatable per school.

4. **Auth and route protection:** Do not add assumptions that one deployed app instance = one school. Server-side auth checks should be written in a way that allows a future `schoolId` from the session without restructuring the guard interface.

5. **Payment provider secrets** (Stripe keys etc.) are stored per school, not as a single global env var (even for the single-school deployment, use the `School` record or a school-scoped settings table as the lookup point).

6. **Prefer evolvable names:** Avoid globally unique names (e.g., `globalAdminSetting`) for concepts that will clearly become school-scoped. Use `school*` prefix or include `schoolId` in the data shape.

7. **Shortcuts are acceptable** when the extraction would be annoying but localized. Leave a `// TODO(multitenant):` comment at the shortcut noting the future extraction point.

## Consequences

### Positive
- Second school can be onboarded by adding a row and routing, not rewriting auth.
- Commission attribution is recoverable from data, not reconstructed from logs.
- Billing code is isolated enough to support per-school settlement.

### Negative
- Slightly more indirection today (e.g., looking up Stripe key from `School` row rather than `process.env`).
- Engineers must classify scope before starting auth/billing/settings work, which adds a small up-front design step.

### Neutral
- The Prisma `School` model is the anchor record for all school-scoped data. It exists today as a single row; future rows are the migration path.
- The `.cursor/rules/future-multitenant-architecture.mdc` Cursor rule surfaces this ADR in context during development.

## Compliance

```bash
# Stripe or payment secrets accessed directly from process.env in non-config files
grep -r "process\.env\.STRIPE" packages/backend --include="*.ts" | grep -v "config\|settings\|\.spec\."

# Hard-coded school context assumptions (no schoolId param where one is expected)
grep -r "schoolId.*=.*1\b\|schoolId.*=.*'[a-f0-9-]*'" packages/backend --include="*.ts"

# Shortcuts marked for future extraction
grep -r "TODO(multitenant)" . --include="*.ts" -l
```

## Links

- Related code: `.cursor/rules/future-multitenant-architecture.mdc`, Prisma schema (`School` model)
- Related ADRs: ADR-001, ADR-002, ADR-003
