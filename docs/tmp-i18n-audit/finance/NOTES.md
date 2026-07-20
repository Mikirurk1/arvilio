# P2.3 /finance

**Role:** admin on `/uk/finance`.

## Wired
- Page header/subtitle, period filter, refresh, loading/error states
- KPI tiles, chart titles/legends/empty states, staff balances table
- Record payout modal + form (`staffPayout.*`)
- Payout history panel filters/empty/loading states
- Catalog: `finance.*`, `staffPayout.*`; seed `npm run seed:campus-ui -w @app/cms`

## Kept as data/content
- Staff names, money amounts, currency codes, dates, period labels from API (e.g. `Current month`)
- Payout notes, API error payload text

## Status
Verified at `/uk/finance` after seed on 2026-07-16 (including payout modal).
