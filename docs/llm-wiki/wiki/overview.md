---
tags: [overview]
updated: 2026-07-11
---

# Arvilio overview

English learning platform monorepo. **Code is authoritative** for behavior; this wiki compiles domain knowledge and decisions.

## What we build

See [[synthesis/product]] — 1:1 lessons (Meet), vocabulary, quizzes, curriculum catalog, role-based dashboards.

## Repository layout

| Area | Path | Role |
|------|------|------|
| Campus app | `apps/campus` | Next.js — Arvilio Campus (tenant product UI) |
| Platform console | `apps/platform` | Next.js — Control Plane (:4300) |
| Marketing site | `apps/hub` | Next.js :4400 — public `arvilio.app` (reads CMS over HTTP) |
| Company CMS | `apps/cms` | Payload :4410 — brand-kit, products, pages (`payload_www`) — [[concepts/payload-cms]] |
| API | `apps/api` | NestJS + GraphQL + REST auth |
| Backend modules | `packages/backend/modules/module-*` | Domain services |
| Database | `packages/backend/data-access/data-access-prisma` | Prisma / PostgreSQL |
| Frontend packages | `packages/frontend/` | Future shared UI/features (stubs today) |
| Shared types | `packages/shared/types` | DTOs, `USER_ROLE` |
| Wiki | `docs/llm-wiki/` | LLM-maintained knowledge base |
| Materials | `materials/` | Design prototypes — read-only; see [materials-index](../../reference/materials-index.md) |

## Build & dev

- **Tooling:** npm workspaces + **Turborepo**
- `npm run dev` — from a **Cursor** terminal: triggers **Cmd+Shift+B** → separate **IDE** panels per app
- `npm run dev:external` — macOS **Terminal.app** windows (outside Cursor)
- `Cmd+Shift+B` anytime — same split panels inside Cursor
- `npm run dev:turbo` — one interleaved stream (hard to read)
- `npm run dev:core` — Campus + API only (same Cursor-task behavior)
- `npm run prisma:generate` / `prisma:migrate:dev`
- **Env:** single repo-root `.env` (copy from `.env.example`). API: `load-env.ts`; Campus/Platform: `scripts/load-root-env.mjs` in `next.config`. No `apps/*/.env`.
- **Editor:** `.vscode/settings.json` — project-wide TS diagnostics + ESLint monorepo roots; tasks **Arvilio: typecheck (all)** / **lint (all)** in Command Palette → Tasks: Run Task
- **`@app/campus` typecheck:** `npm run typecheck` runs `tsconfig.json` (app) + `tsconfig.spec.json` (unit tests + `src/testing/fixtures.ts`); shared mocks in `apps/campus/src/testing/fixtures.ts`

## Domain modules

| Module | Wiki |
|--------|------|
| Auth, users, roles | [[concepts/auth-rbac]], [[entities/user]] |
| Scheduled lessons, Meet | [[concepts/lessons-calendar]], [[entities/scheduled-lesson]] |
| Vocabulary | [[concepts/vocabulary]], [[entities/word]], [[entities/student-word-card]] |
| Quizzes | [[concepts/quizzes-flashcards]], [[entities/quiz]] |
| Catalog progress | [[concepts/progress-tracking]], [[entities/lesson]] |
| GraphQL surface | [[concepts/graphql-api]] |
| Web UI | [[concepts/web-app]], [[concepts/ui-design-system]] |

## Roles (summary)

| Role | One line |
|------|----------|
| STUDENT | Learn; admin-provisioned account; assigned `teacherId` |
| TEACHER | Teach; see own students; schedule lessons |
| ADMIN | Manage student accounts via API/UI |
| SUPER_ADMIN | Manage students/teachers/admins; CLI for super-admin lifecycle |

Details: [[concepts/roles-matrix]].

## Wiki maintenance

- Raw inputs: `docs/llm-wiki/raw/`
- Schema: `docs/llm-wiki/AGENTS.md`
- Index: [[index]]
