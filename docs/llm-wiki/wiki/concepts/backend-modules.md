---
tags: [concept, backend, architecture]
updated: 2026-05-24
---

# Backend modules (`@be/*`)

## Layout

Physical path: `packages/backend/modules/module-{domain}/`  
Import scope: `@be/{domain}` (e.g. `@be/auth`).

```
module-{domain}/
  package.json
  jest.config.cjs
  src/
    index.ts                 # public API only (Module, guards, shared types)
    {domain}.module.ts       # Nest @Module — wiring only
    presentation/
      graphql/*.resolver.ts
      rest/*.controller.ts
      guards/                # module-local guards if any
    application/*.service.ts
    domain/*.logic.ts        # pure functions — no Nest/Prisma
    infrastructure/*.ts    # Prisma repos, external clients
    shared/*.util.ts         # module-local helpers
  tests/integration/         # optional module-scoped integration tests
```

## Layer rules

| Layer | May import | Must not |
|-------|------------|----------|
| `domain/` | — | `@nestjs/*`, `PrismaService` |
| `application/` | `domain/`, infrastructure ports | `presentation/` |
| `infrastructure/` | `@be/prisma`, application contracts | `presentation/` |
| `presentation/` | `application/`, `@be/auth` guards | heavy Prisma in resolvers/controllers |
| `index.ts` | re-exports public surface only | export internal services |

## GraphQL

- Resolvers live in `presentation/graphql/` inside the owning `@be/*` module.
- Shared ObjectTypes / Inputs: `@be/graphql` (`packages/backend/shared/graphql/`).
- [`apps/api`](../../../../apps/api) is a **thin gateway**: `GraphQLModule.forRoot`, imports all domain modules, no domain resolvers.

## REST

- Controllers in `presentation/rest/`.
- Global prefix `/api` is applied in `apps/api` bootstrap.

## Tests

| Level | Location |
|-------|----------|
| Unit | Co-located `*.spec.ts` next to source |
| Module integration | `module-*/tests/integration/` |
| App integration | `tests/integration/` (`AppModule`) |
| E2E | `tests/e2e/` |

Do not import monolithic `be-*.ts` / `auth.ts` blobs in unit tests — test `application/` and `domain/` units.

## Scaffold

```bash
node scripts/scaffold-be-module.mjs vocabulary
```

## Related

- [[synthesis/architecture]]
- [[concepts/graphql-api]]
- [[concepts/testing]]
- [[concepts/package-aliases]]
