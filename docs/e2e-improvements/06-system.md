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

Не покрито цим аудитом (беклог плану): 6.3 повний branding-флоу (save+глобальне застосування), 6.4 domains verify, 6.15 deep saves. **6.5 SMTP / 6.14 AI / 6.16 seller** — окремі mock specs (2026-07-21).

---

## Підсумок
- Закрито: 3 a11y-фікси (2 чекбокси + 1 number input).
- Результат: `06-system-audit.spec.ts` — 12 passed: рендер + скрін + axe усіх 8 табів, branding hex-інпут присутній.


## Доповнення 2026-07-21 — seller legal

- `06-seller-legal-mock.spec.ts`: 6.16.1–3 save + payments gate + contacts override.


## Доповнення 2026-07-21 — P2 deep saves

- `06-system-deep-saves-mock.spec.ts`: 6.15.1–5 payments/payouts/connections/dictionary/branding.


## Доповнення 2026-07-21 — SMTP negatives

- `06-smtp-negatives-mock.spec.ts`: **6.5.6** Server default hides custom host; **6.5.7** verify (`ok: false` message) + save (GraphQL errors → UI error).
