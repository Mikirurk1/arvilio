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
| 7.1 `/dashboard` | `07-platform-dashboard` — KPI cards, secondary metrics, Recent campuses/audit | ☑ |
| 7.1–7.5 сторінки консолі | render + скрін + axe (+ `/users`, billing pages) | ☑ |
| 7.2 /schools | заголовок, статуси TRIAL/ACTIVE, лінки на школи | ☑ |
| 7.3 `/schools/[id]` | `07-platform-schools-detail-mock` — Suspend/Activate/Impersonate, billing country, members chrome | ☑ |
| 7.4 `/promo-codes` | `07-platform-promo-codes-mock` — create + disable (REST mocked) | ☑ |
| 7.5 `/audit-log` | `07-platform-audit-log-mock` — search `q=` + infinite list chrome | ☑ |
| 7.6 `/settings` SMTP | `07-platform-smtp-mock.spec.ts` — chrome, Resend preset, Verify/Save/Send test | ☑ |
| 7.6 `/settings` LLM | `07-platform-llm-mock.spec.ts` — chrome, Anthropic switch, Test/Save | ☑ |
| 7.6 `/settings` payments | `07-platform-payment-methods-mock.spec.ts` — allowlist chrome, Stripe toggle + Save | ☑ |
| 7.9 `/billing/rails` | `07-platform-billing-rails-mock` — search/filter, Configure, Save, Test | ☑ |
| 7.9 `/billing/campus-plans` | `07-platform-campus-plans-mock` — Default offer / empty state, Save | ☑ |
| 7.10 `/users` | `07-platform-users-mock` — stats chrome, list search (mocked) | ☑ |
| 7.7 доступ | school admin → unauthorized; guest → те саме | ☑ |
| 7.8 axe | сторінки консолі чисті | ☑ |

## Нотатки

- **Аутентифікація в тестах:** cookie з логіну через web-proxy (:4200) діє і для :4300 — cookie-домен не включає порт. Логін — `page.request.post('/api/auth/login')`, далі повні URL `http://localhost:4300/...`.
- Спек потребує запущеного platform app (`PLATFORM_BASE_URL`, дефолт :4300) — поза дефолтним `npm run dev`; якщо консоль не піднята, тести впадуть на goto (можна додати soft-skip при потребі CI).
- У /schools видно всі школи, створені аудит-прогонами Етапу 2 (E2E Journey School ×N) — прибираються `cleanupTestUsers` не будуть (створені через API, інші email); за потреби чистити окремо.
- Беклог: schools list search/filter deep e2e (7.2); audit cursor IO flake-hardening; live Stripe balance test stays out of CI; **CI verify** full suite.
- Settings e2e (7.6): SMTP / LLM / payment-methods — mutating REST mocked; Unit: presets, `PlatformSmtpService`, `PlatformLlmService`, `PlatformPaymentMethodsService`.
- 7.3–7.5 + 7.10: schools detail (incl. activate/billing country/members) / promo / audit-log / users — REST mocked; soft-skip якщо platform down.
- 7.9 Billing: rails + campus-plans mock e2e; unit `PlatformBillingRailsService` (+ catalog/product specs).
- 7.1 Dashboard KPI chrome; unit `PlatformUsersService.stats`.

---

## Підсумок
- Кодових фіксів: 0. Тестових: 2 (regex "Not authorized", асерт списку шкіл).
- Результат: `07-platform-audit` smoke (+ users/billing); mock specs cover settings, schools, promo, audit-log, billing, users, dashboard.


## Доповнення 2026-07-21 — P2 login/filters

- `07-platform-login-filters-mock.spec.ts`: 7.0 login UI; 7.2.2–4 campuses filters; 7.10.5 users scope.


## Доповнення 2026-07-21 — thin leftovers

- `07-platform-leftovers-mock.spec.ts`: **7.2.5** campuses infinite scroll (cursor page 2); **7.9B.3–4** Add country + rail picker (soft-skip без availableRails — SSR не мокається через `page.route`).
- `07-platform-smtp-mock.spec.ts`: **7.6A.6** Verify/Save REST 400 error messages (twin of Campus 6.5.7).


## Доповнення 2026-07-21 — optional platform thin

- `07-platform-promo-codes-mock`: **7.4.4** Enable (soft-skip), **7.4.5** duplicate 409 message.
- `07-platform-audit-log-mock`: **7.5.3** cursor scroll, **7.5.4** campus link → `/schools/[id]`.
- `07-platform-schools-detail-mock`: **7.3.7** members search/role/infinite mock; **7.3.8** live impersonate → Campus banner + Stop (soft-skip).
- `07-platform-users-mock`: **7.10.6** users infinite scroll.
