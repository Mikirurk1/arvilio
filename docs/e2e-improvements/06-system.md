# План покращень — Етап 6: /system control room

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 6.

- **Дата аналізу:** 2026-07-02
- **Обсяг:** /system — 8 табів (general, email, dictionary, connections, payments, payouts, domains, branding), під admin (super_admin у сіді нема; route-policy дозволяє admin)
- **Скріни:** `tests/e2e/screenshots/06-system/...`
- **Статус етапу:** ☑ закрито (12 passed, 0 failed)

---

## Знахідки

| # | Сторінка/елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | Connections: чекбокси Telegram dev polling і Zoom S2S | a11y | P1 | `label` (critical): чекбокси без accessible name — `FieldLabelHint` поруч, але не зв'язаний | `system/connections/ConnectionsPanel.tsx` | ☑ `aria-label` з тексту лейбла |
| 2 | Payments: "Min lessons" number input | a11y | P1 | `label`: `<label>` без `htmlFor` | `system/payment/PaymentsPricingSection.tsx` | ☑ `htmlFor` + `id` |
| 3 | Тестове середовище | Func (env) | P2 | Turbopack-перекомпіляція /system під час прогону валить тести 30s-таймаутом; потрібен warm-up або менше workers | — | ☑ warm-up curl + `--workers=2` |

Не покрито цим аудитом (беклог плану): 6.3 повний branding-флоу (save+глобальне застосування), 6.4 domains verify, 6.5 SMTP verify, 6.9 вибір відеопровайдера, 6.10 dictionary setup-guides, 6.11 media-captions (за флагом), super_admin-специфіка (нема в сіді).

---

## Підсумок
- Закрито: 3 a11y-фікси (2 чекбокси + 1 number input).
- Результат: `06-system-audit.spec.ts` — 12 passed: рендер + скрін + axe усіх 8 табів, branding hex-інпут присутній.
