# Backend (`packages/backend`)

NestJS domain modules for SoEnglish. Import via `@be/*` path aliases.

## Packages

| Scope | Path | Role |
|-------|------|------|
| `@be/auth` | `modules/module-auth` | Identity, sessions, dashboard, admin users |
| `@be/lessons` | `modules/module-lessons` | Scheduled lessons, Google Calendar |
| `@be/vocabulary` | `modules/module-vocabulary` | Words, student cards, dictionary |
| `@be/flashcards` | `modules/module-flashcards` | Quizzes, assignments, attempts |
| `@be/progress` | `modules/module-progress` | Calendar REST events |
| `@be/chat` | `modules/module-chat` | Messaging, Socket.IO |
| `@be/mail` | `modules/module-mail` | SMTP, passwords |
| `@be/notifications` | `modules/module-notifications` | Cron, Telegram, streaks |
| `@be/prisma` | `data-access/data-access-prisma` | Prisma schema + client |
| `@be/graphql` | `shared/graphql` | Shared GraphQL ObjectTypes / Inputs |
| `@be/email-templates` | `email-templates` | React Email templates |

## Module layout

Each `module-*` follows layered folders:

```
src/
  {domain}.module.ts
  presentation/graphql/   presentation/rest/
  application/            domain/            infrastructure/    shared/
```

See [backend-modules wiki](../../docs/llm-wiki/wiki/concepts/backend-modules.md).

## Scaffold

```bash
node scripts/scaffold-be-module.mjs my-domain
```

Then register `@be/my-domain` in `tsconfig.base.json`, `jest.paths.cjs`, and `apps/api/src/app/app.module.ts`.

## API gateway

[`apps/api`](../../apps/api) imports all `@be/*` modules and configures `GraphQLModule`. Domain resolvers live inside backend modules, not in `apps/api`.
