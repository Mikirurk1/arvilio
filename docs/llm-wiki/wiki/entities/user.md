---
tags: [entity, auth]
updated: 2026-05-16
---

# Entity: User

Central identity for students, teachers, admins, and super-admins.

## Prisma model

`User` in `packages/backend/data-access/data-access-prisma/prisma/schema.prisma`

| Field | Type | Notes |
|-------|------|-------|
| `id` | cuid | Primary key |
| `email` | string | Unique |
| `passwordHash` | string? | Null for Google-only users |
| `displayName` | string | |
| `avatarUrl` | string? | |
| `role` | UserRole | Default STUDENT |
| `status` | UserAccountStatus | ACTIVE default; not enforced at login |
| `proficiencyLevel` | ProficiencyLevel? | A1–C2 |
| `timezone` | string | IANA, default `Europe/Kyiv` |
| `phone`, `telegram`, `bio` | optional | Profile |
| `nativeLanguageId` | string? | FK → [[entities/language]]; user may set on own profile |
| `learningLanguages` | M2M | **Students only**; admin/super-admin on create or `updateStudentLanguages` |
| `teacherId` | string? | Assigned teacher for **students** |
| `notifyLessonReminder` … `notifyTeacherMessages` | boolean | Email prefs; see [[concepts/profile-notifications]] |

## Roles

| Prisma | API DTO | Numeric id (web) |
|--------|---------|------------------|
| STUDENT | `student` | 1 |
| TEACHER | `teacher` | 2 |
| ADMIN | `admin` | 3 |
| SUPER_ADMIN | `super_admin` | 4 |

See [[concepts/roles-matrix]].

## Relations

| Relation | Model | Role |
|----------|-------|------|
| `teacher` / `students` | User | Student ↔ assigned teacher |
| `oauthAccounts` | OAuthAccount | Google, etc. |
| `refreshTokens` | AuthRefreshToken | Sessions |
| `vocabularyCards` | StudentWordCard | |
| `progress` | Progress | Catalog lessons |
| `reviewQueue` | ReviewQueue | Spaced repetition |
| `lessonsAsTeacher` / `lessonsAsStudent` | ScheduledLesson | |
| `ownedQuizzes`, `assignedQuizzes`, `quizAttempts` | Quiz domain | |
| `calendarConnection` | GoogleCalendarConnection | One per user |
| `notificationDeliveries` | NotificationDelivery | Sent-email dedupe |
| `teacherMessagesReceived` / `teacherMessagesSent` | TeacherMessage | Staff → student |

## Code entry points

- Auth: `packages/backend/modules/module-auth/src/lib/auth.ts`
- Students list: `users.service.ts` → GraphQL `UsersResolver.students`
- Web session: `apps/campus/src/lib/auth-context.tsx`, `lib/active-user.ts`
- Admin UI: `apps/campus/src/app/admin/page.tsx`

## Related

- [[concepts/auth-rbac]]
- [[entities/google-calendar-connection]]
