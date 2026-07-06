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

### Аудит решти резолверів (2026-07-06): ще 3 витоки того ж класу

Пройдено всі сервіси, що лістять глобальний `User` через базовий `PrismaService` без tenant-скоупу. Знайдено й виправлено (той самий патерн — фільтр через ACTIVE `SchoolMembership` активної школи):

| Сервіс | Витік | Ендпоінт |
|---|---|---|
| `admin-users-graphql.service.ts` `listAdminUserSummaries` | admin бачив **усі акаунти платформи** | GraphQL `adminUsers` → `/admin` Accounts overview |
| `staff-payroll.service.ts` (overview + trend, 2 запити) | staff-список і їхні accrued/paid з **усіх шкіл** | `/finance` |
| `chat-visibility.service.ts` (3 запити) | контакт-пікер показував і **дозволяв писати** будь-якому юзеру платформи (admin → всі; teacher/student → всі адміни) | `/chat` |

Нижчий ризик (не витік списку, але крос-тенантний вектор запису — фільтр по явних `id: { in: [...] }`, потребує знання чужих ID, а запис і так tenant-scoped): `lessons.service` (учасники уроку), `student-groups.service` (`validateMembers`). Лишено в беклозі.

E2E 8.7 розширено: перевіряє також `adminUsers` (немає крос-тенантних акаунтів, є лише сам admin нової школи).

Не покрито (беклог): host-based JWT cross-check (JWT школи ≠ host → 403) — потребує host-роутінгу.

---

## Підсумок
- Route-policy редіректи й API-guard'и — 0 знахідок.
- **P0: крос-тенантні витоки через глобальний `User` без tenant-скоупу — виправлено 2026-07-04…06.** Разом **4 сервіси / 7 запитів**: `users.service` (students/page/teachers), `admin-users-graphql` (accounts), `staff-payroll` (finance ×2), `chat-visibility` (contacts ×3). Усі — фільтр через ACTIVE `SchoolMembership`.
- Урок: базовий `PrismaService` на моделі `User` **не** авто-скоупить (User — глобальна ідентичність); кожен резолвер, що лістить User по ролі, зобов'язаний додати membership-фільтр.
- Результат: `08-rbac-audit.spec.ts` — 27 passed (26 RBAC + 8.7 ізоляція students+adminUsers).
