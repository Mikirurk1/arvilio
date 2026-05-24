---
description: Backend @be/* module layout, layers, GraphQL ownership, and tests.
globs: packages/backend/**/*,apps/api/**/*
alwaysApply: false
---

# Backend modules (`@be/*`)

Follow [[docs/llm-wiki/wiki/concepts/backend-modules.md]].

## Structure (required for new and refactored code)

```
src/
  index.ts              # public exports only
  {domain}.module.ts
  presentation/graphql/   # resolvers
  presentation/rest/      # controllers
  application/            # services / use cases
  domain/                 # pure logic (no Nest, no Prisma)
  infrastructure/       # Prisma repos, external APIs
  shared/                 # module-local utils
```

## Rules

1. **No mega-files** — keep files under ~400 LOC; split controllers/services per feature.
2. **GraphQL resolvers** belong in `@be/*` `presentation/graphql/`, not in `apps/api` (gateway wires modules only).
3. **GraphQL types** — import from `@be/graphql`, not from `apps/api`.
4. **Prisma** — only via `infrastructure/` or `application/` services, not in resolvers.
5. **Public API** — export only `*Module`, guards, decorators, and types other modules need from `src/index.ts`.
6. **Tests** — unit specs co-located; cross-module flows in `tests/integration/` or `module-*/tests/integration/`.
7. **Imports** — `@be/*` must not import `@app/api` or `@fe/*`.

## Reference modules

- Small REST-only: `module-progress`
- Split Nest files: `module-chat`, `module-mail`
- After refactor: `module-lessons`, `module-vocabulary`, `module-flashcards`, `module-auth`
