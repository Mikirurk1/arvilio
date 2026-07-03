# План покращень — Етап 11: Edge / помилки / стани

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 11.

- **Дата аналізу:** 2026-07-03
- **Обсяг:** 404, невалідні id, API 500 → UI-помилка (teacher)
- **Скріни:** `tests/e2e/screenshots/11-edge/...`
- **Статус етапу:** ☑ закрито в доступному обсязі (10 passed, 0 failed)

---

## Знахідки

| # | Елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | GraphQL error-стани | UX | P2 | При не-OK відповіді `graphql-client` кидав **сирий JSON body** як message — користувач бачив `{"errors":[{"message":...}]}` у картці "Could not load students" | `lib/graphql-client.ts` | ☑ парситься `errors[0].message` / `message`, фолбек — текст |

## Покриття

| Сценарій | Перевірено | Результат |
|---|---|---|
| 11.1 `/zzz` → 404 | сторінка з "404/not found" | ☑ |
| 11.2 невалідні id | /lessons/zzz, /students/zzz, /staff/zzz, /materials/view/zzz — дружня помилка, не білий екран, не вічний лоадер | ☑ |
| 11.9 API 500 | /lessons (REST scheduled-lessons) і /students (GraphQL) — error-UI з людським текстом | ☑ |

Не покрито (беклог — потрібні фікстури станів білінгу/мережі): 11.3 trial-гейт, 11.4 suspended, 11.5 AI credits 429, 11.6 storage quota, 11.7 seat limit 403, 11.8 PAST_DUE dunning, 11.10 повільна мережа/скелетони, 11.11 Socket.IO reconnect.

---

## Підсумок
- Закрито P2: 1 (людські повідомлення в GraphQL error-станах).
- Результат: `11-edge-audit.spec.ts` — 10 passed.
