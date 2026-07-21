# Arvilio — Сюжетний E2E-план (Playwright + Arvi)

> Вичерпний план: сценарій на **кожну сторінку і кожен функціональний елемент**,
> наскрізний **сюжет нового користувача**, наскрізна інтеграція маскота **Arvi**.
>
> **Плани покращень живуть в окремих документах** — після кожного етапу створюємо
> `docs/e2e-improvements/<NN>-<slug>.md` за шаблоном `docs/e2e-improvements/TEMPLATE.md`.
> У цьому файлі — лише сценарії + статуси. Покращення сюди НЕ пишемо.

---

## 0. Методологія

Цикл для кожного екрана: **Navigate → Screenshot → Analyze → (окремий документ) Improvement plan → Fix → Re-test.**

- Скрін: `tests/e2e/screenshots/<stage>/<role>-<page>[-<state>].png`, `fullPage: true`.
- **Після аналізу етапу** → новий файл у `docs/e2e-improvements/` (копія TEMPLATE):
  знахідки, осі UI/UX/Arvi/a11y/Perf/Func, виправлення.
- Кожен сценарій перевіряє: HTTP 200, `<main>` рендериться, **нема `console.error`
  та 4xx/5xx** (крім очікуваних), ключові елементи присутні, empty/loading/error стани,
  loading-стани кнопок, **axe = 0 violations**.
- Статуси: ☐ не почато · ◐ в роботі · ☑ готово.

**Сервіси:** API `:3000` · Web `:4200` · Platform `:4300`.
**Юзери** (`npx tsx scripts/seed-test-users.ts`, пароль `TestPass123!`):
`jest-student` / `jest-teacher` / `jest-admin` / `jest-super-admin` + empty/reset fixtures (`jest-student-empty`, `jest-teacher-empty`, `jest-reset-probe`) @arvilio.test.

**RBAC (`apps/campus/src/lib/auth/route-policy.ts`):**

| Маршрут | STU | TEA | ADM | SUP |
|---|:--:|:--:|:--:|:--:|
| dashboard, profile, calendar, chat, lessons, practice, vocabulary, quiz | ✅ | ✅ | ✅ | ✅ |
| payment | ✅ | ❌ | ❌ | ❌ |
| materials, students | ❌ | ✅ | ✅ | ✅ |
| staff, finance, billing, admin | ❌ | ❌ | ✅ | ✅ |
| system | ❌ | ❌ | ❌ | ✅ |
| platform (apps/platform) | ❌ | ❌ | ❌ | ✅ |

---

## 🧸 Arvi — наскрізна стратегія (візитна картка)

Поточний стан (B7 ☑ 2026-07-10): `Mascot` + `useArvi` + `ArviSlot` / `GlobalArviSlot`.
Пози `idle|greet|point|celebrate|think|encourage|sleep|wave`, 2D SVG-фолбек, lazy R3F.
Присутність: auth greet, signup celebrate, tour, dashboard greet, practice/quiz reactions,
empty `sleep` (opt-in), 404 encourage, logout `wave`, corner dock для авторизованих.

**Розширити пози:** + `think` · `encourage` · `sleep` · `wave` — **☑**

**Технічний беклог Arvi:**
- [x] `MascotPose` + нові клипи/процедурні фолбеки.
- [x] `useArvi()` — керування позою з події (`celebrate()/encourage()/think()`), авто-повернення в `idle`.
- [x] `ArviSlot` (глобальний кутовий контейнер) + інлайн-вставки.
- [x] reduced-motion / no-WebGL фолбеки з мікро-переходами.
- [x] перф-бюджет: не на критичному шляху, intersection-lazy + tour hides corner slot.
- [~] тематизація під брендовий колір школи (G18) — SVG використовує `--green` / `--accent-primary`.
- [ ] скріни всіх станів у `screenshots/arvi/` (ручний артефакт).

**Карта присутності** (ціль; перевіряється у сценаріях `*.arvi`):

| Місце | Тригер | Поза | Статус |
|---|---|---|---|
| login/signup | завантаження | `greet` | ☑ auth layout |
| signup success | школа створена | `celebrate` | ☑ |
| onboarding/tour | кожен крок | `point` | ☑ ProductTour |
| dashboard (вхід дня) | перший рендер | `greet` | ☑ |
| practice/quiz правильно | подія | `celebrate` | ☑ vocab/quiz/irregular |
| practice/quiz невірно | подія | `encourage` | ☑ |
| завершення уроку/квіза | фініш | `celebrate` | ☑ vocab result |
| empty states | порожньо | `sleep` | ☑ `showArvi` |
| loading/довгі запити | очікування | `think` | ☑ quiz load |
| 404/500/error | помилка | `encourage` | ☑ `not-found` |
| logout | вихід | `wave` | ☑ profile AccountPanel |

---

## 🎬 СЮЖЕТ нового користувача (golden path, основа Етапів 2–3)

1. Гість → `/signup` (Arvi `greet`) → заповнює школа/email/пароль(/промокод) → сабміт.
2. `register-school` → школа+admin+trial, auto-login (Arvi `celebrate`) → onboarding.
3. Wizard 5 кроків (Arvi `point`): profile→teaching→payments→invite→sample-content; Skip/Resume; complete.
4. Tour (Arvi веде): dashboard→calendar→lessons→materials→students→billing; Finish.
5. Перший день dashboard (Arvi `greet` + підсумок); порожні стани з CTA (Arvi `sleep`).
6. `/system`: Branding (колір+лого, live preview) → Domains → інвайт teacher/student.
7. Teacher: створює урок (Lesson modal), додає матеріал, відкриває профіль студента.
8. Student: бачить урок у розкладі, проходить practice+quiz (Arvi реагує), словник, оплата.
9. Admin: `/billing` trial→підписка.
10. Super-admin (`apps/platform`): dashboard KPIs → Campuses → Users → Settings (SMTP / Arvi LLM / payment allowlist) → Billing rails & Campus plans → promo codes → audit-log; suspend / impersonate campus.

---

## ЕТАП 0 — Інфраструктура та фікстури `☑`

> **Playwright-тести написані:** `setup/auth.setup.ts`, `fixtures/auth.ts`, `helpers/a11y.ts`, `playwright.config.ts` (projects: setup/student/teacher/admin/mobile-student/public).
> **Аудит:** ☑ (2026-07-06+); CI `e2e.yml` на main/cron. Локальний run: `npm run dev` + `npm run test:e2e`.

- [x] Сід `seed-test-users.ts` на чистій БД (4 ролі + Default School). *(прогнано 2026-07-03, ідемпотентний)*
- [x] Розширити сід — **зроблено 2026-07-03…10:** 3 уроки (+ homework SUBMITTED на completed), студент у вчителя, словник 10 слів, staff compensation, quiz, платіж, promo `SEED20`, матеріал BOOK, paymentConfig/groupLessons, DIRECT chat teacher↔student, `jest-student-empty` / `jest-teacher-empty` / `jest-reset-probe` + reset token.
- [x] Фікстура per-role `storageState` — `setup/auth.setup.ts` + `fixtures/auth.ts` (+ studentEmpty / teacherEmpty).
- [x] Хелпери: `shot()`, `expectNoA11yViolations()`, `consoleGuard()` — `helpers/a11y.ts`.
- [x] `expectArvi(pose?)` — `helpers/a11y.ts`, анкер `[data-mascot][data-mascot-pose]` у `Mascot.tsx`; використано у 2.11 (greet на welcome-кроці туру). *(2026-07-03)*
- [x] Проєкти: `student/teacher/admin` (Desktop Chrome) + `mobile-student` (Pixel 7); `screenshots/` у `.gitignore`.

- [x] **Опційно:** файлове вкладення матеріалу в сіді — **N/A**: покрито mock-upload specs (`04-material-form-edges`, `03-homework-upload`); binary у сіді не потрібен.

→ Після аудиту: `docs/e2e-improvements/00-infra.md`.

---

## ЕТАП 1 — Публічні / Auth `☑`

> **Playwright-тести написані:** `specs/login.spec.ts` (1A.1/2/5, 1C.1, 1E.3) + `specs/audit/01-auth-full.spec.ts` (решта, 18 tests, 2026-07-06).
> **Аудит:** ☑ проведено 2026-07-06.

### 1A. `/login`
- [x] 1A.1 рендер: поля Email/Password, кнопка Sign in, лінк forgot. *(login.spec.ts)*
- [x] 1A.2 невірний пароль → `role="alert"`, лишається на `/login`. *(login.spec.ts)*
- [x] 1A.3 порожні поля → валідація, без мережевого запиту. *(01-auth-full)*
- [x] 1A.4 невалідний формат email → валідація. *(01-auth-full; додано client-check у login/page.tsx)*
- [x] 1A.5 успіх (student) → редірект `/dashboard`. *(login.spec.ts)*
- [x] 1A.6 rate-limit — **N/A в E2E**: харнес шле `x-e2e-skip-throttle`, тож 429 не тригериться. Throttle покрито бекенд-тестами (`@Throttle` на `auth.controller.ts`).
- [x] 1A.7 «показати пароль» перемикач. *(01-auth-full)*
- [x] 1A.8 логін як teacher/admin/super → `/dashboard`. *(01-auth-full)*

### 1B. `/signup`
- [x] 1B.1 рендер полів (school name, name, email, password) + axe. *(01-auth-full; promo-поля в UI немає — сервер-only)*
- [x] 1B.2 disposable email → помилка. *(01-auth-full)*
- [x] 1B.3 слабкий пароль → помилка. *(01-auth-full)*
- [x] 1B.4 дубль email → «Email already registered». *(01-auth-full)*
- [x] 1B.5 captcha-флоу — **N/A**: Turnstile вимкнено без `SITE_KEY` у dev/test.
- [x] 1B.6 успіх → auto-login → onboarding. *(01-auth-full; також 02-journey)*

### 1C. `/forgot-password`
- [x] 1C.1 сабміт валідного email → «лист надіслано». *(login.spec.ts)*
- [x] 1C.2 невалідний email → валідація. *(01-auth-full)*
- [x] 1C.3 rate-limit — **N/A в E2E** (той самий throttle-bypass).

### 1D. `/reset-password`
- [x] 1D.1 `?token=valid` → форма нового пароля. *(01-auth-full)*
- [x] 1D.2 `?token=invalid|expired` → дружня помилка (+ missing token). *(01-auth-full)*
- [x] 1D.3 успішна зміна → редірект `/login?reset=success`. *(01-auth-reset-happy; seed token `E2E_RESET_PASSWORD_RAW_TOKEN` — 2026-07-10)*

### 1E. Статика та редіректи
- [x] 1E.1 `/privacy` 200 + контент. *(01-auth-full; **фікс:** додано в PUBLIC_ROUTES)*
- [x] 1E.2 `/status` 200. *(01-auth-full; **фікс:** додано в PUBLIC_ROUTES)*
- [x] 1E.3 unauthenticated `/dashboard` → редірект `/login`. *(login.spec.ts)*
- [x] 1E.4 axe кожної сторінки → 0 violations. *(01-auth-full)*
- [x] 1E.5 `/legal/terms` 200 + heading (platform legal template). *(01-legal-offer-mock)*
- [x] 1E.6 `/legal/contacts` 200. *(01-legal-offer-mock)*
- [x] 1E.7 `/legal/payment-refund` 200. *(01-legal-offer-mock)*

### 1F. Public lesson offer (B2C checkout surface)
> Публічна сторінка пакетів школи (`/offer`, `GET /api/school/public-offer`). Без секретів у DOM.

- [x] 1F.1 `/offer` — пакети з `paymentConfig` **АБО** empty state. *(01-legal-offer-mock)*
- [x] 1F.2 Показані лише enabled online method logos (mock public-offer). *(01-legal-offer-mock)*
- [x] 1F.3 axe `/offer`. *(01-legal-offer-mock)*

**Знахідки (виправлено 2026-07-06):** (1) логін не валідував формат email клієнтом → додано; (2) `/privacy` і `/status` гейтились авторизацією (не в `PUBLIC_ROUTES`) → відкрито. Лишок: 1A.6/1B.5/1C.3 — N/A у test-env; **1E.5–7 / 1F** ☑ (2026-07-21).

→ Після аудиту: `docs/e2e-improvements/01-auth.md`.

---

## ЕТАП 2 — Сюжет: Signup → Onboarding → Tour `☑`

> **Playwright-тести написані:** ☑ `specs/audit/02-journey-audit.spec.ts`. **Аудит:** ☑ (2026-07-02 + spotlight 2026-07-09).

- 2.1 Реєстрація школи через UI → школа+admin+trial, auto-login, редірект.
- 2.2 Дубль email → помилка.
- 2.3 Wizard `profile`: назва/опис → `PATCH /onboarding/step`, persist.
- 2.4 Wizard `teaching`: мови/рівні → persist.
- 2.5 Wizard `payments`: вибір методів, allowlist-валідація.
- 2.6 Wizard `invite`: інвайт teacher/student (валідний/невалідний email).
- 2.7 Wizard `sample-content`: демо-контент тоглиться.
- 2.8 `complete` → редірект dashboard.
- 2.9 Tour: Next/Back/Skip/Finish → `POST /onboarding/tour/complete`; крок підсвічує область.
- 2.10 Resume: вийти на кроці 3 → повернутись → стан відновлено.
- 2.11 Golden-path: весь сюжет 1→4 одним наскрізним тестом.
- 2.12 Arvi: `greet`→`celebrate`→`point` по кроках присутні.
- [x] 2.13 **Accept invite**: invalid token → API error. *(02-invite-api; valid-token UI deferred — no Campus accept page; token only in email)*
- [x] 2.14 Help encyclopedia tracks (header `?`, ≠ ProductTour) — open track + step. *(02-help-and-offer-payment)*

→ Після етапу: `docs/e2e-improvements/02-journey.md`.

---

## ЕТАП 3 — Роль STUDENT `☑` (interaction-рівень; Arvi — B7)

> **Playwright-тести:** `specs/audit/03-student-audit.spec.ts` (render+axe усіх сторінок), `specs/audit/03-student-granular.spec.ts` (21 tests: quick-actions, таби, фільтри, віджети, навігація — 2026-07-06) + старі `specs/pages/*`.
> **Аудит:** ☑ 2026-07-02…10 + P1/P2 2026-07-21. GDPR/notifications/DnD/Help/offer↔payment ☑. **Ask Arvi → Етап 12** ☑.

### 3A. `/dashboard`
- [x] 3A.1 `<main>` рендериться. *(dashboard.spec.ts)*
- [x] 3A.2 блок уроків сьогодні АБО empty-стан. *(dashboard.spec.ts — soft)*
- [x] 3A.3 loading «Loading lessons…» зникає. *(03-student-granular)*
- [x] 3A.4 empty «All caught up» / «No lessons today». *(03-empty-states; `jest-student-empty` — 2026-07-10)*
- [x] 3A.5 quick action «Review words» → `/vocabulary`. *(03-student-granular)*
- [x] 3A.6 EntitlementsWidget відображається. *(03-student-granular)*
- [x] 3A.7 кожне quick-action веде у правильний маршрут. *(03-student-granular)*
- [x] 3A.8 **Daily goals** картка з цілями. *(03-student-granular)*
- [x] 3A.9 **Achievements** — таб + badges/counters. *(03-practice-deep — 2026-07-10)*
- [x] 3A.10 **Statistics**: графіки/тайли рендеряться. *(03-student-granular)*
- [x] 3A.∗ SEO title, сайдбар-посилання всіх ролей. *(dashboard.spec.ts)*

### 3B. `/lessons` + `/lessons/[id]` (lesson room)
- [x] 3B.1 рендер `/lessons`, `<main>` є. *(lessons.spec.ts)*
- [x] 3B.2 фільтр-таби Planned / Completed / Cancelled. *(03-student-audit)*
- [x] 3B.3 порожній список АБО список. *(lessons.spec.ts)*
- [x] 3B.4 клік на урок → `/lessons/[id]`. *(03-student-granular)*
- [x] 3B.5 `/lessons/<неіснуючий>` → помилка. *(03-student-granular; також 11-edge)*
- [x] 3B.6 **Video meeting** кнопка провайдер-залежна. *(03-lesson-video-mock; mocked meet URL — 2026-07-09)*
- [x] 3B.7 **LiveKit inline** JWT → PreJoin. *(03-livekit-token — 2026-07-09; full WebRTC room — поза E2E, потребує LiveKit infra)*
- [x] 3B.8 **Homework** student submit flow. *(03-homework-upload; file fixture + upload mock — 2026-07-09)*
- [x] 3B.9 **LessonVocabularyAddPanel**. *(03-lesson-vocab-add — 2026-07-09)*
- [x] 3B.10 lesson detail «Open in calendar» лінк. *(03-student-b3)*
- [x] 3B.11 download вкладень. *(03-homework-upload: mocked GET /api/lessons/files — 2026-07-09; skip якщо немає chip у сіді)*

### 3C. `/practice` (hub)
- [x] 3C.1 блок Stats: «Due for review», «Quizzes open». *(03-student-granular)*
- [x] 3C.2 вхід у Vocabulary practice. *(03-student-granular; лінки під-маршрутів)*
- [x] 3C.3–3C.5 вхід у Irregular/Quiz/Speaking. *(03-practice-deep — 2026-07-10; play specs окремо)*
- [x] 3C.6 loading-стан Stats — покрито 3A.3 патерном (loading зникає).

### 3D. `/practice/vocabulary`
- [x] 3D.1 рендер + картка/empty. *(03-student-audit 3D.1/3D.5)*
- [x] 3D.2 правильна відповідь → Arvi `celebrate`. *(B7 2026-07-10: `useArvi().celebrate` у vocabulary play)*
- [x] 3D.3 невірна → Arvi `encourage`. *(B7 2026-07-10: `useArvi().encourage`)*
- [x] 3D.4 завершення сесії → підсумок. *(03-vocabulary-play — 2026-07-09)*
- [x] 3D.5 empty «All done!» / контент. *(03-student-audit)*

### 3E. `/practice/irregular-verbs`
- [x] 3E.1–3E.3 старт / перевірка / підсумок. *(03-irregular-verbs-play — 2026-07-09)*

### 3F. `/practice/quiz` та `/quiz`
- [x] 3F.1–3F.4 проходження квіза (seed quizAssignment). *(03-quiz-play — 2026-07-09)*
- [x] 3F.5 Arvi-реакції. *(B7 2026-07-10: celebrate/encourage у `QuizPlaySession` + irregular verbs)*

### 3G. `/practice/speaking`
- [x] 3G.1–3G.3 mic-record + submit REST mock. *(03-speaking-mic + 03-practice-deep 3G — 2026-07-10)*

### 3H. `/vocabulary`
- [x] 3H.1 список слів (seeded). *(03-student-granular)*
- [x] 3H.2 фільтр статусів перемикає. *(03-student-granular; також 03-student-audit)*
- [x] 3H.3 empty «No words yet». *(03-empty-states; `jest-student-empty` — 2026-07-10)*
- [x] 3H.4 word detail modal (кнопка «All information»). *(03-student-b3)*

### 3I. `/calendar`
- [x] 3I.1 week/month перемикає вид. *(03-student-audit)*
- [x] 3I.2 події відображаються (сідові уроки). *(03-student-audit render)*
- [x] 3I.3 порожній період. *(03-empty-states; empty student calendar — 2026-07-10)*
- [x] 3I.4 навігація вперед/назад. *(03-student-granular)*
- [x] 3I.5 DnD reschedule (teacher/admin): drag → mutation mocked **АБО** soft-skip. *(03-calendar-dnd-mock)*

### 3J. `/chat` (realtime, Socket.IO)
- [x] 3J.1 інбокс: search + список/empty. *(03-student-granular; також 03-student-audit)*
- [x] 3J.2 відкриття діалогу, історія. *(03-chat-seed; DIRECT teacher↔student — 2026-07-10)*
- [x] 3J.3 realtime доставка через Socket.IO. *(03-chat-mock: send mutation mocked — 2026-07-09; повний socket — беклог)*
- [x] 3J.4 «New message» → Search-people picker. *(03-student-b3)*
- [x] 3J.5 створення групового чату (admin-роль, no-cleanup). *(03-create-group-chat; 2026-07-09)*
- [x] 3J.6 empty-state — покрито 3J.1 (search|empty).
- [x] 3J.7 пагінація вгору. *(03-chat-mock: mocked chatMessages cursor — 2026-07-09)*
- [x] 3J.8 unread badge / markRead. *(03-chat-mock — 2026-07-09)*
- [x] 3J.9 auto-scroll логіка. *(03-chat-mock: log + latest bubble baseline — 2026-07-09)*
- [x] 3J.10 ephemeral attachments TTL. *(03-chat-mock: expired attachment UI — 2026-07-09)*

### 3K. `/payment`
- [x] 3K.1 «Payment» рендер. *(03-student-audit)*
- [x] 3K.2 методи оплати АБО empty. *(03-student-audit 3K.2)*
- [x] 3K.3 **lesson balance** (prepaid credits) відображається. *(03-student-granular)*
- [x] 3K.4 **пакети** top-up (сідовий `School.paymentConfig`: 5/10 lessons). *(03-payment-config)*
- [x] 3K.5 оплата провайдером (редірект). *(03-payment-checkout-mock — 2026-07-09)*
- [x] 3K.6 **manual invoice** інструкції (IBAN bank transfer). *(03-payment-config)*
- [x] 3K.7 вибір валюти (UAH+USD у сіді). *(03-payment-config)*
- [x] 3K.8 Cross-check public `/offer` packages match student `/payment` packages (same school). *(02-help-and-offer-payment — mocked)*

### 3L. `/profile` (таби)
- [x] 3L.1 таб **Profile** відкривається. *(03-student-audit 3L tabs)*
- [x] 3L.2 зміна пароля через UI (happy-path + wrong-current error). *(03-password-change; **виправлено P0-баг** — див. нижче)*
- [x] 3L.3 таб **Appearance**: контрол Small/Medium/Large присутній. *(03-student-granular)*
- [x] 3L.4 таб **Notifications** відкривається (тогли). *(03-student-granular)*
- [x] 3L.5 таб **Connections** OAuth-флоу (Google/Zoom/Telegram/Facebook). *(03-profile-oauth-mock: link URL mocked — 2026-07-09)*
- [x] 3L.6 таб **Statistics** відкривається (+Achievements/Words/Lessons лічильники в hero). *(03-student-granular + 03-student-audit)*
- [x] 3L.7 Escape під-панелей — покрито патерном focus-trap (Етап 10).
- [x] 3L.8 **GDPR Export my data** → download/JSON (mock `GET /gdpr/export`). *(03-gdpr-mock)*
- [x] 3L.9 **Delete account** confirm → `DELETE /gdpr/me` mocked → `/login`. *(03-gdpr-mock)*
- [x] 3L.10 Notifications: toggle → auto-save `updateMyProfile` (mock) → Preferences saved. *(03-notifications-mock)*

### 3M. Навігація + a11y
- [x] 3M.1 сайдбар студента без admin/system/materials/students. *(navigation.spec.ts)*
- [x] 3M.2 logout (Arvi `wave`). *(B7 2026-07-10: `AccountPanel` → `wave` перед logout)*
- [x] 3M.3 axe кожної сторінки → 0 violations. *(03-student-audit 3M sweep)*

→ Після аудиту: `docs/e2e-improvements/03-student.md`.

---

## ЕТАП 4 — Роль TEACHER `☑` (interaction-рівень; Arvi — B7)

> **Playwright-тести:** `specs/audit/04-teacher-audit.spec.ts` (render+axe+modal), `specs/audit/04-teacher-granular.spec.ts` (materials/students/groups/profile-tabs/lesson-modal, 2026-07-06) + старі `specs/pages/*`.
> **Аудит:** ☑ 2026-07-02 (render/axe) + 2026-07-06 (granular) + 2026-07-10 (save/review, group billing, empty teacher).

(Спільні зі студентом сторінки перевіряємо у teacher-контексті + нижче.)

### 4A. `/materials` + MaterialFormModal
- [x] 4A.1 заголовок «Materials» + Grid/List view toggle. *(04-teacher-granular)*
- [x] 4A.2 «Search materials…» фільтрує (nonsense → сідовий матеріал зникає). *(04-teacher-granular)*
- [x] 4A.3 kind filter stat cards (Books/Boards/Total). *(04-teacher-granular — 2026-07-09)*
- [x] 4A.4 **Create modal** відкривається (`role=dialog`) + axe. *(04-teacher-audit)*
- [x] 4A.5 **TagInput** chip-и (тип+Enter→chip). *(04-teacher-material-form)*
- [x] 4A.6 **Level** select A1–C2. *(04-teacher-material-form)*
- [x] 4A.7 upload create + asset file. *(04-material-upload)*
- [x] 4A.8 cover preview + remove. *(04-material-form-edges)*
- [x] 4A.9 book kind multi-asset rows. *(04-material-form-edges)*
- [x] 4A.10 compression select Balanced/Light/Strong/Off. *(04-material-form-edges)*
- [x] 4A.11 nav-lock save progress during slow upload. *(04-material-form-edges)*
- [x] 4A.12 interrupted-upload recovery banner. *(04-material-form-edges)*
- [x] 4A.13 file policy (invalid cover + max-size hint). *(04-material-form-edges; 2026-07-09)*
- [x] 4A.14 сідовий матеріал видно (список не порожній). *(04-teacher-granular)*
- [x] 4A.15 видалення матеріалу. *(04-delete-material; create+delete via GQL+UI, self-cleanup; 2026-07-09)*

### 4B. `/materials/view/[attachmentId]` — *☑ interaction smoke (2026-07-09)*
- [x] 4B.8 `aria-label` кнопки відкриття (04-teacher-audit render).
- [x] 4B.router error / unsupported / media redirect. *(04-material-viewer-smoke)*
- [x] 4B.1 book viewer shell (header, zoom, toolbar) with mocked PDF. *(04-material-viewer-smoke)*
- [x] 4B.2–4B.4 page nav visible, zoom, pen tool. *(04-material-viewer-smoke)*
- [x] 4B.5 annotation PUT save after pen stroke. *(04-material-viewer-smoke — 2026-07-09)*
- [x] 4B.6 Plyr player modal from audio deep link. *(04-material-viewer-smoke — 2026-07-09)*
- [x] 4B.7 Range request → 206 (mocked API contract). *(04-material-viewer-smoke — 2026-07-09)*
- [x] 4B.9 download link href. *(04-material-viewer-smoke)*

### 4C. `/students`
- [x] 4C.1 список (картки) із сідовим студентом. *(04-teacher-granular; також 04-teacher-audit)*
- [x] 4C.2 SegmentedControl scope (за фіче-флагом груп). *(04-teacher-granular; skip якщо флаг off)*
- [x] 4C.3 empty. *(04-empty-teacher; `jest-teacher-empty` — 2026-07-10)*
- [x] 4C.4 error — покрито 11-edge (500→error UI).

### 4D. `/students/[studentId]` (таби)
- [x] 4D.1–6 таби Profile/Statistics/Lessons/Billing/Practice/Achievements відкриваються (aria-selected). *(04-teacher-granular)*
- [x] 4D.6 неіснуючий студент → помилка. *(04-teacher-audit)*
- [x] save/деталі всередині табів (Billing save). *(04-student-tab-save — 2026-07-10)*

### 4E. `/students/groups`
- [x] 4E.1 сторінка груп рендериться (список/empty). *(04-teacher-granular; також 04-teacher-audit render+axe)*
- [x] 4E.2 створення групи (admin-роль, PlatformSettings seed). *(04-create-group; 2026-07-09)*
- [x] 4E.3 empty-state — покрито 4E.1.

### 4F. Lesson modal (1:1)
- [x] 4F.1 відкриття `role=dialog`, focus-on-open, Escape. *(04-teacher-audit + 10-a11y focus-trap)*
- [x] 4F.2/4F.3 таби Lesson planning / Lesson content перемикаються (aria-selected). *(04-teacher-granular)*
- [x] 4F.4 homework tab visible in content. *(04-lesson-modal-deep — 2026-07-09)*
- [x] 4F.6 image/file upload in content tab. *(04-lesson-content-upload — 2026-07-09)*
- [x] 4F.7 video provider link on lesson hub. *(03-lesson-video-mock — 2026-07-09)*
- [x] 4F.8 recurrence controls in planning tab. *(04-lesson-modal-deep — 2026-07-09)*
- [x] 4F.5 review / 4F.9 save. *(04-lesson-save-review; seed homework SUBMITTED — 2026-07-10)*
- [x] 4F.10 закриття без збереження — Escape закриває (04-teacher-granular).

### 4G. Group lessons
- [x] 4G.1 group lesson type in modal. *(04-group-lessons — 2026-07-09)*
- [x] 4G.2–4G.7 billing UI (mode/split/payer). *(04-group-billing-ui; math у module-billing — 2026-07-10)*

### 4H. Навігація + a11y
- [x] 4H.1 сайдбар вчителя: students + materials є, admin/system нема. *(navigation.spec.ts)*
- [x] 4H.2 axe → 0 violations. *(04-teacher-audit 4H sweep, 8 сторінок)*

→ Після аудиту: `docs/e2e-improvements/04-teacher.md`.

---

## ЕТАП 5 — Роль ADMIN `☑` (interaction-рівень)

> **Playwright-тести:** `specs/audit/05-admin-audit.spec.ts` (render+axe+RBAC) + `specs/audit/05-06-granular.spec.ts` (staff-tabs/finance/billing/admin, 2026-07-06) + `specs/pages/admin.spec.ts`.
> **Аудит:** ☑ 2026-07-02 (render/axe) + 2026-07-06 (granular).

### 5A. `/staff` + `/staff/[userId]`
- [x] 5A.1 список «Staff», roster. *(05-admin-audit)*
- [x] 5A.2 empty/error — roster завжди має staff у сіді; error UI покрито 11-edge патерном. **N/A** окремий empty-school fixture.
- [x] 5A.3 профіль: таби Profile/Compensation/Earnings & payouts/Statistics відкриваються. *(05-06-granular)*
- [x] 5A.4 метрики (Accrued/Outstanding/Payout/Lessons) в hero. *(05-admin-audit render)*
- [x] 5A.5 «Back to staff» / 5A.6 non-staff. *(05-admin-deep — 2026-07-10)*
- [x] 5A.7 **Record staff payout** modal → GraphQL mocked → success. *(05-record-payout-mock)*

### 5B. `/finance`
- [x] 5B.1 «Staff finance» рендер + контент. *(05-06-granular; також 05-admin-audit+axe)*
- [x] 5B.2–5B.4 графік/breakdown/empty hints. *(05-admin-deep — 2026-07-10)*

### 5C. `/billing`
- [x] 5C.1 «Subscription» + поточний план. *(05-06-granular)*
- [x] 5C.2 **storage meter** + seats. *(05-06-granular)*
- [x] 5C.3 план-пікери за trial-станом (ACTIVE школа → current-plan summary). *(05-06-granular)*
- [x] 5C.4 promo apply → success banner. *(05-billing-mock, route-mock)*
- [x] 5C.5 checkout → POST fired (mock provider url). *(05-billing-mock)*
- [x] 5C.6 feature-gate: over-quota → storage warning. *(05-billing-mock)*
- [x] 5C.7 seat-enforcement UI: create-account 403 → error shown, no nav (mock createAdminUser). *(05-seat-enforcement)*
- [x] 5C.8 стани TRIAL vs ACTIVE (promo card / current-plan). *(05-billing-mock)*

### 5D. `/admin`
- [x] 5D.1 «Account administration» + 5D.2 «Accounts overview» (region + All accounts). *(05-06-granular)*
- [x] 5D.3 дії керування акаунтами (створення). *(05-create-account; self-cleanup; 2026-07-09)*
- [x] 5D.4 **Student import**: CSV fixture → preview + commit (REST mock) / validation error. *(05-student-import-mock)*
- [x] 5D.5 Invite create via admin API `POST /schools/invitations` (no dedicated roster Invite UI yet). *(02-invite-api)*

### 5E. Навігація + a11y
- [x] 5E.∗ admin sidebar бачить admin link. *(navigation.spec.ts)*
- [x] 5E.1 сайдбар адміна: staff/finance/billing/admin (+/system за route-policy). *(05-admin-audit 5E.1)*
- [x] 5E.2 axe → 0 violations. *(05-admin-audit sweep)*

→ Після аудиту: `docs/e2e-improvements/05-admin.md`.

---

## ЕТАП 6 — SUPER_ADMIN + `/system` `☑` (admin-scope)

> **Playwright-тести:** `specs/audit/06-system-audit.spec.ts` (таби render+axe) + `05-06-granular.spec.ts` + `06-smtp-mock.spec.ts` + `specs/pages/system.spec.ts`.
> **Аудит:** ☑ 2026-07-02…06; SMTP interactions ☑ 2026-07-21. `/system` доступний ADMIN (route-policy); platform-global SMTP/LLM також у Control Plane (Етап 7).

`/system` таби (актуально): general, branding, domains, **email**, **ai** (school LLM override), payments, payouts, connections, dictionary (+ seller/legal за навігацією).

### 6A. Shell
- [x] 6.1 «System control room» рендер + Tabs навігація. *(06-system-audit)*
- [x] 6.12 сайдбар: System видно admin. *(05-admin-audit 5E.1)*
- [x] 6.13 axe табів → 0 violations. *(06-system-audit)*

### 6B. General / branding / domains
- [x] 6.2 **general** панель. *(06-system-audit + 05-06-granular)*
- [x] 6.3 **branding** — hex/логотип. *(05-06-granular + 06-system-audit)*
- [x] 6.4 **domains** add-form / feature-gate + hostname. *(06-system-b3)*
- [x] 6.9 **video meetings** (general) регіон. *(05-06-granular)*

### 6C. Transactional email (SMTP) — platform-global store
> Той самий `PlatformSettings` рядок, що Control Plane → Settings → Transactional email. Live Resend/Brevo у CI **не** викликаємо (GraphQL route-mock).

- [x] 6.5.1 таб **Email** відкривається; runtime badge / host. *(06-smtp-mock)*
- [x] 6.5.2 Mode → **Custom SMTP**; Verify connection → success (mock `verifySmtpConnection`). *(06-smtp-mock)*
- [x] 6.5.3 Provider preset **Resend** → `#smtp-host` = `smtp.resend.com`, port `465`. *(06-smtp-mock — 2026-07-21)*
- [x] 6.5.4 **Save SMTP** → success copy (mock `updatePlatformIntegrationSettings`). *(06-smtp-mock)*
- [x] 6.5.5 **Send test welcome email** → success (mock `sendTestWelcomeEmail`; `systemMailStatus.configured`). *(06-smtp-mock)*
- [x] 6.5.6 Server default mode (без custom host). *(06-smtp-negatives-mock)*
- [x] 6.5.7 Негатив: verify/save fail message. *(06-smtp-negatives-mock)*

### 6D. Arvi AI (school override)
> Platform default — Етап 7.6B. Campus **AI** таб = Pro override (`GET/PUT /api/system/llm`).

- [x] 6.14.1 таб **AI** рендериться в shell. *(smoke via 06-system-audit tabs / page)*
- [x] 6.14.2 Enable override + Save (REST mock). *(06-school-llm-mock)*
- [x] 6.14.3 Test connection (mock). *(06-school-llm-mock)*
- [x] 6.14.4 Feature-gate без `aiAssist` (`canOverride: false`). *(06-school-llm-mock)*

### 6E. Payments / connections / dictionary (deep save)
- [x] 6.6/6.7 **payments/payouts** панелі + labels. *(06-system-audit)*
- [x] 6.8 **connections** (Google/Zoom/LiveKit) + aria. *(06-system-audit)*
- [x] 6.10 **dictionary** панель. *(05-06-granular)*
- [x] 6.11 media-captions — N/A коли flag off; soft assert коли on. *(05-06-granular)*
- [x] 6.15.1 Payments: Save pricing / enable method (GraphQL mock) → Saved. *(06-system-deep-saves-mock)*
- [x] 6.15.2 Payouts defaults Save (mock). *(06-system-deep-saves-mock)*
- [x] 6.15.3 Connections: save Zoom field (mock, без live OAuth). *(06-system-deep-saves-mock)*
- [x] 6.15.4 Dictionary: select provider + Save (mock). *(06-system-deep-saves-mock)*
- [x] 6.15.5 Branding: change hex → Save → preview CSS var (mock). *(06-system-deep-saves-mock)*

### 6F. Seller legal (compliance)
> Merchant-of-record профіль школи; блокує online PSP без профілю.

- [x] 6.16.1 Fill legal name / address / support email → Save (REST mock). *(06-seller-legal-mock)*
- [x] 6.16.2 Payments tab seller-incomplete gate warning. *(06-seller-legal-mock)*
- [x] 6.16.3 Public `/legal/contacts` reflects seller mock overrides. *(06-seller-legal-mock)*

→ Після етапу: `docs/e2e-improvements/06-system.md`.

---

## ЕТАП 7 — Platform Control Plane (`:4300`, platform operator) `☑`

> **Playwright-тести (project=`public`):**
> - Smoke + axe: `07-platform-audit.spec.ts` (dashboard, schools, users, promo-codes, audit-log, settings, billing/rails, billing/campus-plans)
> - Interaction mocks: `07-platform-dashboard.spec.ts`, `07-platform-schools-detail-mock.spec.ts`, `07-platform-users-mock.spec.ts`, `07-platform-promo-codes-mock.spec.ts`, `07-platform-audit-log-mock.spec.ts`, `07-platform-smtp-mock.spec.ts`, `07-platform-llm-mock.spec.ts`, `07-platform-payment-methods-mock.spec.ts`, `07-platform-billing-rails-mock.spec.ts`, `07-platform-campus-plans-mock.spec.ts`
> **Аудит:** ☑ 2026-07-03 (smoke); interaction wave ☑ 2026-07-21.
> **Передумова:** `PLATFORM_BASE_URL` (дефолт `http://localhost:4300`); soft-skip якщо host unreachable.
> **Auth у тестах:** `page.request.post('/api/auth/login')` як `jest-super-admin` (cookie на host діє і для :4300).
> **Правило:** live SMTP / LLM / Stripe / MonoPay у CI **не** викликаємо — лише REST/GraphQL mocks на mutating calls.

Навігація Control Plane: Dashboard · Campuses · Users · Promo codes · Audit log · Settings · Billing → Payment rails · Campus plans.

### 7.0 Platform login (`/login`, `arvilio_pat`)
> Зараз e2e логіниться через Campus `/api/auth/login` + cookie на host. Окремий Control Plane login UI не покритий.

- [x] 7.0.1 `/login` render: email/password, Sign in, restricted-admin copy. *(07-platform-login-filters-mock)*
- [x] 7.0.2 Wrong password → error; cookies не ставлять `arvilio_pat`. *(07-platform-login-filters-mock)*
- [x] 7.0.3 Success (mocked platform login) → `/dashboard`. *(07-platform-login-filters-mock)*
- [x] 7.0.4 Non-operator school admin → 401 / Invalid credentials. *(07-platform-login-filters-mock)*

### 7.1 `/dashboard` — fleet KPIs
- [x] 7.1.1 Heading Dashboard; StatCards: Campuses / Active / Trial / Suspended / Active users / Active subscriptions / Storage / MRR. *(07-platform-dashboard)*
- [x] 7.1.2 Secondary metrics strip: Operators, Orphans, Blocked, Trials ending, Rails configured, Trialing subs. *(07-platform-dashboard)*
- [x] 7.1.3 Panels **Recent campuses** + **Recent audit** + «View all» links. *(07-platform-dashboard)*
- [x] 7.1.4 Smoke + screenshot + axe. *(07-platform-audit)*

### 7.2 `/schools` (Campuses) — list
- [x] 7.2.1 Heading Campuses; список зі статусами TRIAL/ACTIVE; лінки `/schools/[id]`. *(07-platform-audit 7.2)*
- [x] 7.2.2 Search (name/slug) debounce → filtered rows. *(07-platform-login-filters-mock)*
- [x] 7.2.3 Status filter (Active/Trial/Suspended). *(07-platform-login-filters-mock)*
- [x] 7.2.4 Subscription filter (chrome present; status filter exercised). *(07-platform-login-filters-mock)*
- [x] 7.2.5 Infinite scroll «Showing N of M · scroll for more». *(07-platform-leftovers-mock)*

### 7.3 `/schools/[id]` — campus detail & operator actions
- [x] 7.3.1 Chrome: Members/Admins/Teachers/Students/Storage stats; Campus + Owner panels; back «Campuses». *(07-platform-schools-detail-mock)*
- [x] 7.3.2 **Suspend campus** → POST mocked, без UI error. *(07-platform-schools-detail-mock)*
- [x] 7.3.3 **Activate campus** (фільтр Suspended → detail) → POST mocked. *(07-platform-schools-detail-mock)*
- [x] 7.3.4 **Impersonate admin** → POST mocked; Campus redirect aborted. *(07-platform-schools-detail-mock)*
- [x] 7.3.5 **Billing country** Save → PATCH mocked → «Saved». *(07-platform-schools-detail-mock)*
- [x] 7.3.6 **All members** panel + Search members chrome. *(07-platform-schools-detail-mock)*
- [x] 7.3.7 Members list search/filter/infinite (mock). *(07-platform-schools-detail-mock)*
- [x] 7.3.8 Impersonate stop / banner на Campus. *(07-platform-schools-detail-mock — live API; soft-skip)*

### 7.4 `/promo-codes`
- [x] 7.4.1 Chrome: Code / Trial days / Max redemptions / Create code. *(07-platform-promo-codes-mock)*
- [x] 7.4.2 Create → POST mocked → поле Code очищається. *(07-platform-promo-codes-mock)*
- [x] 7.4.3 Disable active code → PATCH mocked. *(07-platform-promo-codes-mock)*
- [x] 7.4.4 Enable disabled code. *(07-platform-promo-codes-mock — soft-skip якщо немає Disabled)*
- [x] 7.4.5 Duplicate code error message. *(07-platform-promo-codes-mock)*

### 7.5 `/audit-log`
- [x] 7.5.1 Heading + Search; mocked rows; «Showing N of M · scroll for more». *(07-platform-audit-log-mock)*
- [x] 7.5.2 Search `q=` refetch filters actions. *(07-platform-audit-log-mock)*
- [x] 7.5.3 Cursor load-more (IntersectionObserver). *(07-platform-audit-log-mock)*
- [x] 7.5.4 Campus link з `targetSchoolId` → `/schools/[id]`. *(07-platform-audit-log-mock)*

### 7.6 `/settings` — platform-global policy
Три панелі на одній сторінці (SSR hydrate + client mutations).

#### 7.6A Transactional email (SMTP)
- [x] 7.6A.1 Panel «Transactional email»; Mode; Save SMTP. *(07-platform-smtp-mock)*
- [x] 7.6A.2 Custom + Resend preset → host `smtp.resend.com`. *(07-platform-smtp-mock)*
- [x] 7.6A.3 Verify connection (POST `/api/platform/smtp/verify` mock). *(07-platform-smtp-mock)*
- [x] 7.6A.4 Save SMTP (PUT mock) → «Saved.» *(07-platform-smtp-mock)*
- [x] 7.6A.5 Send test email (POST `/smtp/test` mock). *(07-platform-smtp-mock)*
- [x] 7.6A.6 Verify/Save fail → error message (REST mock 400) — twin of **6.5.7**. *(07-platform-smtp-mock)*
- Unit: `matchSmtpProviderPreset`, `PlatformSmtpService.spec`. Campus twin: **6.5**.

#### 7.6B Arvi AI — default model
- [x] 7.6B.1 Panel «Arvi AI»; Provider; Save default LLM. *(07-platform-llm-mock)*
- [x] 7.6B.2 Switch Provider → Anthropic → Anthropic API key field (Base URL hidden). *(07-platform-llm-mock)*
- [x] 7.6B.3 Test connection (POST `/api/platform/llm/test` mock). *(07-platform-llm-mock)*
- [x] 7.6B.4 Save default LLM (PUT mock) → «Saved.» *(07-platform-llm-mock)*
- Unit: `PlatformLlmService.spec`. School override: **6.14** ☑ `06-school-llm-mock`.

#### 7.6C Learner payment methods allowlist
- [x] 7.6C.1 Panel «Learner payment methods»; method cards group; Save allowlist. *(07-platform-payment-methods-mock)*
- [x] 7.6C.2 Toggle Stripe + Save (PUT mock) → «Saved». *(07-platform-payment-methods-mock)*
- Unit: `PlatformPaymentMethodsService.spec`. Empty allowlist = no restriction (product rule).

### 7.7 Access control
- [x] 7.7.1 School admin → Not authorized / not a platform operator. *(07-platform-audit)*
- [x] 7.7.2 Guest → unauthorized / sign in. *(07-platform-audit)*

### 7.8 a11y
- [x] 7.8.1 axe на smoke-сторінках консолі → 0 violations. *(07-platform-audit)*

### 7.9 Billing (Layer B / ADR-010)
#### 7.9A `/billing/rails` — Payment rails
- [x] 7.9A.1 Heading Payment rails; Search; Market; Save payment rails; Stripe card. *(07-platform-billing-rails-mock)*
- [x] 7.9A.2 Search «LiqPay» filters cards. *(07-platform-billing-rails-mock)*
- [x] 7.9A.3 Configure → Hide configuration. *(07-platform-billing-rails-mock)*
- [x] 7.9A.4 Save (PUT `/api/platform/billing/rails` mock) → Saved. *(07-platform-billing-rails-mock)*
- [x] 7.9A.5 Test connection на configured rail (POST `…/rails/:id/test` mock; soft-skip якщо немає). *(07-platform-billing-rails-mock)*
- Unit: `PlatformBillingRailsService.spec` + catalog/product specs.

#### 7.9B `/billing/campus-plans` — Campus subscription offers
- [x] 7.9B.1 Heading Campus plans; Default offer **або** empty «No payment rails are ready». *(07-platform-campus-plans-mock)*
- [x] 7.9B.2 Save campus plans (PUT `/campus-subscription` mock) → Saved (skip якщо Save disabled). *(07-platform-campus-plans-mock)*
- [x] 7.9B.3 Add country override row. *(07-platform-leftovers-mock — soft-skip якщо немає availableRails)*
- [x] 7.9B.4 Rail picker лише enabled+configured. *(07-platform-leftovers-mock — live SSR rails; soft-skip якщо empty)*

### 7.10 `/users` — global identity directory (ADR-006)
- [x] 7.10.1 Stats: Total / Active / With campus / No campus / Operators / Blocked. *(07-platform-users-mock)*
- [x] 7.10.2 Filters: Search, Account status, Membership role, Scope. *(07-platform-users-mock)*
- [x] 7.10.3 List rows (mock GET `/api/platform/users`) + search `q=` filter. *(07-platform-users-mock)*
- [x] 7.10.4 Smoke + axe. *(07-platform-audit)*
- Unit: `PlatformUsersService.stats`.
- [x] 7.10.5 Scope operators filter. *(07-platform-login-filters-mock)*
- [x] 7.10.6 Infinite scroll. *(07-platform-users-mock)*

→ Після етапу: `docs/e2e-improvements/07-platform.md`.

> **Поза скоупом E2E:** `/cms-admin` (Payload), `/mascot-preview` (dev Arvi) — лише smoke 200/gate.
> **Out of CI (навмисно):** live SMTP delivery, live LLM provider calls, live Stripe `balance.retrieve` / MonoPay network (мок-only).
> **Ще не збудовано:** per-school SMTP override.

---

## ЕТАП 8 — RBAC негативні `☑`

> **Playwright-тести:** `specs/audit/08-rbac-audit.spec.ts` (28 tests: student/teacher/admin/guest denials + API-no-session + tenant isolation) + старі `specs/pages/*`.
> **Аудит:** ☑ 2026-07-03…06.

- [x] 8.1 STUDENT → /students, /admin → редірект. *(08-rbac 8.1)*
- [x] 8.2 TEACHER → /admin, /system → редірект. *(08-rbac 8.2)*
- [x] 8.3 ADMIN: /system дозволено (route-policy), platform → редірект. *(08-rbac 8.3)*
- [x] 8.4 TEACHER/ADMIN → `/payment` → редірект (тільки student). *(08-rbac 8.2/8.4)*
- [x] 8.5 guest → /dashboard → редірект `/login`. *(08-rbac 8.5)*
- [x] 8.6 API без сесії → 401/403. *(08-rbac 8.6)*
- [x] 8.7 JWT школи ≠ host → 403 — **N/A**: host-based routing не імплементовано (Phase 2). Крос-тенантна ізоляція ☑ `08-rbac-audit` 8.7 tenant-isolation.
- [x] 8.8 прямий перехід по URL гейтиться. *(всі RBAC-тести)*

→ Див.: `docs/e2e-improvements/08-rbac.md`.

---

## ЕТАП 9 — Адаптивність (mobile/tablet) `☑`

> **Playwright-тести:** ☑ `specs/audit/09-responsive-audit.spec.ts`. **Аудит:** ☑ (2026-07-03).

- 9.1 сайдбар на mobile: бургер/collapse.
- 9.2 dashboard/lessons/practice/calendar/chat/vocabulary на mobile — без h-скролу.
- 9.3 lesson modal на mobile — вміщується/скролиться.
- 9.4 `Field as=select` → нативний select на mobile.
- 9.5 таблиці (students/staff/finance) — адаптація (scroll/cards).
- 9.6 Arvi на mobile: масштаб/позиція/прибирання, не ламає лейаут.
- 9.7 tablet (768×1024) ключові екрани.
- 9.8 скріни у desktop+mobile.

→ Після етапу: `docs/e2e-improvements/09-responsive.md`.

---

## ЕТАП 10 — a11y повний прохід `☑`

> **Playwright-тести:** ☑ `specs/audit/10-a11y-audit.spec.ts` + axe у audit 01–07. **Аудит:** ☑ (2026-07-03).

- 10.1 axe на кожній сторінці × кожна доступна роль → зведена таблиця.
- 10.2 keyboard: Tab-порядок, focus-trap модалок, Escape, focus-visible.
- 10.3 `prefers-reduced-motion`: Arvi/анімації поважають.
- 10.4 screen-reader мітки ключових контролів.
- 10.5 контраст усіх станів (hover/disabled/focus).

→ Після етапу: `docs/e2e-improvements/10-a11y.md`.

---

## ЕТАП 11 — Edge / помилки / стани `☑`

> **Playwright-тести:** ☑ `11-edge-audit.spec.ts`, `11-billing-states.spec.ts`, `11-network-edge.spec.ts` (2026-07-09). **11.8 PAST_DUE** — N/A (UI не імплементовано).

- [x] 11.1 `/zzz` → 404. *(11-edge)*
- [x] 11.2 невалідні id → дружня помилка. *(11-edge)*
- [x] 11.3 trial → upgrade path на `/billing`. *(11-billing-states)*
- [x] 11.4 suspended → UI помилка при 403 entitlements. *(11-billing-states)*
- [x] 11.5 AI/feature blocked → UpgradePrompt. *(11-billing-states — custom domain)*
- [x] 11.6 storage quota → upload blocked + upgrade link. *(11-billing-states + 5C.6)*
- [x] 11.7 seat ліміт → 403 UI. *(05-seat-enforcement)*
- [x] 11.8 PAST_DUE банер — **N/A**: UI не імплементовано (dunning cron only).
- [x] 11.9 API 500 → UI-помилка. *(11-edge)*
- [x] 11.10 slow GraphQL → loading hint on `/materials`. *(11-network-edge — 2026-07-09)*
- [x] 11.11 chat inbox loads with Socket.IO blocked (GraphQL). *(11-network-edge — 2026-07-09)*

→ Після етапу: `docs/e2e-improvements/11-edge.md`.

---

## ЕТАП 12 — Ask Arvi (AI chat) `☑`

> **Окремо від B7** (пози маскота / ProductTour) і human `/chat`.
> UI: corner mascot → `ArviChatPanel`. API: `GET /api/assistant/status`, `POST /api/assistant/chat` (SSE).
> Live LLM provider — **out of CI** (mock SSE / status). Feature flag: `aiAssist` (Pro).
> **Playwright:** `specs/audit/12-arvi-assistant-mock.spec.ts`. **Unit:** `assistant.service.spec` + `assistant.controller.spec` (+ існуючі role-policy / retrieve-help).

### 12A. Campus UI (Playwright, mock)
- [x] 12.1 Клік corner Arvi → панель Ask Arvi; welcome + capabilities за роллю (student/teacher/admin).
- [x] 12.2 Без `aiAssist` / Free plan → feature-blocked / Upgrade (mock 403 `featureBlocked: aiAssist`).
- [x] 12.3 `GET /assistant/status` not ready → дружнє «not configured»; composer disabled.
- [x] 12.4 Send message → SSE mock (`delta` / `done`) → відповідь у треді.
- [x] 12.5 `NAVIGATE` у role allowlist → Open button; поза allowlist — stripped на BE (unit).
- [x] 12.6 Academic refusal → refusal copy у треді (mock SSE).
- [x] 12.7 Escape закриває; history у `sessionStorage`.
- [x] 12.8 axe панелі chat.
- [x] 12.9 Chat error copy без API key material (mock SSE error).

### 12B. Backend unit (не Playwright)
- [x] 12.10 `AssistantService` stream + credit assert/consume (mock LLM).
- [x] 12.11 `assistant.controller`: 400 empty / 503 not ready / SSE sanitization.
- [x] 12.12 `role-policy` + corpus ACL regression (існуючі specs).

→ Після етапу: `docs/e2e-improvements/12-arvi-assistant.md`.

---

## Gap matrix (аудит 2026-07-21)

| Пріоритет | Gap | План |
|-----------|-----|------|
| P0 | Ask Arvi chat end-to-end | **Етап 12** ☑ tests written |
| P0 | School LLM override deep | **6.14.2–4** ☑ (`06-school-llm-mock`) |
| P1 | Seller legal + public `/offer`/`/legal` | **6.16**, **1E.5–7**, **1F** ☑ |
| P1 | GDPR export/delete | **3L.8–9** ☑ |
| P1 | Student import / invite accept | **5D.4–5**, **2.13** ☑ (API; accept UI deferred) |
| P1 | Staff record payout | **5A.7** ☑ |
| P2 | System deep saves (payments/…) | **6.15** ☑ |
| P2 | Platform login UI | **7.0** ☑ |
| P2 | Platform list leftovers (7.2/7.5/7.9B/7.10) | 7.2–7.10 thin ☑ (incl. 7.3.7–8, 7.4.4–5, 7.5.3–4, 7.10.6) |
| P2 | Notifications save / calendar DnD | **3L.10**, **3I.5** ☑ |
| Ops | Full suite green | **CI verify** ◐ wave 1–2 ☑; **wave 3** unique-fail triage (363✓/75✗ baseline → contrast/SMTP/chat/platform soft-skip); full green still open |

---

## Зведений трекер

| Етап | Назва | Тести написані | Реальний run | Скріни | Improvements-doc | Виправлено |
|---|---|:--:|:--:|:--:|:--:|:--:|
| 0 | Інфраструктура | ☑ | ☑ | — | ☑ | ☑ (2026-07-06: сід повний — уроки/словник/staff/quiz/платіж/promo/матеріал/tourCompletedAt; expectArvi готовий) |
| 1 | Публічні/Auth | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-06, 01-auth-full 18 tests; email-валідація + /privacy,/status public) |
| 2 | Сюжет signup→tour | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-02, див. e2e-improvements/02-journey.md) |
| 3 | STUDENT | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-02, див. e2e-improvements/03-student.md) |
| 4 | TEACHER | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-02, див. e2e-improvements/04-teacher.md) |
| 5 | ADMIN | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-02, див. e2e-improvements/05-admin.md) |
| 6 | SUPER+System | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-02, admin-scope; super_admin нема в сіді — див. e2e-improvements/06-system.md) |
| 7 | Platform Control Plane | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-03 smoke; 2026-07-21 interaction: settings/SMTP/LLM/payments, schools, users, billing, dashboard — див. e2e-improvements/07-platform.md) |
| 8 | RBAC негативні | ☑ | ☑ | — | ☑ | ☑ (2026-07-03, 0 знахідок — див. e2e-improvements/08-rbac.md) |
| 9 | Адаптивність | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-03, 0 знахідок у коді — див. e2e-improvements/09-responsive.md) |
| 10 | a11y повний | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-03, focus-trap LessonModal — див. e2e-improvements/10-a11y.md) |
| 11 | Edge/помилки | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-09: +11-network-edge slow gql + socket blocked) |
| 12 | Ask Arvi (AI chat) | ☑ | ☐ | ☐ | ☑ | ☑ 2026-07-21 — mock SSE + unit; real e2e run pending campus up |
| 🧸 | Arvi-присутність (poses) | ☑ | ☑ | ☑ | (наскрізно) | ☑ B7 feature 2026-07-10 (`useArvi`/`ArviSlot`; скріни optional) |

**Interaction-рівень etапів 3–6 + кластери B1–B7 ☑** (2026-07-10). **Етап 7 Control Plane interaction ☑** (2026-07-21). **Етап 12 Ask Arvi tests ☑** (real run pending). Gap P0–P2 + thin leftovers ☑. Відкритий ops: **CI verify**.

---

## Відкритий беклог (після gap-аудит 2026-07-21)

| Кластер | Що лишилось | Тип |
|---------|-------------|-----|
| **Compliance / public** | ☑ 1E/1F/6.16/3L.8–9 written | e2e |
| **Admin mutations** | ☑ 5A.7 / 5D.4 / invite API; accept UI deferred | e2e |
| **System deep** | ☑ 6.15 + 6.5.6–7 SMTP negatives | e2e |
| **Platform leftovers** | ☑ 7.0–7.10 thin (members/promo/audit/users/impersonation banner) | e2e |
| **Campus thin** | ☑ 3L.10 / 3I.5 / 3K.8 / 2.14 help | e2e |
| **B7** | ☑ poses; optional `screenshots/arvi/`, richer school-brand theming | feature (done) |
| **CI verify** | ◐ **wave 1–3** triage ☑. **CI timeout fix:** ship `testMatch` (~512 vs 2045) + `workers=2` + shard 1/2\|2/2 (35m/job). Full green still open. | ops |

---

## Порядок виконання

Етапи **0 → 12** + Gap P0–P2 + platform thin ☑ (7.2.5–7.10.6).
Відкритий ops: **CI verify** ◐ (wave 1 project routing done; unique fails + full green pending).
Після кожного етапу:
1. усі скріни зроблені й переглянуті;
2. **створено окремий документ** `docs/e2e-improvements/<NN>-<slug>.md` (з TEMPLATE) —
   знахідки + осі UI/UX/Arvi/a11y/Perf/Func + виправлення;
3. критичні (P0/P1) правки внесені й перетестовані;
4. статуси у трекері оновлені;
5. підсумок у `docs/handoff.md`.

---

## Беклог сценаріїв за інфраструктурою (фіналізовано 2026-07-09)

Кластери **B1–B6 ☑** (smoke/mocks). Нижче — архів виконаних кластерів + **B7**.

### B1. Route-mock провайдерів — **☑ 2026-07-09**
Мокаємо відповідь бекенду/провайдера, перевіряємо UI-реакцію. Не потребує реальних сервісів.
- **3K.5 / 5C.5** provider checkout → мок `POST /api/billing/**/checkout` → assert loading + спроба редіректу.
- **5C.4** promo apply → мок `POST /billing/subscription/promo/redeem` (success/error) → результат-банер.
- **3K.4/3K.7** пакети top-up + вибір валюти → мок entitlements/packages конфіг.
- **3K.6** manual invoice інструкції → мок payment-settings з manual-методом.
- **11.x білінг-стани** (з Етапу 11 беклогу): TRIAL/PAST_DUE/SUSPENDED → мок `GET /billing/entitlements` — **☑ частково 2026-07-09** (`11-billing-states.spec.ts`; PAST_DUE UI N/A).
- **5C.6/5C.7** feature-gating + seat-enforcement → мок entitlements (ліміт seats) → 403-повідомлення.

### B2. Мутаційні флоу з cleanup — **☑ 2026-07-09**
Реальні API-виклики під тестовим юзером, з прибиранням у `afterEach` або через унікальні дані.
- **4E.2** створення групи, **5D.3** створення акаунта, **3J.5/4G.1** створення групового чату/уроку.
- **3L.2** зміна пароля (повернути назад у cleanup).
- **4A.15** видалення матеріалу (створити тимчасовий → видалити).

### B3. TagInput / select / inline-панелі — **☑ 2026-07-09**
Відкрити наявну модалку/панель і поклацати — можна писати зараз.
- **4A.5** TagInput chips (Enter/кома), **4A.6** Level select A1–C2.
- **3B.9** LessonVocabularyAddPanel, **3B.10** calendar-link sidebar, **3H.4** word detail.
- **3J.4** «Search people» → contact picker (visibility вже в backend-тестах).
- **6.4** domains: додати домен → TXT-токен (без зовнішнього verify).

### B4. Файл-аплоад інфра (Playwright `setInputFiles` + fixture-файли) — **☑ 2026-07-09**
- **3B.8** homework submit, **4A.7** material upload, **4F.6** lesson content upload — `tests/e2e/fixtures/*`, `fixtures/files.ts`.
- **3B.11** download ☑ `03-homework-upload`. **4A.8–4A.13** ☑ `04-material-form-edges.spec.ts`.

### B5. Інтерактивні навчальні флоу — **☑ 2026-07-09** (Arvi пози **[~] N/A B7**)
- **3D.2–4** vocabulary play, **3E** irregular verbs, **3F** quiz — audit specs написані; Arvi-пози **[~] N/A B7**.
- **3F.5** Arvi реакції — **[~] N/A B7** (текстовий feedback покрито).

### B6. Realtime / медіа / зовнішнє — **☑ E2E smoke 2026-07-09** (+ Platform 2026-07-21)
- **3J.3/7–10**, **3B.6/7**, **3G**, **3L.5**, **6.5** SMTP (verify/preset/save/send), **3K.5**, **11.10–11**, **4B.*** viewer ☑ (mocked).
- **Platform Control Plane (7.x)** ☑ mock wave: dashboard, schools detail (suspend/activate/impersonate/billing country), users, promo, audit-log, settings SMTP+LLM+payment-methods (+ SMTP fail 7.6A.6), billing rails + campus-plans (+ country override / infinite scroll leftovers).
- **Campus thin leftovers** ☑ Help 2.14, offer↔payment 3K.8, SMTP negatives 6.5.6–7.
- **8.7** host-JWT **N/A** (tenant isolation ☑ `08-rbac-audit`); **4F.8** recurrence materialization — backend-only.

### B7. Feature-робота — **☑ 2026-07-10** (poses only)
- `MascotPose` + `useArvi` / `ArviProvider` / `ArviSlot` / `GlobalArviSlot`; wiring: auth, dashboard, practice/quiz, empty `showArvi`, 404, logout `wave`.
- Optional leftover: manual `screenshots/arvi/`, deeper G18 brand theming.
- **Ask Arvi chat (LLM SSE) — НЕ B7:** див. **Етап 12**.

**Примітка:** математика білінгу (4G.3–5 PER_MEMBER/FIXED_TOTAL/split) уже покрита backend-тестами `module-billing` (108 passed) — E2E тут лише про UI-флоу створення (B2).
