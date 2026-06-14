# Staff payout

Manual payout record for staff compensation.

## Model (`StaffPayout`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | cuid | Primary key |
| `userId` | FK → User | Payee (teacher/admin/super-admin) |
| `amountMinor` | int | Gross payout in minor units |
| `currency` | string | e.g. UAH |
| `paidAt` | DateTime | When money was paid |
| `periodFrom` / `periodTo` | DateTime? | Optional accrual period reference |
| `note` | string? | Free text |
| `createdByUserId` | FK → User | Admin who recorded the payout |
| `createdAt` | DateTime | Audit |

Indexes: `(userId, paidAt)`, `(createdAt)`.

## Related

- [[entities/user]] — payee and creator
- [[concepts/staff-payouts]] — accrual modes, defaults, UI surfaces
- `StaffCompensationProfile` — per-staff rate overrides (1:1 with eligible users)
- `PlatformSettings.staffPayoutDefaults` — school defaults JSON

## Service

`StaffPayrollService.recordPayout(actorUserId, input)` validates payee role, creates row, returns DTO with display names.

Paid amounts in a statistics/finance range are aggregated with `paidAt` between range bounds (inclusive).
