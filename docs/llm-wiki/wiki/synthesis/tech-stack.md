---
tags: [synthesis, tech-stack]
updated: 2026-05-16
---

# Tech stack

## Monorepo & tooling

| Layer | Technology | Notes |
|-------|------------|-------|
| Workspaces | npm workspaces | `apps/*`, `packages/*`, `packages/*/*` |
| Task runner | **Turborepo** ^2.5 | `turbo run dev\|build\|lint\|typecheck` |
| TypeScript | ~5.9 | `tsconfig.base.json`, path aliases `@soenglish/*` |
| Lint / format | ESLint 9 (flat), Prettier 3 | Root `eslint.config.mjs` |
| Tests | — | No jest/vitest scripts in workspace packages |

**Root scripts:** `dev`, `dev:web`, `dev:api`, `build`, `prisma:generate`, `prisma:migrate:dev`, `super-admin`

## Runtime applications

### Web — `apps/web` (`@soenglish/web`)

| Item | Version / detail |
|------|----------------|
| Framework | Next.js ~16.1.6 (App Router) |
| UI | React ^19 |
| Dev port | 4200 |
| State | Zustand 5 |
| API | REST `src/lib/api.ts` + GraphQL `graphql-request` → `/api/graphql` |
| Proxy | `next.config.mjs` rewrites `/api/*` → `API_PROXY_TARGET` (cookies same-origin) |
| Styles | SCSS modules + CSS custom properties — [[concepts/ui-design-system]] |
| Icons | lucide-react |

### API — `apps/api` (`@soenglish/api`)

| Item | Version / detail |
|------|----------------|
| Framework | NestJS ^11 |
| GraphQL | `@nestjs/graphql` + Apollo Server 5, code-first, path `/api/graphql` |
| HTTP prefix | `/api` |
| Dev port | 3000 |
| Cookies | `cookie-parser` for auth |

## Data

| Item | Detail |
|------|--------|
| ORM | Prisma ^7.7 + `@prisma/adapter-pg` |
| Database | PostgreSQL 16 (Docker: `infra/docker/docker-compose.yml`) |
| Schema | `packages/backend/data-access/data-access-prisma/prisma/schema.prisma` |

## Authentication

| Item | Detail |
|------|--------|
| Tokens | JWT access + refresh in httpOnly cookies (`soenglish_at`, `soenglish_rt`) |
| Storage | Refresh token hashes in `AuthRefreshToken` table |
| Password | bcryptjs |
| OAuth | Google sign-in — [[concepts/auth-rbac]] |
| Guards | `AuthGuard`, `GqlAuthGuard` — user id only, no role in JWT |

## External services

| Service | Used for | Env vars |
|---------|----------|----------|
| Google OAuth | Login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, callbacks |
| Google Calendar API | Lesson events, Meet links | Via `GoogleCalendarConnection` |
| dictionaryapi.dev | Word enrichment | `DICTIONARY_API_URL` |
| Stripe | **Not implemented** | — |

## Backend modules (domain)

| Package | Responsibility |
|---------|----------------|
| `module-auth` | Login, sessions, admin user provisioning, dashboard, students list |
| `module-lessons` | Scheduled lessons REST + Google Calendar |
| `module-vocabulary` | Words, student cards, dictionary |
| `module-flashcards` | Quizzes, assignments, attempts |
| `module-progress` | Catalog lesson progress, calendar aggregation |

## Frontend packages (planned)

`packages/frontend/*` — scaffolded; **web does not import yet** — [[concepts/frontend-packages]]

## Deployment notes

- Docker Compose for local full stack
- `WEB_ORIGIN`, `JWT_SECRET`, `DATABASE_URL` — see `.env.example`

## Related

- [[synthesis/architecture]]
- [[concepts/graphql-api]]
