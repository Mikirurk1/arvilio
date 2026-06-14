---
tags: [concept, roles]
updated: 2026-05-16
---

# Roles matrix

Comparison of **STUDENT**, **TEACHER**, **ADMIN**, **SUPER_ADMIN** across API and web UI.

Prisma enum: `UserRole` in `schema.prisma`. DTO slug: `student` | `teacher` | `admin` | `super_admin`.

## Platform capabilities (API / product)

| Capability | STUDENT | TEACHER | ADMIN | SUPER_ADMIN |
|------------|:-------:|:-------:|:-----:|:-----------:|
| Self-register / Google sign-up | No | No | No | No |
| Login / session | Yes | Yes | Yes | Yes |
| Own profile & password | Yes | Yes | Yes | Yes |
| List students (`students` query) | No | Own `teacherId` students | All students | All students |
| REST/GraphQL admin user list | No | No | Yes (no SUPER_ADMIN in list for ADMIN) | Yes (excl. SUPER_ADMIN) |
| Create users via API | No | No | Students only | student, teacher, admin |
| Delete users via API | No | No | Students only | Any except SUPER_ADMIN |
| Create/delete SUPER_ADMIN | No | No | No | **CLI only** |
| Scheduled lesson (participant) | Yes | Yes (as teacher) | If on lesson | If on lesson |
| Dashboard stats | Student scope | Teacher lesson scope | Teacher-id scope (see gap) | Same as admin |
| Vocabulary / quizzes (authenticated) | Own data | Auth only* | Auth only* | Auth only* |

\*API does not consistently enforce teacher→student scope on vocabulary mutations — see [[concepts/auth-rbac#Known gaps]].

## Web UI — navigation

| Route | STUDENT | TEACHER | ADMIN | SUPER_ADMIN |
|-------|:-------:|:-------:|:-----:|:-----------:|
| `/dashboard`, `/practice`, `/lessons`, `/calendar`, `/vocabulary`, `/quiz`, `/profile` | Visible | Visible | Visible | Visible |
| `/students` | Hidden | Visible | Visible | Visible |
| `/finance` | Hidden | Hidden | Visible | Visible |
| `/system` | Hidden | Hidden | Hidden | Visible |
| `/payment` | Visible | Hidden | Hidden | Hidden |

Source: `sidebar-nav.tsx` + `route-policy.ts` (`canRoleAccessPathname`).

Teachers **cannot** see student lesson prices (API redaction on `studentLessonBalance`; statistics roster omits billing columns). Staff payout defaults: **System → Payouts** (`super_admin` only). Operational payouts: **`/finance`** (`admin`, `super_admin`). Own earnings: Profile statistics **My earnings** block.

## Web UI — feature matrix (`roleMatrix`)

Scopes: `dashboard`, `profile`, `vocabulary`, `quiz`, `calendar`, `practice`, `lessons`.

| Permission | STUDENT | TEACHER | ADMIN | SUPER_ADMIN |
|------------|:-------:|:-------:|:-----:|:-----------:|
| **view** (all scopes) | Yes | Yes | Yes | Yes |
| **edit** | No* | Yes | Yes | Yes |
| **schedule** | No | Yes | Yes | Yes |
| **manage** | No | No | Yes | Yes |

\*Profile: student can **edit** own profile (`profile.edit` includes student).

Additional helpers in `roles.ts`:

- `canReviewHomework` — teacher, admin, super-admin
- `isTeacherAdminOrSuper` — teacher, admin, super-admin
- `isAdminOrSuper` — admin, super-admin

Source: `apps/web/src/mocks/roles.ts`.

## Admin UI specifics (`/admin`)

| Action | ADMIN | SUPER_ADMIN |
|--------|:-----:|:-----------:|
| Create student | Yes | Yes |
| Create teacher | No | Yes |
| Create admin | No | Yes |
| Delete student | Yes | Yes |
| Delete teacher/admin | No | Yes |

Enforced in API `createUserAsAdmin` / delete handlers — UI should mirror (verify `admin/page.tsx`).

## SUPER_ADMIN CLI

```bash
npm run super-admin -- token
npm run super-admin -- create --token "$TOKEN" --email ... --password ...
npm run super-admin -- list --token "$TOKEN"
```

Requires `SUPER_ADMIN_CLI_SECRET` in `.env`.

## Related

- [[concepts/auth-rbac]]
- [[entities/user]]
