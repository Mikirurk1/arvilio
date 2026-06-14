# SoEnglish — page-by-page design plan (new skills)

Мета: пройтись по ключових маршрутах `apps/web` і для кожного мати зрозумілий execution plan: **який скіл використовуємо**, **що саме покращуємо**, **критерій готовності**.

---

## Design language v2 (рішення, червень 2026)

**Контекст:** попередній прохід зробив дизайн "табличним" (сірий екран + рамка на кожному блоці). Рішення — **мікс трьох напрямів поверх наявної системи**, не повний rewrite:

- **Airy (Preply):** повітря і ритм відступів важливіші за контейнери. Групуємо **простором**, не бордерами.
- **Soft cards:** глибина через **фон + м'яку тінь**, картки не "злипаються" з фоном завдяки surface-контрасту.
- **Editorial:** сильна type scale (виразний page title → секційні лейбли → body → caption), 1-2 справді підняті hero-блоки на екран, designed empty states (іконка + копі + CTA), а не порожні панелі.

### Залізні правила цього проходу

1. **Tokens-first.** Спочатку міняємо глобальні токени/примітиви (`_theme.scss`, `ui.module.scss`), щоб зсув відчувся одразу всюди. Page-level правки — лише після того, як база виглядає premium.
2. **Hairline borders only.** Видимий бордер — **вторинний** сигнал, не основний. Дозволено лише тонкий hairline (`--border-subtle`) і тільки там, де потрібен явний поділ (рядки списку, table-like дані, поділ секцій). Усюди інде розділення — через `--surface-*` контраст + тінь + відступ. Заборонено: бордер на кожній картці + тінь + градієнт одночасно ("потрійне обведення").
3. **Один акцент на екран.** Зелений primary — focal point. Решта кольорів (info/warning/danger) — лише статусна семантика, не декор.
4. **Depth budget.** Максимум 1-2 елементи з `--shadow-md`+ на viewport (hero / активна картка). Решта — `--shadow-xs`/`sm` або плаский surface-контраст.
5. **Зберігаємо що працює.** Dark theme, токенну архітектуру, status-токени, modal recipe, guardrails — не ламаємо.

## Які скіли використовуємо

**Базове правило:** майже всюди перший і основний скіл — `emil-design-eng`.

- `emil-design-eng` — primary driver майже для всіх page-level рішень (layout rhythm, hierarchy, premium UI ergonomics).
- `soenglish-redesign` — контекст SoEnglish (Preply clarity + Edvibe structure), guardrails і product-fit.
- `redesign-existing-projects` — аудит поточного UI перед змінами, пошук “slop” патернів.
- `design-taste-frontend` (`taste-skill`) — посилення візуальної якості (ієрархія, spacing, contrast, ритм).
- `gpt-taste` — stricter mode для складних поверхонь (dashboard, calendar, data-heavy screens).
- `frontend-design` (Anthropic plugin) — production-grade polish для компонентів/секцій.
- `ui-ux-pro-max` + `ckm:*` — варіативні UI/UX стилі для specific surfaces (hero, design-system, ui-styling).
- `emil-design-eng` — micro-interactions, grid rhythm, clean component ergonomics.
- `impeccable` — фінальний quality pass (consistency, crisp edges, detail polish).

> `magic-mcp` не включено тут як “скі́л”, бо це MCP-сервер. Його використовуємо окремо, якщо потрібна генерація/синхронізація UI через MCP pipeline.

---

## Global workflow (для кожної сторінки)

1. **Audit pass:** `emil-design-eng` + `soenglish-redesign` + `redesign-existing-projects`.
2. **Design pass:** `emil-design-eng` + `design-taste-frontend` або `gpt-taste` (для важких screens).
3. **Component pass:** `emil-design-eng` + `frontend-design`.
4. **Final polish:** `impeccable`.
5. **Verify:** responsive (375/768/1280), dark/light/auto, keyboard/focus.

---

## Tokens-first program (Phase 0 — робимо ПЕРШИМ)

Проблема: світла тема "raw" + табличність. Рішення приходить з примітивів, не з окремих сторінок. Доки база не виглядає premium — page-level правки не починаємо.

### Step 0.1 — Surface & depth scale (`apps/web/src/styles/tokens/_theme.scss`)

Мета — щоб картка читалась від фону **без бордера**.

- Розвести 3-рівневу сходинку у light: `--surface` (canvas, найтемніший warm) → `--surface-raised`/`--surface-panel` (секції) → `--card` (контент, найсвітліший). Зараз контраст між ними замалий.
- `--border` лишити, але в компонентах за замовчуванням використовувати `--border-subtle` (hairline). `--border-strong` — тільки для focus/active/data-таблиць.
- Тіні: лишити navy-tint, але дисциплінувати застосування (див. depth budget). `--shadow-xs` має давати ледь помітний lift на card; `--shadow-md`+ — лише hero.

### Step 0.2 — Type scale (editorial)

- Перевірити/посилити сходинку в `globals.scss` + tokens: display (page title) помітно більший за section title; section label — окремий дрібний uppercase/tracking стиль; body; caption.
- Page titles переходять на `var(--font-display)` де ще не так.

### Step 0.3 — Component recipes (`apps/web/src/components/ui/ui.module.scss`)

- `surfaceCard` / `statTile` / `featureCard`: depth через `background: --card` + `--shadow-xs` + опційний hairline, **без важкого бордера**. Прибрати "border + shadow + gradient" одночасно.
- Уніфікувати status pill/badge на `--status-*` (вже частково зроблено).
- Empty-state recipe: контейнер для "designed empty state" (icon slot + title + caption + optional CTA), щоб порожні панелі не були сірими дірами.

### Критерії Phase 0 done
- Картка `--card` чітко читається на `--surface` **без видимого бордера**.
- На типовому екрані видно ≤ 2 елементи з вираженою тінню.
- Type hierarchy зчитується миттєво (title vs section vs body).
- Жодного блоку з потрійним обведенням (border+shadow+gradient).
- Dark theme не зламана, guardrails проходять (`npm run lint:styles`).

---

## Page-by-page roadmap

> Стартуємо **тільки після Phase 0 (tokens-first)**. На кожній сторінці застосовуємо Design language v2: airy spacing, soft cards, editorial hierarchy, hairline-only borders, designed empty states.

## 1) `apps/web/src/app/dashboard/page.tsx`
- **Skills:** `emil-design-eng`, `soenglish-redesign`, `gpt-taste`, `impeccable`
- **Focus:**
  - чіткий “Today in learning” hierarchy
  - один primary action на viewport
  - уніфікація KPI tiles і статус-чіпів
- **Done when:** перший екран читається за 3-5 секунд; немає дубльованих акцентів.

## 2) `apps/web/src/app/lessons/page.tsx`
- **Skills:** `emil-design-eng`, `soenglish-redesign`, `redesign-existing-projects`, `impeccable`
- **Focus:**
  - зменшити cognitive load у верхніх секціях
  - прибрати дублі метаданих між highlights/list
  - стабільна CTA-модель (explicit actions)
- **Done when:** user швидко переходить до “All lessons” без шуму.

## 3) `apps/web/src/components/lessons/LessonsListPanel.tsx`
- **Skills:** `emil-design-eng`, `frontend-design`, `impeccable`
- **Focus:**
  - сканованість рядків (title/meta/status/actions)
  - чіткі hit-targets для Open/Edit
  - predictability filters/search/status chips
- **Done when:** немає interaction ambiguity і nested-click конфліктів.

## 4) `apps/web/src/app/calendar/page.tsx`
- **Skills:** `emil-design-eng`, `gpt-taste`, `soenglish-redesign`, `impeccable`
- **Focus:**
  - month/week visual parity
  - mobile day-cell readability (не тільки dots)
  - conflict/confirm modal consistency
- **Done when:** на mobile видно мінімальний контекст дня без зайвих tap’ів.

## 5) `apps/web/src/app/chat/page.tsx`
- **Skills:** `emil-design-eng`, `design-taste-frontend`, `frontend-design`, `impeccable`
- **Focus:**
  - стабільний two-pane layout без brittle offsets
  - контраст ієрархії inbox/thread
  - message composer visual clarity
- **Done when:** чат не “ламається” між tablet/mobile breakpoints.

## 6) `apps/web/src/app/vocabulary/page.tsx`
- **Skills:** `emil-design-eng`, `soenglish-redesign`, `gpt-taste`, `impeccable`
- **Focus:**
  - зниження щільності керувань (progressive disclosure)
  - єдина типографіка для word cards / flashcards / play
  - статусні кольори тільки через семантичні токени
- **Done when:** кожен режим (list/flashcard/play) має свій зрозумілий focal point.

## 7) `apps/web/src/app/quiz/page.tsx`
- **Skills:** `emil-design-eng`, `design-taste-frontend`, `frontend-design`, `impeccable`
- **Focus:**
  - consistency між quiz list / play / result
  - clear success/error feedback states
  - action buttons: predictable hierarchy
- **Done when:** не потрібно “пояснювати” UI — flow інтуїтивний.

## 8) `apps/web/src/app/students/page.tsx`
- **Skills:** `emil-design-eng`, `redesign-existing-projects`, `impeccable`
- **Focus:**
  - list scanning: name, status, risk/progress
  - додати/покращити filter/sort affordances
  - card density без перевантаження
- **Done when:** teacher/admin швидко знаходить потрібного студента.

## 9) `apps/web/src/app/students/[studentId]/page.tsx`
- **Skills:** `emil-design-eng`, `gpt-taste`, `soenglish-redesign`, `impeccable`
- **Focus:**
  - tab shell consistency із profile/dashboard language
  - уніфікація section spacing і typography weights
  - чіткий акцент на learning outcomes
- **Done when:** tab navigation і контент-секції не конкурують між собою.

## 10) `apps/web/src/app/profile/page.tsx`
- **Skills:** `emil-design-eng`, `frontend-design`, `impeccable`
- **Focus:**
  - hero + tabs hierarchy
  - social/provider badges і trust semantics
  - modal consistency (avatar/password/appearance)
- **Done when:** profile виглядає як “control center”, не як набір розрізнених панелей.

## 11) `apps/web/src/app/payment/page.tsx`
- **Skills:** `emil-design-eng`, `design-taste-frontend`, `impeccable`
- **Focus:**
  - checkout trust signals
  - one-path completion UX
  - error/warning/info consistency
- **Done when:** сторінка веде до оплати без second-guessing.

## 12) `apps/web/src/app/system/page.tsx`
- **Skills:** `emil-design-eng`, `ui-ux-pro-max`, `ckm:design-system`, `impeccable`
- **Focus:**
  - “control room” структура для platform/admin сценаріїв
  - секційність, щільність, clear operator actions
  - visual language сумісна з рештою app shell
- **Done when:** складні налаштування читаються по секціях без втоми.

---

## Recommended execution batches

- **Phase 0 (foundation):** tokens-first (surface/depth scale, type scale, component recipes) — **робимо першим**
- **Batch A (learning core):** Dashboard, Lessons, LessonsListPanel, Calendar
- **Batch B (student practice):** Vocabulary, Quiz, Chat
- **Batch C (people & account):** Students, Student details, Profile
- **Batch D (ops):** Payment, System

Кожен batch закінчувати mini-audit:
- consistency check (status chips, type scale, spacing rhythm)
- depth check (≤ 2 виражені тіні на viewport; немає потрійного обведення)
- border check (видимий бордер тільки hairline і тільки де є реальний поділ)
- empty-state check (порожні стани designed, не сірі панелі)
- interaction check (focus/hover/keyboard)
- responsive check (375/768/1280)

---

## Definition of done (cross-page)

- `emil-design-eng` використаний як primary skill майже на всіх page-level проходах.
- Phase 0 (tokens-first) завершено до page-level робіт.
- Картки читаються від фону **без видимого бордера**; бордери — лише hairline як вторинний сигнал.
- Depth budget дотримано: ≤ 2 виражені тіні на viewport, немає border+shadow+gradient одночасно.
- Один акцент-focal point на екран; кольори info/warning/danger — лише статусна семантика.
- Порожні стани designed (icon + copy + CTA), а не сірі панелі.
- Немає `transition: all` у high-traffic стилях.
- Немає hardcoded статусних text-colors там, де є семантичні токени.
- Один interaction pattern для card/actions на сторінці.
- Light/dark/auto мають однакову читабельність.
- Візуальна мова між сторінками не “стрибає”.
