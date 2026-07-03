# План покращень — Етап 5: ADMIN

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 5.

- **Дата аналізу:** 2026-07-02
- **Ролі/сторінки в обсязі:** admin — /staff (+профіль), /finance, /billing, /admin, сайдбар
- **Скріни:** `tests/e2e/screenshots/05-admin/...`
- **Статус етапу:** ☑ закрито (13 passed, 1 skipped, 0 failed)

---

## Знахідки

| # | Сторінка/елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | План vs код: /system для admin | Doc | P2 | План (5E.1) стверджував "admin без System", але `route-policy.ts` навмисно дозволяє `/system` для `admin` + `super_admin` (branding/domains — school-scope). Код виграє | `docs/e2e-journey-test-plan.md` | ☑ тест приведено до коду, план-нотатка тут |

Інших знахідок нема: axe чистий на /staff, /staff/[id], /finance, /billing, /admin (контраст-токени Етапів 3–4 покрили і ці сторінки). Глибокі сценарії 5C.4–5C.8 (promo apply, Stripe checkout, feature-gating, seat-enforcement, dunning-стани) — потребують моків/фікстур, лишаються в беклозі плану.

---

## Підсумок
- Кодових фіксів: 0 (все чисто після Етапів 3–4).
- Результат: `05-admin-audit.spec.ts` — 13 passed, 1 skipped (staff profile — немає рядків staff у сіді), 0 failed.
- Рекомендація для Етапу 0: додати в сід ≥1 staff із compensation, щоб 5A.3 не скіпався.
