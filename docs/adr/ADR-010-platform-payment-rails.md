# ADR-010: Platform payment rails (internal vs learner)

- **Status:** accepted
- **Date:** 2026-07-10
- **Updated:** 2026-07-10 (region matrix / Billing nav)
- **Authors:** Arvilio engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** ADR-008, ADR-009
- **Depends-on:** ADR-003, ADR-008, ADR-009

## Context

Control Plane has a **learner payment-method allowlist** (campuses may only enable PSPs the platform permits). Separately, campuses pay Arvilio for SaaS (Layer B) on **platform-owned** rails. Operators need flexible **default + per-country** method and price for internal billing, without IP/VPN gaming, and without stuffing all money config into Settings (Connect fee products come later).

## Decision

1. **Two catalogs**
   - **Learner rails (policy):** `PlatformSettings.allowedPaymentMethods` — Settings only; no country matrix.
   - **Platform rails (adapters):** PSP credentials Arvilio uses to charge campuses (and later Connect). Stored as `platformBillingConfig.rails` + encrypted `platformBillingSecrets`.

2. **Commercial policy (Layer B only)**
   - `platformBillingConfig.products.campus_subscription`: **default** `{ railId, currency, prices }` plus **`countryOverrides[]`** (country → rail + prices).
   - Reserved namespace: `products.connect_*` (finder/placement fees) — not implemented here.
   - Rail catalog `regions` are capability hints only; **pricing policy is the product matrix**, not rail.regions.

3. **VPN-proof country**
   - `School.billingCountry` (ISO alpha-2), set **only by Control Plane**.
   - Checkout offer = override for that country, else default. **Never** request IP / GeoIP.
   - Null `billingCountry` → product default (not a hardcoded UA price).

4. **Control Plane IA**
   - **Billing** nav: rails credentials, campus subscription plans (default + overrides), promos.
   - **Settings**: learner allowlist only.

5. **Config ownership**
   - Platform rail secrets live only in Control Plane / platform DB (+ env fallback for Stripe).
   - Never configure Layer B keys in Campus System payments UI.

6. **Transport:** REST under `/api/platform/billing/*` (and legacy `billing-rails` alias). ADR-003 — cookies/secrets, not GraphQL.

7. **Stripe runtime:** secrets DB → env; plan price from resolved offer (`stripePriceId` or `amountMinor` + `price_data`), else env `STRIPE_PRICE_*` for default. Non-Stripe rails: offer resolvable; checkout adapters later (clear 400 until then).

## Consequences

### Positive
- Operator-owned default + country matrix; learner allowlist stays simple.
- Room for Connect fee products without rewriting Settings.
- Env remains break-glass if DB prices empty.

### Negative
- Two Stripe “accounts” conceptually (school Layer A vs platform Layer B).
- UA platform checkout adapters still deferred.

### Neutral
- Campus cannot self-serve change `billingCountry` this stage (anti-gaming).

## Compliance

```bash
rg -n "billing/rails|billing/campus-subscription|billing-rails" packages/backend/modules/module-platform-admin
rg -n "STRIPE_PLATFORM" apps/campus/src/app/system/payment && echo "FAIL: campus must not reference platform Stripe"
rg -n "billingCountry" packages/backend/data-access/data-access-prisma/prisma/schema.prisma
```

## Links

- Related code: `@be/billing` `PlatformBillingRailsService`, `apps/platform` `/billing/*`
- Related ADRs: ADR-003, ADR-008, ADR-009
- Plans: `docs/tmp-plans/03-platform-billing-rails.md`, `docs/tmp-plans/04-platform-billing-region-matrix.md`
