---
tags: [concept, frontend, monorepo]
updated: 2026-05-16
---

# Frontend packages (planned)

Workspace packages under `packages/frontend/` — intended shared boundaries per `ARCHITECTURE.md`.

## Current status (2026-05)

| Package | Status |
|---------|--------|
| `shared-ui` | Stub — only `UiCardSpec` / `createCardSpec()`, **no React components** |
| `shared-utils` | Stub string export |
| `feature-lessons` | Stub |
| `feature-progress` | Stub |
| `feature-vocabulary` | Partial — overview fetch + card spec |
| `feature-flashcards` | Partial — Zustand session store |

**`apps/web` does not import these packages today.** Real UI is app-local under `apps/web/src/components/ui/`.

## Intended architecture (`ARCHITECTURE.md`)

- Server-fetch by default in App Router
- TanStack Query only where client cache needed — **not installed yet**
- Zustand for ephemeral UI only
- API access centralized in feature libs

## Path aliases

`apps/web/tsconfig.json` maps `@fe/*` feature packages and `@pkg/types` (see [[concepts/package-aliases]]).

## Migration direction

Extract domain UI from `apps/web/src/features/` into `packages/frontend/feature-*` when boundaries stabilize; keep design tokens in web or move to `shared-ui` later.

## Related

- [[concepts/ui-design-system]]
- [[concepts/web-app]]
- [[synthesis/tech-stack]]
