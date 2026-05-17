---
tags: [concept, api]
updated: 2026-05-16
---

# GraphQL API

Code-first GraphQL at **`/api/graphql`** (Nest global prefix `api` + path `graphql`).

Config: `apps/api/src/app/app.module.ts` — Apollo driver, `autoSchemaFile: true`, introspection on.

## Resolvers (`domain.resolvers.ts`)

All use `@UseGuards(GqlAuthGuard)` unless noted.

| Resolver | Queries | Mutations |
|----------|---------|-----------|
| **DashboardResolver** | `dashboardSummary`, `dailyGoals`, `learningStreak`, `wordOfDay`, `practiceWeekSummary` | `setDailyGoalDone`, `recordPracticeSession` |
| **VocabularyResolver** | `vocabularyOverview`, `lookupWord`, `wordsByIds`, `globalWords`, `studentVocabulary` | `addStudentWordCard`, `updateCardStatus` |
| **QuizzesResolver** | `quizzes`, `quiz` | `generateQuiz` |
| **LessonsResolver** | `scheduledLessons`, `scheduledLesson` (+ membership) | `createScheduledLesson`, `updateScheduledLesson`, `deleteScheduledLesson` |
| **UsersResolver** | `students`, `assignableTeachers`, `myProfile` | `updateMyProfile`, `changeMyPassword` |
| **AdminResolver** | `adminUsers` (+ `requireAdmin`) | `createAdminUser`, `deleteAdminUser` |
| **SystemResolver** | `systemMailStatus` (super-admin) | `verifySmtpConnection`, `sendTestWelcomeEmail` |

Types defined in `apps/api/src/graphql/graphql.types.ts`.

## REST (companion)

Auth and some module routes remain REST under `/api/auth`, `/api/...` from backend modules.

## Client

- `apps/web/src/lib/graphql-client.ts` — `graphql-request`, cookies included
- Operations: `apps/web/src/graphql/operations.ts`

## Auth context

`@CurrentGqlUser()` injects authenticated user id from cookie/Bearer — see [[concepts/auth-rbac]].

## Local API dev

`apps/api` **does not** run TypeScript via `tsx` (decorators break on workspace packages). Dev script: `apps/api/scripts/dev.cjs`:

1. `tsc` + `tsc-alias` → `dist/apps/api/`
2. `node --env-file=<repo>/.env` child on port 3000
3. Debounced rebuild when `apps/api/src/**/*.ts` changes (watch **source**, not `dist/main.js` — avoids restart storms)

Production-style start: `npm run start` in `apps/api` (also uses `--env-file`).

Env for SMTP/DB: repo-root `.env` loaded in `apps/api/src/load-env.ts` at bootstrap (and via `--env-file` in dev). Without this, `systemMailStatus` shows “Not configured” even when `.env` is filled in the editor.

## Related

- [[synthesis/architecture]]
- [[synthesis/tech-stack]]
