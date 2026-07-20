# Campus school wizard — remaining work

> **Scope:** Campus only (`apps/campus` + `@be/auth` onboarding). Tour v3 is **done** — see [`tour-v3-chapters.md`](./tour-v3-chapters.md).  
> **This doc:** leftover gaps in the **admin signup wizard** (`/onboarding`, `School.onboardingState`).

## Flow (already shipped)

```
register-school → /onboarding (5 steps) → complete → /dashboard → ProductTour
```

Steps: profile → teaching → payments → invite → sample-content.

## Remaining phases

### W1 — Profile side-effects — [x]

Wizard fields write real School/User data (not only JSON in `onboardingState`):

| Field | Apply to |
|-------|----------|
| `accentColor` | `School.brandColor` (via `SchoolBrandingService`) |
| `locale` | `School.defaultLocale` + ensure in `enabledLocales` |
| `timezone` | Admin `User.timezone` |

Teaching (`languages`, `lessonFormat`): see **W5** (`School.teachingPrefs`).

### W2 — Invite honesty — [x]

- If admin email unverified and emails entered → **BadRequest** (not silent skip)
- Copy: TEACHER invites; sent on Continue (not “after setup”)

### W3 — Sample + payments copy / tests — [x]

- Sample label: materials only
- Payments intro: System → Payments
- Unit test `applyPaymentsStep` + profile side-effects

### W4 — Docs / wiki — [x]

- `wiki/concepts/onboarding.md`
- Workplan linked from wiki

### W5 — Teaching prefs + richer sample — [x]

- `School.teachingPrefs` Json (`languages[]`, `lessonFormat`: online | in-person | hybrid)
- Sample seed: library materials **and** one practice quiz (idempotent per type)
- Copy updated accordingly

### W6 — Teaching prefs in System — [x]

- `GET/PATCH /api/school/teaching-prefs` (auth GET, ADMIN PATCH)
- System → General → Teaching section (edit languages + format after wizard)

### W7 — Sample demo lesson — [x]

- Seed planned `Sample: First lesson` (+ participant)
- Reuse existing ACTIVE student, else create `Demo Student` (`demo+…@sample.arvilio.invalid`, no password / no welcome email)
- Skip if seat limit blocks create and school has no students
- Attach first library material when present

## Out of scope

- Hub / Platform tours
- Tour hard-create chapters
- TTS voice assets
- Lesson/balance CSV import
