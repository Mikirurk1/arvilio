# /onboarding leftovers

Screenshots: `uk-desktop.png`, `uk-desktop-after.png`, `uk-teaching.png`

## Before (step 1)

- Step 1 of 5
- Timezone / Default language / Accent color / English / Ukrainian
- Loading… / Saving… / Could not save
- Later steps: teaching/payments/invite/sample hardcoded EN

## Extracted

`onboarding.progress`, `onboarding.loading|saving|saveError`, `onboarding.profile.*`, `onboarding.teaching.*`, `onboarding.payments.*`, `onboarding.invite.*`, `onboarding.sample.*`

PSP brand names (Stripe, …) kept as product identifiers; manual invoice uses `payment.bankTransfer`.
