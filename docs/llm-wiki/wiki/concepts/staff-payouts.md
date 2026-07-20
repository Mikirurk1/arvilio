# Staff payouts

School operators track **staff compensation** (teachers, admins, super-admins) separately from **student billing**.

## Scope split

| Surface | Roles | Purpose |
|---------|-------|---------|
| **System → Payouts** | `super_admin` | School-wide **defaults only** (mode, rates, frequency, grace) — stored in `PlatformSettings.staffPayoutDefaults` JSON |
| **`/finance`** | `admin`, `super_admin` | School-wide money overview: staff table (names link to `/staff/[userId]`), status badges, charts, payout history. Period switcher: week/month/quarter/year/custom. **Excludes the signed-in user** from staff rows. |
| **`/staff`** | `admin`, `super_admin` | Staff roster with period context; links to individual profiles. **Excludes the signed-in user.** |
| **`/staff/[userId]`** | `admin`, `super_admin` | Per-staff hub: **Profile** (name, timezone, contact, status — `updateStaffUserProfile`), **Compensation** (override rates vs school defaults), **Earnings & payouts**, **Statistics** (assigned students / lessons via `statisticsDashboard(staffUserId)`). |
| **Profile → Statistics → Lessons & payments** | `teacher`, `admin`, `super_admin` | **My earnings** block for the signed-in staff member (same date range as statistics dashboard) |

Teachers do **not** access `/finance` or `/staff`; they see only their own earnings in Profile statistics.

## Compensation modes

- **`per_lesson`** — completed lessons × per-lesson rate (`ScheduledLesson.status = COMPLETED`, `teacherId = staff`). Group lesson counts as **one** lesson.
- **`salary`** — fixed weekly or monthly amount, pro-rated for custom statistics ranges.
- **`mixed`** — salary pro-rata **plus** per-lesson accrual (e.g. admin who also teaches).

Per-staff overrides live in `StaffCompensationProfile` (nullable fields fall back to school defaults).

## Net outstanding («чистими»)

For a period:

`outstanding = max(0, accrued − paid)`

- **Accrued** — computed from completed lessons + salary pro-rata for the range.
- **Paid** — sum of `StaffPayout` rows with `paidAt` in the range.
- Manual payouts are recorded via GraphQL `recordStaffPayout` (admin/super-admin).

## Payout status (UI badges)

When `outstanding > 0`:

| Status | Condition |
|--------|-----------|
| `ok` (green) | Before `nextPayDate`, or no debt |
| `due` (yellow) | `today >= nextPayDate` and within grace days |
| `overdue` (red) | After `nextPayDate + graceDays` |

`nextPayDate` derives from pay frequency + pay day (weekday or day-of-month 1–28). UI pickers: weekly = weekday `<select>`; monthly = day-of-month `<select>` (1–28), not a calendar date.

## Teacher vs student money

Teachers must **not** see student lesson prices. Backend redacts pricing on `studentLessonBalance` for `TEACHER` actors; statistics roster skips billing columns for teacher layout; student Billing tab hides price UI for teacher viewers.

## Code

- Module: `packages/backend/modules/module-billing` — `StaffPayrollService`, accrual/status utils, `StaffPayrollResolver`
- Types: `packages/shared/types/src/lib/staff-payout.ts`
- Web feature layer: `apps/campus/src/features/staff-payout/` (shared forms, badges, money helpers — reused by System, `/finance`, Profile statistics)
- **`UnifiedProfilePanel`** — shared profile form for `/profile`, `/students/[id]`, and `/staff/[userId]`; see [[concepts/unified-profile-form]]
- **`StaffProfilePanel`** — thin wrapper around `UnifiedProfilePanel` on `/staff/[userId]` Profile tab
- **`StaffCompensationPanel`** — `/staff/[userId]` Compensation tab: effective-rate summary card + sectioned override form (pay structure, schedule, overdue rules)
- **`StaffPayoutDefaultsPanel`** — System → Payouts: same visual pattern for school-wide defaults (summary + section cards + footer save)
- **`RecordStaffPayoutModal`** — portal modal for `recordStaffPayout` on `/finance` and staff earnings tab
- **`StaffPayoutHistoryPanel`** — `/finance` Recent payouts and staff earnings payout history: staff filter, period hint, infinite scroll via `staffPayoutHistoryPage`
- Web routes: `apps/campus/src/app/finance`, `apps/campus/src/app/staff`, `apps/campus/src/app/system/PayoutsDefaultsPanel.tsx`

## GraphQL (summary)

| Operation | Roles |
|-----------|-------|
| `staffPayoutDefaults` / `updateStaffPayoutDefaults` | `SUPER_ADMIN` |
| `staffFinanceOverview`, `staffCompensationProfile`, `updateStaffCompensationProfile`, `recordStaffPayout`, `staffPayoutHistory`, `staffPayoutHistoryPage` (cursor pagination), `staffMemberEarnings` | `ADMIN`, `SUPER_ADMIN` |
| `staffUserProfile`, `updateStaffUserProfile` | `ADMIN`, `SUPER_ADMIN` (target must be staff; only `super_admin` may edit another `super_admin`) |
| `myStaffEarnings` | `TEACHER`, `ADMIN`, `SUPER_ADMIN` |
| `statisticsDashboard.staffEarnings` | Staff viewers when `statisticsFocus = operations` |

## Future (not MVP)

Automatic bank transfers, tax withholdings, per-staff multi-currency.
