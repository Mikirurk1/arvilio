# P2.5 /system

**Role:** super_admin on `/uk/system` (all tabs General → Seller & legal).

## Wired
- Shell: `system.title`, `system.subtitle`, overview cards, tab labels (`system.tab.*`)
- **General:** `system.general.*`, video meetings (`system.general.videoMeetings.*`)
- **Email:** `system.email.*` + `common.refresh` / `common.refreshing`
- **Dictionary:** `system.dictionary.*`, captions keys in `MediaCaptionsPanel` (component wired; not mounted in panel tree yet)
- **Connections:** `system.connections.*`, field `labelKey` + `t()` in meta
- **Payments:** `system.payments.*` (panel, pricing, methods, packages, modals, primitives)
- **Payouts:** `system.payouts.*` + `StaffPayoutDefaultsPanel` / fields
- **Domains:** `system.domains.*`
- **Branding:** `system.branding.*`
- **Seller & legal:** `system.seller.*`
- Helpers: `payment-panel-utils` / `staff-payout-ui` optional `t` for group billing + pay frequency labels
- Catalog: ~400+ `system.*` keys; seed `npm run seed:campus-ui -w @app/cms`

## Kept as data / EN by design
- PSP brand names (Stripe, LiqPay, Zoom, Google Meet, etc.)
- Provider descriptions from API catalog
- `word-dictionary-setup-guides.ts` body + `ProviderSetupGuide` step text
- `payment-provider-meta.ts` fieldHelp tooltips (technical)
- API/runtime errors, currency codes, `formatMoney` output, DNS tokens

## Playwright snapshots
- `snapshot-general.yml`, `snapshot-email.yml`, `snapshot-payments.yml`, `snapshot-dictionary.yml`

## Status
Verified at `/uk/system` (General, Email, Dictionary, Payments tabs) after seed on 2026-07-16.
