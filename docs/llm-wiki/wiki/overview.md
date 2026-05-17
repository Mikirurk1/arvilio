---
tags: [overview]
updated: 2026-05-16
---

# SoEnglish overview

English learning platform monorepo. **Code is authoritative** for behavior; this wiki compiles domain knowledge and decisions.

## What we build

See [[synthesis/product]] — 1:1 lessons (Meet), vocabulary, quizzes, curriculum catalog, role-based dashboards.

## Repository layout

| Area | Path | Role |
|------|------|------|
| Web app | `apps/web` | Next.js — student/teacher/admin UI |
| API | `apps/api` | NestJS + GraphQL + REST auth |
| Backend modules | `packages/backend/modules/module-*` | Domain services |
| Database | `packages/backend/data-access/data-access-prisma` | Prisma / PostgreSQL |
| Frontend packages | `packages/frontend/` | Future shared UI/features (stubs today) |
| Shared types | `packages/shared/types` | DTOs, `USER_ROLE` |
| Wiki | `docs/llm-wiki/` | LLM-maintained knowledge base |
| Materials | `materials/` | Design prototypes — read-only; see [materials-index](../../reference/materials-index.md) |

## Build & dev

- **Tooling:** npm workspaces + **Turborepo**
- `npm run dev` — web + api in parallel
- `npm run dev:web` / `dev:api` — filtered
- `npm run prisma:generate` / `prisma:migrate:dev`

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
