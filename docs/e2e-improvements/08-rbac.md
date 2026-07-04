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
| 8.7 тенантна ізоляція: admin школи B не бачить студентів/матеріалів school_default | GraphQL + UI | ☑ (після фікса) |

### P0 знахідка (2026-07-04): крос-тенантний витік студентів

`students` / `studentsPage` / `assignableTeachers` GraphQL-запити для ADMIN/SUPER_ADMIN робили `{ role: 'STUDENT' }` **без фільтра по школі** — admin новоствореної школи бачив усіх студентів платформи (і `jest-student@soenglish.test` зі school_default). `User` — глобальна ідентичність (не row-scoped по schoolId), тож ізоляція має йти через `SchoolMembership`.

**Фікс** (`users.service.ts`): інжектовано `TenantContextService`, доданий `tenantStudentFilter()` → `{ schoolMemberships: { some: { schoolId, status: 'ACTIVE' } } }`, застосований у всіх трьох запитах. Юніт-тест на admin-ізоляцію + E2E 8.7 (реєстрація свіжої школи через API → перевірка, що її admin не бачить даних school_default через GraphQL і UI).

Не покрито (беклог): host-based JWT cross-check (JWT школи ≠ host → 403) — потребує host-роутінгу.

---

## Підсумок
- Route-policy редіректи й API-guard'и — 0 знахідок.
- **P0: крос-тенантний витік студентів (admin бачив усіх студентів платформи) — виправлено 2026-07-04** (`users.service.ts`, тенант-фільтр через SchoolMembership).
- Результат: `08-rbac-audit.spec.ts` — 27 passed (26 RBAC + 8.7 ізоляція).
