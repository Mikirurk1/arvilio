# Code audit snapshot — monorepo inventory

**Date:** 2026-05-16  
**Type:** Immutable audit record (agent-generated from repository state)

## Monorepo

- Root: `package.json` — npm workspaces `apps/*`, `packages/*`, `packages/*/*`
- Task runner: Turborepo `turbo.json` — `dev`, `build`, `lint`, `typecheck`
- Package manager: npm@11.6.2

## Applications

| App | Path | Stack |
|-----|------|-------|
| Web | `apps/web` | Next.js ~16, React 19, port 4200 |
| API | `apps/api` | NestJS 11, GraphQL (Apollo), port 3000, prefix `/api` |

## Backend packages

- `packages/backend/data-access/prisma` — Prisma 7, PostgreSQL
- `packages/backend/modules/auth`
- `packages/backend/modules/lessons`
- `packages/backend/modules/vocabulary`
- `packages/backend/modules/flashcards`
- `packages/backend/modules/progress`
- `packages/backend/core` — minimal

## Frontend packages (scaffold)

- `packages/frontend/ui`, `shared-utils`, `feature-*` — mostly stubs; web app does not import them yet

## Shared

- `packages/shared/types` — DTOs, `USER_ROLE` constants

## Infrastructure

- `infra/docker/docker-compose.yml` — postgres:16-alpine, api, web
- `scripts/super-admin.ts` — SUPER_ADMIN CLI

## External integrations (in code)

- Google OAuth + Calendar/Meet
- dictionaryapi.dev (vocabulary enrichment)
- Stripe: **not implemented**
