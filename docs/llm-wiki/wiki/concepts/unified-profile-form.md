# Unified profile form

One shared profile UI for **self** (`/profile`), **student** (`/students/[id]` Profile tab), and **staff** (`/staff/[userId]` Profile tab).

## Component

`apps/web/src/components/profile/UnifiedProfilePanel.tsx`

Layout: blue **summary card** (name, email, key stats) + **section cards** (Identity, Contact & timezone, Learning, School settings, Account & bio) + save footer.

## Field policy

`profile-field-policy.ts` resolves each field as `hidden | view | edit` from:

| Input | Effect |
|-------|--------|
| `subjectKind` | `self` \| `student` \| `staff` — which field set applies |
| `viewerRole` | student / teacher / admin visibility (e.g. teacher cannot see student phone) |
| `canEdit` | global edit lock while saving or read-only viewers |
| `showNativeLanguage` | student tab when backend user exists |
| `groupLessonsEnabled` | gates lesson-format field |

All fields exist in `UnifiedProfileFormValues`; only visibility/editability changes per context.

## Adapters

`profile-form-adapters.ts` maps domain DTOs ↔ unified values:

- `/profile` — `ProfileFormState` ↔ unified
- `/students/[id]` — `MockStudent` + teacher assignment + native language id
- `/staff/[userId]` — `MyProfileDto` ↔ unified (`updateStaffUserProfile` on save)

## Wrappers (thin)

| Route | Wrapper |
|-------|---------|
| `/profile` | `ProfileDetailsPanel` in `apps/web/src/app/profile/panels.tsx` |
| `/students/[id]` | `StudentProfileTab.tsx` |
| `/staff/[userId]` | `StaffProfilePanel` in `features/staff-payout/` |

Styles: `ProfileForm.module.scss`. Shared subcomponents: `UserColorPicker`, `LessonFormatField` (student lesson format).
