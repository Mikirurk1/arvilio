# План покращень — Етап 8: RBAC негативні сценарії

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 8.

- **Дата аналізу:** 2026-07-03
- **Обсяг:** редіректи student/teacher/admin/guest по заборонених маршрутах + API без сесії
- **Статус етапу:** ☑ закрито (26 passed, 0 failed — жодної знахідки)

---

## Покриття

| Сценарій | Перевірено | Результат |
|---|---|---|
| 8.1 student → /students, /admin, /system, /staff, /finance, /billing, /materials | 7 маршрутів | ☑ всі редіректять |
| 8.2 teacher → /admin, /system, /staff, /finance, /billing, /payment | 6 маршрутів | ☑ всі редіректять |
| 8.3 admin → /system | дозволено (route-policy: admin+super_admin) | ☑ |
| 8.4 admin → /payment (student-only) | редірект | ☑ |
| 8.5 guest → /dashboard, /lessons, /system, /billing | → /login | ☑ |
| 8.6 API без сесії: /auth/me, /users/students, /billing/entitlements, /onboarding/tour | 401/403 | ☑ |

Не покрито (беклог): 8.7 JWT школи ≠ host → 403 (потребує другої школи в сіді + host-роутінг).

---

## Підсумок
- Знахідок: 0 — route-policy.ts і API-guard'и працюють консистентно.
- Результат: `08-rbac-audit.spec.ts` — 26 passed.
