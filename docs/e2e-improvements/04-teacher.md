# План покращень — Етап 4: TEACHER

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 4.

- **Дата аналізу:** 2026-07-02
- **Ролі/сторінки в обсязі:** teacher — /materials (+MaterialFormModal), /students, /students/[id], /students/groups, lesson modal, /dashboard, /lessons, /calendar, /chat, /profile
- **Скріни:** `tests/e2e/screenshots/04-teacher/...`
- **Статус етапу:** ☑ закрито (20 passed, 1 skipped, 0 failed)

---

## Знахідки

| # | Сторінка/елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | LessonModal: поля Title і Duration | a11y | P1 | `label` (critical): `<label class=fieldLabel>` без `htmlFor` — інпути без accessible name | `features/lesson-modal/LessonSetupTab.tsx` | ☑ додано `htmlFor` + `id` |
| 2 | LessonModal бейдж "Create lesson" | a11y | P1 | `color-contrast`: `--accent-primary` 4.26:1 на muted-фоні | `LessonModal.module.scss` | ☑ → `--green-dark` (+ `modalBadgeInfo` → `--blue-dark`) |
| 3 | MaterialFormModal бейдж режиму | a11y | P1 | Той самий green-on-green-light 4.26:1 | `features/materials/MaterialFormModal.module.scss` | ☑ → `--green-dark` / `--blue-dark` |
| 4 | StudentSummaryCard "Open" кнопка | a11y | P1 | green 4.26:1 на tinted фоні; використовувала неіснуючий токен `--accent-primary-strong` | `components/students/StudentSummaryCard.module.scss` | ☑ → `--green-dark` |
| 5 | /students/groups | Func (env) | P2 | Одноразовий 500 від Turbopack dev ("module factory is not available") після HMR під час прогону — не відтворюється | — | ☑ flake, не баг |
| 6 | Тест 4A.4 | Func (тест) | P2 | Регекс `/create/i` чіпляв quick-action "Create lesson" замість "Add material" | `04-teacher-audit.spec.ts` | ☑ звужено |
| 7 | Тест 4C.3 | Func (тест) | P2 | Assert до завершення "Loading students…" | `04-teacher-audit.spec.ts` | ☑ wait for hidden |

Примітка: 4H.2 axe sweep по 8 teacher-сторінках пройшов чисто одразу — контраст-фікси Етапу 3 (токени) покрили і teacher-раскладки. Глибокі сценарії 4A.5–4A.15 (TagInput, upload, compression, recovery), 4B (book viewer), 4G (group billing) — не покриті цим аудитом, лишаються в беклозі тест-плану.

---

## Підсумок
- Закрито: 4 a11y-фікси в апці (LessonModal labels + 3 контрасти), 2 тест-фікси.
- Результат: `04-teacher-audit.spec.ts` — 20 passed, 1 skipped, 0 failed; axe чистий на /dashboard, /lessons, /materials, /students, /students/groups, /calendar, /chat, /profile + обидва модали.
