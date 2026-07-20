# Statistics dashboard

Server-aggregated period analytics for **students** and **staff** (teacher / admin / super-admin).

## GraphQL

```graphql
statisticsDashboard(
  range: String!
  studentId: ID
  studentScope: String  # "all" | "my_students" — admin/super-admin profile only
  staffUserId: ID       # admin/super-admin drill-down: view another staff member's stats
): StatisticsDashboardPayload!
```

| Caller | `studentId` | `staffUserId` | `studentScope` | Result |
|--------|-------------|---------------|----------------|--------|
| Student | omitted | — | — | Own dashboard (`layout: student`) |
| Student | another user | any | — | `Forbidden` |
| Teacher | omitted | — | ignored (always my students) | `layout: teacher` + full per-student roster |
| Teacher | any | any | — | `staffUserId` → `Forbidden` |
| Admin / super-admin | omitted | omitted | `my_students` for admin; super-admin uses `my_students` when they have assigned students, otherwise `all` | Own staff dashboard |
| Admin / super-admin | omitted | staff user id | forced `my_students` for subject | Subject's teacher/admin layout; title `{displayName} statistics`; earnings for subject when `statisticsFocus = operations` |
| Admin / super-admin | student id | — | — | Student dashboard |

`studentId` and `staffUserId` cannot be combined (`BadRequest`).

`range`: `week` | `month` | `quarter` | `year` | `custom` (UTC bounds via `@pkg/types` helpers). Custom requires `rangeFrom` / `rangeTo` (`YYYY-MM-DD`, max 366 days). Profile Statistics tab: **Custom** + From/To date pickers.

## Layouts

| `layout` | Audience | Sections |
|----------|----------|----------|
| `student` | Learner (self or staff viewing student) | Lessons, vocabulary, practice, quiz, speaking, daily goals, streak |
| `teacher` | Teacher profile | Lessons you teach; **all assigned students** with per-row: lessons, practice, vocab, quiz, speaking, homework, streak |
| `admin` | Admin profile | Toggle **All students** / **My students**; school overview KPIs only on `all` |
| `super_admin` | Super-admin profile | Same as admin + extra school-wide vocab/speaking KPIs on `all` |

## Backend

- Service: `packages/backend/modules/module-auth/src/application/statistics-dashboard.service.ts`
- Resolver: `DashboardResolver.statisticsDashboard` (`module-auth`)
- GraphQL types: `packages/backend/shared/graphql/src/statistics-dashboard.types.ts`

### Student data (per period + previous period for deltas)

| Section | Prisma / services |
|---------|-------------------|
| Lessons | `scheduledLesson` by `date` (YYYY-MM-DD) |
| Vocabulary | `studentWordCard` activity + `groupBy` status |
| Practice | `practiceSession` (`PRACTICE` source) |
| Quiz | `quizAttempt` with `finishedAt` in range |
| Speaking | `speakingSubmission` in range |
| Daily goals | `DailyGoalProgressService` per UTC day (max 90 days lookback) |
| Streak | `StreakService.snapshotForStudent` |

### Staff data

| Metric | Scope |
|--------|--------|
| Lessons | `teacherId = viewer` (teacher) or all lessons (admin/super-admin) |
| Active students | Distinct `studentId` on lessons in period |
| Roster size | `User` count `STUDENT` (filtered by `teacherId` for teachers) |
| Homework reviewed | Lessons with `homeworkChecked` in period |
| Speaking reviews | `speakingSubmission.reviewedById` (teacher) |
| Top learners | Top 8 by completed lessons + quiz attempts in period |
| School overview | Student/teacher counts, utilization % (admin/super-admin) |

DTO: `StatisticsDashboardDto` in `packages/shared/types/src/lib/statistics-dashboard.ts`.

## Web

- Hook: `apps/campus/src/hooks/use-statistics-dashboard.ts`
- UI: `StatisticsDashboard` — student charts vs staff lessons/roster table
- Profile tab: all roles use the same hook; layout driven by API `layout`
- Student detail tab: hook with `studentId` → always student layout

### Role-appropriate staff KPIs

| Role / scope | `statisticsFocus` | KPI emphasis |
|--------------|-------------------|--------------|
| **Teacher** | always `operations` | Roster, lessons, homework, speaking **reviews** (queue) |
| **Admin / super-admin** · My students | `operations` (Lessons & payments UI) | Teacher-like roster KPIs + **billing** per assigned student |
| **Admin / super-admin** · My students | `learning` (Learning activity UI) | Roster activity columns + **quizzes** KPI (scoped to roster) |
| **Admin / super-admin** · All students | `operations` (Lessons & payments UI) | Above + school (teachers, utilization) + **billing** totals |
| **Admin / super-admin** · All students | `learning` (Learning activity UI) | Roster activity + **quizzes**; super-admin also **vocabulary** + **speaking submissions** |
| **Teacher** profile | `operations` / `learning` via same switcher | My-students roster; **Lessons & payments** shows lesson counts **without student pricing**; **My earnings** block for own pay |

GraphQL: optional `statisticsFocus` (`operations` \| `learning`). Profile switcher refetches when toggling roster view (any staff scope).

### Staff profile — dual roster view (UI)

Profile statistics shows **Lessons & payments** / **Learning activity** for all staff (teacher, admin, super-admin), for both **My students** and **All students** scopes:

| View | Content |
|------|---------|
| **Lessons & payments** (default) | **Admin/super-admin:** per student price/lesson, lesson counts, paid, billable. **Teacher:** lesson counts only (no money columns). **All staff:** **My earnings** (accrued, paid, outstanding, trend) for viewer. Summary tiles (paid/billable) admin only. |
| **Learning activity** | Practice, vocabulary, quiz, speaking, streak columns |

Billing data: `StudentLessonBalance`, `Payment` (SUCCEEDED), `LessonBalanceLedger` (PURCHASE/MANUAL_CREDIT), platform `paymentConfig`. Staff earnings: `StaffPayrollService.buildMyEarnings` → `statisticsDashboard.staffEarnings`. See [[concepts/staff-payouts]].

Mapper: `apps/campus/src/lib/map-statistics-dashboard.ts`.

## Profile tab UI (redesign)

`StatisticsDashboard` with `variant="profile"` ( `/profile`, `/students/[id]`, `/staff/[userId]` Statistics tab):

- **Summary card** — title from API, period label, optional `profileIntro`, top 4 KPI highlights
- **Toolbar card** — period note + filters (range, scope, roster view, custom dates)
- **Metric sections** — one `StatisticsSection` per KPI category with StatTiles
- **Chart sections** — same section pattern for trends, pies, roster table, earnings

Component: `apps/campus/src/components/statistics/StatisticsSection.tsx`. Styles: `StatisticsDashboard.module.scss` (`statsSummary`, `statsToolbar`, `statsSection*`).

## Tenant note

Staff aggregation is **single-school** today (no `schoolId` filter). When multi-tenant ships, scope lesson and user counts by tenant.
