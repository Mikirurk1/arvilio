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

---

## Доповнення 2026-07-06 — granular interaction-сценарії (Етапи 5+6)

`specs/audit/05-06-granular.spec.ts` (10 passed, 1 conditional-skip):
- **5A** staff-профіль: таби Profile/Compensation/Earnings & payouts/Statistics відкриваються (aria-selected).
- **5B** finance: контент staff-finance присутній.
- **5C** billing: Subscription heading + Current plan + Storage meter; план-пікери **умовні** — Starter/Pro лише за TRIAL-станом (default-школа ACTIVE → показує current-plan summary).
- **5D** admin: «Account administration» + region «Accounts overview» + «All accounts».
- **6.3** branding text input, **6.9** general video-meetings регіон, **6.10** dictionary панель.

**Знахідка (не баг, а поведінка):** план-пікери Starter/Pro на `/billing` гейтяться `summary.plan === 'TRIAL'` — на ACTIVE-школі їх нема; тест адаптовано.

**Беклог:** 5C.4–8 (promo/Stripe/feature-gating/seat-enforcement/білінг-стани), 5A.2/5A.6 (empty/non-staff), 5D.3 (створення акаунтів), 6.4/6.5 (domains/SMTP verify), 6.11 (media-captions за флагом).


## Доповнення 2026-07-21 — import / payout / invites

- `05-student-import-mock.spec.ts` (5D.4), `05-record-payout-mock.spec.ts` (5A.7), `02-invite-api.spec.ts` (2.13 invalid + 5D.5 create API; accept UI deferred).
