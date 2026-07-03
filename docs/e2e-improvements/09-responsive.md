# План покращень — Етап 9: Адаптивність

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 9.

- **Дата аналізу:** 2026-07-03
- **Обсяг:** mobile (Pixel 7) — 8 student-сторінок + навігація; tablet (768×1024) — dashboard/lessons/calendar
- **Скріни:** `tests/e2e/screenshots/09-responsive/...` (mobile-* і tablet-*)
- **Статус етапу:** ☑ закрито (15 passed, 0 failed)

---

## Покриття

| Сценарій | Перевірено | Результат |
|---|---|---|
| 9.1 mobile nav | сайдбар прихований, бургер "Open navigation menu" відкриває меню | ☑ |
| 9.2 mobile, без h-скролу | /dashboard, /lessons, /practice, /vocabulary, /calendar, /chat, /payment, /profile | ☑ `scrollWidth <= clientWidth` на всіх |
| 9.7 tablet 768×1024 | /dashboard, /lessons, /calendar | ☑ без h-скролу |
| 9.8 скріни | mobile ×9 + tablet ×3 | ☑ |

## Знахідки

| # | Елемент | Вісь | Пріоритет | Опис | Статус |
|---|---|---|---|---|---|
| 1 | ProductTour на mobile | Func (тест) | P2 | Тур перекриває бургер-кнопку для сід-юзера (tour не completed) — тести мають мокати `/api/onboarding/tour` | ☑ мок у тесті; рекомендація: сід-юзерам ставити `tourCompletedAt` |

Не покрито (беклог): 9.3 lesson modal на mobile (кнопка "Create lesson" прихована на Pixel 7 — потрібен teacher-mobile проект), 9.4 нативний select, 9.5 адаптація таблиць staff/finance (потрібен admin-mobile), 9.6 Arvi.

---

## Підсумок
- Кодових фіксів: 0 — лейаути адаптивні, горизонтального скролу нема ніде.
- Результат: `09-responsive-audit.spec.ts` — 15 passed.
