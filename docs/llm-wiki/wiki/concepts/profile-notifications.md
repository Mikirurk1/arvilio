---
tags: [concept, email, profile]
updated: 2026-05-17
---

# Profile email notifications

User-controlled delivery for five event types (email + optional Telegram). Distinct from in-app toasts (`features/notifications`).

## Preference fields (User)

Stored on `User` (Prisma booleans, default on):

| DTO key (`notificationPrefs`) | Prisma column | Default |
|-------------------------------|---------------|---------|
| `lessonReminder` | `notifyLessonReminder` | true |
| `streakAlert` | `notifyStreakAlert` | true |
| `weeklyReport` | `notifyWeeklyReport` | true |
| `newVocab` | `notifyNewVocab` | false |
| `teacherMessages` | `notifyTeacherMessages` | true |

GraphQL: `myProfile.notificationPrefs`, `updateMyProfile(input: { notificationPrefs })`.

Web: `profile-store.updateNotificationPrefs` → debounced save on Profile → Notifications tab (`apps/web/src/app/profile/page.tsx`).

## Delivery (`@be/notifications`)

| Kind | Cron / trigger | Template |
|------|----------------|----------|
| `LESSON_REMINDER` | Every 5 min, ~T-30min before lesson | `lesson-reminder/` |
| `STREAK_ALERT` | Daily 20:00 UTC, at-risk streak | `streak-alert/` |
| `WEEKLY_REPORT` | Monday 09:00 UTC | `weekly-report/` |
| `NEW_VOCAB` | Daily 08:00 UTC, word-of-day | `new-vocabulary/` |
| `TEACHER_MESSAGE` | On `sendTeacherMessage` mutation | `teacher-message/` |

Idempotency: `NotificationDelivery` unique on (`userId`, `kind`, `dedupeKey`, `channel`) — email and Telegram tracked separately.

HTML via React Email (`@be/email-templates`). SMTP unset → email skipped. Telegram: `TelegramDeliveryService` uses linked `OAuthAccount` provider `TELEGRAM` (`providerAccountId` = numeric chat id from Login Widget) and `TELEGRAM_BOT_TOKEN`; welcome message on connect in `linkTelegramToUser`. Scheduler: `@nestjs/schedule` in `apps/api`.

## Teacher messages

- Prisma `TeacherMessage` (`teacherId`, `studentId`, `body`).
- GraphQL `sendTeacherMessage` — staff only; teachers limited to assigned students.
- Web compose: `apps/web/src/app/students/[studentId]/TeacherMessageCompose.tsx` on student profile tab.

## Related

- [[concepts/transactional-email]]
- [[entities/user]]
- [[concepts/web-app]]
