# ADR-006: Global User Identity with School Memberships

- **Status:** proposed
- **Date:** 2026-06-16
- **Authors:** Arvilio engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-005

## Context

In a multi-tenant world a person may belong to more than one school (a teacher at school A, a learner at school B), and the future marketplace routes a single learner identity to partner schools. Two identity models were considered:

1. **Separate `User` row per school** — `@@unique([schoolId, email])`. Simplest to migrate, but a person ends up with duplicate accounts and no shared identity, which fights the marketplace vision (ADR-004 rule #2 / #9) and makes cross-school routing and commission attribution awkward.
2. **One global identity + membership join** — one `User` per real person (email globally unique), with a `SchoolMembership` row per (user, school) carrying the role within that school.

The product direction (platform-sourced learners routed to schools, commission attribution recoverable from data) favors a single durable identity.

## Decision

Adopt **one global `User` identity** plus a **`SchoolMembership`** join table.

1. `User.email` stays **globally unique**. `User` holds identity-level data only (email, password hash, display name, avatar, OAuth links, global preferences).

2. New `SchoolMembership { userId, schoolId, role, status }`. Role within a school (`STUDENT`/`TEACHER`/`ADMIN`) moves **off `User.role` onto the membership**. `teacherId` (student↔teacher assignment) becomes school-scoped via membership.

3. The session/JWT carries the **active** `schoolId` plus the membership role for that school (see ADR-008). Switching school = switching active membership, not re-login.

4. Platform operators are a **separate axis** (ADR-008), not a `SchoolMembership` role.

5. Migration: existing `User` rows are kept as the global identities; create a `SchoolMembership` per user into `school_default` carrying their current `User.role`. The `User.role` column is retained read-only during transition, then dropped.

## Consequences

### Positive
- One identity supports multi-school membership and marketplace routing without account duplication.
- Commission attribution (lead → enrollment → membership → schoolId) is recoverable from data.

### Negative
- Larger refactor than per-school rows: every place reading `user.role` must read the active membership's role instead.
- Auth flows (OAuth/Telegram link, invites) must select/establish the active membership.

### Neutral
- Global catalogs are consistent with this model: `Language`, `Word`, `WordDefinition` remain platform-wide (shared dictionary), not per-school.

## Compliance

```bash
# Role should come from membership, not the global User after migration
grep -rn "user\.role\|\.role ===" packages/backend/modules --include="*.ts"
```

## Links

- Related ADRs: ADR-004 (rules #2, #9), ADR-005, ADR-008, ADR-009
