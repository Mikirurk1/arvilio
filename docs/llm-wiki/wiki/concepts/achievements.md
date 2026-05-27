---
tags: [concept, achievements]
updated: 2026-05-26
---

# Achievements

Achievements are now computed from **live backend data**, not mock-only `unlockedAchievementIds`.

## Source of truth

- GraphQL query: `achievementStats(studentId?: ID)`
- Resolver: `packages/backend/modules/module-auth/src/presentation/graphql/dashboard.resolver.ts`
- Service: `packages/backend/modules/module-auth/src/application/achievement-stats.service.ts`

The backend computes counters on demand and returns:

- `wordsLearned`
- `lessonsCompleted`
- `streakDays`
- `quizzesCompleted`
- `perfectQuizCount`
- `speakingSessions`
- `practiceMinutesTotal`
- `lessonMinutesTotal`
- `weeklyGoalsCompleted`
- `unlockedAchievementIds`

## How unlocks are derived

Shared catalog and unlock rules live in `packages/shared/types/src/lib/achievements.ts`.

- Backend uses `computeUnlockedAchievementIds(...)`
- Frontend uses the same shared ids/catalog to render cards
- `ach_profile_complete` is now computed server-side from persisted profile fields (`displayName`, `email`, `avatarUrl`, `timezone`, `proficiencyLevel`, `phone`, `telegram`, `bio`, `nativeLanguageId`)

## Data inputs

- Lessons: completed `ScheduledLesson`
- Streak: `StreakService.snapshotForStudent(...)`
- Vocabulary: total `StudentWordCard`
- Quizzes: `QuizAttempt` count
- Perfect quizzes: `QuizAttempt.score === 100`
- Speaking: `PracticeSession` with `source = PRACTICE` and `kind = SPEAKING`
- Weekly goals: `DailyGoalCompletion` in the last 7 UTC days

## Web

- `/profile` loads live stats through `apps/web/src/hooks/use-achievement-stats.ts`
- `/students/[studentId]` loads the same server query for staff-visible student achievements
- `/practice/speaking` now records real `speaking` practice sessions through `usePracticeSessionTracker`
- Frontend catalog wrapper stays in `apps/web/src/mocks/domains/achievements.ts`, but it now consumes shared definitions instead of owning separate live logic

## Notes

- No dedicated Prisma achievement table yet; unlocks are computed from existing domain tables on demand.
- Teacher access to `achievementStats(studentId)` is limited to their own students; admin/super-admin can view any student.

