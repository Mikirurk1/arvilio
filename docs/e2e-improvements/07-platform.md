# План покращень — Етап 7: Platform console (:4300)

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 7.

- **Дата аналізу:** 2026-07-03
- **Обсяг:** /dashboard, /schools, /promo-codes, /audit-log, /settings під super_admin; RBAC для admin/guest
- **Скріни:** `tests/e2e/screenshots/07-platform/...`
- **Статус етапу:** ☑ закрито (8 passed, 0 failed — кодових знахідок нема)

---

## Покриття

| Сценарій | Перевірено | Результат |
|---|---|---|
| 7.1–7.6 сторінки консолі | 5 сторінок: render + скрін + axe (0 violations) | ☑ |
| 7.2 /schools | заголовок, статуси TRIAL/ACTIVE, лінки на школи | ☑ |
| 7.7 доступ | school admin → "Not authorized / not a platform operator"; guest → те саме | ☑ |
| 7.8 axe | усі 5 сторінок чисті | ☑ |

## Нотатки

- **Аутентифікація в тестах:** cookie з логіну через web-proxy (:4200) діє і для :4300 — cookie-домен не включає порт. Логін — `page.request.post('/api/auth/login')`, далі повні URL `http://localhost:4300/...`.
- Спек потребує запущеного platform app (`PLATFORM_BASE_URL`, дефолт :4300) — поза дефолтним `npm run dev`; якщо консоль не піднята, тести впадуть на goto (можна додати soft-skip при потребі CI).
- У /schools видно всі школи, створені аудит-прогонами Етапу 2 (E2E Journey School ×N) — прибираються `cleanupTestUsers` не будуть (створені через API, інші email); за потреби чистити окремо.
- Беклог: 7.3 деталі школи + suspend/activate/impersonate, 7.4 створення promo, 7.5 фільтри/пагінація audit-log, 7.6 save налаштувань.

---

## Підсумок
- Кодових фіксів: 0. Тестових: 2 (regex "Not authorized", асерт списку шкіл).
- Результат: `07-platform-audit.spec.ts` — 8 passed.
