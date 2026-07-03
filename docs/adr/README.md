# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for SoEnglish.

ADRs capture significant architectural decisions: their context, the decision made, and the consequences. They are immutable records — superseded ADRs are marked as such rather than deleted.

## Status lifecycle

`proposed` → `accepted` → `deprecated` → `superseded by [ADR-NNN]`

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-monorepo-turborepo-npm-workspaces.md) | Monorepo with Turborepo and npm Workspaces | accepted | 2026-06-15 |
| [ADR-002](ADR-002-backend-module-layered-structure.md) | Backend Module Layered Structure | accepted | 2026-06-15 |
| [ADR-003](ADR-003-graphql-rest-surface-split.md) | GraphQL vs REST API Surface Split | accepted | 2026-06-15 |
| [ADR-004](ADR-004-single-school-tenant-ready-architecture.md) | Single-School Now, Tenant-Ready Later | superseded by ADR-005 | 2026-06-15 |
| [ADR-005](ADR-005-multi-tenant-data-isolation.md) | Multi-Tenant Data Isolation (Shared DB, Row-Level schoolId) | proposed | 2026-06-16 |
| [ADR-006](ADR-006-global-identity-school-memberships.md) | Global User Identity with School Memberships | proposed | 2026-06-16 |
| [ADR-007](ADR-007-tenant-resolution-subdomains-custom-domains.md) | Tenant Resolution via Subdomains and Custom Domains | proposed | 2026-06-16 |
| [ADR-008](ADR-008-platform-vs-school-operators-and-billing.md) | Platform vs School Operators, Tenant-Aware Sessions, Three-Layer Billing | proposed | 2026-06-16 |
| [ADR-009](ADR-009-platform-admin-console.md) | Platform Admin Console | proposed | 2026-06-16 |

## Creating a new ADR

1. Copy `TEMPLATE.md` to `ADR-NNN-<slug>.md` where `NNN` is the next sequential number.
2. Fill in all fields. Set status to `proposed`.
3. Add a row to the index table above.
4. When the decision is agreed upon, update status to `accepted`.
5. If this ADR supersedes an older one, set the older ADR's status to `superseded by [ADR-NNN]` and add a `Supersedes:` link in the new ADR.

## Checking compliance

The Compliance section of each ADR contains grep patterns to detect violations. Run them from the repo root.

To check all recent changes at once:

```bash
git diff HEAD~10..HEAD --name-only | xargs grep -l "ADR-" 2>/dev/null
```
