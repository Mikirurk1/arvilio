# План покращень — Етап 2: Сюжет Signup → Onboarding → Tour

> Джерело сценаріїв: `docs/e2e-journey-test-plan.md`, Етап 2.

- **Дата аналізу:** 2026-07-02
- **Обсяг:** /signup → register-school → /onboarding wizard (5 кроків) → /dashboard → Product Tour; дубль email; resume після relogin
- **Скріни:** `tests/e2e/screenshots/02-journey/...`
- **Статус етапу:** ☑ закрито (4 passed, 0 failed)

---

## Знахідки

| # | Сторінка/елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | `POST /auth/register-school` | Func | **P0** | **500 при дублі назви школи.** Slug-retry не спрацьовував: Prisma 7 + pg driver adapter кладе поля констрейнта в `meta.driverAdapterError.cause.constraint.fields`, а не в `meta.target`; сама помилка може бути не `instanceof PrismaClientKnownRequestError` | `module-auth/.../school-signup.service.ts` | ☑ структурна перевірка обох форматів + юніт-тест на adapter-shape |
| 2 | Product Tour на /onboarding | UX | P1 | Тур відкривався **поверх onboarding wizard** і блокував кліки (за сюжетом тур іде після wizard, на dashboard) | `components/tour/ProductTour.tsx` | ☑ pathname-guard: на `/onboarding` тур не стартує; ефект перезапускається після переходу |
| 3 | Тест: перевірка туру | Func (тест) | P2 | `locator.isVisible()` ігнорує timeout — тур з'являється ~0.5с після приходу на dashboard і тест його "не бачив" | `02-journey-audit.spec.ts` | ☑ `waitFor({ state: 'visible' })` |
| 4 | Тест: /login поля | Func (тест) | P2 | `getByLabel(/password/i)` матчить і кнопку "Show password" (strict mode) | `02-journey-audit.spec.ts` | ☑ `getByRole('textbox', …)` |

Спостереження (не блокери):
- Cookie consent banner на /onboarding перекриває нижню частину — тест приймає його перед скрінами; UX ок.
- Wizard axe — чистий; /signup axe — чистий.
- Rate-limit register-school: 5/15хв на IP — на CI з паралельними ранами може стрельнути (бекспейс: bypass-header уже шлеться конфігом).

---

## Підсумок
- Закрито P0: 1 (500 на дублі назви школи — реальний продакшн-баг: друга школа з популярною назвою "English School" не могла зареєструватися).
- Закрито P1: 1 (тур поверх wizard).
- Результат: `02-journey-audit.spec.ts` — 4 passed (golden path: signup → 5 кроків wizard → dashboard → тур Next/Back/Finish → complete; дубль email → alert; onboarding після завершення редіректить на dashboard).
