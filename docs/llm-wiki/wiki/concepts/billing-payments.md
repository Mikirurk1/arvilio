---
tags: [concept, billing]
updated: 2026-05-27
---

# Billing & lesson payments

## Platform settings (super-admin)

`/system` → **Payments** tab. GraphQL: `paymentSettings`, `updatePaymentSettings`.

- `enabledPaymentMethods`: `manual_invoice` | `stripe` | `liqpay` | `wayforpay` | `lemonsqueezy` | `paddle` | `monopay` | `paypal`
- `paymentConfig` JSON: `defaultPricePerLessonMinor`, `allowedCurrencies`, `defaultCurrency`, `minPackageLessons` (default 3), packages (`lessons` + `label`), `manualInvoiceMethods[]`, plus per-provider config blocks for Stripe / LiqPay / WayForPay / Lemon Squeezy / Paddle / MonoPay / PayPal
- Provider config blocks are mode-aware:
  - shared mode: `live` | `test`
  - Stripe: `livePublishableKey`, `testPublishableKey`
  - LiqPay: `livePublicKey`, `testPublicKey`
  - WayForPay: `liveMerchantAccount`, `liveMerchantDomainName`, `testMerchantAccount`, `testMerchantDomainName`
  - Lemon Squeezy: `liveStoreId`, `liveVariantId`, `liveVariantCurrency`, `testStoreId`, `testVariantId`, `testVariantCurrency` (variant currency drives checkout ISO code; amount uses `custom_price` in minor units)
  - Paddle: currently stores only the selected mode
  - MonoPay: currently stores only the selected mode
  - PayPal: `liveClientId`, `testClientId`
- Provider secrets are no longer assumed to be platform-global env only:
  - `PlatformSettings.paymentSecrets` stores encrypted provider secrets for the current school/system profile
  - `PAYMENT_SECRETS_ENCRYPTION_KEY` is the platform-level master key used to encrypt/decrypt those secrets
  - legacy provider env vars are still accepted only as fallback for installs that have not saved school secrets yet
- UI: payment method **cards**; Payments tab is grouped into sections: currencies & per-currency lesson rates, payment methods (+ checkout-currency matrix), package templates (currency per row), and “Ready for students” review before save. Currency = checkbox list from `PAYMENT_CURRENCY_OPTIONS` + default select; cards show active provider mode (`Test mode` / `Live mode`) when relevant.

### Manual invoice methods

- `manual_invoice` stays a provider-level payment method, but its config is now a list of typed entries instead of one global text blob
- First-class templates in the admin UI:
  - `iban_sepa` — receiver/beneficiary, IBAN, optional bank name/country, optional BIC/SWIFT
  - `swift_wire` — receiver/beneficiary, account number (+ optional IBAN), SWIFT/BIC, optional bank name/address, optional intermediary bank
  - `card_transfer` — cardholder name, bank name, and card number for direct person-to-person card payments
- DTO model is discriminator-based and also supports compatibility `custom` entries so old installs keep their previous manual instructions after migration; the admin/student UI shows these fallback entries as a normal `Manual invoice` item (or their own saved label) rather than as a separate first-class template
- Each structured manual method can now also carry:
  - `recipientTaxId` (for Ukrainian `ІПН / ЄДРПОУ`-style recipient codes)
  - `paymentPurpose` (explicit transfer purpose text, e.g. `За ведення уроків`)
  - `importantNotes[]` (student-facing bullet list such as SWIFT/SEPA timing, intermediary-bank fees, settlement destination)
- `card_transfer` reuses the common structured fields above, but only requires `beneficiaryName`, `bankName`, and `cardNumber` to count as configured
- `label` is now the main scenario title, so one school can keep separate entries such as `UAH IBAN transfer`, `Top up from abroad (USD, SWIFT)`, `Top up from Europe (EUR, SEPA)`, and `Top up from abroad (EUR, SWIFT)` without inventing new provider kinds
- Provider status is `configured` only when there is at least one valid manual invoice method entry. Card label uses **ready** count: e.g. `2 of 2 manual methods configured` when complete, or `1 of 2 manual methods ready` when a template is missing required fields (IBAN, SWIFT/BIC, card number, etc.). The Manual invoice modal lists `Missing: …` per draft template.

### Provider mode switcher and onboarding

- `System → Payments` provider modal now renders a provider-specific help block from a central metadata map instead of ad-hoc paragraphs
- The modal uses a richer dialog shell with a descriptive header, softer section cards for provider/manual blocks, and a more prominent footer action area so dense payment settings stay readable
- Dark theme uses the same modal structure but avoids white-tinted gradients on cards/sections, keeping the dialog on theme-native `card/surface` tones instead of washed-out gray overlays
- Every supported online provider (`stripe`, `liqpay`, `wayforpay`, `lemonsqueezy`, `paddle`, `monopay`, `paypal`) exposes a persisted `test/live` switcher
- Modal fields use label-row info tooltips that explain where each value is found in the provider dashboard
- The modal also includes:
  - official docs link
  - short “what you need to connect” checklist
  - provider note about sandbox / test behavior
- Online providers now render two groups in the modal:
  - school merchant details (non-secret ids / public keys / domains)
  - school secure secrets (secret keys, webhook secrets, private keys)
- MonoPay currently keeps only secure merchant tokens per environment; PayPal keeps client IDs in merchant details and client secret + webhook ID in secure secrets
- Secret fields never come back to the frontend as raw values; the query returns only status per field: saved in school settings, using env fallback, or missing
- `manual_invoice` has no sandbox switch and keeps only the instructional help block

## Currency model (platform)

- Admin UI (`System → Payments`): `allowedCurrencies` checkbox list from `PAYMENT_CURRENCY_OPTIONS` = **UAH, USD, EUR, GBP, PLN**; one **`defaultCurrency`** for self-serve checkout and package totals.
- **`pricePerLessonByCurrency`** — one lesson price (minor units) per allowed currency, stored in `paymentConfig` JSON and exposed on GraphQL `PaymentConfigType`. Legacy installs migrate from `defaultPricePerLessonMinor` into the default currency row via `finalizePaymentConfig` / `normalizePricePerLessonByCurrency`.
- `defaultPricePerLessonMinor` stays in sync with the default currency row (backward compatibility for older clients).
- **Per-package `currency`** — each platform package template stores ISO currency (admin select per row). `finalizePaymentConfig` defaults missing currency to `defaultCurrency`. Package total = `lessons × getPricePerLessonForCurrency(config, pkg.currency)`.
- Student checkout amount: `lessons ×` price for the package currency (or student single-number override when set).
- Save validation: `getPaymentSettingsCurrencyIssues` — per-package currency ∈ `allowedCurrencies`, lesson price > 0 for that currency, and each **enabled online provider** must support every package currency (`providerSupportsCheckoutCurrency`; Lemon Squeezy uses configured variant currency).

## Currency support by provider (code + provider limits)

| Provider | Passes checkout currency from platform? | Practical support in SoEnglish today |
|----------|----------------------------------------|--------------------------------------|
| **manual_invoice** | N/A (offline) | Any amount copy; no ISO field on templates — currency is implied by template label/instructions (e.g. UAH IBAN vs USD SWIFT). |
| **stripe** | Yes (`price_data.currency`) | Broad Stripe support; our 5 platform codes generally work if the Stripe account is enabled for them. **No pre-check in code.** |
| **paypal** | Yes (`currency_code` on order) | PayPal-supported ISO codes; **no pre-check in code.** GBP/PLN usually OK on PayPal. |
| **paddle** | Yes (`unit_price.currency_code`) | Paddle billing API; wide list but not all ISO codes — failures surface at API call. **No pre-check in code.** |
| **liqpay** | Yes (`currency` in payload) | Provider docs: **UAH, USD, EUR** (+ extras by merchant request). **GBP/PLN will fail** unless enabled on the LiqPay merchant. **No pre-check in code.** |
| **wayforpay** | Yes (`currency` on purchase) | Docs: order currency **UAH** primary; **USD/EUR** as alternative. **GBP/PLN not documented** for checkout. **No pre-check in code.** |
| **monopay** | Yes (`ccy` ISO numeric) | **Only UAH, USD, EUR** — explicit validation in `monoPayCurrencyCodeFromIso` + `BadRequestException` on checkout. **GBP/PLN blocked.** |
| **lemonsqueezy** | Variant currency from config | Checkout uses **Store ID + Variant ID** + `custom_price`. **Currency must match** `liveVariantCurrency` / `testVariantCurrency` (active mode). Student filter + save validation; backend `assertProviderSupportsPackageCurrency`. |

### Gaps / risks

1. Student **per-student price override** is still a single number (not per currency).
2. Manual invoice templates still do not store ISO currency — amount copy uses selected package on `/payment` when online packages are shown.

## Per-student price per lesson

- Platform default: `paymentConfig.defaultPricePerLessonMinor`
- Override: `StudentLessonBalance.pricePerLessonMinor` (null = default)
- Package total for checkout/display: `lessons × resolvedPricePerLessonMinor`
- GraphQL: `updateStudentLessonPricing`; balance queries return `packages` with resolved `amountMinor`

## Student billing mode & packages

- `StudentLessonBalance.billingMode`: `PER_LESSON` | `PACKAGES` | `BOTH` (DTO: `per_lesson` | `packages` | `both`)
- **Per lesson** — staff/manual pricing only; no self-serve checkout packages
- **Packages** — student tops up via fixed lesson packages (online checkout, min `minPackageLessons`)
- **Both** — per-lesson rate + optional self-serve packages
- `packageOverrides` JSON per student: `enabled`, `lessons`, `lessonsLocked` per platform `packageId`
- `paymentMethodSelection` JSON per student: `allowedMethods[]`; empty allowlist means every platform-enabled method (including future toggles). Non-empty allowlist + `restrictToAllowlistOnly: true` (set when staff saves a partial allowlist on the student Billing tab) locks the student to that list. Legacy / migrated rows without the flag still receive newly enabled platform methods on `/payment` when their saved methods remain school-enabled
- `manualInvoiceSelection` JSON per student: `allowedMethodIds[]` + optional `defaultMethodId`
- GraphQL: `updateStudentLessonBilling`; staff tab **Billing** now configures billing mode, package rules, top-level payment-method allowlist, and nested manual invoice method restrictions/default in one save flow

Env:

- Platform-wide:
  - `WEB_APP_URL`, `API_URL`
  - `PAYMENT_SECRETS_ENCRYPTION_KEY`
- `.env.example` intentionally documents only the platform-wide values above
- Provider-specific env keys still exist in runtime as undocumented legacy fallback for old installs, but the intended source of truth is now `System → Payments`

## Student experience

- Recent balance activity: shared `LessonBalanceLedgerActivity` (`apps/web/src/components/billing/`) with human-readable kind labels (`PURCHASE`, `MANUAL_CREDIT`, `CONSUMPTION`, `REVERSAL`), icons, grouped by day, relative timestamps, and `+N lessons` / `N lessons left` copy. Helpers in `apps/web/src/lib/billing/ledger-display.ts`.
- `/payment` — when self-serve packages are enabled: **(1)** choose a package (grouped by currency when multiple ISO codes exist; currency badge on card), **(2)** order summary (“You buy …”, amount, lessons, balance after), **(3)** pay online — only providers compatible with the selected package currency (`apps/web/src/lib/billing/checkout-display.ts`; Lemon Squeezy uses `myLessonBalance.lemonSqueezyVariantCurrency`). Hidden providers show a short “not available for {currency}” note. Bank transfer section includes “Transfer {amount} {currency}” when a package is selected. Balance hero “Your rate” only when `showPerLessonPricing` (per-lesson / both mode), in `defaultCurrency`.
- Backend checkout: all `*CheckoutService.createCheckout` call `assertProviderSupportsPackageCurrency` (`checkout-currency.util.ts`) after resolving the package.
- Student-facing provider copy: `apps/web/src/app/payment/payment-page-meta.ts` (`PAYMENT_METHOD_STUDENT_META`)
- Balance DTO now includes student-visible `manualInvoiceMethods` (already filtered by allowlist/default) and admin-facing `platformManualInvoiceMethods`
- Self-serve package cards use stronger visual hierarchy: `Starter` / `Popular choice` / `Premium`; the middle package is highlighted as `Recommended`
- Header badge: balance with warning (1 left) / danger (≤0 or debt); links to `/payment`
- Student-visible `availableMethods` are now resolved from the per-student `StudentLessonBalance.paymentMethodSelection` allowlist intersected with platform-enabled methods; if `manual_invoice` is not allowed, the backend also returns no manual invoice templates for that student

## Staff

- `/students/[id]` → **Billing**: view balance, configure per-student payment-method allowlist, package rules, and manual invoice subset/default in one admin save flow; the manual invoice section only appears when `manual_invoice` is allowed, and staff still have a one-click shortcut to make one concrete manual invoice template the only visible option for that student
- The student Billing tab now uses a more explicit workspace layout: top summary cards, icon-led section headers, and separate nested rule cards for billing mode, payment methods, and manual invoice restrictions so staff can understand where each setting lives without scanning one long flat form
- The `Manual invoice` payment-method card now also summarizes how many manual invoice templates are available/selected for the student and whether a default template is set, making it clearer that staff can allow one or several concrete manual invoice templates instead of only the provider-level method
- For admin restriction UI, `platformManualInvoiceMethods` now exposes the full list of templates created in `System → Payments`, while student-facing `manualInvoiceMethods` remains filtered to templates that are fully configured and allowed for that student
- The `Recommended template` selector inside the inline `Manual invoice` picker only appears when more than one template is currently available for that student; with one template there is nothing to recommend, so the UI stays compact
- The inline `Manual invoice` picker no longer has a separate “choose specific templates” toggle or `Only this` quick action; staff now directly multi-select the concrete templates they want on the student, which keeps the control smaller and clearer
- `Allowed payment methods` also no longer has a separate “choose specific methods” toggle; staff now directly check the payment methods they want, and the backend still stores “all selected” as an empty allowlist for compatibility
- Header (non-student): today / remaining lesson counts → `/lessons`

## Online checkout

- **Stripe:** Checkout Session + `POST /api/billing/stripe/webhook`
- **LiqPay:** redirect checkout + `POST /api/billing/liqpay/callback`; active mode controls the `sandbox` payload flag and selected key pair
- **WayForPay:** server-side purchase request to `https://secure.wayforpay.com/pay?behavior=offline`; backend returns hosted URL; callback `POST /api/billing/wayforpay/callback`
- **Lemon Squeezy:** API-created hosted checkout with `custom_price`; active mode controls selected API key/webhook secret, test-vs-live store/variant ids, and `test_mode` checkout creation flag; webhook `POST /api/billing/lemonsqueezy/webhook`
- **Paddle:** API-created transaction checkout using inline custom price objects; active mode switches both credentials and API base URL (`https://sandbox-api.paddle.com` vs `https://api.paddle.com`); webhook `POST /api/billing/paddle/webhook`
- **MonoPay (Plata by mono):** backend creates an acquiring invoice through `/api/merchant/invoice/create`, sends the student to returned `pageUrl`, and verifies webhook `X-Sign` with monobank ECDSA public key (`POST /api/billing/monopay/webhook`). Runtime uses per-school live/test merchant tokens.
- **PayPal:** backend creates an Orders API order, redirects the student to the PayPal approval URL, verifies PayPal webhook signatures through the `verify-webhook-signature` API, captures approved orders server-side, and finalizes credits from verified capture events (`POST /api/billing/paypal/webhook`).

All online methods still create a local `Payment` row first (`status=PENDING`) and only grant lessons after the provider webhook/callback marks the payment as succeeded.

## Module

`@be/billing` — `BillingModule` registered in `apps/api/src/app/app.module.ts`.

## Related

- [[entities/student-lesson-balance]]
- [[entities/lesson-balance-ledger]]
- [[entities/scheduled-lesson]]
