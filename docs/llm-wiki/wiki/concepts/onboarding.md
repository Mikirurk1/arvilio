---
tags: [concept, onboarding, campus]
updated: 2026-07-19
---

# Onboarding (Campus)

Two sequential systems after school signup. **Campus only** — Hub/Platform have no product tour.

## 1. School wizard (`/onboarding`)

Admin-only, school-scoped. State: `School.onboardingState` JSON `{ completed, currentStep, steps }`.

| Step | Persists in JSON | Side effects on Continue |
|------|------------------|--------------------------|
| `profile` | timezone, locale, accentColor | `School.brandColor`, `School.defaultLocale` / `enabledLocales`, admin `User.timezone` |
| `teaching` | languages, lessonFormat | `School.teachingPrefs` via `SchoolTeachingPrefsService`; editable in System → General |
| `payments` | methods[] | `PaymentSettings.enabledMethods` (config preserved) |
| `invite` | emails text | `SchoolInvitation` TEACHER per email; **requires verified admin email** or BadRequest |
| `sample-content` | seed yes/no | 3 library materials + 1 quiz + 1 planned lesson (demo student if needed; seat-aware) |

API: `GET/PATCH /api/onboarding`, `POST /api/onboarding/complete` (`SchoolOnboardingService`).

Skip advances UI without PATCH. Finish sets `completed` and routes to `/dashboard`.

Workplan leftovers: [`docs/campus-wizard-workplan.md`](../../../campus-wizard-workplan.md).

## 2. Product tour (Arvi)

User-scoped (`User.tourCompletedAt`). Chapter hub + soft scenarios — see [[concepts/arvi]] and [`docs/tour-v3-chapters.md`](../../../tour-v3-chapters.md).

Tour does not open on `/onboarding` (pathname guard).

## Related

- [[concepts/auth-rbac]] — admin gate on wizard writes
- [[concepts/billing-payments]] — payments step + System → Payments
- [[concepts/materials-library]] — sample seed
- [[concepts/multi-tenancy]] — school-scoped wizard state
