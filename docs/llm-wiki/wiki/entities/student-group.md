# StudentGroup

Admin-defined **learning group** template: members, assigned teacher, and billing settings copied onto each new group lesson.

## Model

- `StudentGroup` — `name`, optional `teacherId`, billing fields (`groupBillingMode`, `groupPriceMinor`, `groupCurrency`, `groupSplitMode`, `groupPayerUserId`)
- `StudentGroupMember` — `userId`, `sortOrder`; unique per `(studentGroupId, userId)`
- `ScheduledLesson.studentGroupId` — optional link; billing + participants are **snapshotted** at lesson create

## Access

| Action | Who |
|--------|-----|
| CRUD groups | `ADMIN`, `SUPER_ADMIN` |
| List groups (for scheduling) | Staff; teachers see groups where `teacherId` = self |
| Create group lesson from group | Teacher must use `studentGroupId`; cannot send client `groupBilling` |

## Student `lessonFormat`

On `User` (students): `INDIVIDUAL_ONLY` | `GROUP_ONLY` | `MIXED`. Enforced when adding group members or creating lessons.

## Feature flag

`PlatformSettings.paymentConfig.groupLessons.enabled` — when false, group UI hidden and `kind: GROUP` create returns 400.

GraphQL (staff): `schoolGroupLessonsSettings`. Feature flag: System → **General**. Group payment defaults: System → **Payments** → Group payments. Groups UI: `/students` → **Groups** tab (`?view=groups`); `/students/groups` redirects.

## Admin UI (web)

- **Create / edit** — sectioned card: Basics (name, teacher), Billing defaults, Members.
- **Members** — add via `StudentSelectField` (`advancedSelect` + paginated `studentsPage`); only `GROUP_ONLY` / `MIXED` `lessonFormat`; min **2** members (client + server validation).
- **Save errors** — shown inside the editor card (e.g. missing name, &lt;2 members, invalid payer/amount).

## Related

- [[concepts/group-lessons]]
- [[entities/scheduled-lesson]]
- [[concepts/billing-payments]]
