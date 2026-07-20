# Group lessons — implementation roadmap

Living checklist for Arvilio group lessons. **Do not treat `materials/` as product truth** — update `docs/llm-wiki/wiki/` when behavior ships.

## Product decisions (locked)

| Topic | Decision |
|-------|----------|
| Data model | One `ScheduledLesson` + `ScheduledLessonParticipant` junction (no duplicate lessons per slot) |
| MVP billing | **Both** `PER_MEMBER` and `FIXED_TOTAL` (with `SINGLE_PAYER` / `EQUAL_SPLIT`) |
| Max participants | No hard cap; UI warns when count > 6 |
| FIXED_TOTAL money | `GROUP_CHARGE` ledger rows with `amountMinor` + `currency` |
| PER_MEMBER | One `CONSUMPTION` (−1 credit) per participant on charge |
| Split rounding | `EQUAL_SPLIT`: floor division; remainder minor units go to **first participant** in `sortOrder` |
| `studentId` on lesson | Kept as **primary** participant (first in list) for backward compatibility |

## Access model (2026-06-02)

| Topic | Decision |
|-------|----------|
| School flag | `paymentConfig.groupLessons.enabled` (+ defaults in System → Payments) |
| Groups | `StudentGroup` + members; admin CRUD at `/students/groups` |
| Teacher create | Select group by name only; billing snapshotted from group — **no prices/modes in lesson UI** |
| Student profile | `lessonFormat`: individual only / group only / mixed (separate from `scheduleType`) |
| Legacy lessons | Existing `GROUP` lessons without `studentGroupId` remain valid |

**Migration:** `20260602120000_group_lessons_access_model`

---

## Phase 0 — Discovery

**Goal:** Confirm rules before coding (done in this doc).

- [x] Rounding: remainder to first participant
- [x] Ledger: `@@unique([scheduledLessonId, userId, kind])`
- [x] Homework: shared `homeworkText` on lesson; per-participant response on junction

**Depends on:** —

---

## Phase 1 — Data & API

**Goal:** Persist group lessons; CRUD + list + access.

### Files

- `packages/backend/data-access/data-access-prisma/prisma/schema.prisma`
- `packages/backend/data-access/data-access-prisma/prisma/migrations/20260602100000_group_lessons/migration.sql`
- `packages/shared/types/src/lib/group-lesson.ts`
- `packages/backend/modules/module-lessons/src/application/lessons.service.ts`
- `packages/backend/modules/module-lessons/src/domain/lessons-access.util.ts`
- `packages/backend/modules/module-lessons/src/infrastructure/google-calendar.service.ts`
- `packages/backend/shared/graphql/src/graphql.types.ts`
- `packages/backend/modules/module-lessons/src/presentation/graphql/lessons.resolver.ts`

### Acceptance criteria

- [ ] Enums: `ScheduledLessonKind`, `GroupLessonBillingMode`, `GroupFixedSplitMode`, `LessonParticipantRole`
- [ ] Table `ScheduledLessonParticipant` with per-participant homework fields
- [ ] Migration backfills one participant per existing lesson (`kind = INDIVIDUAL`)
- [ ] `CreateScheduledLessonRequestDto`: `kind`, `participantIds`, group billing fields
- [ ] Create GROUP: min 2 participants; `studentId` = first participant
- [ ] List/query: visible if user is teacher **or** primary student **or** in `participants`
- [ ] `ScheduledLessonBackendDto` returns `kind`, `participants[]`, billing summary
- [ ] Meet: all participant emails as attendees
- [ ] Unit tests for create group + membership

**Depends on:** Phase 0

---

## Phase 2 — Billing

**Goal:** Charge correctly for group completion/cancel.

### Files

- `packages/backend/modules/module-billing/src/application/lesson-balance.service.ts`
- `packages/backend/modules/module-billing/src/application/lesson-balance.service.spec.ts`

### Acceptance criteria

- [ ] `syncLessonCharge` delegates to group logic when `kind = GROUP`
- [ ] `PER_MEMBER`: N × `CONSUMPTION` (−1) per participant when chargeable
- [ ] `FIXED_TOTAL` + `SINGLE_PAYER`: one `GROUP_CHARGE` on payer for `groupPriceMinor`
- [ ] `FIXED_TOTAL` + `EQUAL_SPLIT`: N × `GROUP_CHARGE` with split amounts
- [ ] Reversal removes charge rows when lesson no longer chargeable
- [ ] Ledger unique `(scheduledLessonId, userId, kind)` enforced

**Depends on:** Phase 1

---

## Phase 3 — Web create

**Goal:** Teacher can create group lessons from modal.

### Files

- `apps/campus/src/features/lesson-modal/LessonSetupTab.tsx`
- `apps/campus/src/features/lesson-modal/tabTypes.ts`
- `apps/campus/src/features/lesson-modal/lessonPersistence.ts`
- `apps/campus/src/features/lesson-modal/scheduledLessonsBackendAdapter.ts`
- `apps/campus/src/graphql/operations.ts`

### Acceptance criteria

- [ ] Icon toggle: Individual / Group
- [ ] Group: participant list + “Add student”
- [ ] Billing block: mode, price, split, payer
- [ ] Warning when participants > 6
- [ ] Create mutation sends new fields

**Depends on:** Phase 1–2

---

## Phase 4 — Web surfaces

**Goal:** Calendar, list, lesson room, student profile show group context.

### Files

- `apps/campus/src/app/calendar/page.tsx`, `apps/campus/src/features/calendar/**`
- `apps/campus/src/app/lessons/**`
- `apps/campus/src/app/students/[studentId]/sections.tsx`
- `apps/campus/src/features/lesson-modal/scheduledLessonsBackendAdapter.ts`

### Acceptance criteria

- [ ] Calendar chip: “Group” badge + “Name +N”
- [ ] Conflict check includes all participants
- [ ] Lesson room: participant list in sidebar
- [ ] Student sees lesson if participant
- [ ] Student homework updates participant row

**Depends on:** Phase 3

---

## Phase 5 — Statistics

**Goal:** Staff stats reflect group lessons and billing.

### Files

- `packages/shared/types/src/lib/statistics-dashboard.ts`
- `packages/backend/modules/module-auth/src/application/statistics-dashboard.service.ts`
- `apps/campus/src/components/statistics/StatisticsDashboard.tsx`

### Acceptance criteria

- [ ] KPI: group lessons completed in period
- [ ] Roster column: lesson type (1:1 / Group N)
- [ ] Billable includes group FIXED split / PER_MEMBER rules

**Depends on:** Phase 2

---

## Phase 6 — Wiki & QA

**Goal:** Document and manual test path.

### Files

- `docs/llm-wiki/wiki/concepts/group-lessons.md` (new)
- `docs/llm-wiki/wiki/entities/scheduled-lesson.md`
- `docs/llm-wiki/wiki/concepts/billing-payments.md`
- `docs/llm-wiki/wiki/index.md`
- `docs/llm-wiki/wiki/log.md`

### Manual QA checklist

- [ ] Create 1:1 — unchanged
- [ ] Create group 3 students, PER_MEMBER — 3 credits consumed on complete
- [ ] Create group FIXED single payer — one GROUP_CHARGE on payer
- [ ] Create group FIXED equal split — split on all
- [ ] Student participant sees lesson in calendar
- [ ] Stats roster shows Group (3)

**Depends on:** Phases 1–5

---

## Out of scope (MVP)

- Stripe auto-split checkout between students
- Per-participant different prices inside one FIXED_TOTAL lesson
- Group packages in `paymentConfig`
