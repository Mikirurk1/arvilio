# SoEnglish — Сюжетний E2E-план (Playwright + Arvi)

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
`jest-student` / `jest-teacher` / `jest-admin` / `jest-super-admin` @soenglish.test.

**RBAC (`apps/web/src/lib/auth/route-policy.ts`):**

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

Поточний стан: `Mascot` (`apps/web/src/components/mascot`) — 3D GLB `/mascot/arvi.glb`,
пози `idle|greet|point|celebrate`, 2D SVG-фолбек, lazy R3F. Використовується лише в
`mascot-preview` і `ProductTour`. **Мета: Arvi присутній у ключових моментах усього продукту.**

**Розширити пози:** + `think` (loading) · `encourage` (помилка/підбадьорення) ·
`sleep` (empty state) · `wave` (logout).

**Технічний беклог Arvi** (задачі розкидані по планах покращень етапів):
- [ ] `MascotPose` + нові клипи/процедурні фолбеки.
- [ ] `useArvi()` — керування позою з події (`celebrate()/encourage()/think()`), авто-повернення в `idle`.
- [ ] `ArviSlot` (глобальний кутовий контейнер) + інлайн-вставки.
- [ ] reduced-motion / no-WebGL фолбеки з мікро-переходами.
- [ ] перф-бюджет: не на критичному шляху, intersection-lazy.
- [ ] тематизація під брендовий колір школи (G18).
- [ ] скріни всіх станів у `screenshots/arvi/`.

**Карта присутності** (ціль; перевіряється у сценаріях `*.arvi`):

| Місце | Тригер | Поза |
|---|---|---|
| login/signup | завантаження | `greet` |
| signup success | школа створена | `celebrate` |
| onboarding/tour | кожен крок | `point` |
| dashboard (вхід дня) | перший рендер | `greet` |
| practice/quiz правильно | подія | `celebrate` |
| practice/quiz невірно | подія | `encourage` |
| завершення уроку/квіза | фініш | `celebrate` |
| empty states | порожньо | `sleep` |
| loading/довгі запити | очікування | `think` |
| 404/500/error | помилка | `encourage` |
| logout | вихід | `wave` |

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
10. Super-admin: `apps/platform` — школа в списку, audit-log, promo.

---

## ЕТАП 0 — Інфраструктура та фікстури `◐`

> **Playwright-тести написані:** `setup/auth.setup.ts`, `fixtures/auth.ts`, `helpers/a11y.ts`, `playwright.config.ts` (projects: setup/student/teacher/admin/mobile-student/public).
> **Аудит:** ☐ не проводився — потрібен запущений dev server + реальний run.

- [x] Сід `seed-test-users.ts` на чистій БД (4 ролі + Default School). *(прогнано 2026-07-03, ідемпотентний)*
- [x] Розширити сід — **зроблено 2026-07-03:** 3 уроки (planned/completed/cancelled), студент у вчителя, словник 10 слів усіх статусів, staff compensation (PER_LESSON, UAH), `tourCompletedAt` для всіх юзерів (тур більше не перекриває E2E), quiz із 2 питаннями, платіж SUCCEEDED (4 уроки), promo `SEED20`, матеріал (BOOK, без файла — storage-upload лишається ручним).
- [x] Фікстура per-role `storageState` — `setup/auth.setup.ts` + `fixtures/auth.ts`.
- [x] Хелпери: `shot()`, `expectNoA11yViolations()`, `consoleGuard()` — `helpers/a11y.ts`.
- [x] `expectArvi(pose?)` — `helpers/a11y.ts`, анкер `[data-mascot][data-mascot-pose]` у `Mascot.tsx`; використано у 2.11 (greet на welcome-кроці туру). *(2026-07-03)*
- [x] Проєкти: `student/teacher/admin` (Desktop Chrome) + `mobile-student` (Pixel 7); `screenshots/` у `.gitignore`.

**☐ remaining:** файлове вкладення матеріалу в сіді (опційно).

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
- [~] 1A.6 rate-limit — **N/A в E2E**: харнес шле `x-e2e-skip-throttle`, тож 429 не тригериться. Throttle покрито бекенд-тестами (`@Throttle` на `auth.controller.ts`).
- [x] 1A.7 «показати пароль» перемикач. *(01-auth-full)*
- [x] 1A.8 логін як teacher/admin/super → `/dashboard`. *(01-auth-full)*

### 1B. `/signup`
- [x] 1B.1 рендер полів (school name, name, email, password) + axe. *(01-auth-full; promo-поля в UI немає — сервер-only)*
- [x] 1B.2 disposable email → помилка. *(01-auth-full)*
- [x] 1B.3 слабкий пароль → помилка. *(01-auth-full)*
- [x] 1B.4 дубль email → «Email already registered». *(01-auth-full)*
- [~] 1B.5 captcha-флоу — **N/A**: Turnstile вимкнено без `SITE_KEY` у dev/test.
- [x] 1B.6 успіх → auto-login → onboarding. *(01-auth-full; також 02-journey)*

### 1C. `/forgot-password`
- [x] 1C.1 сабміт валідного email → «лист надіслано». *(login.spec.ts)*
- [x] 1C.2 невалідний email → валідація. *(01-auth-full)*
- [~] 1C.3 rate-limit — **N/A в E2E** (той самий throttle-bypass).

### 1D. `/reset-password`
- [x] 1D.1 `?token=valid` → форма нового пароля. *(01-auth-full)*
- [x] 1D.2 `?token=invalid|expired` → дружня помилка (+ missing token). *(01-auth-full)*
- [~] 1D.3 успішна зміна → редірект — покрито формою+сабмітом; happy-path потребує валідного токена з БД (беклог фікстури).

### 1E. Статика та редіректи
- [x] 1E.1 `/privacy` 200 + контент. *(01-auth-full; **фікс:** додано в PUBLIC_ROUTES)*
- [x] 1E.2 `/status` 200. *(01-auth-full; **фікс:** додано в PUBLIC_ROUTES)*
- [x] 1E.3 unauthenticated `/dashboard` → редірект `/login`. *(login.spec.ts)*
- [x] 1E.4 axe кожної сторінки → 0 violations. *(01-auth-full)*

**Знахідки (виправлено 2026-07-06):** (1) логін не валідував формат email клієнтом → додано; (2) `/privacy` і `/status` гейтились авторизацією (не в `PUBLIC_ROUTES`) → відкрито. Лишок: 1D.3 happy-path (валідний reset-токен), 1A.6/1B.5/1C.3 — N/A у test-env.

→ Після аудиту: `docs/e2e-improvements/01-auth.md`.

---

## ЕТАП 2 — Сюжет: Signup → Onboarding → Tour `☐`

> **Playwright-тести написані:** ☐ не написано. **Аудит:** ☐.

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

→ Після етапу: `docs/e2e-improvements/02-journey.md`.

---

## ЕТАП 3 — Роль STUDENT `☑` (interaction-рівень; глибокі флоу — беклог)

> **Playwright-тести:** `specs/audit/03-student-audit.spec.ts` (render+axe усіх сторінок), `specs/audit/03-student-granular.spec.ts` (21 tests: quick-actions, таби, фільтри, віджети, навігація — 2026-07-06) + старі `specs/pages/*`.
> **Аудит:** ☑ 2026-07-02 (render/axe) + 2026-07-06 (granular). Беклог позначено `[ ]` з причиною — потребують realtime/OAuth/media/checkout інфри або окремих порожніх фікстур.

### 3A. `/dashboard`
- [x] 3A.1 `<main>` рендериться. *(dashboard.spec.ts)*
- [x] 3A.2 блок уроків сьогодні АБО empty-стан. *(dashboard.spec.ts — soft)*
- [x] 3A.3 loading «Loading lessons…» зникає. *(03-student-granular)*
- [~] 3A.4 empty «All caught up» — сід має уроки, тож порожній стан не відтворюється (потребує окремого порожнього юзера).
- [x] 3A.5 quick action «Review words» → `/vocabulary`. *(03-student-granular)*
- [x] 3A.6 EntitlementsWidget відображається. *(03-student-granular)*
- [x] 3A.7 кожне quick-action веде у правильний маршрут. *(03-student-granular)*
- [x] 3A.8 **Daily goals** картка з цілями. *(03-student-granular; клік→actionPath — беклог)*
- [~] 3A.9 **Achievements** — лічильники в профілі (3L.6); окремий тест розблокування — беклог фікстури.
- [x] 3A.10 **Statistics**: графіки/тайли рендеряться. *(03-student-granular)*
- [x] 3A.∗ SEO title, сайдбар-посилання всіх ролей. *(dashboard.spec.ts)*

### 3B. `/lessons` + `/lessons/[id]` (lesson room)
- [x] 3B.1 рендер `/lessons`, `<main>` є. *(lessons.spec.ts)*
- [x] 3B.2 фільтр-таби Planned / Completed / Cancelled. *(03-student-audit)*
- [x] 3B.3 порожній список АБО список. *(lessons.spec.ts)*
- [x] 3B.4 клік на урок → `/lessons/[id]`. *(03-student-granular)*
- [x] 3B.5 `/lessons/<неіснуючий>` → помилка. *(03-student-granular; також 11-edge)*
- [ ] 3B.6 **Video meeting** кнопка провайдер-залежна. *(беклог: потребує провайдер-конфіг)*
- [ ] 3B.7 **LiveKit inline** JWT flow. *(беклог: realtime infra)*
- [ ] 3B.8 **Homework** student submit flow. *(беклог: файл-аплоад фікстура)*
- [ ] 3B.9 **LessonVocabularyAddPanel**. *(беклог)*
- [ ] 3B.10 calendar-link / опис sidebar. *(беклог)*
- [ ] 3B.11 download вкладень. *(беклог: storage фікстура)*

### 3C. `/practice` (hub)
- [x] 3C.1 блок Stats: «Due for review», «Quizzes open». *(03-student-granular)*
- [x] 3C.2 вхід у Vocabulary practice. *(03-student-granular; лінки під-маршрутів)*
- [~] 3C.3–3C.5 вхід у Irregular/Quiz/Speaking — лінки присутні; глибокі флоу нижче.
- [~] 3C.6 loading-стан Stats — покрито 3A.3 патерном (loading зникає).

### 3D. `/practice/vocabulary`
- [x] 3D.1 рендер + картка/empty. *(03-student-audit 3D.1/3D.5)*
- [ ] 3D.2 правильна відповідь → Arvi `celebrate`. *(беклог: інтерактивний флоу відповіді)*
- [ ] 3D.3 невірна → Arvi `encourage`. *(беклог)*
- [ ] 3D.4 завершення сесії → підсумок. *(беклог)*
- [x] 3D.5 empty «All done!» / контент. *(03-student-audit)*

### 3E. `/practice/irregular-verbs` — *беклог (інтерактивний флоу введення форм)*
- [ ] 3E.1–3E.3 старт / перевірка / підсумок.

### 3F. `/practice/quiz` та `/quiz` — *беклог (флоу проходження квіза, Arvi-реакції)*
- [ ] 3F.1–3F.5.

### 3G. `/practice/speaking` — *беклог (mic-permission + запис, потребує медіа-моків)*
- [ ] 3G.1–3G.3.

### 3H. `/vocabulary`
- [x] 3H.1 список слів (seeded). *(03-student-granular)*
- [x] 3H.2 фільтр статусів перемикає. *(03-student-granular; також 03-student-audit)*
- [~] 3H.3 empty «All done!» — сід має слова; окремий порожній юзер — беклог.
- [ ] 3H.4 деталь слова. *(беклог, якщо є)*

### 3I. `/calendar`
- [x] 3I.1 week/month перемикає вид. *(03-student-audit)*
- [x] 3I.2 події відображаються (сідові уроки). *(03-student-audit render)*
- [~] 3I.3 порожній період — беклог.
- [x] 3I.4 навігація вперед/назад. *(03-student-granular)*

### 3J. `/chat` (realtime, Socket.IO)
- [x] 3J.1 інбокс: search + список/empty. *(03-student-granular; також 03-student-audit)*
- [~] 3J.2 відкриття діалогу, історія — потребує сідового діалогу (беклог).
- [ ] 3J.3 realtime доставка через Socket.IO. *(беклог: realtime infra)*
- [ ] 3J.4 «Search people...» → новий діалог. *(беклог; visibility вже покрито backend-тестами)*
- [ ] 3J.5 створення групи. *(беклог)*
- [~] 3J.6 empty-state — покрито 3J.1 (search|empty).
- [ ] 3J.7 пагінація вгору. *(беклог: потребує 50+ повідомлень)*
- [ ] 3J.8 unread badge / markRead. *(беклог)*
- [ ] 3J.9 auto-scroll логіка. *(беклог)*
- [ ] 3J.10 ephemeral attachments TTL. *(беклог)*

### 3K. `/payment`
- [x] 3K.1 «Payment» рендер. *(03-student-audit)*
- [x] 3K.2 методи оплати АБО empty. *(03-student-audit 3K.2)*
- [x] 3K.3 **lesson balance** (prepaid credits) відображається. *(03-student-granular)*
- [ ] 3K.4 **пакети** (top-up): вибір пакета/валюта. *(беклог: конфіг пакетів)*
- [ ] 3K.5 оплата провайдером (редірект-мок). *(беклог: provider checkout mock)*
- [ ] 3K.6 **manual invoice** інструкції. *(беклог)*
- [ ] 3K.7 вибір валюти. *(беклог)*

### 3L. `/profile` (таби)
- [x] 3L.1 таб **Profile** відкривається. *(03-student-audit 3L tabs)*
- [x] 3L.2 таб **Account** відкривається. *(03-student-granular; сам флоу зміни пароля — беклог, мутує сід)*
- [x] 3L.3 таб **Appearance**: контрол Small/Medium/Large присутній. *(03-student-granular)*
- [x] 3L.4 таб **Notifications** відкривається (тогли). *(03-student-granular)*
- [ ] 3L.5 таб **Connections** OAuth-флоу (Google/Zoom/Telegram/Facebook). *(беклог: зовнішні OAuth)*
- [x] 3L.6 таб **Statistics** відкривається (+Achievements/Words/Lessons лічильники в hero). *(03-student-granular + 03-student-audit)*
- [~] 3L.7 Escape під-панелей — покрито патерном focus-trap (Етап 10).

### 3M. Навігація + a11y
- [x] 3M.1 сайдбар студента без admin/system/materials/students. *(navigation.spec.ts)*
- [ ] 3M.2 logout (Arvi `wave`). *(беклог: Arvi-поза wave — feature-робота)*
- [x] 3M.3 axe кожної сторінки → 0 violations. *(03-student-audit 3M sweep)*

→ Після аудиту: `docs/e2e-improvements/03-student.md`.

---

## ЕТАП 4 — Роль TEACHER `☑` (interaction-рівень; глибокі флоу — беклог)

> **Playwright-тести:** `specs/audit/04-teacher-audit.spec.ts` (render+axe+modal), `specs/audit/04-teacher-granular.spec.ts` (materials/students/groups/profile-tabs/lesson-modal, 2026-07-06) + старі `specs/pages/*`.
> **Аудит:** ☑ 2026-07-02 (render/axe) + 2026-07-06 (granular). Глибокі флоу позначено `[ ]` з причиною.

(Спільні зі студентом сторінки перевіряємо у teacher-контексті + нижче.)

### 4A. `/materials` + MaterialFormModal
- [x] 4A.1 заголовок «Materials» + Grid/List view toggle. *(04-teacher-granular)*
- [x] 4A.2 «Search materials…» фільтрує (nonsense → сідовий матеріал зникає). *(04-teacher-granular)*
- [~] 4A.3 SegmentedControl тип/категорія — view toggle покрито; тип-фільтр беклог.
- [x] 4A.4 **Create modal** відкривається (`role=dialog`) + axe. *(04-teacher-audit)*
- [ ] 4A.5 **TagInput** chip-и. *(беклог: інтеракція з тегами)*
- [ ] 4A.6 **Level** select A1–C2. *(беклог)*
- [ ] 4A.7–4A.13 upload/cover/compression/nav-lock/recovery/size-limit. *(беклог: файл-аплоад інфра)*
- [x] 4A.14 сідовий матеріал видно (список не порожній). *(04-teacher-granular)*
- [ ] 4A.15 видалення матеріалу. *(беклог: мутує сід + storage)*

### 4B. `/materials/view/[attachmentId]` — *беклог (pdf.js+Konva viewer, annotations, Plyr, HTTP-Range — важка інфра)*
- [x] 4B.8 `aria-label` кнопки відкриття (04-teacher-audit render). — [ ] 4B.1–7, 4B.9.

### 4C. `/students`
- [x] 4C.1 список (картки) із сідовим студентом. *(04-teacher-granular; також 04-teacher-audit)*
- [x] 4C.2 SegmentedControl scope (за фіче-флагом груп). *(04-teacher-granular; skip якщо флаг off)*
- [~] 4C.3 empty — сід має студента; окремий порожній teacher — беклог.
- [~] 4C.4 error — покрито 11-edge (500→error UI).

### 4D. `/students/[studentId]` (таби)
- [x] 4D.1–6 таби Profile/Statistics/Lessons/Billing/Practice/Achievements відкриваються (aria-selected). *(04-teacher-granular)*
- [x] 4D.6 неіснуючий студент → помилка. *(04-teacher-audit)*
- [~] save/деталі всередині табів — беклог (мутує дані).

### 4E. `/students/groups`
- [x] 4E.1 сторінка груп рендериться (список/empty). *(04-teacher-granular; також 04-teacher-audit render+axe)*
- [ ] 4E.2 створення групи. *(беклог: флоу створення)*
- [~] 4E.3 empty-state — покрито 4E.1.

### 4F. Lesson modal (1:1)
- [x] 4F.1 відкриття `role=dialog`, focus-on-open, Escape. *(04-teacher-audit + 10-a11y focus-trap)*
- [x] 4F.2/4F.3 таби Lesson planning / Lesson content перемикаються (aria-selected). *(04-teacher-granular)*
- [ ] 4F.4 homework tab. *(беклог: файл-аплоад)*
- [ ] 4F.5 review / 4F.6 image upload / 4F.7 video provider / 4F.8 recurrence / 4F.9 save. *(беклог: провайдери/аплоад/серії)*
- [~] 4F.10 закриття без збереження — Escape закриває (04-teacher-granular).

### 4G. Group lessons — *беклог (billing-математика покрита backend-тестами module-billing; UI-флоу створення групи потребує ≥2 учасників + провайдер)*
- [ ] 4G.1–4G.7.

### 4H. Навігація + a11y
- [x] 4H.1 сайдбар вчителя: students + materials є, admin/system нема. *(navigation.spec.ts)*
- [x] 4H.2 axe → 0 violations. *(04-teacher-audit 4H sweep, 8 сторінок)*

→ Після аудиту: `docs/e2e-improvements/04-teacher.md`.

---

## ЕТАП 5 — Роль ADMIN `☑` (interaction-рівень; білінг-стани — беклог)

> **Playwright-тести:** `specs/audit/05-admin-audit.spec.ts` (render+axe+RBAC) + `specs/audit/05-06-granular.spec.ts` (staff-tabs/finance/billing/admin, 2026-07-06) + `specs/pages/admin.spec.ts`.
> **Аудит:** ☑ 2026-07-02 (render/axe) + 2026-07-06 (granular).

### 5A. `/staff` + `/staff/[userId]`
- [x] 5A.1 список «Staff», roster. *(05-admin-audit)*
- [~] 5A.2 empty/error — сід має staff; окремий порожній — беклог.
- [x] 5A.3 профіль: таби Profile/Compensation/Earnings & payouts/Statistics відкриваються. *(05-06-granular)*
- [x] 5A.4 метрики (Accrued/Outstanding/Payout/Lessons) в hero. *(05-admin-audit render)*
- [~] 5A.5 «Back to staff» / 5A.6 non-staff — беклог.

### 5B. `/finance`
- [x] 5B.1 «Staff finance» рендер + контент. *(05-06-granular; також 05-admin-audit+axe)*
- [~] 5B.2–5B.4 графік/breakdown/empty — рендер покрито; деталі беклог.

### 5C. `/billing`
- [x] 5C.1 «Subscription» + поточний план. *(05-06-granular)*
- [x] 5C.2 **storage meter** + seats. *(05-06-granular)*
- [x] 5C.3 план-пікери за trial-станом (ACTIVE школа → current-plan summary). *(05-06-granular)*
- [ ] 5C.4 promo apply / 5C.5 Stripe checkout / 5C.6 feature-gating / 5C.7 seat-enforcement / 5C.8 стани. *(беклог: провайдер-моки + білінг-фікстури станів)*

### 5D. `/admin`
- [x] 5D.1 «Account administration» + 5D.2 «Accounts overview» (region + All accounts). *(05-06-granular)*
- [ ] 5D.3 дії керування акаунтами (створення). *(беклог: мутує дані)*

### 5E. Навігація + a11y
- [x] 5E.∗ admin sidebar бачить admin link. *(navigation.spec.ts)*
- [x] 5E.1 сайдбар адміна: staff/finance/billing/admin (+/system за route-policy). *(05-admin-audit 5E.1)*
- [x] 5E.2 axe → 0 violations. *(05-admin-audit sweep)*

→ Після аудиту: `docs/e2e-improvements/05-admin.md`.

---

## ЕТАП 6 — SUPER_ADMIN + `/system` `☑` (admin-scope; глибокі флоу — беклог)

> **Playwright-тести:** `specs/audit/06-system-audit.spec.ts` (усі 8 табів render+axe) + `specs/audit/05-06-granular.spec.ts` (branding/video/dictionary панелі) + `specs/pages/system.spec.ts`.
> **Аудит:** ☑ 2026-07-02 (render/axe) + 2026-07-06 (granular). `/system` доступний ADMIN (route-policy).

`/system` таби (8): general, branding, domains, email, payments, payouts, connections, dictionary.

- [x] 6.1 «System control room» рендер + Tabs навігація (усі 8 табів). *(06-system-audit)*
- [x] 6.2 **general** панель відкривається. *(06-system-audit + 05-06-granular)*
- [x] 6.3 **branding** — text input присутній (hex/логотип). *(05-06-granular + 06-system-audit 6.3)*
- [ ] 6.4 **domains** verify-флоу / 6.5 **email** SMTP verify. *(беклог: зовнішня верифікація)*
- [x] 6.6/6.7 **payments/payouts** панелі + labels. *(06-system-audit; a11y-фікси застосовано)*
- [x] 6.8 **connections** панель (Google/Zoom/LiveKit секції) + aria-label чекбокси. *(06-system-audit)*
- [x] 6.9 **video meetings** (general) регіон присутній. *(05-06-granular)*
- [x] 6.10 **dictionary** панель рендериться. *(05-06-granular)*
- [~] 6.11 media-captions — за `MATERIAL_CAPTIONS_ENABLED` (прихована).
- [x] 6.12 сайдбар: System видно admin. *(05-admin-audit 5E.1)*
- [x] 6.13 axe усіх табів → 0 violations. *(06-system-audit)*

→ Після етапу: `docs/e2e-improvements/06-system.md`.

---

## ЕТАП 7 — Platform app (`:4300`, super_admin) `☐`

- 7.1 `/dashboard`: метрики платформи.
- 7.2 `/schools`: список (h1 «Schools»), пошук/фільтр.
- 7.3 `/schools/[id]`: деталі, suspend/activate/reactivate, impersonate (якщо є).
- 7.4 `/promo-codes`: список, створення, ліміти, деактивація.
- 7.5 `/audit-log`: журнал, фільтри, пагінація.
- 7.6 `/settings`: платформні налаштування, save.
- 7.7 доступ тільки super_admin; інші → заборона.
- 7.8 axe усіх → 0 violations.

→ Після етапу: `docs/e2e-improvements/07-platform.md`.

> **Поза скоупом E2E:** `/cms-admin` (Payload CMS адмінка) і `/mascot-preview` (dev-превʼю
> Arvi) — лише smoke-перевірка, що віддають 200/гейтяться; повний UI-флоу не тестуємо.

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
- [~] 8.7 JWT школи ≠ host → 403 — **беклог**: потребує host-based роутінгу (Phase 2 multi-tenant). Крос-тенантну ізоляцію по JWT-схемі покрито через 8.7 tenant-isolation (реєстрація школи + перевірка витоку читання/запису).
- [x] 8.8 прямий перехід по URL гейтиться. *(всі RBAC-тести)*

→ Див.: `docs/e2e-improvements/08-rbac.md`.

---

## ЕТАП 9 — Адаптивність (mobile/tablet) `☐`

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

## ЕТАП 10 — a11y повний прохід `☐`

- 10.1 axe на кожній сторінці × кожна доступна роль → зведена таблиця.
- 10.2 keyboard: Tab-порядок, focus-trap модалок, Escape, focus-visible.
- 10.3 `prefers-reduced-motion`: Arvi/анімації поважають.
- 10.4 screen-reader мітки ключових контролів.
- 10.5 контраст усіх станів (hover/disabled/focus).

→ Після етапу: `docs/e2e-improvements/10-a11y.md`.

---

## ЕТАП 11 — Edge / помилки / стани `☐`

- 11.1 `/zzz` → 404 (Arvi `encourage`).
- 11.2 `/lessons/zzz`, `/students/zzz`, `/staff/zzz`, `/materials/view/zzz` → дружня помилка.
- 11.3 trial завершився → гейт підписки.
- 11.4 school suspended → блокування доступу.
- 11.5 AI credits вичерпано → 429 + повідомлення.
- 11.6 storage quota вичерпано → upload блокується з повідомленням.
- 11.7 seat ліміт → 403 при додаванні студента.
- 11.8 PAST_DUE (dunning grace) банер; після grace → suspend.
- 11.9 API 500 → UI-помилка, не білий екран.
- 11.10 повільна мережа → скелетони/`think`-Arvi.
- 11.11 offline/розрив Socket.IO у чаті → reconnect.

→ Після етапу: `docs/e2e-improvements/11-edge.md`.

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
| 7 | Platform | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-03, 0 кодових знахідок — див. e2e-improvements/07-platform.md) |
| 8 | RBAC негативні | ☑ | ☑ | — | ☑ | ☑ (2026-07-03, 0 знахідок — див. e2e-improvements/08-rbac.md) |
| 9 | Адаптивність | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-03, 0 знахідок у коді — див. e2e-improvements/09-responsive.md) |
| 10 | a11y повний | ☑ | ☑ | ☑ | ☑ | ☑ (2026-07-03, focus-trap LessonModal — див. e2e-improvements/10-a11y.md) |
| 11 | Edge/помилки | ◐ | ☑ | ☑ | ☑ | ☑ (2026-07-03, 404/bad-id/500 закрито; білінг-стани — беклог. Див. e2e-improvements/11-edge.md) |
| 🧸 | Arvi-присутність | ☐ | ☐ | ☐ | (наскрізно) | ☐ feature-робота, не тест (див. беклог нижче) |

**Interaction-рівень etапів 3–6 закрито granular-спеками** (2026-07-06): `03-student-granular` (21), `04-teacher-granular` (9), `05-06-granular` (10). Решта відкритих пунктів — у беклозі за інфраструктурою (нижче).

---

## Порядок виконання

Етапи **0 → 11** послідовно; усередині — по рядках сценаріїв.
Після кожного етапу:
1. усі скріни зроблені й переглянуті;
2. **створено окремий документ** `docs/e2e-improvements/<NN>-<slug>.md` (з TEMPLATE) —
   знахідки + осі UI/UX/Arvi/a11y/Perf/Func + виправлення;
3. критичні (P0/P1) правки внесені й перетестовані;
4. статуси у трекері оновлені;
5. підсумок у `docs/handoff.md`.

---

## Беклог сценаріїв за інфраструктурою (фіналізовано 2026-07-07)

Усі решта `[ ]` згруповано за тим, ЩО треба збудувати, щоб їх написати. Порядок = рекомендована черга (дешевше→дорожче). Кожен кластер = окрема сесія написання сценаріїв.

### B1. Route-mock провайдерів (Playwright `page.route`) — **найдешевше, наступне**
Мокаємо відповідь бекенду/провайдера, перевіряємо UI-реакцію. Не потребує реальних сервісів.
- **3K.5 / 5C.5** provider checkout → мок `POST /api/billing/**/checkout` → assert loading + спроба редіректу.
- **5C.4** promo apply → мок `POST /billing/subscription/promo/redeem` (success/error) → результат-банер.
- **3K.4/3K.7** пакети top-up + вибір валюти → мок entitlements/packages конфіг.
- **3K.6** manual invoice інструкції → мок payment-settings з manual-методом.
- **11.x білінг-стани** (з Етапу 11 беклогу): TRIAL/PAST_DUE/SUSPENDED → мок `GET /billing/entitlements` різними станами → банер/гейт.
- **5C.6/5C.7** feature-gating + seat-enforcement → мок entitlements (ліміт seats) → 403-повідомлення.

### B2. Мутаційні флоу з cleanup (створюємо→перевіряємо→прибираємо)
Реальні API-виклики під тестовим юзером, з прибиранням у `afterEach` або через унікальні дані.
- **4E.2** створення групи, **5D.3** створення акаунта, **3J.5/4G.1** створення групового чату/уроку.
- **3L.2** зміна пароля (повернути назад у cleanup).
- **4A.15** видалення матеріалу (створити тимчасовий → видалити).

### B3. TagInput / select / inline-панелі (interaction без нової інфри)
Відкрити наявну модалку/панель і поклацати — можна писати зараз.
- **4A.5** TagInput chips (Enter/кома), **4A.6** Level select A1–C2.
- **3B.9** LessonVocabularyAddPanel, **3B.10** calendar-link sidebar, **3H.4** word detail.
- **3J.4** «Search people» → contact picker (visibility вже в backend-тестах).
- **6.4** domains: додати домен → TXT-токен (без зовнішнього verify).

### B4. Файл-аплоад інфра (Playwright `setInputFiles` + fixture-файли)
- **3B.8** homework submit, **3B.11** download, **4A.7–4A.13** cover/multi-file/compression/nav-lock/recovery/size-limit, **4F.4/4F.6** homework tab / image upload.

### B5. Інтерактивні навчальні флоу (стан сесії + Arvi-реакції)
- **3D.2–4** vocabulary answer→feedback, **3E** irregular verbs, **3F** quiz проходження, **3F.5** Arvi реакції.

### B6. Realtime / медіа / зовнішнє (найдорожче)
- **3J.3/3J.7–10** Socket.IO доставка/пагінація/unread/auto-scroll/ephemeral, **3B.6/3B.7/4F.7** video provider + LiveKit JWT, **3G** speaking mic, **4B.*** PDF viewer + annotations + Plyr, **3L.5** OAuth Connections, **4F.8** recurrence materialization, **6.5** SMTP verify, **8.7** host-based JWT ≠ host.

### B7. Feature-робота (НЕ тести — продуктова розробка)
- **Arvi-беклог** (MascotPose/useArvi/ArviSlot/theming/reduced-motion/перф/скріни) та **3M.2** Arvi `wave` при logout — потребують імплементації маскота, не написання тестів.

**Примітка:** математика білінгу (4G.3–5 PER_MEMBER/FIXED_TOTAL/split) уже покрита backend-тестами `module-billing` (108 passed) — E2E тут лише про UI-флоу створення (B2).
