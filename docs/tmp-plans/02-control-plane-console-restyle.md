# 02 — Control Plane Stage 2: console restyle

> Companion: [`docs/arvilio-ecosystem-control-plane.md`](../arvilio-ecosystem-control-plane.md). Stage 1: [`01-control-plane-secure-login.md`](./01-control-plane-secure-login.md).

## Locked decisions

| Topic | Decision |
|-------|----------|
| Scope | Editorial tables/forms/KPI cards + Campus wording + nav cleanup |
| API / URLs | Keep `/schools` and `/api/platform/schools` (DB model still `School`) |
| Connect | Stubs stay disabled `soon` — no Connect UI |
| Billing | No Layer B Stripe UI this stage |
| Shared package | No `@fe/ui` extract — local kit in `apps/platform` |

## Acceptance checklist

- [x] `PageHeader`, `DataTable`, `StatCard`, `StatusBadge`, `Panel` in `apps/platform/src/components/ui`
- [x] Dashboard / Campuses / audit / promos / settings use kit (no inline-styled tables)
- [x] Operator copy says Campus/Campuses; API paths unchanged
- [x] `SchoolActions` + allowlist + promo forms use `Button`/`Field`
- [x] ConsoleShell comment + separator before Settings; Connect stubs kept
- [x] Duplicate non-`(console)` page trees removed
- [x] Wiki + log updated

## Out of scope (Stage 3+)

Layer B Stripe config UI, product registry model, real MRR, Connect nav sections, `@fe/ui` extract.
