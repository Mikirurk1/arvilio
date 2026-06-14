---
tags: [entity, billing]
updated: 2026-05-26
---

# Entity: StudentLessonBalance

Prepaid lesson credits for a **student** (`User.role = STUDENT`). One row per student (`userId` PK). `balance` may be **negative** (debt).

| Field | Notes |
|-------|-------|
| `balance` | Individual lesson credits remaining |
| `groupBalance` | Group per-member lesson credits (separate bucket from `balance`) |
| `pricePerLessonMinor` | Optional individual override; null → platform `defaultPricePerLessonMinor` |
| `groupPricePerLessonMinor` | Optional group per-member override; null → `paymentConfig.groupLessons.defaultPriceMinor` |
| `billingMode` | `PER_LESSON`, `PACKAGES`, or `BOTH` |
| `packageOverrides` | Per-package `enabled`, `lessons`, `lessonsLocked` for self-serve checkout |
| `paymentMethodSelection` | JSON allowlist of top-level payment methods (`allowedMethods[]`); empty means all currently platform-enabled methods are allowed |
| `manualInvoiceSelection` | JSON allowlist/default for manual invoice method ids; empty allowlist means all configured manual methods. Staff Billing UI also exposes a one-click "only this method" shortcut that saves this field as a single allowed id plus matching default |

## Related

- [[entities/lesson-balance-ledger]] — audit trail
- [[concepts/billing-payments]] — methods, checkout, admin credit
- `ScheduledLesson.credited` — triggers consumption, not the balance field itself

## Code

- Prisma: `StudentLessonBalance` in `schema.prisma`
- Service: `packages/backend/modules/module-billing/src/application/lesson-balance.service.ts`
