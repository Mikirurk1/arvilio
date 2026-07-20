# 04 — Platform Billing region matrix (Layer B)

> Companion: [ADR-010](../adr/ADR-010-platform-payment-rails.md) (amended).

## Locked decisions

| Topic | Decision |
|-------|----------|
| Scope | Internal Campus→Arvilio only; learner allowlist unchanged |
| Policy | Default rail+prices + arbitrary country overrides |
| Country source | `School.billingCountry` (CP only); never IP |
| IA | Billing nav; Settings = learner allowlist |
| Connect | `products.connect_*` reserved; no UI |
| UA checkout | Offer only; Stripe checkout path required |

## Acceptance checklist

- [x] ADR-010 amended + this tmp-plan
- [x] `School.billingCountry` + CP edit
- [x] `products.campus_subscription` + compat from old Stripe price fields
- [x] `resolveCampusSubscriptionOffer` + Stripe `createCheckout`
- [x] `GET/PUT /api/platform/billing/rails` + `campus-subscription`
- [x] `/billing/rails`, `/billing/campus-plans`; Settings stripped of rails
- [x] Wiki + unit tests

## Out of scope

UA Layer B checkout adapters, Connect fees, tax, Campus self-serve `billingCountry`.
