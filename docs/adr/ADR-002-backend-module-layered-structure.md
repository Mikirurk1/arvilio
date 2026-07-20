# ADR-002: Backend Module Layered Structure

- **Status:** accepted
- **Date:** 2026-06-15
- **Authors:** Arvilio engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-001

## Context

NestJS encourages a flat `controllers / services / modules` pattern that, at scale, produces large files with mixed concerns — HTTP handling, business rules, and database access all in the same service. Past modules in this project (`module-lessons`, `module-vocabulary`, `module-auth`) grew beyond 400 lines per file before a split was enforced manually.

The project also mixes GraphQL resolvers and REST controllers. Without explicit rules, resolvers migrated into `apps/api` (the gateway), which makes them hard to test in isolation and couples transport to the gateway.

## Decision

Every backend domain module under `packages/backend/modules/module-*` must follow this directory structure:

```
src/
  index.ts                    # public exports only
  {domain}.module.ts          # NestJS module registration
  presentation/
    graphql/                  # resolvers only
    rest/                     # @Controller classes only
  application/                # @Injectable services / use cases
  domain/                     # pure TypeScript logic (no Nest, no Prisma)
  infrastructure/             # Prisma repositories, external API clients
  shared/                     # module-local utilities and DTOs
```

Rules enforced by this ADR:

1. Files stay under ~400 LOC; split per feature when the limit is approached.
2. GraphQL resolvers live in `presentation/graphql/` of the owning `@be/*` module, not in `apps/api`.
3. GraphQL `ObjectType` / `InputType` classes are exported from `@be/graphql` (the shared graphql package), not redeclared locally.
4. Prisma is used only in `infrastructure/` or `application/` layers; resolvers and controllers never import `PrismaClient` directly.
5. `src/index.ts` exports only: the NestJS module class, guards, decorators, and types that other modules depend on.
6. `@be/*` modules must not import `@app/api` or `@fe/*`.

## Consequences

### Positive
- Domain logic in `domain/` is testable without spinning up NestJS or a database.
- Clear seam for future tenant isolation: `infrastructure/` repositories can accept a tenant context without touching resolvers.
- `apps/api` stays thin (wires modules, configures GraphQL, applies global middleware) — easier to replace or duplicate for multi-tenant gateway routing later.

### Negative
- More directories per module than a vanilla NestJS project; onboarding cost for engineers used to flat structure.
- Files must be split earlier than engineers instinctively would.

### Neutral
- Integration tests for cross-module flows live in `tests/integration/` at repo root or in `module-*/tests/integration/`.

## Compliance

```bash
# Prisma imported outside infrastructure/ or application/
grep -r "PrismaClient\|from '@prisma/client'" \
  packages/backend/modules/*/src/presentation \
  packages/backend/modules/*/src/domain \
  --include="*.ts"

# Resolvers declared in apps/api (should be zero)
grep -r "@Resolver" apps/api/src --include="*.ts"

# Cross-boundary imports (@be importing @app/api or @fe)
grep -r "from '@app/api\|from '@fe/" packages/backend --include="*.ts"
```

## Links

- Related code: `packages/backend/modules/`, `packages/backend/shared/graphql/`
- Related ADRs: ADR-001 (monorepo), ADR-003 (GraphQL vs REST surface split)
