# План покращень — Етап 1: Auth (Login / Signup / Forgot password)

- **Дата аналізу:** 2026-06-29
- **Ролі/сторінки в обсязі:** public · `/login` · `/signup` · `/forgot-password` · `/privacy`
- **Скріни:** `tests/e2e/screenshots/01-auth/`
- **Статус етапу:** ◐ P1 фікси застосовано; P2/залишки відкриті

---

## Знахідки

| # | Сторінка/елемент | Вісь | Пріоритет | Опис проблеми | Файл(и) | Статус |
|---|---|---|---|---|---|---|
| 1 | `/login` — error banner | UX | P1 | `formError` і `accountError` рендеряться **до** кнопки Google та форми. Помилка "Invalid email" з'являється вище Google-кнопки → виглядає як помилка OAuth, а не поля Email. Потрібно перемістити банер **після** `<div className={divider}>or</div>`, прямо над полями форми. | `apps/web/src/app/(auth)/login/page.tsx:83-92` | ☑ виправлено |
| 2 | `/login` — empty submit | UX/Func | P1 | При порожніх полях форма відправляє мережевий запит → API повертає "Invalid email". Немає клієнтської валідації `required` на полях. Додати `required` на `<Field>` та `onSubmit`-гард. | `apps/web/src/app/(auth)/login/page.tsx:106-134` | ☑ виправлено |
| 3 | `/signup` — error banner | UX | P1 | Та сама проблема: глобальний error-банер вгорі картки — "School name is required" з'являється над полем School name (src: `signup-duplicate-email.png`). Перемістити під заголовок або використати `Field error` prop inline. | `apps/web/src/app/(auth)/signup/` | ☐ |
| 4 | Всі auth-сторінки — cookie banner | UI | P2 | Cookie consent оверлей перекриває ~20% нижньої частини екрана на всіх auth-сторінках (`student-login.png`, `signup.png`, `forgot-password.png`). Зберігається між тестами. UX: приховує "Need an account?" і "Sign in" кнопку. Рішення: зменшити висоту або змінити позицію на `fixed bottom-0` з `z-index` нижче основного контенту. | `apps/web/src/components/cookie-consent/` (або аналог) | ☐ |
| 5 | `/login` — trust panel | UI | P2 | Trust panel ("Your English classroom, organized") не відображається на viewport 1280px. В `auth-layout.tsx` є `<aside>` але в скріні він відсутній. Перевірити CSS breakpoint — можливо потрібно показувати від 1440px. | `apps/web/src/app/(auth)/layout.tsx` · `auth-layout.module.scss` | ☐ |
| 6 | Всі auth-сторінки — Arvi | Arvi | P2 | Arvi (`greet` поза) не присутній на `/login` та `/signup`. За планом (e2e-journey-test-plan.md §Arvi) він має з'являтись при завантаженні login/signup. | `apps/web/src/app/(auth)/login/page.tsx` · `signup/` | ☐ |
| 7 | `/login` — `<main>` landmark | a11y | P2 | Auth-layout використовує `<div data-auth-route>` замість `<main>`. Screen reader не може знайти основний контент через стандартний skip-link. Замінити `<div className={authMain}>` на `<main className={authMain}>`. | `apps/web/src/app/(auth)/layout.tsx:18` | ☑ виправлено |
| 8 | `/login` error — screenshot timing | Func/Test | P3 | Тест `1A.2` знімає скрін під час стану "Signing in..." — помилка ще не з'явилась. Додати `await expect(page.getByRole('alert')).toBeVisible()` **перед** `shot()`. | `tests/e2e/specs/audit/01-auth-audit.spec.ts:30` | ☑ виправлено |
| 9 | `/reset-password` | Func | P1 | Сценарії 1D.1–1D.3 не протестовані. Сторінка `/reset-password?token=...` існує — потрібно додати тести з валідним/невалідним токеном. | `tests/e2e/specs/audit/01-auth-audit.spec.ts` | ☐ |
| 10 | 1A.6 rate-limit | Func | P2 | Тест не написаний. 5+ швидких спроб → очікується 429 або UI-блок. | `apps/web/src/app/(auth)/login/page.tsx` | ☐ |

---

## Покращення по осях

### UI
- **#4 Cookie banner**: занадто інвазивний на auth-сторінках. Перевірити z-index і висоту.
- **#5 Trust panel**: перевірити CSS — можливо потрібен breakpoint `≥1440px`. Якщо задуманий — документувати.

### UX
- **#1 Error banner position** (P1): перемістити `formError` і `accountError` на `/login` **після** Google-кнопки та OR-роздільника. Зараз: `<error> → <Google> → OR → <form>`. Має бути: `<Google> → OR → <error> → <form>`.
- **#2 Client-side validation** (P1): додати `required` attrs та onSubmit guard на `/login`. Це усуне зайвий round-trip на пусті поля.
- **#3 Signup error** (P1): аналогічно до #1 — перемістити error-банер або використовувати inline Field errors.

### Arvi
- **#6**: Додати `<Mascot pose="greet" />` на `/login` та `/signup` — поки Arvi в `mascot-preview` та `ProductTour` тільки. Розмістити в правому нижньому куті або в trust panel.

### a11y
- **#7 `<main>` landmark** (P2): auth layout не має `<main>`. Виправити — замінити `<div className={authMain}>` на `<main className={authMain}>` в `apps/web/src/app/(auth)/layout.tsx`.
- **axe = 0 violations** на `/login`, `/signup`, `/forgot-password` — ☑.

### Perf
- Немає критичних знахідок. Auth-сторінки легкі.

### Func
- **#9 /reset-password** (P1): тести 1D.1–1D.3 відсутні — потрібно написати.
- **#10 Rate-limit** (P2): тест 1A.6 відсутній.
- ☑ Всі три ролі (student/teacher/admin) логінуються → dashboard.
- ☑ Wrong password → `role="alert"` відображається.
- ☑ forgot-password → "Check your inbox" успішний стан.
- ☑ Unauthenticated → redirect `/login`.
- ☑ Show/hide password toggle працює (eye icon).

---

## Виправлення (P0/P1 в цій сесії)

### Fix #1 + #3: перемістити error-банер після Google / полів

**`apps/web/src/app/(auth)/login/page.tsx`** — перемістити блок `{formError}` та `{accountError}` після `<div className={styles.divider}>`:

```tsx
// До:
{formError && <div className={styles.error} role="alert">{formError}</div>}
{accountError && ...}
<Link className={styles.googleBtn} ...>Continue with Google</Link>
<div className={styles.divider}>or</div>
<form ...>

// Після:
<Link className={styles.googleBtn} ...>Continue with Google</Link>
<div className={styles.divider}>or</div>
{formError && <div className={styles.error} role="alert">{formError}</div>}
{accountError && ...}
<form ...>
```

### Fix #2: client-side validation

```tsx
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email.trim()) { setFormError('Email is required'); return; }
  if (!password) { setFormError('Password is required'); return; }
  // ...existing logic
};
```

### Fix #7: `<main>` в auth layout

```tsx
// apps/web/src/app/(auth)/layout.tsx
<div className={layoutStyles.authMain}>{children}</div>
// →
<main className={layoutStyles.authMain}>{children}</main>
```
