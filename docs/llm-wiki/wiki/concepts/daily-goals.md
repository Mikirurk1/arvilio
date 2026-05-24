# Daily goals

## Overview

Students see **4 daily goals** on the dashboard — one per difficulty tier (1–4). Templates are picked deterministically per user and UTC date (`YYYY-MM-DD`).

## Data

- `DailyGoalCompletion` — `userId`, `dateKey`, `templateId`, `difficulty`, `completedAt`
- Unique: `(userId, dateKey, difficulty)` — at most one completion per tier per day

## Logic (`@pkg/types` → `daily-goals.ts`)

- `goalTemplates` — text bank by difficulty
- `getDailyGoalsForUser(userId, dateKey)` — hash-based daily pick
- `GOAL_XP_BY_DIFFICULTY` — 20 / 30 / 40 / 50 XP display

## API (GraphQL)

| Operation | Purpose |
|-----------|---------|
| `dailyGoals` | Today's goals for current student |
| `setDailyGoalDone(goalId, done)` | Toggle completion; returns updated list |

Non-students get an empty list.

## Web

- `DailyGoalsCard` in `apps/web/src/app/dashboard/sections.tsx`
- `useDashboardStore` — `fetchGoals`, `toggleGoal`

## Code

- `packages/backend/modules/module-auth/src/lib/daily-goals.service.ts`
- `apps/api/src/graphql/domain.resolvers.ts` (`DashboardResolver`)
