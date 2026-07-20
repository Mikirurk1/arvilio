---
tags: [concept, monorepo, typescript]
updated: 2026-05-20
---

# Package import aliases

Monorepo packages use **technical** TypeScript/npm scopes (layer + role), not the product name.

## Scopes

| Scope | Layer | Examples |
|-------|--------|----------|
| `@pkg/` | Shared contracts | `@pkg/types` ← `packages/shared/types` |
| `@be/` | Backend (Nest modules, Prisma) | `@be/auth`, `@be/vocabulary`, `@be/prisma` |
| `@fe/` | Frontend feature libs | `@fe/ui`, `@fe/vocabulary` |
| `@app/` | Runnable apps | `@app/campus`, `@app/api`, `@app/platform` |

## Mapping (legacy → current)

| Old (`@arvilio/…`) | Current |
|----------------------|---------|
| `shared-types` | `@pkg/types` |
| `module-auth` | `@be/auth` |
| `module-vocabulary` | `@be/vocabulary` |
| `data-access-prisma` | `@be/prisma` |
| `backend/shared/graphql` | `@be/graphql` |
| `shared-ui` | `@fe/ui` |
| `feature-vocabulary` | `@fe/vocabulary` |
| `web` / `api` | `@app/campus` / `@app/api` (legacy folder was `apps/web`) |

Config: [`tsconfig.base.json`](../../../../tsconfig.base.json), [`jest.paths.cjs`](../../../../jest.paths.cjs).

## ESLint boundaries

- `apps/campus` must not import `@be/*` — campus may import `@pkg/types` and `@fe/*`; **no** `@be/*`.
- `apps/api` / `packages/backend` must not import `@fe/*`.

See root [`eslint.config.mjs`](../../../../eslint.config.mjs).

## Related

- [[synthesis/tech-stack]]
- [[concepts/frontend-packages]]
