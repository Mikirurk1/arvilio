# План покращень — Етап 3: STUDENT

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 3.

- **Дата аналізу:** 2026-07-02
- **Ролі/сторінки в обсязі:** student — /dashboard, /lessons, /practice, /practice/vocabulary, /vocabulary, /calendar, /chat, /payment, /profile
- **Скріни:** `tests/e2e/screenshots/03-student/...`
- **Статус етапу:** ☑ закрито (усі знахідки run'у виправлені; 29 passed, 2 soft-skip)

---

## Знахідки

| # | Сторінка/елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | Header search input (усі сторінки) | a11y | P0 | `aria-allowed-attr` (critical): `input[type=search]` мав `aria-expanded`/`aria-controls` без ролі combobox — ламав axe на всіх сторінках | `components/layout/HeaderSearch.tsx` | ☑ виправлено — додано `role="combobox"` + `aria-autocomplete="list"` |
| 2 | ⌘K бейдж у пошуку | a11y | P1 | `color-contrast`: `--text-faint` (#b4b4cc) ≈2.2:1 на білому | `HeaderSearch.module.scss` | ☑ → `--text-tertiary` |
| 3 | Sidebar заголовки секцій (Learn/Schedule) | a11y | P1 | `color-contrast`: `--text-faint` на білому | `Sidebar.module.scss` | ☑ → `--text-tertiary` |
| 4 | Header "lessons left" | a11y | P1 | `color-contrast`: tertiary на тонованому бейджі < 4.5:1 | `Header.module.scss` | ☑ → `--text-secondary` |
| 5 | StatTile labels (dashboard, vocabulary) | a11y | P1 | `--text-tertiary` #6e6e90 = 4.35–4.45:1 на тонованих поверхнях (#eff5fc, --surface) | `styles/tokens/_theme.scss` | ☑ токен затемнено до #656586 (≥4.98:1) |
| 6 | Vocabulary stat chips (blue/amber/rose) | a11y | P1 | `--blue` 4.18, `--amber` 2.26, `--rose` 3.46 на тонованих чипах | `app/vocabulary/page.module.scss`, `_theme.scss` | ☑ нові токени `--blue-dark` #2e5f95, `--rose-dark` #b03a58; amber → `--accent-warning-strong` |
| 7 | Badge blue/green (practice) | a11y | P1 | `--status-info-text`/`--status-success-text` < 4.5:1 на світлих фонах | `_theme.scss` | ☑ → `--blue-dark` / `--green-dark` |
| 8 | Practice "Coming soon" заголовок | a11y | P2 | `--text-faint` на surface | `app/practice/page.module.scss` | ☑ → `--text-tertiary` |
| 9 | Calendar week: минулі дні | a11y | P1 | `opacity: 0.55` на `.weekDayPast` зводив текст до ~1.9–3.8:1 | `app/calendar/page.module.scss` | ☑ замість opacity — явні AA-кольори (`--text-tertiary`) |
| 10 | Calendar nav ‹ › кнопки | a11y | P0 | `button-name` (critical): icon-only без accessible name | `app/calendar/sections.tsx` | ☑ додано `aria-label="Previous/Next period"` |
| 11 | Calendar week body | a11y | P1 | `scrollable-region-focusable`: скрол-зона недоступна з клавіатури | `app/calendar/CalendarWeekView.tsx` | ☑ `tabIndex={0}` + `role="region"` + aria-label |
| 12 | /lessons фільтр-чипи | Func (тест) | P2 | Тест шукав кнопку "Completed", а чип називається "Done"; локатор не був звужений до групи фільтрів | `tests/e2e/specs/audit/03-student-audit.spec.ts` | ☑ локатор через `group "Filter by status"` + `/^done$|completed/i` |
| 13 | Скріншоти під час гідрації | Func (тест) | P2 | Playwright ховає caret інлайн-стилем `caret-color: transparent`; якщо скрін ловить сторінку в мить гідрації — React репортить hydration mismatch → consoleGuard валить тест | `tests/e2e/helpers/a11y.ts` | ☑ `caret: 'initial'` у `shot()` |

---

## Підсумок
- Закрито P0: 2 (aria-allowed-attr на header search, button-name на calendar nav)
- Закрито P1/P2: 11
- Перенесено в беклог: dark-theme контраст токенів не перевірявся цим етапом (axe ганявся тільки на light); окремої перевірки потребують `--text-faint` у решті використань.
- Результат: `03-student-audit.spec.ts` — 29 passed, 2 skipped (умовні секції), 0 failed.

---

## Доповнення 2026-07-06 — granular interaction-сценарії

`specs/audit/03-student-granular.spec.ts` (21 passed, 2 conditional-skip) закрив interaction-рівень Етапу 3:
- **3A** dashboard: loading зникає, «Review words»→vocabulary, EntitlementsWidget, усі quick-action href in-app, Daily goals, Statistics.
- **3B** lessons: клік уроку→`/lessons/[id]`, неіснуючий id→дружня помилка.
- **3C** practice hub: «Due for review»/«Quizzes open», лінки під-маршрутів.
- **3H** vocabulary: сідові слова, фільтр статусів.
- **3I** calendar: навігація періодами (крос-місяць змінює заголовок).
- **3J** chat: інбокс search/empty.
- **3K** payment: lesson balance / prepaid credits.
- **3L** profile: таби Statistics/Notifications/Appearance/Account, font-size контрол (SegmentedControl role=radio).

**Беклог (потребує інфри/моків, не interaction-рівень):** 3B.6–11 (video/LiveKit/homework/downloads), 3D.2–4 + 3E + 3F + 3G (інтерактивні practice-флоу з Arvi-реакціями/mic), 3J.2–10 (realtime Socket.IO, пагінація, групи), 3K.4–7 (пакети/provider checkout), 3L.5 (OAuth Connections), 3M.2 (Arvi wave — feature). Порожні стани (3A.4/3H.3/3I.3) потребують окремого юзера без даних.
