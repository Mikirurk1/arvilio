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

## ЕТАП 4 — Роль TEACHER `◐`

> **Playwright-тести написані:** `specs/pages/lessons.spec.ts` (4F часткове), `specs/pages/students.spec.ts` (4C/4D часткове), `specs/navigation.spec.ts` (4H.1).
> **Аудит:** ☐ не проводився.

(Спільні зі студентом сторінки перевіряємо у teacher-контексті + нижче.)

### 4A. `/materials` + MaterialFormModal
- 4A.1 заголовок «Materials», список карток (Grid/List view toggle).
- 4A.2 «Search materials…» фільтрує.
- 4A.3 SegmentedControl (тип/категорія).
- 4A.4 **Create/edit modal** (`MaterialFormModal`, BodyPortal): asset rows за роллю
  (student_book/teacher_book/workbook/audio/video/slides/link/board/presentation).
- 4A.5 **TagInput**: chip-и, Enter/кома, suggestions з наявних тегів.
- 4A.6 **Level** select A1–C2 (`PROFICIENCY_LEVEL`).
- 4A.7 **Cover image** upload (`coverAttachmentId`).
- 4A.8 multi-file для audio/video/slides; **Link** — URL-only.
- 4A.9 **File compression** select (off/light/balanced/strong).
- 4A.10 upload: прогрес-панель (XHR bytes) + крок «Compressing»; PDF — deferred.
- 4A.11 **navigation lock**: warning на Back/закриття під час save.
- 4A.12 **recovery banner**: перерваний upload (`sessionStorage`).
- 4A.13 завеликий файл → ліміт (`MATERIAL_ATTACHMENT_MAX_BYTES`).
- 4A.14 empty «No materials yet», error «Could not load materials».
- 4A.15 видалення матеріалу (файли+теки прибираються, storage-decrement).

### 4B. `/materials/view/[attachmentId]` (book viewer + media modal)
- 4B.1 **PDF book viewer** (pdf.js + Konva): рендер сторінки, fit-to-width.
- 4B.2 zoom 0.5–2.5, page jump input, first/last, клавіші PageUp/Down/Home/End/Alt+arrows.
- 4B.3 **Text annotations**: Text tool створює; Select tool drag+resize (Transformer); edit; Ctrl/Cmd+Z undo.
- 4B.4 анотації per `(userId, fileAttachmentId, contextUserId)`; staff «Remove my additions».
- 4B.5 **Media viewer modal** (audio/video): Plyr, session notes (newest top), Esc/backdrop/X (confirm якщо нотатки), HTTP Range scrubbing.
- 4B.6 deep-link на audio/video `/materials/view/...` → редірект + модалка.
- 4B.7 студент бачить лише student-facing assets; `teacher_book` — staff-only.
- 4B.8 `aria-label` кнопки відкриття (вже додано).
- 4B.9 неіснуючий id → помилка.

### 4C. `/students`
- 4C.1 список (таблиця/картки).
- 4C.2 SegmentedControl scope.
- 4C.3 empty «No students in this scope».
- 4C.4 error «Could not load students».

### 4D. `/students/[studentId]` (таби)
- 4D.1 **Profile** hero + save.
- 4D.2 **Lessons** (All lessons / All).
- 4D.3 **Practice** / **Vocabulary** / **Quiz** / **Speaking** / **Words**.
- 4D.4 **Statistics** / **Achievements** / **Streak**.
- 4D.5 **Billing** / **Group billing** / Individual / Group.
- 4D.6 неіснуючий студент → помилка.

### 4E. `/students/groups`
- 4E.1 список груп.
- 4E.2 створення групи (feature-flag).
- 4E.3 empty-state.

### 4F. Lesson modal (1:1)
- 4F.1 відкриття: `role=dialog`, focus-on-open, Escape, `aria-labelledby`.
- 4F.2 таб **setup**: дата/час, студент, валідація.
- 4F.3 таб **content**: `LibraryMaterialPicker` (attach з бібліотеки), media opt-in toggles (`sharedLibraryAssetIds`).
- 4F.4 таб **homework**: текст+файли (`POST /api/lessons/files/:lessonId`).
- 4F.5 таб **review**.
- 4F.6 завантаження зображення (`fileError` `role=alert`).
- 4F.7 **video provider**: `createMeetLink` при створенні (Meet/Zoom/LiveKit за активним провайдером).
- 4F.8 **recurrence**: weeklyDays + матеріалізація серії (`lib/lesson-recurrence.ts`) на створенні.
- 4F.9 збереження: loading-стан, успіх (Arvi `celebrate`), помилка.
- 4F.10 закриття без збереження (підтвердження, якщо є).

### 4G. Group lessons
- 4G.1 створення GROUP-уроку: ≥2 учасники (UI warn >6).
- 4G.2 primary student = перший учасник.
- 4G.3 billing mode **PER_MEMBER**: −1 credit на учасника.
- 4G.4 **FIXED_TOTAL + SINGLE_PAYER**: один GROUP_CHARGE на платника.
- 4G.5 **FIXED_TOTAL + EQUAL_SPLIT**: N×GROUP_CHARGE, floor-split + remainder.
- 4G.6 per-participant homework response.
- 4G.7 доступ: teacher / primary / будь-який учасник.

### 4H. Навігація + a11y
- [x] 4H.1 сайдбар вчителя: students + materials є, admin/system нема. *(navigation.spec.ts)*
- [ ] 4H.2 axe → 0 violations.

→ Після аудиту: `docs/e2e-improvements/04-teacher.md`.

---

## ЕТАП 5 — Роль ADMIN `◐`

> **Playwright-тести написані:** `specs/pages/admin.spec.ts` (5D + RBAC), `specs/pages/system.spec.ts` (часткове 6 → admin-scope).
> **Аудит:** ☐ не проводився.

### 5A. `/staff` + `/staff/[userId]`
- 5A.1 список «Staff», roster.
- 5A.2 empty «No staff members found», error «Could not load staff roster».
- 5A.3 профіль: таби **Profile** / **Compensation** / **Earnings & payouts** / **Statistics**.
- 5A.4 метрики: Accrued, Outstanding, Payout status, Lessons (month).
- 5A.5 «Back to staff».
- 5A.6 не-staff юзер → «Not a staff member».

### 5B. `/finance`
- 5B.1 «Staff finance» рендер.
- 5B.2 графік «Accrued vs paid trend».
- 5B.3 «Staff balances», «Staff breakdown (accrued)».
- 5B.4 empty/error «Could not load finance data».

### 5C. `/billing`
- 5C.1 «Subscription» рендер, поточний план.
- 5C.2 **storage meter** + **seats meter** (max/active/remaining) з `GET /api/billing/entitlements`.
- 5C.3 trial-статус банер.
- 5C.4 promo: ввід («e.g. LAUNCH20» / «e.g. PARTNER30») → apply → результат.
- 5C.5 **Starter/Pro picker** → `POST /api/billing/subscription/checkout` → Stripe redirect (мок).
- 5C.6 **feature-gating**: PRO-фічі приховані/заблоковані на нижчому плані (`FeatureGuard`/entitlements).
- 5C.7 seat-enforcement: додавання студента понад ліміт → 403.
- 5C.8 стани: TRIAL / ACTIVE / PAST_DUE (dunning grace) / SUSPENDED / grandfathered.

### 5D. `/admin`
- 5D.1 «Account administration» рендер.
- 5D.2 «Accounts overview».
- 5D.3 дії керування акаунтами.

### 5E. Навігація + a11y
- [x] 5E.∗ admin sidebar бачить admin link. *(navigation.spec.ts)*
- [ ] 5E.1 сайдбар адміна: + Staff/Finance/Billing/Admin, без System/Platform.
- [ ] 5E.2 axe → 0 violations.

→ Після аудиту: `docs/e2e-improvements/05-admin.md`.

---

## ЕТАП 6 — SUPER_ADMIN + `/system` `◐`

> **Playwright-тести написані:** `specs/pages/system.spec.ts` — tabs, branding, billing, connections (часткове). RBAC-редірект teacher.
> **Аудит:** ☐ не проводився. Примітка: в коді `/system` доступний ADMIN, не лише SUPER_ADMIN.

`/system` таби (9): general, branding, domains, email, payments, payouts, connections, dictionary (+ media-captions, video-meetings панелі).

- 6.1 «System control room» рендер, Tabs навігація.
- 6.2 **general** панель.
- 6.3 **branding** (G18): колір (hex-валідація) + лого URL → live preview → save → застосовано глобально.
- 6.4 **domains** (G16): додати домен → TXT-токен → verify → видалити.
- 6.5 **email**: SMTP-налаштування, verify-флоу.
- 6.6 **payments**: методи/allowlist.
- 6.7 **payouts**: налаштування виплат.
- 6.8 **connections**: Google OAuth (Calendar/Meet), Zoom S2S (`ZOOM_ACCOUNT_ID`), LiveKit (`wsUrl`/`apiKey`/`apiSecret`).
- 6.9 **video meetings** (General): вибір активного провайдера (Meet/Zoom/LiveKit).
- 6.10 **dictionary** (word dictionary): додавання/налаштування + setup-guides.
- 6.11 media-captions панель (наразі прихована за `MATERIAL_CAPTIONS_ENABLED`).
- 6.12 сайдбар суперадміна: System + усе.
- 6.13 axe усіх табів → 0 violations.

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

## ЕТАП 8 — RBAC негативні `◐`

> **Playwright-тести написані:** `specs/pages/admin.spec.ts` (teacher/student → /admin), `specs/pages/system.spec.ts` (teacher → /system), `specs/pages/students.spec.ts` (student → /students), `specs/login.spec.ts` (guest → /dashboard), `specs/navigation.spec.ts` (sidebar RBAC).
> **Аудит:** ☐ не проводився.

- [x] 8.1 STUDENT → /students, /admin → редірект. *(students.spec.ts, admin.spec.ts)*
- [x] 8.2 TEACHER → /admin, /system → редірект. *(admin.spec.ts, system.spec.ts)*
- [ ] 8.3 ADMIN → /system, platform → редірект (уточнити: ADMIN має доступ до /system у коді).
- [ ] 8.4 TEACHER/ADMIN → `/payment` → редірект (тільки student).
- [x] 8.5 guest → /dashboard → редірект `/login`. *(login.spec.ts)*
- [ ] 8.6 API без сесії → 401/403.
- [ ] 8.7 JWT школи ≠ host → 403.
- [x] 8.8 прямий перехід по URL гейтиться. *(всі RBAC-тести)*

→ Після аудиту: `docs/e2e-improvements/08-rbac.md`.

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
| 🧸 | Arvi-присутність | ☐ | ☐ | ☐ | (наскрізно) | ☐ |

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
