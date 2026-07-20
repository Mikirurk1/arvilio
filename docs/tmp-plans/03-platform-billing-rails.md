# 03 — Platform billing rails (Settings UI)

> Companion: [ADR-010](../adr/ADR-010-platform-payment-rails.md), ecosystem control-plane plan.

## Locked decisions

| Topic | Decision |
|-------|----------|
| Learner vs internal | Separate panels; separate storage |
| Regions | Stripe global `*`; LiqPay/Mono/WayForPay = `UA` |
| Stripe runtime | DB → env fallback |
| UA checkout | UI + secrets only this stage |

## Acceptance checklist

- [x] ADR-010 + this tmp-plan
- [x] `platformBillingConfig` / `platformBillingSecrets` on `PlatformSettings`
- [x] `GET/PUT /api/platform/billing-rails`
- [x] Settings panel “Platform subscription payments”
- [x] Stripe resolve DB→env in subscription service
- [x] Wiki + unit tests

## Out of scope

UA Layer B checkout adapters, Connect fees, `School.billingCountry` column, tax.
