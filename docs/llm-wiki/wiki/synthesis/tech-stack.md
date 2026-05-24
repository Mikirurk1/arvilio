---
tags: [synthesis, tech-stack]
updated: 2026-05-20
---

# Tech stack

## Monorepo & tooling

| Layer | Technology | Notes |
|-------|------------|-------|
| Workspaces | npm workspaces | `apps/*`, `packages/*`, `packages/*/*` |
| Task runner | **Turborepo** ^2.5 | `turbo run dev\|build\|lint\|typecheck\|test` |
| TypeScript | ~5.9 | `tsconfig.base.json`, path aliases `@pkg/*`, `@be/*`, `@fe/*`, `@app/*` — [[concepts/package-aliases]] |
| Lint / format | ESLint 9 (flat), Prettier 3 | Root `eslint.config.mjs` |
| Unit tests | **Jest** 29 + `@swc/jest` | Projects: `module-auth`, `apps/web` (`next/jest`, jsdom) |
| Integration tests | Jest + **ts-jest** + supertest | `jest.integration.config.cjs`; needs Postgres — [[concepts/testing]] |
| E2E | **Playwright** | `tests/e2e/`; env `PLAYWRIGHT_TEST_EMAIL` / `PASSWORD` |
| CI/CD | **GitHub Actions** | CI (lint, typecheck, unit, integration, build); CD → GHCR; see `docs/reference/ci-cd.md` |
| Containers | Docker | Dev: `infra/docker/docker-compose.yml`; prod images: `*.prod.Dockerfile`, `docker-compose.prod.yml` |

**Root scripts:** `dev`, `dev:web`, `dev:api`, `build`, `test`, `test:unit`, `test:integration`, `test:e2e`, `prisma:generate`, `prisma:migrate:dev`, `prisma:studio`, `super-admin`

## Runtime applications

### Web — `apps/web` (`@app/web`)

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

### API — `apps/api` (`@app/api`)

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

## Prisma Migrate

- Schema: `packages/backend/data-access/data-access-prisma/prisma/schema.prisma`
- History is a **single baseline** migration `20260501000000_baseline` (full schema from empty). Older incremental folders were squashed so `migrate dev` shadow replay works.
- **Apply on existing DB (prod/staging):** `npm run prisma:migrate:deploy` then `npm run prisma:generate`
- **Create migrations locally:** `npm run prisma:migrate:dev` (needs Postgres + shadow DB)
- **After pull, if `migrate dev` fails and `_prisma_migrations` lists removed migration names:** `npm run prisma:migrate:rebaseline` (marks baseline applied; does not alter app tables)

## Prisma Studio

- **Run:** `npm run prisma:studio` (loads root `prisma.config.ts`; default URL often `http://localhost:5555`, port may vary).
- **Terminal noise:** Prisma 7 + Node 22+ may log repeated `[Prisma Studio] Error [ERR_STREAM_UNABLE_TO_PIPE]` when the browser cancels favicon/preflight requests. Upstream cosmetic issue ([prisma/studio#1479](https://github.com/prisma/studio/issues/1479)); Studio still serves the UI if HTTP 200 on the printed URL.
- **If the UI is blank:** open via `http://localhost:<port>` (not LAN IP) so `crypto.randomUUID` works; ensure Postgres is up and `DATABASE_URL` in `.env` matches `soenglish-postgres`.
- **"Could not load schema metadata":** Postgres not reachable (e.g. `pg_isready -h localhost -p 5432` fails). Start DB: `docker compose -f infra/docker/docker-compose.yml up -d postgres` (Docker Desktop must be running), then **restart** Studio.

## Local dev (recommended)

- **App on host:** `npm run dev` (API :3000, web :4200) — logs in the terminal, hot reload.
- **DB in Docker only:** `npm run docker:up` (Postgres :5432). Do **not** use `docker:stack` unless you want api/web in containers.
- If api/web containers were started earlier: `npm run docker:stack:down`.
- API needs Postgres; if stopped → Prisma `ECONNREFUSED` → **500** on `/api/auth/me`. Check: `pg_isready -h localhost -p 5432 -U soenglish -d soenglish`.
- Full stack in Docker (optional): `npm run docker:stack` or `npm run docker:restore:stack`.

## Deployment notes

- Docker Compose for local full stack
- `WEB_ORIGIN`, `JWT_SECRET`, `DATABASE_URL` — see `.env.example`

## Related

- [[synthesis/architecture]]
- [[concepts/graphql-api]]
