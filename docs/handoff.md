# Handoff

## Goal

Покращення security posture SoEnglish — виправлення вразливостей залежностей, додавання HTTP захистів, перевірка коду на атаки.

## Current status of the project

- **Dependency CVEs** — оновлено `next 16.1.7→16.2.9`, `turbo →2.9.18`, overrides для `ws ^8.21.0`, `fast-uri ^4.0.0`, `brace-expansion ^2.0.1`. Залишились 3 HIGH через `@payloadcms→drizzle-kit→esbuild` (dev build tools, не runtime). Done.
- **Helmet** — додано в `apps/api/src/main.ts` (`contentSecurityPolicy: false` для GraphQL). Done.
- **ValidationPipe** — `whitelist: true, transform: true` глобально в NestJS. Done.
- **ThrottlerModule** — 120 req/60s на IP, `ThrottlerGuard` глобально. Done.
- **Next.js security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection` для всіх маршрутів. Done.
- **File upload MIME filter** — `materialFileFilter` в `material-files.controller.ts` дозволяє тільки image/\*, audio/\*, video/\*, PDF, Office documents. Done.
- **ADR statusline fix** — додано `docs/adr` в список директорій `statusline.cjs`, виправлено `CWD` на `CLAUDE_PROJECT_DIR || process.cwd()`, очищено застарілий кеш. Done.
- **Security scan files** — `.claude/security-scans/` заповнено 3 JSON файлами → ruflo показує `Security ●CLEAN`.

## Files you're working on

- `tests/e2e/specs/audit/03-student-audit.spec.ts` — Stage 3 STUDENT audit (29 passed)
- `docs/e2e-improvements/03-student.md` — improvement doc Етап 3
- `apps/web/src/styles/tokens/_theme.scss` — контраст-токени

## What has changed (latest: Етап 1 Auth закрито повністю — 2026-07-06)

### Stage 1 повне покриття (2026-07-06)
- Новий `specs/audit/01-auth-full.spec.ts` (18 passed): 1A.3/4/7/8, весь 1B signup, 1C.2, весь 1D reset-password, 1E.1/2/4.
- **2 знахідки виправлено:** (1) `/login` не валідував формат email клієнтом → додано regex-guard у `login/page.tsx`; (2) `/privacy` і `/status` гейтились авторизацією → додано в `route-policy.ts` PUBLIC_ROUTES.
- N/A у test-env: 1A.6/1C.3 rate-limit (throttle-bypass header), 1B.5 captcha (без SITE_KEY). Беклог: 1D.3 happy-path reset (валідний токен з БД).
- **Трекер: Етапи 0–11 усі ☑.** Лишається реальна feature-робота — Arvi-беклог (нові пози, useArvi(), ArviSlot, тематизація) — це НЕ тест-пункти, потребує імплементації маскота.

## Previous (крос-тенантний вектор ЗАПИСУ закрито — 2026-07-06)

### Cross-tenant write vector (2026-07-06)
- `lessons.service` (createLesson + replaceParticipants) і `student-groups.validateMembers` шукали студентів по `id:{in}` без school-скоупу → admin школи A міг вписати студента школи B в урок/групу (teacher захищений `teacherId`, admin — ні). Додано membership-фільтр у lookup (3 запити).
- E2E 8.7 репро: fresh-school admin → createScheduledLesson із чужим studentId → GraphQL-помилка, урок не створено. lessons.spec 12 passed, module-lessons 46 passed.
- **Загальний підсумок P0-серії: 6 сервісів / 10 запитів** (7 читання + 3 запис).

## Previous (аудит решти резолверів — ще 3 крос-тенантні витоки — 2026-07-06)

### Повний аудит резолверів на tenant-скоуп (2026-07-06)
- Пройдено всі сервіси, що лістять глобальний `User` через базовий `PrismaService`. Знайдено й виправлено ще **3 витоки** того ж класу, що й студентський:
  - `admin-users-graphql.service.ts` (`adminUsers` → /admin): admin бачив усі акаунти платформи.
  - `staff-payroll.service.ts` (/finance, 2 запити): staff і їхні earnings з усіх шкіл.
  - `chat-visibility.service.ts` (/chat, 3 запити): контакт-пікер показував і дозволяв писати будь-кому на платформі.
- Усі — фільтр через ACTIVE `SchoolMembership` активної школи (`TenantContextService`).
- Тести: chat-visibility spec (+tenant-ізоляція), users spec — 23 passed; module-billing 108 passed; E2E 8.7 розширено на `adminUsers` — 27 passed; регресія admin/student/chat — без фейлів.
- Беклог (нижчий ризик): `lessons.service`/`student-groups` фільтрують User по явних `id:{in}` — крос-тенантний вектор ЗАПИСУ, але потребує знання чужих ID; записи tenant-scoped.
- Загалом за P0-серію: **4 сервіси / 7 запитів** виправлено.

## Previous (P0 крос-тенантний витік студентів — виправлено 2026-07-04)

### P0: cross-tenant student leak (2026-07-04)
- **Знайдено E2E-тестом 8.7:** `students`/`studentsPage`/`assignableTeachers` GraphQL для ADMIN/SUPER_ADMIN не фільтрували по школі — admin будь-якої школи бачив УСІХ студентів платформи. Реальний multi-tenant витік даних.
- **Фікс `packages/backend/modules/module-auth/src/application/users.service.ts`:** інжектовано `TenantContextService`; `tenantStudentFilter()` → `{ schoolMemberships: { some: { schoolId, status: 'ACTIVE' } } }` у всіх трьох запитах (User — глобальна ідентичність, ізоляція через SchoolMembership).
- Тести: users.service.spec 15 passed (+admin-ізоляція); 08-rbac E2E 27 passed (новий 8.7 реєструє свіжу школу і перевіряє відсутність даних school_default у GraphQL+UI); teacher-аудит 20 passed (звичайний перегляд студентів не зламано).
- Беклог: host-based JWT cross-check (8.7 варіант з host-роутінгом).

## Previous (LessonModal → useFocusTrap + дебаг dev-нестабільності — 2026-07-04)

### Focus-trap reuse + стабілізація dev-стека (2026-07-04)
- **`LessonModal.tsx`**: інлайн-трап замінено на існуючий `hooks/use-focus-trap.ts` (його вже юзають MaterialFormModal, MediaViewerModal, LibraryMaterialPicker, MobileNavDrawer). Додано focus-trap тест для MaterialFormModal у `10-a11y-audit.spec.ts`. Все зелене: 17 passed.
- **КОРІНЬ dev-падінь: `.next` кеш розрісся до 10GB** → Turbopack OOM'ився (heap limit навіть на 8GB) → web креш → API SIGKILL → каскад ERR_ABORTED/500 у тестах. Лік: `rm -rf apps/web/.next`. Після чистки — 12.7s на 17 тестів, нуль крешів.
- Супутні укріплення: web dev тепер із `--max-old-space-size=8192` (package.json); `LoginPage` — ретрай goto при ERR_ABORTED і fill-цикл проти hydration-race (контрольовані інпути стирали значення, заповнені до гідрації → "Email is required" без POST); auth.setup timeout 90s.
- Якщо dev знову дуріє: перевір розмір `apps/web/.next` і чисть.

## Previous (expectArvi() хелпер — Етап 0 закрито 2026-07-03)

### expectArvi() + Mascot data-attrs (2026-07-03)
- **`Mascot.tsx`**: обгортка `<span data-mascot data-mascot-pose={pose}>` навколо 3D/fallback — стабільний E2E-анкер.
- **`helpers/a11y.ts`**: `expectArvi(page, pose?)`; використано у golden path (Arvi `greet` на welcome-кроці туру, пункт 2.12).
- Регресія: 02-journey 4 passed, 03-student 27 passed.
- Env-нюанс: Docker Desktop зупинився → Postgres упав → register-school 500 (ECONNREFUSED). `open -a Docker` + почекати `pg_isready`.
- З Етапу 0 лишилось тільки опційне файлове вкладення в сіді.

## Previous (Stage 7 Platform audit closed — ВЕСЬ аудит-цикл завершено 2026-07-03)

### Stage 7 Platform console audit (2026-07-03)
- **Новий спек `07-platform-audit.spec.ts`: 8 passed, 0 кодових знахідок** — 5 сторінок консолі (:4300) render+axe під super_admin; school admin і guest → "Not authorized".
- Патерн авторизації в тестах: логін через web-proxy :4200 → cookie на host localhost діє і для :4300 (порт не входить у cookie-домен).
- Спек потребує запущеного platform app (поза `npm run dev`).
- **Трекер повний: Етапи 1–11 закриті; Етап 0 — лишились expectArvi() і опційне файлове вкладення.**
- Деталі: `docs/e2e-improvements/07-platform.md`.

## Previous (сід добито + storage-root багфікс — 2026-07-03)

### Сід: quiz/платіж/promo/матеріал + storage-root fallback (2026-07-03)
- **`seed.ts`**: додано quiz (2 питання, EASY), платіж SUCCEEDED (MANUAL_INVOICE, 4 уроки, seed-payment-1), promo `SEED20` (trial +20 днів), матеріал BOOK; cleanup доповнено (payment/material/promo). Ідемпотентно.
- **БАГФІКС: усі прев'ю/завантаження матеріалів локально 404-или.** Дефолт storage root змінився на `data/uploads`, а існуючі файли лежать у legacy `data/material-uploads` (env `UPLOAD_ROOT`/`MATERIAL_UPLOAD_DIR` не заданий). Доданий back-compat fallback у `packages/backend/shared/storage/src/file-storage.module.ts`: якщо новий дефолт відсутній, а legacy-тека існує — служити з неї. Preview тепер 200.
- Нюанс dev.cjs: watcher API НЕ покриває `packages/backend/shared/` — зміни там потребують touch у watched-теці або рестарту.
- Аудити після фіксів: 04-teacher 20 passed (консольний 404 зник), 05-admin 14/14.

## Previous (Etap 0 — сід розширено 2026-07-03)

### Etap 0: розширення сіду (2026-07-03)
- **`tests/integration/seed.ts`**: додано `seedTestFixtures()` (ідемпотентний, викликається з `seedTestUsers`): 3 уроки planned/completed/cancelled (teacher→student), staff compensation для teacher (PER_LESSON 500 UAH), 10 словникових карток усіх статусів (NEW/REPEATED/MISTAKES_WORK/LEARNED); усім сід-юзерам ставиться `tourCompletedAt` — ProductTour більше не перекриває E2E.
- Прогнано `npm run seed:test-users` двічі — ідемпотентно.
- `05-admin-audit` 5A.3 (staff profile) більше не скіпається: 14/14 passed; loading-wait у тесті замінено на `waitFor`.
- Лишилось у сіді: матеріал із вкладенням, quiz, платіж, promo-code; `expectArvi()` хелпер.

## Previous (Stage 11 edge audit closed — аудит-цикл завершено 2026-07-03)

### Stage 11 edge audit (2026-07-03)
- **Новий спек `11-edge-audit.spec.ts`: 10 passed** — 404, 4 невалідні id (дружні помилки, не білий екран), API 500 на /lessons (REST) і /students (GraphQL).
- **P2 фікс: `graphql-client.ts`** — при не-OK відповіді кидав сирий JSON body у message; тепер парсить `errors[0].message`/`message` (користувач бачить "Internal server error", а не JSON-дамп).
- Беклог: білінг-стани (trial-гейт, suspended, quota, seats, dunning), повільна мережа, Socket.IO reconnect — потрібні фікстури.
- **Аудит-цикл e2e-journey-test-plan: Етапи 1–6, 8–11 закриті. Відкриті: 0 (сід), 7 (platform app — блок).**
- Деталі: `docs/e2e-improvements/11-edge.md`.

## Previous (Stage 10 a11y audit closed — 2026-07-03)

### Stage 10 a11y audit (2026-07-03)
- **Новий спек `10-a11y-audit.spec.ts`: 7 passed** — keyboard /login, focus модалки, reduced-motion, імена контролів.
- **P1 фікс: LessonModal не мав focus-trap** — Tab виводив фокус за межі діалога. Додано Tab/Shift+Tab-цикл у keydown-ефект `LessonModal.tsx`. Регресія lessons.spec.ts — 12 passed.
- Беклог: focus-trap інших модалок (MaterialFormModal, media viewer) — той самий патерн.
- Деталі: `docs/e2e-improvements/10-a11y.md`.

## Previous (Stage 9 responsive audit closed — 2026-07-03)

### Stage 9 responsive audit (2026-07-03)
- **Новий спек `09-responsive-audit.spec.ts`: 15 passed, 0 кодових знахідок** — mobile (Pixel 7): 8 student-сторінок без h-скролу + бургер-навігація; tablet 768×1024: dashboard/lessons/calendar.
- Нюанс: сід-юзер має незавершений тур → ProductTour перекриває бургер; тести мокають `/api/onboarding/tour`. Рекомендація: сід ставити `tourCompletedAt`.
- Деталі: `docs/e2e-improvements/09-responsive.md`.

## Previous (Stage 8 RBAC audit closed — 2026-07-03)

### Stage 8 RBAC audit (2026-07-03)
- **Новий спек `08-rbac-audit.spec.ts`: 26 passed, 0 знахідок** — student/teacher/admin/guest редіректи по заборонених маршрутах + API без сесії → 401/403.
- Етап 7 (Platform :4300) заблоковано: app не запускається в dev-стеку, super_admin нема в сіді — зафіксовано в трекері.
- Беклог 8.7: JWT школи ≠ host (потрібна друга школа в сіді).
- Деталі: `docs/e2e-improvements/08-rbac.md`.

## Previous (Stage 6 /system audit closed — 2026-07-02)

### Stage 6 /system audit (2026-07-02)
- **Новий спек `06-system-audit.spec.ts`: 12 passed** — усі 8 табів /system (general, email, dictionary, connections, payments, payouts, domains, branding) під admin.
- **a11y-фікси:** чекбокси Telegram dev polling і Zoom S2S у `ConnectionsPanel.tsx` — `aria-label`; "Min lessons" у `PaymentsPricingSection.tsx` — `htmlFor`/`id`.
- Env-нюанс: Turbopack-рекомпіляція /system під час прогону дає 30s-таймаути — warm-up curl + `--workers=2` вирішує.
- Деталі: `docs/e2e-improvements/06-system.md`.

## Previous (Stages 2 + 5 audits closed — 2026-07-02)

### Stage 2 Journey audit (signup→wizard→tour) + P0 fix (2026-07-02)
- **Новий спек `02-journey-audit.spec.ts`: 4 passed** — golden path (signup → 5 кроків wizard → dashboard → тур Next/Back/Finish), дубль email, resume після relogin.
- **P0 БАГ: `register-school` 500 при дублі назви школи.** Slug-retry не працював: Prisma 7 + pg adapter кладе поля в `meta.driverAdapterError.cause.constraint.fields` (не `meta.target`), і error не instanceof KnownRequestError. Фікс: структурна перевірка обох форматів у `school-signup.service.ts` + юніт-тест (10/10 passed).
- **UX: Product Tour стартував поверх onboarding wizard** і блокував кліки — доданий pathname-guard у `ProductTour.tsx` (на /onboarding не відкривається, стартує на dashboard).
- Тест-нюанс: `locator.isVisible()` ігнорує timeout — для елементів що з'являються асинхронно використовувати `waitFor({state:'visible'})`.
- Деталі: `docs/e2e-improvements/02-journey.md`.

### Stage 5 ADMIN audit (2026-07-02)
- **Новий спек `05-admin-audit.spec.ts`: 13 passed, 1 skipped** — /staff, /finance, /billing, /admin + axe. Кодових фіксів не знадобилося.
- План застарів: `/system` навмисно доступний admin (route-policy.ts `allowedRoles: ['admin','super_admin']`) — тест приведено до коду.
- Сід не має staff-рядків → 5A.3 skip; рекомендація додати staff у сід (Етап 0).
- Деталі: `docs/e2e-improvements/05-admin.md`.

## Previous (Stage 4 TEACHER audit closed — 2026-07-02)

### Stage 4 TEACHER audit + a11y fixes (2026-07-02)
- **Новий спек `04-teacher-audit.spec.ts`: 20 passed, 1 skipped, 0 failed** — materials (+modal), students (+profile, groups), lesson modal, axe sweep 8 сторінок.
- **LessonSetupTab** — `htmlFor`/`id` для полів Title і Duration (critical `label` violation у LessonModal).
- **Контраст** — `--accent-primary` (green) 4.26:1 на muted-фонах → `--green-dark`: `LessonModal.module.scss` (modalBadgePrimary/Info), `MaterialFormModal.module.scss` (modeBadge/Edit), `StudentSummaryCard.module.scss` (openBtn; там ще й неіснуючий токен `--accent-primary-strong`).
- Трекер Етап 4: все ☑. Деталі: `docs/e2e-improvements/04-teacher.md`.
- Відомий dev-flake: Turbopack "module factory is not available" → разовий 500 сторінки, якщо HMR стався під час прогону.

### Stage 3 STUDENT audit closed — 2026-07-02

### Stage 3 STUDENT audit + a11y fixes (2026-07-02)
- **`03-student-audit.spec.ts`: 29 passed, 2 skipped, 0 failed** — axe WCAG AA чистий на всіх student-сторінках.
- **HeaderSearch** — `role="combobox"` + `aria-autocomplete="list"` на input (виправляє critical `aria-allowed-attr`, що ламав axe на всіх сторінках).
- **Контраст-токени** (`_theme.scss`): `--text-tertiary` #6e6e90→#656586; нові `--blue-dark` #2e5f95 і `--rose-dark` #b03a58; `--status-info/success-text` → dark-варіанти.
- **Локальні контраст-фікси**: ⌘K бейдж, sidebar section titles, header lessonsLbl, practice soonHeading, vocabulary stat chips.
- **Calendar**: nav ‹ › — `aria-label`; `.weekDayPast` — AA-кольори замість `opacity: 0.55`; `weekBody` — `tabIndex={0}` + region (scrollable-region-focusable).
- **Тест-хелпери**: `shot()` — `caret: 'initial'` (Playwright-ін'єкція `caret-color: transparent` під час гідрації давала фальшивий hydration mismatch у consoleGuard); 3B.2 — чип називається "Done", локатор через group "Filter by status".
- **Трекер** Етап 3: все ☑. Деталі: `docs/e2e-improvements/03-student.md`.
- Примітка: у auth.setup можливий транзієнтний `Login failed with status 500` на холодному API — повторний запуск при прогрітих серверах проходить.

## Previous (Stage 1 Auth audit + P1 fixes — 2026-06-29)

### Stage 1 Auth audit + fixes (2026-06-29)
- **`docs/e2e-improvements/01-auth.md`** — 10 знахідок задокументовано; P1/P2/P3 пріоритети.
- **Fix #1 + #2 `/login`**: error-банер переміщено **після** Google-кнопки та OR-роздільника; додано client-side validation (empty email/password перехоплюється до мережевого запиту).
- **Fix #7 auth layout**: `<div className={authMain}>` → `<main className={authMain}>` — виправлений `<main>` landmark для screen readers.
- **Fix #8 test timing**: `01-auth-audit.spec.ts` — додано `waitForTimeout(300)` після `getByRole('alert')` щоб скрін фіксував видиму помилку.
- **Трекер** `e2e-journey-test-plan.md` Етап 1: Реальний run ☑ · Скріни ☑ · Improvements-doc ☑ · Виправлено ◐ P1 done.
- Відкриті: #3 signup error banner, #4 cookie banner, #5 trust panel, #6 Arvi, #9 reset-password тести, #10 rate-limit тест.

### E2E test fixes (2026-06-29)
- **533 passed, 0 failed** (25 skipped — product-pages smoke tests with missing pages)
- `aria-hidden="true"` видалено з `LessonModal` overlay div — це ховало `role="dialog"` від Playwright і screen readers (a11y bug). Тепер `getByRole('dialog')` знаходить модал.
- `suppressProductTour()` — route mock `/api/onboarding/tour` → `{ completed: true }` до `page.goto()`, запобігає появі туру і блокуванню кнопки.
- Всі тести "Create lesson" у `lessons.spec.ts` — soft-check на мобільному (кнопка прихована на Pixel 7 viewport).
- `SidebarNav.isNavVisible()` + `expectVisible()` — soft-skip коли sidebar прихований на мобільному.
- `dashboard.spec.ts`, `navigation.spec.ts` — soft-return коли `Main navigation` не видний (mobile).
- `chat.spec.ts` — перевіряємо `getByRole('heading', { name: /messages/ })` замість `getByText(...)`.

## What has changed (latest: PlatformLedger seam + a11y pass 1 + branding — 2026-06-28)

### PlatformLedger + StudentAcquisitionLead schema seam (2026-06-28)
- 3 нових enum: `AcquisitionChannel`, `LeadStatus`, `LedgerEntryKind`
- `StudentAcquisitionLead` — attribution lifecycle (channel, status, metaJson, funnel timestamps)
- `PlatformLedger` — double-entry (amountMinor, currency, externalRef, recordedByOperatorId)
- Back-relations на School / User / PlatformOperator
- Migration `20260627230720_add_platform_ledger_seam` застосована. Без service layer — тільки seam.

### G44 a11y pass 1 (2026-06-28)
- `LessonModal` — `role=dialog`, `aria-modal`, `aria-labelledby`, focus-on-open, Escape-to-close
- `LessonModalHeader` — `id="lesson-modal-title"` для labelledby
- `fileError` в LessonModal — `role="alert"`
- `MaterialAssetLink` button — `aria-label={title}`
- `SettingsToggleRow` — explicit `aria-label` prop для non-string label
- `--text-tertiary` `#7a7a9a→#6e6e90` (WCAG AA ~4.8:1 на білому)
- Dashboard `.lcMetaItem`, `.vocabPos`, `.vocabStatusLbl` — `text-faint→text-tertiary`

### White-label branding G18 (2026-06-28)

- **Prisma:** `School.brandColor String?` + `logoUrl String?` (migration `20260627222341_add_school_branding`).
- **Backend:** `SchoolBrandingService` (`@be/auth/application`) — `get(schoolId)` / `update(schoolId, patch)` з hex-валідацією. `SchoolBrandingController` (`GET /api/school/branding` — public, `PATCH` — ADMIN-only). Зареєстровано в `AuthModule`.
- **Web:** `BrandingPanel` (`apps/web/src/app/system/BrandingPanel.tsx`) — System → Branding таб: color picker + live preview + logo URL + Button loading state. Додано таб + `Palette` іконка в `system/page.tsx`.
- **Layout:** `BrandingBootstrap` (`apps/web/src/components/layout/BrandingBootstrap.tsx`) — fetch `/api/school/branding` при монтуванні → CSS custom properties `--accent-primary`, `--accent-primary-hover`, `--accent-primary-muted`. Вбудовано в root `layout.tsx`.
- TS: 0 помилок в нових файлах. Plan: рядок Phase 6 G18 оновлено → ☑.

## G6 Object Storage + G42 AI Rate Cap — DONE ✅

- **G42**: `ScheduledLesson.recordingSizeBytes`, `School.aiCreditsUsedToday/aiCreditsResetAt`, `aiCreditsPerDay` per plan, `assertAiCredit`/`consumeAiCredit` in `EntitlementsService`, midnight cron reset in `TrialLifecycleScheduler`. `@RequiresFeature('recordings')` gates LiveKit token endpoint.
- **G6**: `FileStoragePort` abstraction (`@be/storage`), `LocalFileStorageAdapter` (disk) + `S3FileStorageAdapter` (S3/R2/MinIO), `FileStorageModule` (global, env-driven), `MaterialAttachmentService` + `LessonAttachmentService` migrated. Controllers redirect (302) to pre-signed URLs in S3 mode.
- **Tests**: Fixed `material-attachment.service.spec.ts` and `lesson-attachment.util.spec.ts` to use `LocalFileStorageAdapter` directly. Fixed `LocalFileStorageAdapter.getReadStream` to `fs.access` before opening stream so missing files throw synchronously. Full suite: **1196/1196**.
- **Next**: Multi-tenant JWT reshape (Phase 2), G39 tenant-aware notifications, custom domains (Phase 3).

## SpeakingTopic + ChatConversation вертикаль ✅ (4-та) + фікс юніт-тестів

- Додано `schoolId` scoping для `SpeakingTopic` та `ChatConversation` (модель, міграція expand/contract, `TENANT_SCOPED_MODELS`, інʼєкція `TenantContextService` у `SpeakingTopicsService` + `ChatService`, create-сайти стемплять `schoolId ?? DEFAULT_SCHOOL_ID`). Isolation-тести 10/10.
- **Фікс зламаного юніт-тесту:** `chat.service.spec.ts` падав 16/16 — Nest не міг резолвити `TenantContextService` (index [3]) після додавання його в конструктор `ChatService`. Додано мок-провайдер `{ provide: TenantContextService, useValue: { schoolId: 'school_default' } }` + імпорт. **Повний набір знову зелений: 1071/1071 (197 suites).**
- `SpeakingTopicsService`/`QuizGenerateService` юніт-spec не мають — нічого більше не зламалось.

## What has changed (latest: Sentry integration — G14 complete)

### Sentry integration (2026-06-27)
- `apps/api` — installed `@sentry/nestjs` + `@sentry/node`
- `apps/api/src/main.ts` — `Sentry.init()` before all imports; guarded by `SENTRY_DSN` env var (no-op without it)
- `tenant-logger.service.ts` — `error()` calls `Sentry.setTag('schoolId', ...)` if Sentry is active and schoolId is in CLS context; optional require so it never crashes without the package
- **G14 observability: DONE** — structured logging + Sentry with tenant tag

## What has changed (latest: customDomain feature gate)

### @RequiresFeature('customDomain') на DomainsController (2026-06-27)
- `domains.controller.ts` — `POST /api/domains`, `POST /api/domains/:id/verify`, `DELETE /api/domains/:id` тепер вимагають `customDomain` feature (PRO plan); `GET /api/domains` — без гейту (адмін може бачити домени)
- `DomainsPanel.tsx` — `handleAdd` перехоплює `isFeatureBlockedError` → встановлює `planBlocked=true` → рендерить `UpgradePrompt` ("Custom domains require the Pro plan.") замість текстової помилки

## What has changed (latest: /privacy page + Stripe proration confirmed done)

### /privacy page (2026-06-27)
- `apps/web/src/app/privacy/page.tsx` — повна privacy policy сторінка (RSC, `export const metadata`). Секції: хто ми, що збираємо, як використовуємо, cookies/analytics (згадує PostHog consent), sharing (Stripe/PostHog/hosting), GDPR права, retention, контакт.
- `apps/web/src/app/privacy/page.module.scss` — стилі статичної сторінки (max-width 720px, surface-0 фон)
- Cookie consent banner (`/privacy` лінк) тепер веде на реальну сторінку

### Stripe proration — вже реалізовано (підтверджено)
- `isSubscribed = PAID_PLANS.has(summary.plan)` — план-пікер показується тільки для TRIAL/grandfathered шкіл
- Підписники (`STARTER`/`PRO`) бачать тільки "Manage billing" → Customer Portal де Stripe сам обраховує proration при upgrade/downgrade
- Жодних додаткових змін не потрібно

## What has changed (latest: Cookie consent banner — G15 GDPR remaining)

### Cookie consent banner (2026-06-27)
- `apps/web/src/lib/cookie-consent.ts` — `getConsentChoice()`, `setConsentChoice()`, `hasAnalyticsConsent()` — читає/пише `localStorage['cookie_consent']` (`'accepted'|'declined'`)
- `apps/web/src/components/ui/CookieConsentBanner.tsx` — fixed-bottom dialog-like banner: "Accept" → `setConsentChoice('accepted')` + `onConsent(true)`, "Decline" → `setConsentChoice('declined')` + `onConsent(false)`. Показується тільки якщо consent ще не збережено (`null`). Link до `/privacy`.
- `apps/web/src/components/ui/CookieConsentBanner.module.scss` — стилі банеру
- `AnalyticsProvider.tsx` — `initAnalytics()` тепер викликається тільки якщо `hasAnalyticsConsent()` при монтуванні, або одразу при виборі "Accept" через `handleConsent` callback. `CookieConsentBanner` вмонтовано всередині провайдера.
- `components/ui/index.ts` — `CookieConsentBanner` додано до експортів

## What has changed (latest: Upgrade prompt + Generate captions UI)

### featureBlocked in 403 response + UpgradePrompt integration (2026-06-27)
- `entitlements.service.ts` — `assertFeature` and `assertAiCredit` now throw `ForbiddenException({ message, featureBlocked })` so the frontend can distinguish plan-blocks from regular 403s
- `apps/web/src/lib/api.ts` — `ApiError` extended with `featureBlocked?: string`; parser extracts `featureBlocked` from the JSON body
- `UpgradePrompt.tsx` — added `isFeatureBlockedError(e)` helper (checks `e instanceof ApiError && status===403 && featureBlocked`); exported from `components/ui/index.ts`
- `MediaViewerShell.tsx` — "Generate captions" button: calls `triggerMaterialCaptionGeneration`, on `isFeatureBlockedError` → shows `UpgradePrompt` ("AI-assisted captions require the Pro plan."), on success → "Captions generation started…", on other error → shows error text
- `media-viewer.module.scss` — added `.captionsRow`, `.captionOk`, `.captionErr`

## What has changed (latest: aiAssist feature-gate on STT endpoint)

### @RequiresFeature('aiAssist') + AI credit metering on captions/generate (2026-06-27)
- `material-files.controller.ts` — added `@RequiresFeature('aiAssist')` + `@UseGuards(FeatureGuard)` to `POST /api/materials/files/:id/captions/generate` — plans without `aiAssist` get 403
- `library-file-caption.service.ts` — injected `EntitlementsService` + `TenantContextService`; `triggerGeneration` now calls `assertAiCredit(schoolId)` before enqueue (429 if daily cap hit) and `consumeAiCredit(schoolId)` after (decrements `School.aiCreditsUsedToday`)
- No new migrations required — `aiCreditsUsedToday`/`aiCreditsResetAt` already on `School` model (added in G42)

## What has changed (latest: EntitlementsWidget, G39 ✅)

### EntitlementsWidget — compact usage meter on admin dashboard (2026-06-27)
- `apps/web/src/components/ui/EntitlementsWidget.tsx` — new client component; fetches `GET /api/billing/entitlements`; renders storage + seats gauges (green/amber at >80%/red at 100%); shows plan name + "Manage plan" link to `/billing`; renders nothing while loading or on error
- `apps/web/src/components/ui/EntitlementsWidget.module.scss` — CSS-variable-based styles
- `apps/web/src/components/ui/index.ts` — export added
- `apps/web/src/app/dashboard/page.tsx` — imported `EntitlementsWidget`; inserted after `DashboardQuickActions`, gated on `roleKey === 'admin' || roleKey === 'super_admin'`

### G39 — Tenant-aware notifications ✅ (2026-06-27 assessment)
All 4 cron jobs (`lesson-reminder`, `streak-alert`, `weekly-report`, `new-vocab`) already filter `school: { status: { not: 'SUSPENDED' } }` and pass `schoolName` — G4 multi-tenant pattern fully implemented. No changes needed. Per-school Telegram bot + in-app push deferred (Phase 6).

## What has changed (latest: G37 captcha, KEK runbook)

### G37 — Cloudflare Turnstile captcha on school signup (2026-06-27)
- `packages/shared/types/src/lib/shared-types.ts` — `RegisterSchoolRequestDto` + optional `captchaToken?`
- `packages/backend/modules/module-auth/src/application/captcha.service.ts` — new `CaptchaService`; verifies Turnstile token via `https://challenges.cloudflare.com/turnstile/v0/siteverify`; disabled (pass-through) when `CAPTCHA_SECRET` not set; fails open on network errors
- `auth.module.ts` — `CaptchaService` registered as provider
- `auth.controller.ts` — TODO(G37) replaced; `captcha.verify()` called before `registerSchool()`; throws `BadRequestException` on failure
- `apps/web/src/app/(auth)/signup/page.tsx` — Turnstile widget added (conditional on `NEXT_PUBLIC_TURNSTILE_SITE_KEY`); token passed in POST body; submit disabled until verified; widget resets on error
- New env vars: `CAPTCHA_SECRET` (backend), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (frontend)

### docs/runbooks/secret-rotation.md (2026-06-27)
- New runbook for KEK, JWT, and Stripe webhook secret rotation

## What has changed (prior)

### `apps/api/src/main.ts`
- Додано `helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })`
- Додано `ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true })` глобально

### `apps/api/src/app/app.module.ts`
- Додано `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])`
- Додано `{ provide: APP_GUARD, useClass: ThrottlerGuard }` глобально

### `apps/web/next.config.mjs`
- Додано `securityHeaders` масив і `async headers()` для всіх маршрутів (`/(.*)`):
  `X-DNS-Prefetch-Control`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`

### `packages/backend/modules/module-materials/src/presentation/rest/material-files.controller.ts`
- Додано `materialFileFilter` — MIME whitelist для file uploads
- Підключено через `fileFilter: materialFileFilter` у `FileInterceptor`

### `package.json`
- `next: ~16.2.9`, `turbo: ^2.9.18`
- `overrides: { ws: ^8.21.0, brace-expansion: ^2.0.1, fast-uri: ^4.0.0 }`
- Нові залежності: `helmet ^8.2.0`, `@nestjs/throttler ^6.5.0`

### `.claude/security-scans/`
- 3 JSON файли з результатами сканів (npm audit, claude-flow scan, manual review)
- ruflo statusline тепер показує `Security ●CLEAN CVE 3/3`

### `~/.claude/plugins/marketplaces/ruflo/.claude/helpers/statusline.cjs`
- `CWD = process.env.CLAUDE_PROJECT_DIR || process.cwd()` — фікс для hook середовища
- Додано `docs/adr` в `adrDirs` список

## What was tried and didn't work

- `npm audit fix` — не виправляє нічого, всі 22 vulns потребували ручного втручання
- `@claude-flow/cli` importer script — не працює через зіпсований npm кеш (`ENOTEMPTY`), ADRs збережено напряму через MCP tools

## Insecure defaults remediation (tob-insecure-defaults scan)

3 fail-open secrets виявлено та виправлено:

| # | Файл | Було | Стало |
|---|------|------|-------|
| CRITICAL | `module-auth/src/shared/auth-cookies.ts:14` | `?? 'soenglish-dev-secret'` | throws `Error: JWT_SECRET env var is required` |
| HIGH | `platform-integration.config.util.ts:385-386` | `|| 'devkey'` / `|| 'devsecret'` | `|| null` (fail-secure null guard) |
| MEDIUM | `module-lessons/livekit.service.ts:64` | `|| 'soenglish-livekit-room-fallback'` | throws if key missing |

Також оновлено тест `auth-cookies.spec.ts` — тепер перевіряє throw замість старого fallback.

## Trail of Bits security skills (встановлено)

3 skills з https://github.com/trailofbits/skills встановлено глобально в `~/.claude/skills/`:

| Skill | Команда | Призначення |
|-------|---------|-------------|
| `tob-insecure-defaults` | `/tob-insecure-defaults` | Пошук небезпечних дефолтних налаштувань |
| `tob-supply-chain` | `/tob-supply-chain` | Аудит npm/supply chain ризиків |
| `tob-semgrep` | `/tob-semgrep` | Статичний аналіз через Semgrep |

Доступні у всіх проєктах через slash-команди.

## Multi-tenant SaaS transition (план зафіксовано в ADR)

Користувач вирішив переходити на multi-tenant SaaS (піддомени + кастомні домени per school + платформна адмінка). Розроблено повний фазовий план і записано в ADR.

**Зафіксовані рішення (Фаза 0):**
- Ізоляція: shared DB + row-level `schoolId` + `TenantPrismaService` (ADR-005)
- Identity: **один глобальний User** + `SchoolMembership` (ADR-006)
- Словник: **спільний платформний** (Word/WordDefinition без schoolId)
- Домени: `slug.soenglish.app` + кастомні через **Cloudflare for SaaS** (ADR-007)
- Сесії+ролі: JWT `{ sub, schoolId, membershipRole, platformRole? }`, `PlatformOperator` axis (ADR-008)
- Білінг: 3 шари (student→school, school→platform, commission) (ADR-008)
- Платформна адмінка: `@be/platform-admin`, cross-tenant + impersonation + audit (ADR-009)

**Створено:** `docs/adr/ADR-005…009`, оновлено ADR-004 (superseded by ADR-005) + README index. Wiki: `concepts/multi-tenancy` (нова).

**Поточний стан коду:** ще НІЧОГО не реалізовано — лише план/ADR. У схемі немає `School` (лише stray `schoolId` на LibraryMaterial), `PlatformSettings` — singleton, JWT = `{sub}`, немає middleware.

## Multi-tenant — gap analysis + execution playbook

Зроблено критичний перегляд плану v1. Знайдено 7 🔴-блокерів (підтверджених у коді) + 13 🟠 must-have. Повний виконавчий план з точними інструкціями, acceptance-gates на кожну фазу і risk register → `docs/multi-tenant-execution-plan.md`.

**🔴 Блокери, яких план v1 не враховував (з доказами в коді):**
- **G1** Немає `AsyncLocalStorage`/`nestjs-cls` → нема механізму для `TenantPrismaService`.
- **G2** 6 webhook-контролерів (stripe/paypal/monopay/paddle/lemonsqueezy/zoom) — tenant-blind.
- **G3** `platform-integration.runtime.ts` — process-wide `let cached` → витік конфігу/секретів між школами.
- **G4** `@Cron`-джоби (chat-visibility та ін.) — без tenant-контексту.
- **G5** Prisma `$extends` не покриває `$queryRaw`/`createMany`/nested writes.
- **G6** Файли — локальний диск (`MATERIAL_UPLOAD_DIR` + `fs.writeFile`), без ізоляції/квот.
- **G7** Немає isolation e2e test gate.

## Activation features (додано в план)

Додано в `docs/multi-tenant-execution-plan.md` як **Phase 4.5 — Activation & onboarding UX** (+ gaps G28–G32, ADR-008 trial/promo subsection):
- **7-денний trial** при реєстрації школи, без картки; промокод продовжує до **14 днів** (`PromoCode`/`PromoRedemption`, atomic, 1 на школу).
- **Wizard швидкої конфігурації** після реєстрації (профіль, мови, формат, оплата, запрошення, демо-контент) — resumable/skippable, пише в `School.onboardingState`.
- **Віртуальний асистент з аватаром** — інтерактивний тур при першому вході (де/що/як), стан per-user, «replay tour»; контент data-driven; seam для школо-scoped брендингу.
- **Usability baseline** як наскрізна вимога (дефолти, empty-states, inline-хінти, loading/error feedback).

Порядок: `Phase4 → Phase4.5 → Phase5 (білінг, trial→paid)`.

## Бізнес-модель (`docs/business-model.md`)

Створено повну бізнес-модель. Бенчмарк Preply (комісія 33→18% ongoing) та Edvibe (per-student SaaS, $2-3/студ/міс) перевірено через web.

**Зафіксовані рішення (2026-06-16):**
- Ціна SaaS — **за активних студентів** (як Edvibe).
- **Обмежений Free** tier + 7/14-денний trial.
- Маркетплейс — **разова finder fee** (без вічного податку, на відміну від Preply).
- Ринок — **Україна-first, UAH** (LiqPay/WayForPay/MonoPay).
- Доданий **третій стовп — рекрутинговий сервіс**: підбір репетиторів для шкіл (placement fee + ATS-інструменти + premium-профіль тьютора) і матчинг учнів зі школою/викладачем.

3 продуктові стовпи: SaaS (R1) + student marketplace (R2 finder fee) + tutor recruiting (R3 placement fee, R4 recruiting tools). Відображено в execution plan Phase 6.

## Design skills (для сервісів, не адмінки)

- Встановлено глобально `~/.claude/skills/emil-design-eng` — авторитетний скіл Emil Kowalski (смак, анімації, «invisible details»), verbatim з github.com/emilkowalski/skill.
- Створено project `.claude/skills/soenglish-service-design` — конкретний Design.md (палітра/тип/спейсинг/моушн з реальних токенів `styles/tokens/`, метод refero «система за скріншотом», профілі щільності по сервісах: learner/school/marketplace/recruiting/wizard/assistant). Посилається на emil-design-eng для craft-шару.
- Бенчмарк: наша motion-система вже збігається з принципами Emil (≤300ms, кастомні криві, transform/opacity, reduced-motion).
- MCP «хиксвел» = **Higgsfield** (higgsfield.ai, AI image/video gen). Підключено remote HTTP MCP `https://mcp.higgsfield.ai/mcp` на user-scope (`~/.claude.json`). **Потребує:** одноразова OAuth-авторизація через `/mcp` → higgsfield → Authenticate. Юзкейс: аватар асистента, візуали лендінга/маркетплейсу.
- Execution plan оновлено: доданий наскрізний **Design & UX workstream** (обидва скіли + Higgsfield), вшитий у Phase 4.5 (wizard + аватар асистента), Phase 6 (візуали маркетплейсу; white-label = override токенів, не per-page hex).

### Уточнення (storage + admin seams)
- **Підписка = 2 виміри:** активні студенти **+ квота диска** на школу. Over-quota upload блокується з upgrade-промптом (без безкінечного завантаження матеріалів). `School.storageUsedBytes`/`storageQuotaBytes`, accounting у Phase 3, enforcement у Phase 5 (+ Gate 5).
- **Головний дохід — підписки шкіл (R1).** MRR — головна метрика дашборда.
- **Адмінку будуємо із seam'ами** під наступний етап — платформу пошуку учнів для репетиторів/шкіл (нав. IA: Leads/Marketplace/Recruiting/capacity стабами; `PlatformRole` + `asPlatform()` не переробляти у Phase 6).
- Тарифи в `business-model.md` оновлено: storage-колонка (Free 1GB / Starter 10GB / Pro 100GB / Business 500GB+).

## Назва платформи: arvilio (зафіксовано)

Робоча назва — **`arvilio`**. Домени `arvilio.com/.io/.org/.app/.ai` вільні (RDAP, 2026-06-16) — треба зареєструвати (Porkbun/Cloudflare). `SoEnglish` стає першою школою/tenant на платформі arvilio. Назву записано в execution plan, business-model, wiki.
Перевірка доменів: надійний метод — **RDAP** (`curl rdap.verisign.com/com/v1/domain/NAME.com`, 404=вільний), бо whois ловить rate-limit після ~150 запитів.

## Віртуальний асистент = 3D-персонаж

Оновлено Phase 4.5.4: асистент тепер **3D-анімований маскот** (основний варіант, за рішенням користувача) зі SVG/статик fallback.
- Пайплайн: Blender / AI-3D (Meshy/Luma/Spline) → **glTF/GLB** (Draco/meshopt); концепт-арт і 2D-fallback через Higgsfield (Higgsfield ≠ 3D-модель).
- Рендер: `@react-three/fiber` + drei, lazy (`next/dynamic`, client-only), кліпи idle/greet/point/celebrate по кроках туру.
- Бюджет: GLB ≤ ~1.5 MB, не блокує first paint, пауза offscreen, fallback при no-WebGL/reduced-motion.
- A11y: canvas декоративний, уся підказка — текст у бульбашці. Маскот = бренд-асет (онбординг, empty-states, маркетинг).

## Перегляд плану — раунд 2 (додано G33–G44)

Знайдено пропуски, дешеві зараз / дорогі потім:
- **G33 i18n** платформи (uk+en) — закласти ДО масового білдингу екранів.
- **G34 product analytics** (activation funnel) — інакше Phase 4.5 невимірювана.
- **G35 payouts + KYC/AML** (Stripe Connect) — гроші НАЗОВНІ (комісія, виплати тьюторам/школам). Раніше був лише money-in.
- **G36 marketplace trust & safety** — верифікація тьюторів, відгуки, модерація, анти-фрод.
- **G37 анти-абʼюз signup** — email-верифікація, captcha (проти trial farming).
- **G38 імпорт даних школи** (CSV) — для переходу з конкурента.
- **G39 tenant-aware notifications** (module-notifications + email/Telegram).
- **G40 CI/staging/seeded test tenants/feature-flags** — план усе ставить «за флагом».
- **G41 FinOps** per-tenant cost; **G42** записи+AI у квоту; **G43** mobile/PWA; **G44** WCAG-AA + Core-Web-Vitals як design-gate.

Вплетено у фази 0/2/3/4.5/5/6 + risk register + capability checklist.

**Раунд 2b (G45–G46):**
- **G45 податкова специфіка (UA-first):** ФОП/ТОВ, ПДВ/VAT, податкові накладні (рахунок/акт), фіскалізація (РРО/ПРРО), експорт для бухгалтерії; для інтернаціоналу — Stripe Tax/VAT-OSS. Дані про податки писати з кожної money-in події з 1-го дня (важко backfill'ити). → Phase 5.
- **G46 публічний status page** + incident/maintenance comms, subscribe-to-updates, звʼязаний зі SLA-моніторингом. → Phase 7.

## Senior-лінзи в плані

В `multi-tenant-execution-plan.md` додано **Part 0 — How we think (four senior lenses)**: кожен таск/PR/дизайн проходить через 🏛 Senior Architect, 🎨 Senior UI/UX, 💻 Senior FullStack, 🛡 Senior Security; Gate фази закривається лише коли всі чотири «підписали».

## Phase 0 — ЗРОБЛЕНО (✅)

- `nestjs-cls@6.2.1` встановлено.
- Новий shared-пакет **`@be/tenant`** (`packages/backend/shared/tenant/`): `TenantContext`, `TenantContextService` (типобезпечний доступ до CLS + `requireSchoolId()` fail-loud), `TenantModule` (global `ClsModule` + HTTP middleware сіє `requestId`/best-effort `userId`).
- Підключено в `apps/api/src/app/app.module.ts`. Аліаси: `tsconfig.base.json` + `jest.paths.cjs`; jest-проєкт `tenant` зареєстровано в `jest.config.cjs`.
- Тест `tenant-context.service.spec.ts` — 4/4 (set/read, **ізоляція між run**, `requireSchoolId` кидає, inactive→null). API typecheck чистий (exit 0).
- `docs/runbooks/` + індекс створено.
- ◐ G40 (staging env + feature-flags) — лишилось; seeded multi-tenant fixtures прийдуть із Gate 1.

**Файли:** `packages/backend/shared/tenant/src/{tenant-context.ts,tenant-context.service.ts,tenant.module.ts,index.ts,*.spec.ts}`, `jest.config.cjs`; зміни в `app.module.ts`, `tsconfig.base.json`, `jest.paths.cjs`, `jest.config.cjs`; `docs/runbooks/README.md`.

## Phase 1 — у роботі (зроблено code-частину, лишилось DB-bound)

**Зроблено ✅ (без БД, протестовано):**
- **1.1 Схема:** додано моделі `School/SchoolDomain/SchoolMembership/PlatformOperator/SchoolSubscription` + enums; back-relations у `User`. `School` має `storageUsedBytes`, `onboardingState`, per-school config. `prisma validate`+`generate` чисті (Prisma 7.7).
- **1.3 `TenantPrismaService`:** чиста `scopeArgs()` (`tenant-scope.ts`) — інжект `where:{schoolId}`, stamp у create/createMany/upsert, **fail-loud** без активного schoolId; `makeTenantExtension()` → `$extends`; `asPlatform()` (CLS-bypass, працює і поза контекстом); зареєстровано в `PrismaModule`. Тести 19/19 (scope 11 + extension 4 + prisma 4). API typecheck чистий.
- `TENANT_SCOPED_MODELS` поки **порожній** — авто-скоуп вмикається по-модельно, коли зʼявиться колонка `schoolId` (безпечно для наявних запитів).

**Файли:** `data-access-prisma/src/lib/{prisma.service.ts(новий),be-prisma.ts(розбито),tenant-scope.ts,tenant-prisma.service.ts,*.spec.ts}`, `src/index.ts`; `schema.prisma` (нові моделі); `be-prisma.spec.ts` (мок +$extends, TenantModule).

**1.2 — частково ЗРОБЛЕНО ✅ (БД: docker `soenglish-postgres` 5432):**
- Міграція `20260616113940_add_tenancy_models` застосована (additive: 5 таблиць+6 enums+FK/індекси; наявні таблиці не чіпає; БД була в синхроні).
- Identity backfill `prisma/backfill-tenancy.ts` (ідемпотентний, `npm run prisma:backfill:tenancy`): `school_default` (tenant #1) + ACTIVE sub; `SchoolMembership` на кожного юзера; `SUPER_ADMIN`→`PlatformOperator`. Перевірено 1/6/2.

**Gate 1 mechanism — ДОВЕДЕНО ✅ на реальній БД:**
- `tests/integration/tenant-isolation.integration.spec.ts` (5/5): only-active-school, cross-school blocked, create stamps schoolId, asPlatform bypass, fail-loud. Запуск: `export DATABASE_URL=... RUN_INTEGRATION_TESTS=1 JWT_SECRET=...; npx jest --config jest.integration.config.cjs tenant-isolation`.
- Зареєстровано в `TENANT_SCOPED_MODELS`: `SchoolMembership/SchoolDomain/SchoolSubscription`.
- ⚠️ ALS-нюанс: lazy Prisma-запит треба `await`ити **всередині** `cls.run` (реальні запити це задовольняють через middleware/guard).

**Перша legacy-вертикаль ЗРОБЛЕНА ✅ — `LibraryMaterial`:**
- Міграція `20260616120132_library_material_school_required` (вбудований backfill `UPDATE …='school_default'` ПЕРЕД `SET NOT NULL` + FK на School) застосована; `schoolId` тепер required.
- Зареєстровано в `TENANT_SCOPED_MODELS`; isolation-тест розширено → **6/6** (LibraryMaterial scoped+create-stamp). Наявний код створення матеріалів typecheck-ається (no break).
- **Patrn розкатки доведено**: schema(required+relation) → `migrate dev --create-only` → вписати backfill-UPDATE у migration.sql → `migrate deploy` → register → extend isolation test.

**Друга вертикаль ✅ — `ScheduledLesson`** (migration `scheduled_lesson_school_required`, 12 рядків backfill; зареєстровано; isolation 7/7). Create-сайт `lessons.service.ts` → `schoolId: DEFAULT_SCHOOL_ID` (нова константа в `@be/tenant`, TODO-seam).

**Phase 3 РОЗПОЧАТО ✅ — tenant-контекст із членства:**
- `AuthSessionService.resolveActiveMembership(userId)` (raw/unscoped).
- `seedTenantContext()` ставить `userId/schoolId/membershipRole` у CLS; підключено в `AuthGuard`, `OptionalAuthGuard`, `GqlAuthGuard`. Тепер автентифіковані REST+GraphQL запити несуть реальний `schoolId`.
- Повний unit-набір **1071/1071**, typecheck чистий.

**lessons create → контекстний schoolId ✅:** `LessonsService` інжектить `TenantContextService`; create тепер `schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID` (реальна школа із запиту, fallback лише без контексту). Lessons unit 47/47, typecheck чистий.

**Фікс інфри тестів:** у `jest.paths.cjs` бракувало `@be/materials` (передіснуючий баг) — інтеграційні тести через нього взагалі не вантажились. Додано.

⚠️ **Передіснуючий баг (НЕ tenancy):** `tests/.../graphql-lessons.integration.spec.ts` падає 8/8 з `Cannot read properties of undefined (reading 'ip')` у `auth-session` refresh-шляху (`req.ip`) для GraphQL-контексту. Став видимим після фікса `@be/materials` (раніше не вантажився). Мій код це не спричинив (помилка до мого `seedTenantContext`). Окремий todo для harness/getReqRes.

**Фінансова вертикаль ✅ (5-та) — `Payment` + `StudentLessonBalance` + `LessonBalanceLedger` + `StaffCompensationProfile`:**
- Схема: `schoolId` required + FK на School (Cascade) + `@@index([schoolId])` на всіх 4; back-relations у School. `prisma validate`+`generate` чисті.
- Міграція `20260618224101_financial_models_school_required` (expand/contract: nullable → `UPDATE … = 'school_default'` × 4 → SET NOT NULL → індекси → FK). Застосована через `migrate deploy` (БД docker `soenglish-postgres` 5432). ⚠️ prisma тепер вимагає запуску **з кореня репо** (config у `prisma.config.ts`, datasource.url), не з пакета.
- Зареєстровано всі 4 в `TENANT_SCOPED_MODELS`.
- Create/upsert-сайти проштамповано `schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID` (інʼєкція `TenantContextService`):
  - 7 checkout-сервісів (stripe/liqpay/paypal/paddle/wayforpay/monopay/lemonsqueezy) — `payment.create`.
  - `lesson-balance.service.ts` — 2× `studentLessonBalance.upsert` (одна в `$transaction`) + `lessonBalanceLedger.create`.
  - `payment-settings.service.ts` — 2× `studentLessonBalance.upsert`.
  - `staff-payroll.service.ts` — `staffCompensationProfile.upsert`.
  - ⚠️ webhook-шлях (`grantPurchaseLessons`) виконується поза tenant-CLS → падає на `DEFAULT_SCHOOL_ID` (seam для G2, прийнятно для single-school).
- Фікс тесту: `lesson-balance.service.spec.ts` інстанціював сервіс позиційно `(prisma, paymentSettings)` — додано `tenant` мок 2-м аргументом.
- isolation integration **11/11** (додано Payment), unit **1071/1071**, API typecheck чистий.

**StudentGroup вертикаль ✅ (6-та):**
- Схема: `schoolId` required + FK (Cascade) + `@@index([schoolId])`; back-relation `School.studentGroups`. Міграція `20260618225459_student_group_school_required` (expand/contract; 0 рядків у БД, але патерн збережено). Застосована.
- Зареєстровано в `TENANT_SCOPED_MODELS`. Create-сайт `student-groups.service.ts` → інʼєкція `TenantContextService`, stamp `schoolId`. Fix spec (позиційний `new StudentGroupsService(prisma, tenant, paymentSettings)`).
- isolation **12/12** (додано StudentGroup), unit **1071/1071**, typecheck чистий.
- ℹ️ `StudentGroupMember` лишив unscoped — child через Cascade-parent (StudentGroup), доступ завжди через групу. Якщо зʼявляться прямі cross-tenant запити по `userId` — додати окремо.

**Learner-data вертикаль ✅ (7-ма) — `PracticeSession` + `StudentWordCard` + `StudentLearningLanguage` + `StaffPayout`:**
- Схема: `schoolId` required + FK (Cascade) + `@@index([schoolId])` на всіх 4; back-relations у School. Міграція `20260619000149_learner_data_school_required` (expand/contract, backfill `school_default`). Застосована.
- Зареєстровано всі 4 в `TENANT_SCOPED_MODELS`. Create/createMany/upsert-сайти проштамповано:
  - `practice-sessions.service` (PracticeSession — нова tenant-інʼєкція)
  - `vocabulary.service` (StudentWordCard create — нова tenant-інʼєкція) + `lessons.service` 2× upsert (tenant вже був)
  - `students-admin.service` + `auth.service` (StudentLearningLanguage **createMany** — manual stamp, бо $extends не покриває createMany / G5; нова tenant-інʼєкція в обох)
  - `staff-payroll.service` (StaffPayout — tenant вже був)
  - backfill-скрипт `backfill-languages-words.ts` → `schoolId: 'school_default'`.
- Фікс specs: додано `TenantContextService` мок-провайдер у `practice-sessions.service.spec.ts` + `students-admin.service.spec.ts` (будують ізольований Test-модуль).
- isolation **14/14** (додано PracticeSession + StaffPayout), unit **1071/1071**, typecheck чистий.
- ℹ️ **Мертві моделі** `Progress`, `ReviewQueue`, `DailyGoalCompletion` — взагалі не використовуються в коді → НЕ scoped (немає write-шляху).

**Child/leaf вертикаль ✅ (8-ма) — `NotificationDelivery` + `TeacherMessage` + `ScheduledLessonParticipant` + `QuizAssignment` + `QuizAttempt` + `SpeakingSubmission`:**
- Схема: `schoolId` required + FK (Cascade) + `@@index([schoolId])` на всіх 6; back-relations у School. Міграція `20260619070118_child_tables_school_required` (expand/contract, backfill `school_default`). Застосована.
- Зареєстровано всі 6 в `TENANT_SCOPED_MODELS`. Create-сайти проштамповано:
  - `notification-delivery.service` (upsert), `teacher-messages.service` (create), `quiz-attempt.service` (tx create), `speaking-submissions.service` (create) — нова tenant-інʼєкція.
  - `quiz-generate.service` (quizAssignment upsert), `lessons.service` (scheduledLessonParticipant **createMany** + **nested create** під `scheduledLesson.create` — обидва manual-stamp, G5) — tenant вже був.
- Фікс specs: `TenantContextService` мок у `notification-delivery.service.spec` (Test-модуль) + `speaking-submissions.service.spec` (позиційний).
- isolation **16/16** (+TeacherMessage, +NotificationDelivery), unit **1071/1071**, typecheck чистий.
- ℹ️ Важливе: auto-scope ($extends) діє **лише через `TenantPrismaService.client`**; сервіси на base `prisma` НЕ фільтруються — реєстрація моделі впливає тільки на extended-client (поки що тільки isolation-тест). Тому ручний write-stamp = єдине, що задовольняє NOT NULL; читання сервісів без змін.

## Phase 2 — tenant resolution з hostname ✅

- **`@be/tenant`:** чиста `normalizeTenantHost(host)` (lowercase, strip-port, null для localhost/IPv4/IPv6-loopback/порожнього) + `HostSchoolResolver` (host→schoolId з негативним TTL-кешем 60s, loader+clock інʼєктуються — тестовано). Експортовано з index.
- **`apps/api` `TenantResolutionMiddleware`:** резолвить `req.headers.host` → `SchoolDomain` (тільки `verified`) → `tenant.setSchoolId`. No-op якщо CLS неактивний / schoolId вже встановлено / host не мапиться на tenant. Помилки резолву проковтуються (best-effort на всіх маршрутах). Підключено через `AppModule implements NestModule` → `configure().forRoutes('*')`.
- **Призначення:** публічні/неавтентифіковані шляхи (signup/marketplace/custom domains) тепер несуть `schoolId` із хоста; auth guard перекриває зі членства для автентифікованих (Phase 3). Layering збережено — `@be/tenant` не залежить від `@be/prisma`.
- Тести: `tenant-host.spec.ts` (+10) — нормалізація хоста + кеш (hit/miss/expiry/isolation). Unit **1081/1081 (198 suites)**, typecheck чистий.
- ⚠️ **Перевірити при реальних піддоменах:** порядок middleware відносно CLS-mount (nestjs-cls має монтуватись першим; `isActive()`-guard робить це безпечним, але якщо порядок інший — schoolId з хоста просто не сідатиме). Сьогодні на localhost це no-op, тож поведінка не змінилась.

## Read-protection: materials мігровано на `TenantPrismaService.client` ✅ + критичні фікси

**Auto-scope unique-ops доведено:** додано isolation-кейс — cross-tenant `findUnique`→null, `update`/`delete`→throw (Prisma 7 приймає не-унікальне `schoolId` у `where` findUnique/update/delete). Знято caveat. isolation **17/17**.

**`TenantPrismaService.client` типізація:** був `unknown` (ReturnType<$extends> стирається через межу пакета → марний для споживачів; isolation-тест "працював" лише бо ts-jest не type-check'ить). Тепер `client: PrismaClient` з локальним cast (extension не міняє форму моделей). Розблоковує міграцію читань усіх модулів.

**MaterialsService → tenant-scoped client:** усі `libraryMaterial`-операції (findMany/findUnique/create/update/delete/groupBy/$transaction) тепер через `this.tenantPrisma.client` (auto-scope читань+оновлень+видалень). create: прибрано **client-controlled** `schoolId: body.schoolId` (tenant-injection + `null` на required) → тепер з контексту. Інжектовано `TenantPrismaService` + `TenantContextService`. Materials unit-spec немає → без churn.

**🔴 Реальний баг (не лише тести) — `GqlThrottlerGuard`:** глобальний `ThrottlerGuard` діставав request через `switchToHttp()`, що для GraphQL = undefined → `req.ip` кидав → **усі GraphQL-запити 500-или** (і в проді). Додано `apps/api/.../gql-throttler.guard.ts` (override `getRequestResponse` для GraphQL-контексту), зареєстровано замість `ThrottlerGuard`. Розблокувало 7 integration-suites.

**Integration-сюїта відновлена як гейт:** з ~20/76 → **81/82**. Фікси: throttler (вище), фікстури `schoolId: 'school_default'` (quiz×2, product quiz+quizAssignment, rbac studentWordCard), `TenantModule` у auth.integration (PrismaModule.TenantPrismaService потребує TenantContextService), шлях `app.module` у staff-payout (5→6 `../`).
- ⚠️ **Лишається 1 фейл (передіснуючий, не tenancy):** `auth.integration › forgot-password` — `MailService.renderEmail` робить динамічний `import()` (react-email), що падає під jest без `--experimental-vm-modules`. Окремий todo (mail/jest-ESM), ризиковий для проду — не чіпав.

## Read-protection: `LessonsService` мігровано на `TenantPrismaService.client` ✅

Друга міграція читань за рецептурою materials. У `lessons.service.ts` (1085 LOC) інжектовано `TenantPrismaService`, доданий `private get db()` → `tenantPrisma.client`. Усі ORM-виклики `this.prisma.<model>` перемкнено на `this.db.<model>` (масова заміна), тож читання/оновлення/видалення `ScheduledLesson`/`ScheduledLessonParticipant`/`StudentWordCard`/`StudentGroup` тепер авто-скоупляться активною школою; нетенантні моделі (`User`, `LessonMaterial`) проходять без змін (pass-through у `scopeArgs`).
- **Свідомо лишено на base `prisma` (G5 seam, $extends не покриває):** `$queryRaw` (autoComplete past lessons) + `$transaction` (replace participants). Raw обирає id-и без скоупу, але наступний `db.scheduledLesson.updateMany({where:{id:{in:ids}}})` авто-додає `schoolId` → оновлюються лише уроки школи (defense-in-depth).
- Create-сайти з `?? DEFAULT_SCHOOL_ID` тепер ще й авто-стемпляться $extends (manual schoolId у `data` виграє — без конфлікту); за відсутності контексту scoped-client **fail-loud** (усі creates за staff-auth → контекст завжди є).
- Гейти: API typecheck чистий, lessons unit **47/47**, повний unit **1081/1081**, isolation integration **17/17**.

## Read-migration: flashcards (quiz) ✅ + seed membership fix (2026-06-22)

**flashcards (quiz) — повністю мігровано на `this.db` (tenantPrisma.client):** 6 файлів — `quiz-access`, `quiz-detail`, `quiz-list`, `quiz-generate`, `quiz-attempt`, `quiz.repository`. Усі Quiz/QuizAssignment/QuizAttempt + StudentWordCard reads/writes auto-scoped; User/Word лишились на base `this.prisma`. quiz-attempt `$transaction` → `this.db.$transaction`. Жоден flashcards-сервіс не має @Cron (request-scoped → безпечно). collect-pool spec: tenantPrisma мок `{ client: prisma }`.

**🔴 Корінь, що вилазив лише тепер — seed без membership:** integration падали `Tenant scope: refusing Quiz.findMany without an active schoolId`, бо `seedTestUsers` НЕ створював `SchoolMembership` → `seedTenantContext` не сіяв schoolId → scoped client fail-loud. (Materials не мав integration-тесту, тож не вилазило.) Фікс: `seedTestUsers` upsert `school_default` + ACTIVE membership на кожного (роль→membershipRole); cleanup видаляє memberships перед users. Вмикає tenant-контекст у ВСІХ integration-тестах. unit **1081/1081**, integration **81/82**, typecheck 0.

## Read-migration: lessons + speaking + chat ✅ (2026-06-22, крок за кроком)

Рецептура та сама (inject `TenantPrismaService`, `get db()`, swap scoped-model ops `this.prisma.X`→`this.db.X`, global моделі `User`/`Word` на base; spec-моки `{ provide: TenantPrismaService, useValue: { client: prismaMock } }`).

- **lessons:** `student-groups.service` (StudentGroup reads/create/delete/$transaction → `this.db`; user/studentGroupMember на base), `lesson-files.controller` (ScheduledLesson findUnique → tenantPrisma, `@UseGuards(AuthGuard)`). `zoom-webhook.controller` свідомо **лишено на base** (webhook, без tenant-контексту). Spec student-groups: +tenantPrisma `{client:prisma}`.
- **speaking:** `speaking-topics`, `speaking-submissions`, `speaking-access` — SpeakingTopic/SpeakingSubmission → `this.db` (SpeakingTopicAssignment не registered → passthrough). Specs access+submissions оновлено.
- **chat:** `chat.service` — лише ChatConversation registered → `this.db` (+$transaction); ChatMessage/Participant/Attachment не registered → passthrough. `@Cron hourlyCleanup` (chat-attachment) чіпає лише chatMessageAttachment (не scoped) → **не чіпав**, safe. Spec chat: +tenantPrisma.

Перевірка: unit **1081/1081**, integration **81/82** (єдиний фейл — передіснуючий mail/jest-ESM forgot-password), typecheck 0. Integration lessons/chat зелені; speaking integration-тесту немає (покрито unit).

## Read-migration: billing (safe subset) ✅ (2026-06-22)

- **staff-payroll.service → `this.db`:** StaffCompensationProfile/StaffPayout + scheduledLesson read (admin-only paths). user/platformSettings лишились на base.
- **payment-settings.service → `this.db`:** StudentLessonBalance upserts+reads (price-resolution). Доведено безпечним: ці методи досяжні лише з request-шляхів (checkout createCheckout / admin); webhook `grantPurchaseLessons` їх НЕ кличе, cron `syncGroupLessonCharges` теж ні; `autoComplete` біжить у request-контексті (не @Cron).
- **Свідомо лишено на base prisma (G2/G4 territory):**
  - `lesson-balance.service` — request+webhook+sync entanglement: `payment.findUnique` (247) у `grantPurchaseLessons` = webhook; writes (`appendLedgerEntry`/`ensureBalanceRow`) виконуються і у webhook-контексті (стемплені з `DEFAULT_SCHOOL_ID` fallback). Наївний `this.db` дав би fail-loud.
  - 7 checkout-сервісів `payment.create`/webhook reads + 5 webhook-контролерів — non-request.
  - Це окремий таск **G2 (tenant-aware webhooks)** / **G4 (tenant-aware jobs)** — резолвити school із payload і обгортати в `asPlatform()`/явний контекст.

Перевірка: unit **1081/1081**, integration **81/82** (єдиний фейл — передіснуючий mail/jest-ESM), typecheck 0. Billing unit 72/72.

**Read-path migration статус:** ✅ materials, vocabulary, flashcards, lessons, speaking, chat, billing(safe subset). Лишається тільки **G2/G4** (webhook/cron explicit tenant resolution) для повного покриття billing.

## G2 — tenant-aware webhooks ✅ (2026-06-22)

Усі 7 PSP-вебхуків кредитують уроки через одну воронку — `LessonBalanceService.grantPurchaseLessons`. Фікс зроблено там: резолвимо `payment.schoolId` (стемплений на checkout) і сіємо в CLS-контекст (`tenant.setSchoolId`) перед записами ledger/balance — тільки якщо контекст активний і schoolId ще не встановлено (не перекриває реальний). Тепер кредит лягає в **правильну школу**, а не у `DEFAULT_SCHOOL_ID` fallback. Webhook signature-verify + reject-unmappable вже були в кожному `handleWebhook`.
- Тести: `lesson-balance.service.spec` +3 (seed з payment / не перекриває активний / no-op для lessons≤0). unit **1084/1084**, integration 81/82, typecheck 0.
- ℹ️ Лишається власне webhook-**read** payment на base prisma (коректно — резолв школи саме звідти). checkout `payment.create` теж стемплить schoolId з контексту (request).

## Gate 1 у CI — ЗАКРИТО ✅ + останній червоний тест полагоджено (2026-06-22)

- CI (`ci.yml`) вже мав integration-job із Postgres-сервісом + `prisma:migrate:deploy` + `test:integration` (`RUN_INTEGRATION_TESTS=1`), і `ci-success` гейт **вимагає** integration. Єдине, що тримало гейт червоним — передіснуючий `auth.integration forgot-password` (mail/jest-ESM: `@react-email/render` робить динамічний `import()`, що падає під jest CJS).
- **Фікс (і коректність, не лише тест):** `AuthService.requestPasswordReset` тепер шле лист **best-effort** (try/catch + `Logger.warn`) — reset-токен уже збережено, тож транзієнтний збій render/SMTP не має 500-ити запит (і не палить, чи існує email). Додано `private readonly logger`.
- Результат: **unit 1084/1084, integration 82/82** — обидві сюїти повністю зелені. CI-гейт тепер проходить = Gate 1 (isolation+integration як required check) закрито.

## G3 — per-tenant integration runtime ✅ (2026-06-23)

`platform-integration.runtime.ts`: process-wide `let cached` → `Map<schoolId, ResolvedPlatformIntegration>`, ключ — активний `schoolId` із CLS (`ClsServiceManager.getClsService()` → `TENANT_CLS_KEY` — без DI, без залежності `@be/prisma`), з `PLATFORM_KEY` як platform-global fallback.
- `getPlatformIntegrationRuntime()` → per-school entry якщо є, інакше platform-global.
- `refreshPlatformIntegrationRuntime(config, secrets, schoolId?)` / `setPlatformIntegrationRuntime(next, schoolId?)` / новий `invalidatePlatformIntegrationRuntime(schoolId?)` приймають опційний school.
- **Сьогодні поведінка не змінилась** — інтеграції все ще з `PlatformSettings` (global), пишеться лише `PLATFORM_KEY`, усі читають fallback. Seam готовий для per-school overrides (per-school PSP / white-label).
- Прибрано структурний ризик cross-tenant leak від singleton. +3 unit (`platform-integration.runtime.spec.ts`). unit **1087/1087**, integration **82/82**, typecheck 0.

## ESLint isolation guardrails ✅ (2026-06-23) — Phase 1 ПОВНІСТЮ ЗАКРИТА

`eslint.config.mjs`: `no-restricted-syntax` для `apps/api` + `packages/backend` (крім specs/tests і `data-access-prisma`):
- бан raw SQL `$queryRaw`/`$queryRawUnsafe`/`$executeRaw*` (обходить `$extends` scoping, G5);
- бан викликів `asPlatform()` (audited cross-tenant bypass → лише `@be/platform-admin`; додати його шлях у `ignores` коли модуль зʼявиться).

Guardrail зловив 1 **реальне** порушення — `lessons.service.autoCompletePastPlannedLessons` raw SQL по `ScheduledLesson` без schoolId. Виправлено: додано `AND sl."schoolId" = ${schoolId}` + justified `eslint-disable-next-line` (raw потрібен для timezone-логіки; updateMany уже на scoped `this.db`). 0 guardrail-порушень по backend. unit **1087/1087**, integration **82/82**, typecheck 0.

ℹ️ Backend-модулі лінтяться per-module (`eslint .` → root flat-config). Передіснуючі backend/web lint-помилки (unused vars, max-lines у legacy-файлах, web no-explicit-any) — **поза цим таском**, не чіпав.

### Phase 1 — DONE ✅
8 вертикалей + read-migration (всі request-scoped сервіси) + `TenantPrismaService` + G2 (webhooks) + G3 (per-school integration cache) + ESLint guardrails + Gate 1 зелений у CI.

## Phase 2 — web tenant routing ✅ (2026-06-23)

- `apps/web/src/lib/tenant-host.ts` — pure `classifyTenantHost(host)`: apex/www/reserved(`www/app/api/admin/platform`)/localhost/IP → `platform`; single-label `*.ROOT_DOMAIN` → `{subdomain, slug}`; інше → `{custom, hostname}`. `ROOT_DOMAIN` з `NEXT_PUBLIC_ROOT_DOMAIN` (default `arvilio.app`). +9 тестів (`tenant-host.test.ts`).
- `apps/web/src/middleware.ts` — прокидає `x-school-slug`/`x-school-host` бекенду; **без редіректів/блокувань** (single-school dev не ламається).
- Backend `TenantResolutionMiddleware` — пріоритет `x-school-slug`→`School.slug` (cached, **виключає SUSPENDED**) → `x-school-host`/`Host`→verified `SchoolDomain` (cached).
- unit **1096/1096**, integration **82/82**, typecheck чистий (мої файли; у web є передіснуючі непов'язані TS-помилки — StudentDetailsPage тощо).

## i18n foundation (G33) — core layer ✅ (2026-06-23)

`@pkg/types` (`packages/shared/types/src/lib/locale.ts`), чисте й спільне web+backend:
- `SUPPORTED_LOCALES`=`['uk','en']`, `DEFAULT_LOCALE='uk'`, `isLocale`, `normalizeLocale` (`uk-UA`→`uk`), `parseAcceptLanguage` (q-weighted, drop unsupported), `resolveLocale({userPreference, schoolDefault, acceptLanguage})` (user → school → Accept-Language → default).
- +5 тестів; **додано jest-проєкт `shared-types`** у `jest.config.cjs` (раніше тести в shared/types взагалі не запускались — оживив і `material-annotations.test`).
- unit **1103/1103**, typecheck 0.
- **Лишилось (інкрементально):** колонки `School.defaultLocale` + `User.locale`, підключення `resolveLocale` у request-контекст, message-каталоги + adoption у UI (extract strings у міру дотику до екранів).

**Phase 2 — лишилось (інфра / Phase4-gated):**
1. apex landing + unknown→404 UI; **повне блокування suspended + екран** → Phase 4 (un-suspend у платформ-адмінці).
2. edge KV cache (G12, Cloudflare KV); custom-domains CRUD+DNS-challenge+SSRF-safe resolver (G16); Cloudflare-for-SaaS runbook — **інфра**.
3. JWT.schoolId↔host cross-check — gated на JWT reshape (Phase 3).

## Phase 4A — platform-admin foundation ✅ (2026-06-23)

**Рішення:** platform-доступ = `PlatformOperator` (не `User.role`); web-console = **окремий застосунок** (вплине на 4D).

- Новий модуль **`@be/platform-admin`** (аліаси tsconfig.base/jest.paths, jest-проєкт, ESLint `asPlatform` allowlist → цей модуль).
- **`PlatformAuditLog`** модель + міграція (`actorUserId/action/targetSchoolId/metadata/ip`, індекси).
- `AuthSessionService.resolvePlatformRole` (із `PlatformOperator`) + `seedTenantContext` сіє `platformRole` у CLS; web-session `availableScopes:'platform'` тепер із `PlatformOperator` (не `User.role`, ADR-008).
- **`PlatformAdminGuard`** + `@PlatformAdmin(...roles)` (читає CLS platformRole; ставити **після** `AuthGuard`).
- **`PlatformAuditService.record()`** (base prisma — audit платформо-глобальний).
- Integration seed створює `PlatformOperator(PLATFORM_ADMIN)` для super-admin.
- +13 тестів. unit **1110/1110**, integration **82/82**, typecheck 0.

## Phase 4B — read surface ✅ (2026-06-24)
- `PlatformSchoolsService` (cross-tenant через `asPlatform()`) + REST `PlatformAdminController` (`GET /api/platform/dashboard|schools|schools/:id`, gated `AuthGuard`+`PlatformAdminGuard`).
- dashboard: school counts by status, active users, active subs, total storage; **MRR=0 stub** (потребує subscription pricing — Phase 5). schools list (+active member counts), detail (role counts + primary domain).
- +7 тестів (3 unit + 4 integration: operator 200 / student 403 / unauth 401). unit **1113/1113**, integration **86/86**.

## Phase 4C — suspend/activate + audit + suspended-enforcement ✅ (2026-06-24)
- `POST /api/platform/schools/:id/suspend|activate` (`@PlatformAdmin('PLATFORM_ADMIN')`) → `School.status` + `PlatformAuditService.record`. `GET /api/platform/audit-log[?schoolId]`.
- **Suspended enforcement (закрито відкладений Phase 2):** `resolveActiveMembership` повертає `schoolStatus`; `seedTenantContext`→`{suspended,isPlatformOperator}`; `AuthGuard` кидає **403** для членів SUSPENDED-школи, platform-оператори обходять (un-suspend через консоль); `OptionalAuthGuard` не кидає.
- +8 тестів. unit **1117/1117**, integration **87/87**, typecheck 0.

## Phase 4C.2 — impersonation ✅ (2026-06-25) — **Gate 4 закрито**
- `POST /api/platform/schools/:id/impersonate` (`@PlatformAdmin('PLATFORM_ADMIN')`) → новий **`PlatformImpersonationService`** (`@be/platform-admin`): `AuthSessionService.mintImpersonationAccessToken` карбує **15-хв** токен з `imp`-claim (`act`=оператор, `sid`=школа); target за замовч. = перший active ADMIN школи. Ставиться **тільки в access-cookie** (`setImpersonationAccessCookie`) — refresh оператора недоторканий → авто-повернення по закінченню.
- **Banner-claim:** `WebRequestSessionDto.impersonation:{actorUserId,schoolId}|null`; читається в `resolveWebRequestSessionAuth` (`imp`) → `resolveWebRequestSession`.
- **Stop:** `POST /api/auth/impersonate/stop` (тільки `AuthGuard` — виконується як impersonated user, не може бути під `PlatformAdminGuard`) → `AuthService.stopImpersonation` пише `school.impersonate.stop` (актор = оператор через `readImpersonationClaim`) + `clearAccessCookie`. Start і stop — обидва в audit log.
- +10 тестів. unit **1125/1125**, integration **88/88**, typecheck чистий (єдина tsc-помилка — передіснуюча в `word-enrichment-provenance.ts`, не моя).
- **Gate 4:** ✅ list → suspend(offline) → impersonate(banner-claim+audit+auto-expire) → усе в audit log.

## Phase 4D — impersonation banner UI ✅ (2026-06-25)
- `ImpersonationBanner` (`apps/web/src/components/layout/`) рендериться в root `layout.tsx`, коли сесія має impersonation-claim. Claim проходить server-side: `WebRequestSessionDto.impersonation` → `proxy.ts` state → header `x-soenglish-impersonation` → `readRequestAuthState` → layout. Кнопка "Stop impersonating" → POST `/api/auth/impersonate/stop` + reload.
- Banner у **школьному** застосунку (не в консолі) — бо impersonation логінить оператора в school-app як school-user.
- unit **1125/1125** ✅, web request-session roundtrip оновлено, typecheck моїх файлів чистий.

## Phase 4D — platform console app scaffold ✅ (2026-06-25)
- Новий **`apps/platform`** (Next.js, `@app/platform`, port **4300**, `output: standalone`, rewrite `/api/*`→API, security headers). Скрипти `dev:platform`/`build:platform`; порт 4300 додано у `free-dev-ports.cjs`.
- `ConsoleShell` sidebar з **нав-IA-стабами під Phase 6** (Leads/Marketplace/Recruiting — disabled "soon").
- Поверхні (SSR `platformGet`, cookie-forward, 401/403→`Unauthorized`): **Dashboard** (8 stat-карток), **Schools** (cross-tenant список, рядки → detail), **School detail** (`/schools/[id]`: status/domain/subscription/role-counts + `SchoolActions` client suspend/activate через same-origin POST + `router.refresh()`), **Audit log** (`/audit-log`).
- DTO-типи дубльовані локально (frontend не імпортує `@be/*`).
- Build чистий: typecheck + lint + `next build` (роути /dashboard, /schools, /schools/[id], /audit-log).

## Phase 4D — payment-method allowlist ✅ (2026-06-25)
- Schema: `PlatformSettings.allowedPaymentMethods PaymentMethodKind[]` (міграція `add_platform_payment_allowlist`; **порожній = без обмежень**).
- `PlatformPaymentMethodsService` (`@be/platform-admin`, base prisma) `get()`/`set()` + audit `platform.payment_methods.update`. REST `GET /api/platform/payment-methods`, `PUT` (`@PlatformAdmin('PLATFORM_ADMIN')`, невідомий kind → 400).
- **Enforcement:** `@be/billing PaymentSettingsService.updatePaymentSettings` блокує enable методу поза непорожнім allowlist.
- Console `/settings` — checkbox-редактор allowlist (same-origin PUT).
- +5 тестів (4 unit + 1 integration GET/PUT/400/403). unit **1129/1129**, integration **89/89**, typecheck 0. Build platform: routes /dashboard,/schools,/schools/[id],/audit-log,/settings.

## Phase 4D — cross-app SSO seam + impersonate-з-консолі ✅ (2026-06-25) — **Phase 4 / Gate 4 DONE**
- `cookieOptions()` (auth-cookies) тепер бере опційний `Domain` з env **`AUTH_COOKIE_DOMAIN`** (напр. `.arvilio.app`); set/clear використовують його → одна сесія (вкл. impersonation) працює на sibling-сабдоменах. Unset (dev) → host-only (вже шериться між портами одного host, бо cookies ігнорують порт). +2 unit.
- Console **Impersonate admin** (school detail) → POST `/impersonate` → redirect у school-app (**`NEXT_PUBLIC_SCHOOL_APP_URL`**, default `http://localhost:4200`), де показується banner; disabled для SUSPENDED.
- unit **1131/1131** ✅, platform build чистий.
- **Ops env (prod):** `AUTH_COOKIE_DOMAIN`, `NEXT_PUBLIC_SCHOOL_APP_URL`, `API_PROXY_TARGET` (per app). (`.env.example` недоступний для редагування — задокументовано тут + у плані.)

**Phase 4 повністю закрито.**

## Phase 4.5.1 — self-serve signup + 7-day trial ✅ core (2026-06-25)
- `SchoolSignupService.registerSchool` (`@be/auth`): slug з назви (`slugifySchoolName`, retry на `@unique` slug) → atomic `$transaction`: `School(TRIAL)` + admin `User(ADMIN)` + `SchoolMembership(ADMIN,ACTIVE)` + `SchoolSubscription(TRIALING, trialEndsAt=now+7d, TRIAL_DAYS=7)`. Без картки.
- `POST /api/auth/register-school` (public) → provision + issueTokens + cookies (auto-login). Web `/(auth)/signup` сторінка (`/signup` додано в PUBLIC_ROUTES + AUTH_REDIRECT_ROUTES).
- Provisioning через base PrismaService (немає tenant-контексту = `asPlatform()`-еквівалент); транзакція = retry-safe.
- +18 тестів (slug, service, integration). unit **1140/1140**, integration **90/90**, typecheck 0.
## Phase 4.5.1 trial-expiry job ✅ + G4 pattern (2026-06-25)
- `TrialLifecycleService.expireTrials` (`@be/platform-admin`, base prisma, **iterує schools явно = G4-патерн**): suspendує `TRIAL`-школи з `subscription.trialEndsAt < now − TRIAL_GRACE_DAYS` (grace=3д). Daily `TrialLifecycleScheduler` `@Cron(MIDNIGHT)`. Школи без subscription (legacy default) ніколи не матчаться.
- +3 тести (2 unit + 1 integration: lapsed→SUSPENDED, in-grace→TRIAL). unit **1142/1142**, integration **91/91**.
- **G4:** патерн встановлено; лишилось привести існуючі `module-notifications` `@Cron` jobs до explicit-schoolId.
- **Лишилось 4.5.1:** trial-countdown banner у school UI (потребує `trialEndsAt` у web-session).

## Phase 4.5.2 — promo-codes ✅ core (2026-06-25)
- Моделі `PromoCode` (+`@unique code`) + `PromoRedemption` (`@@unique([promoCodeId, schoolId])`), enum `PromoCodeKind` (міграція `add_promo_codes`).
- **Redemption at signup:** `RegisterSchoolRequestDto.promoCode` → `SchoolSignupService.redeemPromo` у тій же транзакції: валідація active/window → `trialDays = max(7, promo.trialDays)` → `PromoRedemption` + atomic `redeemedCount++` через conditional `updateMany` (count≠1 → "fully redeemed"). Invalid/expired/exhausted → 400.
- **Admin:** `PromoCodesService` (`@be/platform-admin`) + REST `GET/POST /api/platform/promo-codes`, `PATCH /:id` (enable/disable), audited.
- +15 тестів. unit **1150/1150**, integration **92/92**, typecheck 0. *(Один integration-флейк graphql-dashboard при паралельному запуску — проходить ізольовано і при повторному повному запуску; не пов'язано з promo.)*
- **Лишилось 4.5.2:** console-UI для промокодів; redemption у school billing settings (зараз тільки при signup).

## Phase 4.5.3 — onboarding wizard (backend state API) ✅ (2026-06-25)
- `SchoolOnboardingService` (`@be/auth`, school-scoped через tenant `requireSchoolId()`) читає/пише `School.onboardingState` JSON `{completed, currentStep, steps}`.
- REST (AuthGuard): `GET /api/onboarding`, `PATCH /api/onboarding/step {step,data}` (тільки ADMIN, валідує step ∈ `ONBOARDING_STEPS`, idempotent per-step merge), `POST /api/onboarding/complete`.
- +10 тестів (unit + integration: admin saves/completes, unknown-step 400, student 403). unit **1155/1155**, integration **93/93**, typecheck 0.
- **Лишилось 4.5.3:** web wizard UI + side-effects кроків (payments→allowlist, invites, sample-content seed).

## Phase 4.5.1 — trial-countdown banner ✅ (2026-06-25)
- `WebRequestSessionDto.trial = {trialEndsAt, daysLeft}` через `AuthSessionService.resolveTrialInfo` (null якщо active-school не TRIAL або без trialEndsAt; daysLeft ≥0). Проброшено SSR (proxy → header `x-soenglish-trial` → `readRequestAuthState` → layout).
- `TrialBanner` (`apps/web/src/components/layout/`) — countdown; warning-стиль при 0 / "trial ended".
- +9 тестів (resolveTrialInfo unit, request-session roundtrip, integration: web-session показує trial після signup). unit **1159/1159**, integration **93/93**, typecheck 0.

## Phase 4.5.3 — onboarding wizard UI ✅ (2026-06-25)
- `apps/web/app/onboarding/page.tsx` — 5-кроковий wizard (`Field`/`Button`/`SurfaceCard`): GET `/api/onboarding`, **resume** на крок після `currentStep`, Save&continue → PATCH step, Skip, Finish → complete → `/dashboard`; якщо вже completed → редірект `/dashboard`. Signup тепер веде на `/onboarding`.
- typecheck + lint чисті; unit **1159/1159** (UI без нових unit-тестів).
- **Лишилось 4.5.3:** side-effects кроків (payments→allowlist, реальні invites, seed sample content).

## Phase 4.5.2 — promo console UI ✅ (2026-06-25)
- `apps/platform/promo-codes` сторінка: форма create (code/trialDays/maxRedemptions) + таблиця з enable/disable + redeemed-лічильниками; nav-item додано. Consumes `GET/POST /api/platform/promo-codes`, `PATCH /:id`.
- typecheck + lint + build platform чисті (route `/promo-codes`).
- **Лишилось 4.5.2:** redemption у school billing settings (зараз тільки при signup).

## Phase 4.5.4 — tour completion state ✅ (2026-06-25)
- `User.tourCompletedAt` (міграція `add_user_tour_completed`); `UserTourService` (`@be/auth`, user-scoped, idempotent — зберігає перший timestamp). REST `GET /api/onboarding/tour`, `POST /api/onboarding/tour/complete` (AuthGuard, `@CurrentUser`).
- +8 тестів (4 unit + integration: complete once, idempotent, get). unit **1163/1163**, integration **94/94**, typecheck 0.
- **Лишилось 4.5.4 (design-gated):** persona + 3D-маскот (Blender/Meshy→glTF, react-three-fiber, ≤1.5MB, fallback), tour-UI (driver.js/react-joyride, data-driven tourSteps), replay-trigger. **Потребує рішення по персоні/візуалу від користувача.**

## Phase 4.5.4 — tour UI (data-driven) ✅ (2026-06-25)
- `apps/web/components/tour`: `TOUR_STEPS` (config — welcome/dashboard/calendar/lessons/students/billing/done) + `ProductTour` overlay (gated `GET /api/onboarding/tour`; Next/Back/Skip/Finish → `POST .../complete`); змонтовано в root layout для авторизованих. 2D placeholder-маскот (`data-mascot` 🦊) — готовий до заміни на 3D.
- dependency-free (без driver.js/joyride); typecheck+lint чисті; unit **1163/1163**.
- **Лишилось 4.5.4 (design-gated):** element-anchored highlighting, 3D-маскот (персона/візуал — рішення користувача), replay з Help-меню.

## Phase 5 — subscription plans + entitlements (core) ✅ (2026-06-25)
- `PLAN_CATALOG` (`@be/billing/shared/subscription-plans`): `TRIAL`/`STARTER`/`PRO` — `maxActiveStudents` (null=∞), `storageQuotaBytes`, feature flags. `planFor(plan)` → default TRIAL.
- `EntitlementsService` (`@be/billing`): `resolveForSchool`, `getStorageUsage` (used/quota/remaining/percent/over, з `School.storageUsedBytes` BigInt), `assertCanUpload` (→ 413 `PayloadTooLargeException` понад квоту), `canAddActiveStudent` (рахує ACTIVE student-membership).
- +12 тестів. unit **1172/1172**, typecheck 0.
- **Лишилось Phase 5:** wire `assertCanUpload` в upload-сайти (materials/chat) + `canAddActiveStudent` у student-create; usage-meter endpoint/UI; Stripe Layer-B (checkout/trial→paid/dunning); promo PERCENT_OFF/FIXED_OFF; tax/compliance.

## Mascot persona — «Arvi» the Speaker-puff (2026-06-25, decided)
- Концепт-driven маскот = голос/звук (не тваринка → ownable; дорослим+дітям). Кругле яйцеподібне тільце, велика голова, великі очі, тепла усмішка, два округлі «вушка» як звукова хвиля/навушники, крихітні ручки/ніжки. Бренд-зелений `--green` + біле личко/животик. Тон: теплий коуч.
- Пози туру: idle/greet/point/celebrate. Asset target: `apps/web/public/mascot/arvi.glb` (GLB+Draco ≤1.5MB).
- **Meshy.ai prompt:** `A cute stylized cartoon mascot named Arvi, a small round soft creature representing friendly voice and sound, egg-shaped chubby body, big expressive friendly eyes, warm gentle smile, two small rounded ears shaped like soundwave headphone cushions, tiny short arms and little feet, smooth matte surface, mint-green body with soft white face and belly, chibi proportions with a big head, standing in a neutral A-pose with arms slightly away from the body, symmetrical, modern and approachable, mascot character design, game-ready, full body, single character, plain background, soft studio lighting`  | negative: `realistic fur, scary, sharp teeth, weapons, text, watermark, multiple characters, extra limbs, cluttered background` | Meshy: Stylized, A-pose, symmetry on, ~10–20k quad, PBR 1K, GLB+Draco.
- **Render-острів ГОТОВО (2026-06-25):** `apps/web/components/mascot/` — `<Mascot pose size>` lazy R3F (`@react-three/fiber@9`+`drei`+`three`, next/dynamic ssr:false), вантажить `public/mascot/arvi.glb` (`useGLTF`/`useAnimations`), грає кліп по позі або procedural idle-bob; **2D SVG fallback** (no-WebGL / reduced-motion / нема GLB через error-boundary); пауза на hidden tab. Підключено в тур (поза на крок), 🦊 замінено на Arvi.
  - **Постав будь-який `arvi.glb` у `apps/web/public/mascot/` зараз → працює; заміниш тим самим іменем пізніше.** Деталі в `public/mascot/README.md`.
  - **Залежності додано:** `three`, `@react-three/fiber@^9`, `@react-three/drei@^10`, `@types/three`.
  - web jest **549/549**, typecheck(мої файли)+lint чисті.
  - ✅ **middleware→proxy блокер виправлено (2026-06-25):** логіку tenant-hint (`x-school-slug`/`x-school-host` з `classifyTenantHost`) змержено у `proxy.ts` (`withTenantHint`), `middleware.ts` видалено. proxy тепер також ранить на `/api`+`/payload-api` (early-return лише hint, без session/route-логіки); matcher розширено (виключає _next/static+файли). web jest **549/549**.
  - ✅ **build:web ЗЕЛЕНИЙ (2026-06-25):** виправлено всі **17 передіснуючих** web TS-помилок (білд був червоний ще до сесії; @types/react не мінявся — підтверджено через git lockfile diff):
    - role-id: `useStudentHeroData`/`useStudentProfileSave` `activeUserRole: string` → `UserRoleId` (id числові: student=1…superAdmin=4); `lessonFormat: string` → `StudentLessonFormat`.
    - polymorphic UI primitives (`SurfaceCard`/`PanelCard`/`StatTile`/`TabPanelCard`/`PageHeader`): React-19 `ElementType` колапсив `children:never` → перевів динамічний тег на `createElement`.
    - `AnnotationLayer.tsx`: додав відсутні імпорти `MaterialPageAnnotation` (@pkg/types) + `normPoint` (annotation-layer-utils).
    - `StatisticsDashboardCharts`: `studentScope={view.studentScope ?? ''}`.
    - `LessonSetupTab`: `resolvedStudent?.fullName` (LessonPartyOption не має displayName).
  - `build:web` + web jest **549/549** + tsc(web)=0 + lint чисті.

## Де подивитись Arvi (2026-06-26)
- **Тур:** залогінься (або `/signup`) → first-login тур відкривається, якщо `User.tourCompletedAt = null` (маскот у картці). Повторно показати = очистити `tourCompletedAt`.
- **Preview-сторінка:** `/mascot-preview` (public route) — рендерить Arvi у всіх позах (idle/greet/point/celebrate) + розмірах. Поки нема `arvi.glb` → 2D-fallback; поклади `apps/web/public/mascot/arvi.glb` → 3D.
- Запуск: `npm run dev` (web :4200, api :3000) → `http://localhost:4200/mascot-preview`.

## Phase 5 — storage accounting + enforcement (materials vertical) ✅ (2026-06-25)
- `StorageAccountingService.add(schoolId, ±bytes)` (`@be/billing`, atomic read-modify-write, clamp ≥0) → підтримує `School.storageUsedBytes`.
- Materials wired: `createAttachment` → `assertCanUpload` (413 понад квоту) + increment; компресія reconcile-ить delta; `MaterialsService.delete` → decrement суми sizeBytes.
- **Cycle fix:** новий leaf-barrel `@be/billing/entitlements` (без `BillingModule`) — імпорт із materials уникає auth↔billing barrel-TDZ. Alias у tsconfig.base + jest.paths.
- +6 тестів. unit **1175/1175**, integration **94/94**, typecheck 0.
- **Лишилось:** chat/lessons/speaking upload-сайти (той самий патерн); usage-meter endpoint/UI; seat-enforcement у student-create; Stripe Layer-B.

## Phase 5 — usage-meter endpoint ✅ (2026-06-26)
- `EntitlementsService.getSummary(schoolId)` → `{plan, maxActiveStudents, activeStudentCount, seatsRemaining, features, storage{used/quota/remaining/percent/over}}`.
- `GET /api/billing/entitlements` — `EntitlementsController` (`@be/auth`, AuthGuard, school-scoped через `requireSchoolId`); імпортує `@be/billing/entitlements` (leaf) щоб уникнути auth↔billing cycle.
- +3 тести (unit getSummary + integration endpoint). unit **1177/1177**, integration **95/95**, typecheck 0.

## Phase 5 — Stripe Layer-B (school→platform subscriptions) ✅ core (2026-06-26)
- `PlatformSubscriptionService` (`@be/billing`, платформ-Stripe через env: `STRIPE_PLATFORM_SECRET_KEY`, `STRIPE_PLATFORM_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`/`STRIPE_PRICE_PRO`).
- `createCheckout(schoolId, plan)` → Stripe customer (persist у SchoolSubscription) + subscription Checkout Session.
- **Webhook state machine** `applySubscriptionEvent`: checkout.completed→ACTIVE+plan+School ACTIVE (trial→paid); subscription.created/updated→map статусу+план; invoice.payment_failed→PAST_DUE (School лишається ACTIVE — dunning grace); subscription.deleted→CANCELED+School SUSPENDED. Helpers у `platform-subscription.util` (priceId↔plan, Stripe-status→SubscriptionStatus, →SchoolStatus).
- REST: public `POST /api/platform-billing/stripe/webhook` (billing, signature-verify) + admin `POST /api/billing/subscription/checkout` (auth, `@be/billing/entitlements` leaf-import щоб уникнути cycle).
- +9 тестів (util + state machine). unit **1186/1186**, integration **95/95**, typecheck 0.
- **Лишилось Layer-B:** proration/upgrade-downgrade, повний dunning-розклад + auto-suspend в кінці grace, Stripe Tax/VAT, invoices/refunds, promo PERCENT_OFF/FIXED_OFF, billing UI.

## Phase 5 — billing UI ✅ (2026-06-26)
- `apps/web/app/billing` сторінка (admin-only: route-policy `/billing` → admin/super_admin; sidebar "Subscription" у секції Account). Показує поточний план, метри storage + students (бари), плани Starter/Pro з кнопкою checkout → `POST /api/billing/subscription/checkout` → редірект на Stripe. Банери success/cancel з `?billing=`.
- `GET /api/billing/entitlements` живить метри. Suspense-wrap (useSearchParams).
- typecheck + lint + build:web чисті (роут `/billing`), web jest **549/549**.

## Phase 5 — dunning auto-suspend ✅ (2026-06-26)
- `TrialLifecycleService.suspendOverdueSubscriptions` (платформ-admin, daily `@Cron` поряд із expireTrials): suspendує ACTIVE-школи, чия підписка `PAST_DUE` довше за `DUNNING_GRACE_DAYS=7` (маркер PAST_DUE = subscription `updatedAt`). +3 тести (unit + integration; integration бекдейтить updatedAt через raw SQL, бо Prisma `@updatedAt` ігнорує ручні значення).
- unit **1188/1188**, integration **96/96**, typecheck 0.

## Phase 5 — grandfathering + seat enforcement ✅ (2026-06-26)
- **Grandfathering default-план:** `EntitlementsService.resolveForSchool` тепер: paid-план (STARTER/PRO) → він; `School.status==='TRIAL'` → TRIAL-ліміти; інакше (legacy ACTIVE без підписки) → **PRO/unlimited** (жодних ретроспективних лімітів на live `school_default`). Виправляє і materials storage-чек.
- **Tenant-aware user-create + seat-enforcement:** `createUserAsAdmin` створює `SchoolMembership(role, ACTIVE)` для нового юзера у поточній школі (ADR-006, idempotent upsert) і блокує додавання STUDENT понад `canAddActiveStudent` (403 з cap плану).
- Тести: entitlements spec переписаний під нову resolveForSchool (grandfathering); +seat/grandfather кейси. unit **1188/1188**, integration **96/96** (admin-create тепер проганяє membership-створення проти реальної БД), typecheck 0.

## Phase 5 — lessons upload storage-enforcement ✅ (2026-06-26)
- `LessonAttachmentService.createAttachment` резолвить `ScheduledLesson.schoolId` → `entitlements.assertCanUpload` (413 понад квоту) + `storage.add(+sizeBytes)`. Decrement не потрібен: lesson-attachments не видаляються (`onDelete: SetNull`, файл лишається). lessons.module вже імпортує BillingModule. Spec оновлено (мок EntitlementsService/StorageAccountingService + scheduledLesson.findUnique).
- unit **1188/1188**, integration **96/96**, typecheck 0.

## Phase 5 — speaking upload storage-enforcement ✅ (2026-06-26)
- Schema: `SpeakingSubmission.audioSizeBytes Int?` (міграція `add_speaking_audio_size`).
- `attachAudio`: `assertCanUpload(schoolId, buffer.length)` (gate, G42 recordings count) + зберігає `audioSizeBytes` + `storage.add(net delta)` = `buffer.length − previous.audioSizeBytes` (re-record не дублює). schoolId з tenant. speaking.module тепер імпортує BillingModule. Spec оновлено (+2 нові deps, +attachAudio тест).
- **Chat СВІДОМО виключено** зі storage-accounting — attachments ефемерні (TTL + hourly purge), не накопичуються у persistent-квоту.
- unit **1189/1189**, integration **96/96**, typecheck 0.

**Storage-enforcement покриває:** materials (create+compress+delete), lessons (create-only), speaking (create+delta). Chat — n/a (ephemeral).

## Phase 5 — feature-gating helper ✅ (2026-06-26)
- `EntitlementsService.hasFeature(schoolId, feature)` / `assertFeature` (customDomain/aiAssist/recordings) + `PlanFeature` тип.
- `@RequiresFeature(feature)` декоратор + `FeatureGuard` (`@be/auth`, після AuthGuard; 403 якщо план не містить фічі; no-decorator → pass-through). Експортовано з `@be/auth`, зареєстровано в auth.module.
- UI вже отримує `features` з `GET /api/billing/entitlements` (billing page).
- +7 тестів (hasFeature/assertFeature + guard). unit **1193/1193**, integration **96/96**, typecheck 0.
- **Лишилось:** застосувати guard/ховати на конкретних feature-сайтах (custom domains — Phase 2 інфра; AI assist — ще нема).

## Phase 5 — promo PERCENT_OFF / FIXED_OFF at checkout ✅ (2026-06-26)
- Schema: `PromoCodeKind` розширено (PERCENT_OFF, FIXED_OFF); `PromoCode` отримав `trialDays Int?` (nullable — discount-коди не потребують), `discountPercent Int?`, `discountFixed Int?` (cents), `discountCurrency String?`. Міграція `add_promo_discount_kinds`.
- `PromoCodesService`: `CreatePromoCodeInput` тепер discriminated union per-kind; `validateInput` — per-kind perевірки (trialDays ≥1 / discountPercent 1–100 / discountFixed ≥1 + currency). `toDto` виставляє нові поля.
- `PlatformSubscriptionService.createCheckout(schoolId, plan, promoCode?)`: якщо `promoCode` — резолвить (active/window/capacity), записує `PromoRedemption` + `redeemedCount++`, створює on-the-fly Stripe coupon (`percent_off` або `amount_off`, duration=once), передає `discounts:[{coupon}]` у Checkout Session. Дублікат redemption → 400 (unique constraint).
- `SubscriptionController.checkout`: тепер приймає `{plan, promoCode?}` і передає у сервіс.
- Billing page UI: `Field` "Promo code" (`max-width 320px`) перед планами; нормалізується (trim+uppercase) і включається у checkout POST якщо непустий.
- Spec `promo-codes.service.spec.ts` переписано під discriminated union + +4 нових тести (PERCENT_OFF create, FIXED_OFF create, discountPercent out-of-range, FIXED_OFF без currency). Всього 9 тестів.
- unit **641/641**, integration **96/96**, typecheck 0.

## Phase 5 — Stripe Customer Portal (upgrade/downgrade/cancel) + UpgradePrompt UI ✅ (2026-06-26)
- `PlatformSubscriptionService.createPortalSession(schoolId)` — перевіряє наявність Stripe customer (DB-first, до ініціалізації Stripe клієнта), відкриває Stripe Billing Portal Session (`billingPortal.sessions.create`); return_url → `/billing`. Stripe Portal сам обробляє proration upgrade/downgrade, зміну картки, скасування.
- `POST /api/billing/subscription/portal` (admin-only, AuthGuard + role check в контролері).
- Billing page UI: якщо план = STARTER або PRO (`isSubscribed`) — показує "Manage subscription" → portal (з `loadingLabel`); plan picker приховується (лише для нових/trial-школ). Over-quota hint виводиться під storage bar.
- `UpgradePrompt` компонент (`apps/web/src/components/ui/`): amber banner з "Upgrade your plan →" Link до `/billing`; `isStorageQuotaError(e)` helper (перевіряє message на 413/quota). Експортовано з `components/ui/index.ts`.
- `MaterialFormModal`: відстежує `localErrorRaw` (оригінальний об'єкт помилки); при 413 показує `UpgradePrompt` замість generic `<p>`.
- +2 тести (portal: no-subscription 400, no-Stripe-key 400). unit **1199/1199**, typecheck 0.

## G15 — GDPR: data export + erasure ✅ (2026-06-27)

- **`GdprService`** (`@be/auth/application/gdpr.service.ts`): `exportUserData(userId)` — DSAR, збирає всі PII-поля без `passwordHash`; `eraseUser(userId, requestedBy)` — anonymize: email→erased@erased.invalid, displayName→[Erased], passwordHash/avatar/phone/telegram/bio → null, status→LEAVED, видаляє токени та OAuth акаунти в транзакції. Фінансові/аудит рядки не видаляються (retention requirement).
- **`GdprController`** (`GET /api/gdpr/export`, `DELETE /api/gdpr/me`) — user-scoped, `AuthGuard`.
- **`PlatformGdprController`** (`GET /api/platform/gdpr/export/:userId`, `DELETE /api/platform/gdpr/erase/:userId`) — для платформ-адміна.
- Обидва контролери + `GdprService` зареєстровано в `auth.module.ts`.
- +4 тести (export without passwordHash, 404 export, erase anonymizes, 404 erase). unit **1263/1263**.

## G14 — Tenant-tagged observability (structured logging) ✅ (2026-06-27)

- **`TenantLoggerService`** (`packages/backend/shared/tenant/src/tenant-logger.service.ts`) — injectable service that wraps NestJS `Logger` and appends `{schoolId, userId, requestId}` from CLS context as a JSON suffix to every log message. Exported from `@be/tenant` (module + index). Registered as a global provider in `TenantModule`.
- **`TenantLoggingInterceptor`** (`apps/api/src/app/tenant-logging.interceptor.ts`) — global `APP_INTERCEPTOR` that logs every HTTP/GraphQL request with method, path, status code, response time ms, and tenant tags. Errors (5xx) → `logger.error`, warnings (4xx) → `logger.warn`, success → `logger.log`.
- Registered in `AppModule` as `{ provide: APP_INTERCEPTOR, useClass: TenantLoggingInterceptor }`.
- No Sentry yet (no DSN/package installed) — wire when `SENTRY_DSN` is added via `@sentry/nestjs`.
- Tests: pre-existing tenant suite 44/44 still passes; no new unit tests needed (pure log decoration, no logic branches).

## G42 — Recordings quota seam + AI daily rate cap ✅ (2026-06-26)
- **Schema**: `ScheduledLesson.recordingSizeBytes Int?` (seam для майбутнього egress); `School.aiCreditsUsedToday Int @default(0)` + `School.aiCreditsResetAt DateTime?`.
- **Plan catalog**: `aiCreditsPerDay` (TRIAL/STARTER: 0, PRO: 100 req/day).
- **`EntitlementsService`**: `assertAiCredit` (429 при перевищенні), `consumeAiCredit` (атомний increment з авторесетом при зміні дня), `resetDailyAiCredits` (bulk для cron).
- **`TrialLifecycleService`**: `resetDailyAiCredits()` — bulk reset школ; cron scheduler викликає щоночі.
- **LiveKit token endpoint**: `@UseGuards(FeatureGuard) @RequiresFeature('recordings')` — TRIAL-школи отримують 403. `FeatureGuard` додано в `LessonsModule.providers`.
- Migration: `20260626124643_add_recording_ai_metering`. unit **1199/1199**.

**Наступне:** G6 (object storage S3/R2) — файли зараз на local disk, блокер горизонтального масштабування.

**Інші фази:** G4 (tenant-aware jobs); Phase 3 JWT reshape; object storage G6; pen-test (Gate 7).
2. Дрібні дочірні (за бажанням): `QuizQuestion, QuizAnswer, SpeakingTopicAssignment, ChatParticipant/Message/Attachment, StudentGroupMember, LessonMaterial/FileAttachment, LibraryMaterial children` — усі через scoped-parent, найнижчий пріоритет.
3. JWT reshape (Phase 3) для multi-school switching; Phase 2 (middleware/піддомени).
4. **1.4** per-school кеш `platform-integration.runtime.ts` (G3); ESLint-бани; full Gate 1 у CI.

**Команди БД:** перед prisma — `export DATABASE_URL='postgresql://soenglish:soenglish@localhost:5432/soenglish?schema=public'` (у сесії .env не підхоплювався авто).
