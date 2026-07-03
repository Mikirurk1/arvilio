# ADR-003: GraphQL vs REST API Surface Split

- **Status:** accepted
- **Date:** 2026-06-15
- **Authors:** SoEnglish engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-002

## Context

The API has two transport surfaces — REST and GraphQL — that serve different needs. Auth flows (login, refresh, logout, Google OAuth) require cookie manipulation and redirect semantics that are natural in REST but awkward in GraphQL. Product data (lessons, vocabulary, quizzes, students, dashboard, admin) is well-served by GraphQL's flexible querying, reducing over-fetching and eliminating multiple round-trips.

Without an explicit rule, the team was inconsistently adding new endpoints to whichever surface was easiest to copy from in the file they had open, producing a mixed API that was hard for the frontend to reason about.

## Decision

The API surface is split by concern:

| Surface | What belongs here |
|---------|-------------------|
| **REST** (`@Controller`) | Auth: login, refresh, logout, me, Google OAuth, password reset. Admin: `/admin/users`. File upload and download endpoints. Any endpoint requiring HTTP redirect or cookie set. |
| **GraphQL** (`@Resolver`) | All product data queries and mutations: dashboard, lessons, vocabulary, flashcards, quizzes, students, calendar, chat, speaking topics, progress, billing. |

New endpoints default to **GraphQL unless** the operation is inherently REST (redirect, cookie, file, webhook).

The frontend uses:
- `src/lib/api.ts` for REST calls
- `graphql-request` via `/api/graphql` for GraphQL operations

Both surfaces are proxied through Next.js `/api/*` rewrites so the browser always sends cookies same-origin.

## Consequences

### Positive
- Frontend developers have a clear rule: auth uses `api.ts` helpers; product data uses generated GraphQL operations.
- GraphQL schema is the single source of truth for product data shape; OpenAPI is not maintained in parallel.
- Cookie-setting auth endpoints stay simple HTTP handlers without GraphQL context complications.

### Negative
- Some cross-cutting queries (e.g., "who am I + my current enrollments") require coordinating a REST call for identity and a GraphQL call for data, unless a thin `me` GraphQL query is added (acceptable exception).
- Engineers must resist the temptation to add product mutations as REST endpoints for convenience.

### Neutral
- `/api/graphql` is the single GraphQL endpoint; no per-domain endpoints.
- Subscriptions (WebSocket) are not currently used; if added they extend the GraphQL surface.

## Compliance

```bash
# Product domain controllers in REST that should be GraphQL
# Flag any @Controller outside auth and admin
grep -r "@Controller" packages/backend/modules/*/src/presentation/rest --include="*.ts" -l

# GraphQL mutations on auth flows (should be zero)
grep -r "Mutation\(\)" packages/backend/modules/module-auth/src --include="*.ts"
```

## Links

- Related code: `apps/web/src/lib/api.ts`, `apps/web/src/lib/graphql/`, `apps/api/src/app/app.module.ts`
- Related ADRs: ADR-002 (module structure), ADR-004 (single-school tenant-ready architecture)
