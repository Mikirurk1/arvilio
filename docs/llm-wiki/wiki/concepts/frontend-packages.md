---
tags: [concept, frontend, monorepo]
updated: 2026-07-11
---

# Frontend packages

Workspace packages under `packages/frontend/` — shared boundaries per `ARCHITECTURE.md`.

## Current status (2026-07)

| Package | Status |
|---------|--------|
| `shared-ui` (`@fe/ui`) | **Live** — `Button`, `Field` (incl. `advancedSelect`), `AdvancedSelectControl`, date/time pickers + primitives SCSS |
| `shared-utils` | Stub string export |
| `feature-lessons` | Stub |
| `feature-progress` | Stub |
| `feature-vocabulary` | Partial — overview fetch + card spec |
| `feature-flashcards` | Partial — Zustand session store |

**Apps:** `@app/campus` and `@app/platform` import `@fe/ui` (Next `transpilePackages: ['@fe/ui']`). Campus keeps thin re-exports under `apps/campus/src/components/ui/{Button,Field,…}` so existing `@/components/ui` imports keep working. Platform imports `Button` / `Field` **directly** from `@fe/ui`; local `components/ui` is CP-only chrome (PageHeader, Panel, DataTable, …).

## Intended architecture (`ARCHITECTURE.md`)

- Server-fetch by default in App Router
- TanStack Query only where client cache needed — **not installed yet**
- Zustand for ephemeral UI only
- API access centralized in feature libs

## Path aliases

`tsconfig.base.json` + app tsconfigs map `@fe/*` (see [[concepts/package-aliases]]).

## Migration direction

- Primitives → `@fe/ui` (done for Button / Field / advanced select)
- Domain UI from `apps/campus/src/features/` → `packages/frontend/feature-*` when boundaries stabilize
- Design **tokens** stay per-app (`styles/tokens`); shared components consume CSS variables

## Related

- [[concepts/ui-design-system]]
- [[concepts/web-app]]
- [[synthesis/tech-stack]]
