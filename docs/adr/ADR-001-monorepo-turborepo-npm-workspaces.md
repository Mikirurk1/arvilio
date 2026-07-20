# ADR-001: Monorepo with Turborepo and npm Workspaces

- **Status:** accepted
- **Date:** 2026-06-15
- **Authors:** Arvilio engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** —

## Context

Arvilio consists of a Next.js frontend (`apps/campus`), a NestJS API gateway (`apps/api`), and a set of backend domain modules under `packages/backend/modules/`. These layers share TypeScript types, Prisma-generated types, and GraphQL contracts. Managing them as separate repositories would require versioning and publishing for each internal package on every change, slowing iteration. A monorepo eliminates the cross-repo dependency problem and gives a single place to run lint, typecheck, build, and test.

npm workspaces was chosen over Yarn or pnpm because the project already uses npm and no advanced hoisting or peer-dep features that require Yarn/pnpm were identified. Turborepo was added on top as the task runner to provide caching, parallelism, and dependency-aware task ordering across workspace packages.

## Decision

The project is structured as a single **npm workspaces** monorepo with **Turborepo** as the task runner.

Package scopes:
- `@app/*` — runnable applications (`apps/campus`, `apps/api`)
- `@be/*` — backend domain modules (`packages/backend/modules/module-*`) and shared backend packages
- `@fe/*` — frontend-only shared packages
- `@pkg/*` — packages shared across web and API

All `turbo run` tasks (dev, build, lint, typecheck, test) respect the dependency graph declared in `turbo.json`.

## Consequences

### Positive
- Single `npm install` at root; no cross-repo publish cycle for internal changes.
- Turborepo cache means unchanged packages are not rebuilt in CI.
- TypeScript path aliases (`@be/*`, `@fe/*`, `@app/*`, `@pkg/*`) resolve correctly because all packages live in the same tree.
- Unified lint and typecheck surface: one command catches issues across all packages.

### Negative
- `node_modules` hoisting can produce subtle peer-dep mismatches (mitigated by `overrides` in root `package.json`).
- New contributors must understand workspace scoping to add a package correctly.
- CI must install the full dependency graph even if only one app changed (partially offset by Turborepo remote caching).

### Neutral
- Prisma schema lives in `packages/backend/data-access/data-access-prisma`; all backend modules import the generated client from there rather than generating their own.

## Compliance

Violations to watch for:
- A `package.json` inside `apps/` or `packages/` that does NOT declare its `name` with the correct scope prefix (`@app/`, `@be/`, `@fe/`, `@pkg/`).
- An import of a sibling module using a relative `../../` path that crosses package boundaries instead of the alias (`@be/...`).

```bash
# Check for cross-boundary relative imports
grep -r "from '\.\.\/\.\.\/" packages/backend/modules --include="*.ts" | grep -v node_modules
```

## Links

- Related code: `turbo.json`, `package.json` (root), `tsconfig.base.json`
- Related ADRs: ADR-002 (layered backend module structure)
