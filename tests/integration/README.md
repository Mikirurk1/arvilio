# Integration tests

Requires PostgreSQL with migrations applied.

```bash
# Create test database (once)
createdb soenglish_test  # or via psql

export DATABASE_URL=postgresql://soenglish:soenglish@localhost:5432/soenglish_test?schema=public
npm run prisma:migrate:deploy

# Seed shared users (student / teacher / admin)
npm run seed:test-users

# Run integration suite
npm run test:integration
```

Seeded emails: `jest-student@soenglish.test`, `jest-teacher@soenglish.test`, `jest-admin@soenglish.test` — password `TestPass123!` (see `tests/integration/seed.ts`).

Playwright can use the same users via `.env.test.example`.

Set `RUN_INTEGRATION_TESTS=1` (included in `npm run test:integration`).

Domain GraphQL integration specs live next to modules, e.g. `packages/backend/modules/module-vocabulary/tests/integration/graphql-vocabulary.integration.spec.ts`. They import shared bootstrap/helpers from this folder (`bootstrap.ts`, `fixtures.ts`, `helpers.ts`, `seed.ts`). Cross-cutting smoke: `graphql-product.integration.spec.ts` stays here.

## What we do not unit-test here

- **Google OAuth** redirect/callback flows — covered by integration smoke or manual QA; mock `google-calendar` in unit tests.
- **Real Telegram bot** / production SMTP — mocked in unit; `verifySmtpConnection` may hit sandbox only in dedicated env.
- **Socket.IO gateway** live connections — prefer GraphQL chat integration + E2E; gateway unit uses mocks when added.

Shared helpers: [`tests/shared/`](../shared/) (`createMockPrisma`, `gqlAs` for integration).
