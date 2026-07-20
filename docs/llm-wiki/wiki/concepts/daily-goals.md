# Daily goals

## Overview

Students see **4 daily goals** on the dashboard — fixed activity slots (vocabulary, quiz, speaking, deep practice), one per difficulty tier (1–4). Each day a **hash-based variant** picks threshold copy from `@pkg/types` (`goalDefinitions`); completion is **computed from real activity**, not self-reported checkboxes.

## Slots (UTC `YYYY-MM-DD`)

| Tier | `kind` | Signals |
|------|--------|---------|
| 1 | `vocabulary` | `StudentWordCard.lastReviewedAt` in day, or `PracticeSession` VOCABULARY duration |
| 2 | `quiz` | Finished `QuizAttempt` (optional min score / question count per variant) |
| 3 | `speaking` | `SpeakingSubmission`, or `PracticeSession` SPEAKING duration |
| 4 | `deep_practice` | Sum of `PracticeSession.durationSec`, or one `ScheduledLesson` COMPLETED |

## Data

- `DailyGoalCompletion` table remains in Prisma but is **not written** in v1 (computed `done` only).
- Legacy manual rows are ignored.

## Logic (`packages/shared/types/src/lib/daily-goals.ts`)

- `goalDefinitions` — four kinds with variant pools (thresholds + text)
- **`daily-goal-variant-pools.ts`** — large copy pools (~30+ vocabulary, ~14 quiz, etc.): add words, add adjectives/nouns/verbs, review mistakes, mark learned, irregular verbs minutes, …
- `getDailyGoalsForUser(userId, dateKey)` — deterministic variant per tier
- `GOAL_TIER_LABELS` — Easy / Medium / Hard / Expert (UI only; no XP)

## API (GraphQL)

| Operation | Purpose |
|-----------|---------|
| `dailyGoals` | Today's goals with `progressCurrent`, `progressTarget`, `progressLabel`, `actionPath`, `done` |

Removed: `setDailyGoalDone`, `xpReward`.

Non-students get an empty list.

## Web

- `DailyGoalsCard` in `apps/campus/src/app/dashboard/sections.tsx` — read-only progress, links to practice routes
- `useDashboardStore.fetchGoals` — refetch on `PRACTICE_SESSION_LOGGED_EVENT` after practice sessions

## Code

- `packages/backend/modules/module-auth/src/application/daily-goals.service.ts`
- `packages/backend/modules/module-auth/src/application/daily-goal-progress.service.ts`
- `apps/api/src/graphql/domain.resolvers.ts` (`DashboardResolver`)
