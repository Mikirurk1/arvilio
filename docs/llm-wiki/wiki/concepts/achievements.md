---
tags: [concept, achievements]
updated: 2026-05-30
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
- `speakingSubmissions`
- `speakingReviewsReceived`
- `speakingMinutesTotal`
- `gamesSessions`
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
- Speaking sessions: `PracticeSession` with `source = PRACTICE` and `kind = SPEAKING`
- Speaking recordings: `SpeakingSubmission` count for the student
- Speaking feedback: `SpeakingSubmission` with `status = REVIEWED`
- Speaking minutes: sum of `durationSec` on SPEAKING practice sessions (rounded to minutes)
- Irregular verbs drills: `PracticeSession` with `source = PRACTICE` and `kind = GAMES` (recorded from `/practice/irregular-verbs`)
- Weekly goals: `DailyGoalCompletion` in the last 7 UTC days

## Achievement branches (speaking & irregular verbs)

Catalog in `packages/shared/types/src/lib/achievements.ts`:

- **Speaking sessions** — ladder 1, 3, 5, 10, 20, 30, 50, 75, 100 (`ach_speaking_*`)
- **Speaking recordings** — 1, 5, 10 submissions (`ach_speaking_record_*`)
- **Speaking feedback** — 1, 5 teacher reviews received (`ach_speaking_feedback_*`)
- **Speaking time** — 60 minutes (`ach_speaking_minutes_60`)
- **Irregular verbs** — 1, 3, 5, 10, 20, 30, 50 drills (`ach_irregular_*`)

## Web

- `/profile` loads live stats through `apps/campus/src/hooks/use-achievement-stats.ts`
- `/students/[studentId]` loads the same server query for staff-visible student achievements
- `/practice/speaking` — create topics, record voice (`SpeakingRecordSession`), optional vocab word chips; teacher reviews all student submissions on student Practice tab
- Speaking practice time still uses `usePracticeSessionTracker` (`kind: speaking`, wall-clock while recording)
- Frontend achievement card builder: `apps/campus/src/lib/achievements.ts` (`buildProfileAchievements`); `mocks/domains/achievements.ts` re-exports for tests only

## Notes

- No dedicated Prisma achievement table yet; unlocks are computed from existing domain tables on demand.
- Teacher access to `achievementStats(studentId)` is limited to their own students; admin/super-admin can view any student.

