# P2.4 /billing

**Role:** admin on `/uk/billing`.

## Wired
- Page header (already had title/subtitle), loading/success/cancel/error states
- Current plan, storage/students meters, over-quota hint, unlimited label
- Stripe portal CTA + hint, trial promo block, legacy notice, promo code field
- Plan cards (Starter/Pro blurbs + subscribe buttons)
- Reused `entitlements.storage`, `entitlements.students`, `entitlements.bytes.*`
- Catalog: `billing.*`; seed `npm run seed:campus-ui -w @app/cms`

## Kept as data/content
- Plan tier codes from API (`PRO`, `TRIAL`, etc.)
- Product tier names `Starter` / `Pro` (brand labels)
- API error payload text

## Status
Verified at `/uk/billing` after seed on 2026-07-16.
