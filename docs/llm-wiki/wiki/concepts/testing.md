---
tags: [concept, testing, dev]
updated: 2026-07-10
---

# Testing

## Commands

| Script | What runs |
|--------|-----------|
| `npm run test` | All unit Jest projects |
| `npm run test:unit` | 10 projects: `module-auth`, `module-vocabulary`, `module-chat`, `module-lessons`, `module-flashcards`, `module-notifications`, `module-progress`, `module-mail`, `data-access-prisma`, `web` |
| `npm run test:coverage` | Unit with `--coverage` |
| `npm run test:coverage:integration` | Integration + coverage |
| `npm run test:integration` | Postgres + `AppModule` (`ts-jest`) |
| `npm run test:e2e` | Playwright (`tests/e2e/playwright.config.ts`) |
| `npm run seed:test-users` | Upsert jest-*@arvilio.test users |

## Config layout

- [`jest.config.cjs`](../../../../jest.config.cjs) — unit project list
- [`jest.config.base.cjs`](../../../../jest.config.base.cjs) + [`jest.paths.cjs`](../../../../jest.paths.cjs) — aliases, `@swc/jest`
- [`packages/backend/modules/create-module-jest-config.cjs`](../../../../packages/backend/modules/create-module-jest-config.cjs) — per-module Jest factory
- Per-module: `packages/backend/modules/module-*/jest.config.cjs`
- [`apps/campus/jest.config.cjs`](../../../../apps/campus/jest.config.cjs) — `next/jest`, jsdom, coverage on `lib/`, `stores/`, `components/ui/`, `features/`
- [`jest.integration.config.cjs`](../../../../jest.integration.config.cjs) — `ts-jest`, **`maxWorkers: 1`** (shared DB seed; avoids cross-suite cleanup races); see [`tests/integration/README.md`](../../../../tests/integration/README.md)
- Shared helpers: [`tests/shared/`](../../../../tests/shared/) (`createMockPrisma`, `gqlAs` via integration re-export)

## Integration DB

Copy `.env.test.example`. Apply migrations to `arvilio_test`. Run `npm run seed:test-users` before integration/E2E.

Bootstrap: [`tests/integration/bootstrap.ts`](../../../../tests/integration/bootstrap.ts) (`createIntegrationApp`, `gqlAs` in [`helpers.ts`](../../../../tests/integration/helpers.ts)). Module specs import shared code as `@tests/integration/seed`, `@tests/integration/bootstrap`, etc. (`tsconfig.base.json` paths).

**Seeded users** (`tests/integration/seed.ts`): `student`, `teacher`, `admin`, **`superAdmin`** (`jest-super-admin@arvilio.test`), plus E2E fixtures `studentEmpty`, `teacherEmpty`, `resetProbe` — password `TestPass123!`. Also: DIRECT chat teacher↔student, homework on completed lesson, `E2E_RESET_PASSWORD_RAW_TOKEN` for 1D.3. `superAdmin` is for integration only (e.g. `systemMailStatus`); production SUPER_ADMIN remains CLI-only.

**Vocabulary integration:** pre-upsert `Word` rows in `beforeAll` — `addStudentWordCard` calls dictionary enrichment when the lemma is missing; CI has no external dictionary API.

## E2E

- Page objects: [`tests/e2e/pages/`](../../../../tests/e2e/pages/) (`LoginPage`, `SidebarNav`, `ChatPage`, `CalendarPage`)
- `SidebarNav` targets `navigation` with `aria-label="Main navigation"` only (dashboard quick actions can share link labels).
- `LoginPage.login` waits for `POST /api/auth/login` and `/dashboard` redirect before assertions.
- **E2E dev server** (`scripts/e2e-web-server.sh`): Playwright `webServer` command — starts `npm run dev:core:turbo` (api + campus only), waits for `GET /api/auth/web-session` + `:4200`, verifies seeded login (`jest-student@arvilio.test`), then keeps servers running. Avoids full `npm run dev` / Cursor split on CI. Local reuse: `PLAYWRIGHT_SKIP_WEBSERVER=1` against already-running `dev:campus` / `dev:api`.
- Projects (`tests/e2e/playwright.config.ts`): `setup` → `student` / `teacher` / `admin` / `mobile-student` (storageState) + `public` (no cookies). **Each project has `testMatch`** so auth/platform/role specs do not cross-run (CI verify wave 1). Specs that need a guest session also clear storage (`test.use({ storageState: { cookies: [], origins: [] } })`).
- **Full suite status:** 2026-07-10 local cross-product: 1658✓ / 160✗ / 135⏭. **2026-07-21 after project routing:** listed **512** tests; wrong-project auth class eliminated. Full green still open — see `docs/e2e-journey-test-plan.md` CI verify.
- **Arvi (B7):** `expectArvi(page, pose?)` anchors on `[data-mascot]`; product presence via `useArvi` / `ArviSlot` — see [[concepts/arvi]].
- **Role product tour (Stage 5):** [`tests/e2e/specs/tour/`](../../../../tests/e2e/specs/tour/) — `tour-student.spec.ts`, `tour-teacher.spec.ts`, `tour-admin.spec.ts`; helpers in [`tests/e2e/helpers/tour.ts`](../../../../tests/e2e/helpers/tour.ts) (`resetTour`, `openTourOnDashboard`, `skipTour`, `replayTourFromProfile`). Run: `PLAYWRIGHT_SKIP_WEBSERVER=1 npx playwright test specs/tour --project=student --project=teacher --project=admin` (from `tests/e2e/`).
- **Gap leftovers (2026-07-21):** thin specs — `07-platform-leftovers-mock` (7.2.5 scroll, 7.9B.3–4), `02-help-and-offer-payment` (2.14 Help, 3K.8), `06-smtp-negatives-mock` (6.5.6–7), `07-platform-smtp-mock` (+7.6A.6). Soft-skip when Platform/Campus down or rails empty.
- **Platform optional thin (2026-07-21):** 7.3.7–8, 7.4.4–5, 7.5.3–4, 7.10.6 closed in schools-detail / promo / audit-log / users mock specs. Journey gap matrix Platform leftovers ☑.
- **CI verify wave 1 (2026-07-21):** `playwright.config.ts` project `testMatch` — each file on one project (`public` / `student` / `teacher` / `admin` / `mobile-student`). Listed suite **512** tests vs prior ~1950 cross-runs. Auth/journey cleared `storageState` + public-only skip.
- **CI verify wave 2 (2026-07-21):** Signup «Work email» locators + `LoginPage` for 1A.8. `01-auth-full` public **18/18**. Full green still open.
- **CI verify wave 3 (2026-07-21):** First full routed run **363✓ / 75✗ / 69⏭**. Fixes: platform soft-skip when `:4300` down; Chat heading/search; axe contrast (`--text-faint`, vocabulary status chips, header badges, dashboard stats); SMTP AdaptiveSelect (not native `<select>`); payment-settings mock shape; tour helper deadline + soft-skip; chat send = Socket.IO not GraphQL; `main.first()` (duplicate `#main-content` in DOM). Access token TTL **30m** — refresh setup mid-long runs. Full green still open (teacher materials/tours, remaining mocks).
- **E2E CI timeout (2026-07-21):** Cancelled job showed **2045 tests × 1 worker** (pre-`testMatch` on main). Keep project `testMatch` (~512). CI: `workers=2` (`PLAYWRIGHT_WORKERS`), `retries=1`, action/nav timeouts; workflow shards `--shard=1/2|2/2` @ 35m/job.

## Agent-browser smoke tour (manual / AI)

Exploratory UI pass via [agent-browser](https://agent-browser.dev/) CLI (not CI). Script: [`scripts/agent-browser-all-pages.sh`](../../../../scripts/agent-browser-all-pages.sh).

**Prereqs:** `npm run dev`, `npm run seed:test-users`, `agent-browser` on PATH.

```bash
bash scripts/agent-browser-all-pages.sh
# report: tmp/agent-browser-tour/report.md (+ screenshots/, gitignored)
```

Visits public auth routes, then student / teacher / admin / super-admin app paths (dynamic `/students/:id` when a list link exists). Uses the same jest-*@arvilio.test users as Playwright (`TestPass123!`).

## Current scale (2026-05-20)

| Layer | Approx. count |
|-------|----------------|
| Unit suites | **123** (~712 tests) |
| Integration suites | **10** (`graphql-lessons`, `graphql-vocabulary`, `graphql-quiz`, RBAC, …) |
| E2E route specs | **14** files (login/nav/product + per-route under `specs/pages/`) |

Backend: unit specs co-located under `application/`, `domain/`, `shared/` (and legacy `src/lib/` during migration). Module integration: `packages/backend/modules/module-*/tests/integration/`. App integration: `tests/integration/`. Prefer testing `application/*.service.ts` and `domain/*.logic.ts` — not monolithic module entry files.

## Typecheck notes

- Nested backend packages can be checked directly from their own folder with `npm run typecheck` (for example `packages/backend/modules/module-auth`, `module-billing`, `module-lessons`) when you want focused verification instead of the whole turbo graph.
- Under the current backend TS settings, env/index-signature objects should use bracket access (`process.env['FOO']`, `raw['key']`) in strict modules like billing helpers/checkouts; this matters for keeping focused module typechecks green.

## Coverage targets (local)

| Area | Target | Status |
|------|--------|--------|
| Backend modules `src/**` | ≥80% lines | In progress — pure utils + services covered; large `auth.ts` / `be-*` services partial |
| Web `lib/` + `stores/` | ≥80% lines | In progress — all 14 stores have at least smoke unit tests |
| App `page.tsx` | E2E smoke | Most routes have `specs/pages/*.spec.ts` |
| GraphQL ops | Happy path + RBAC deny | Core domains covered; extend `graphql-lessons` / `graphql-quiz` as needed |

Run `npm run test:coverage` locally before merge.

## CI (GitHub Actions)

| Workflow | Jobs |
|----------|------|
| **CI** (`.github/workflows/ci.yml`) | `quality` (lint + typecheck), `unit`, `integration` (Postgres 16), `build` (api + web), `ci-success` gate |
| **E2E** (`.github/workflows/e2e.yml`) | Playwright on `main`, weekly cron, manual — not on every PR |
| **CD** (`.github/workflows/cd.yml`) | GHCR images `api` / `web` on `main` + `v*` tags |

Details: `docs/reference/ci-cd.md`.

**GitHub Actions:** workflows use `checkout@v5`, `setup-node@v5`, `upload-artifact@v5` with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` (Node 24 runtime for action JS). Playwright HTML report is written to repo-root `playwright-report/` for artifact upload (`if-no-files-found: ignore` — path is gitignored).

## Explicit exclusions (unit)

Documented in [`tests/integration/README.md`](../../../../tests/integration/README.md):

- Google OAuth redirect/callback (integration/manual)
- Real Telegram bot / production SMTP
- Socket.IO `chat.gateway` (GraphQL chat + E2E)
- Full `be-flashcards.ts` service class — **pure logic** in [`quiz-generator.logic.ts`](../../../../packages/backend/modules/module-flashcards/src/lib/quiz-generator.logic.ts)
- App Router page components — E2E preferred over RTL

## Module layout

See [[concepts/backend-modules]] for layer folders and where to add new specs.

## Related

- [[concepts/backend-modules]]
- [[concepts/auth-rbac]]
- [[synthesis/tech-stack]]
