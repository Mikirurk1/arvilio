# Group lessons

One `ScheduledLesson` row with `kind = GROUP` and many students via `ScheduledLessonParticipant`.

## Product rules (MVP)

| Topic | Behavior |
|-------|----------|
| Participants | Min 2 for create; no hard cap (UI warns above 6) |
| Primary student | `ScheduledLesson.studentId` = first participant (`sortOrder` 0) for backward compatibility |
| Access | Teacher **or** primary student **or** any participant |
| Homework | Shared `homeworkText` on lesson; per-participant `studentResponse*` on junction |
| Meet / Calendar | All participant emails as attendees; title suffix `(Group)` |

## Billing

| Mode | On chargeable completion |
|------|---------------------------|
| `PER_MEMBER` | One `CONSUMPTION` (−1 credit) per participant |
| `FIXED_TOTAL` + `SINGLE_PAYER` | One `GROUP_CHARGE` on payer (`amountMinor`, `delta: 0`) |
| `FIXED_TOTAL` + `EQUAL_SPLIT` | N × `GROUP_CHARGE`; floor split, remainder minor units on first participant |

Ledger uniqueness: `@@unique([scheduledLessonId, userId, kind])`.

Implementation: `LessonBalanceService.syncLessonCharge` → `syncGroupLessonCharges` in `packages/backend/modules/module-billing`.

## School feature flag

`paymentConfig.groupLessons` (platform JSON): `enabled`, default billing for new groups. Staff query: `schoolGroupLessonsSettings`. When disabled, hide group UI and reject group creates.

- Disabled API message (constant `@pkg/types` `GROUP_LESSONS_FEATURE_DISABLED_MESSAGE`): `Group lessons are not enabled for this school`.
- Backend guards: `assertGroupLessonsEnabledForSchool` on `kind: GROUP` **or** `studentGroupId`; `StudentGroupsService.assertGroupLessonsFeatureEnabled()` on all group CRUD/list.
- Web gating helpers: `apps/campus/src/lib/group-lessons-feature.ts` (`resolveGroupLessonsUiSurfaces`, `stripGroupContentFromStatisticsView`, etc.) — unit-tested; toggle persisted via `GeneralPanel` → `syncGroupLessonsEnabled` + `useSchoolGroupLessons().refresh`.
- Tests: `group-lessons-feature.test.ts`, `group-lesson.util.spec.ts`, `student-groups.service.spec.ts`, integration `graphql-group-lessons-feature.integration.spec.ts`.

## Access model (2026-06)

| Role | Scheduling | Billing configuration |
|------|------------|------------------------|
| Teacher | Pick **learning group** by name; read-only member list | None in lesson UI |
| Admin | Same + manage groups on `/students?view=groups` | Group template + System → Payments → Group payments |

Teachers must pass `studentGroupId` for group lessons (no ad-hoc multi-student + billing in modal).

## API / web

- GraphQL: `studentGroups`, `createStudentGroup`, `studentGroupId` on lesson create.
- `User.lessonFormat` on student profile (staff); hero badge + billing/lessons split when flag on.
- **System → General:** `groupLessons.enabled` toggle. **System → Payments:** group payment defaults (when enabled).
- **Nav:** `Students & Groups` when enabled. **Students page:** `Students | Groups` switcher (`/students?view=groups`); legacy `/students/groups` redirects.
- **Student profile:** lesson format badge; header stats for individual balance vs group memberships; Lessons tab filter by `kind`; Billing tab dual-track summary.
- `studentLessonBalance` includes `lessonFormat`, `groupMemberships`, ledger `amountMinor`/`currency` for `GROUP_CHARGE`.
- Web create: `LessonSetupTab` — group picker when flag on; no billing block for teachers.
- Roadmap: `docs/product/group-lessons-roadmap.md`.

## Related

- [[entities/student-group]]
- [[entities/scheduled-lesson]]
- [[concepts/billing-payments]]
- [[concepts/lessons-calendar]]
