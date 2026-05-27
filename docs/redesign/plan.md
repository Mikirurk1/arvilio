# SoEnglish — план редизайну UI

**Мета:** платформа рівня **Preply** (довіра, людяність, ясний шлях учня) + **Edvibe** (структуроване навчання, уроки, матеріали, ролі teacher/student).

**Сьогодні:** один продукт для **однієї школи** — один бренд, одна спільна тема, зрозумілий learning UI.  
**Завтра:** еволюція до **SaaS** (багато шкіл + platform) — редизайн не повинен закопати це: токени, неймінг і layout лишають місце для school-scoped брендингу та platform-зон (див. `.cursor/rules/future-multitenant-architecture.mdc`).

**Статус плану:** living document. Після кожного кроку оновлюйте колонку `Status` і дату в `Done`.

**Як запускати агента (один крок):**

```text
Виконай крок <ID> з docs/redesign/plan.md.
Skills: .agents/skills/redesign-existing-projects, .cursor/skills/soenglish-redesign.
Reuse: §1.4 — спочатку components/ui і існуючі feature blocks; не переписуй сторінку з нуля.
Scope: лише файли з рядка кроку. Не чіпай інші ID.
Перевірка: ./scripts/agent-browser-all-pages.sh (або agent-browser для цього route).
Онови Status → done у plan.md.
```

---

## 1. Дизайн-напрям (Preply × Edvibe × premium edtech)

### Що беремо з референсів

| Референс | Що копіюємо (ідея, не пікселі) |
|----------|----------------------------------|
| **Preply** | Спокійна «дорога» палітра, великі заголовки, чіткий next step, довіра (урок / оплата / прогрес), мінімум візуального шуму |
| **Edvibe** | Класна кімната: урок → матеріали → завдання; ролі; календар і списки зрозумілі з першого погляду |
| **SoEnglish** | Lora wordmark, ink-navy `#1a1a2e`, warm surface `#f7f6f3`, зелений прогрес — **не** purple-gradient AI look |

### Принципи (обов’язкові для кожного кроку)

1. **Для навчання** — ієрархія: «що робити зараз» → деталі → другорядне. Один primary CTA на блок.
2. **Зрозуміло** — короткі підзаголовки, tabular nums для балів/грошей, статуси кольором + текстом (не лише колір).
3. **Сучасно й дорого** — повітря (spacing ×1.25–1.5), м’які тіні з tint navy, тонкі border, refined radius (8/12/16), без плоского «template dashboard».
4. **Одна школа зараз, SaaS пізніше** — один tone of voice і один візуальний каркас; `/system` і billing — platform-зони, але **той самий shell і тема**, не «інший продукт». Не ховати school-дані в глобальні singleton-стилі; семантичні токени (`--surface`, `--text-primary`), щоб пізніше можна було підмінити палітру на школу.
5. **Спільна тема** — light/dark/auto через `data-theme` на `<html>`; кольори лише з CSS-змінних теми, не хардкод у page SCSS (див. §1.1).
6. **Читабельний SCSS** — вкладеність через `&`, breakpoints через константи + `@include respond-to(...)`; без magic numbers у media queries (див. §1.2).
7. **Стек не змінюємо** — SCSS modules, `components/ui`, токени `styles/tokens/`. Без Tailwind/shadcn у `apps/web`.
8. **Референси read-only** — `materials/fluent/` (layout/SCSS), `materials/figma_design/` (композиція; не копіювати Tailwind).
9. **Рух обмежено** — це **навчальна платформа**, не showcase; анімація підтримує фокус і feedback, не відволікає (див. §1.3).
10. **Структура й reuse** — дизайн **шаровий**; на кожному кроці **компонувати** існуюче, не малювати сторінку з нуля (див. §1.4).

### Візуальна система (ціль після F0)

| Токен / елемент | Напрям |
|-----------------|--------|
| Фон app | Warm off-white `--surface`, cards `--card` з легкою elevation |
| Текст | `--text-primary` ink, secondary для мета-інфо |
| Акцент | **Один** primary: progress/success green; blue — links/info; amber — увага; purple — рідко (premium badge) |
| Типографіка | Lora (brand) + sans для UI (уточнити в F0-02); чітка scale display → body → caption |
| Shell | Sidebar як «навігація курсу» (Edvibe), не generic admin; mobile drawer — ті самі групи |
| Модалки | Єдиний overlay blur + radius + header pattern (як урок у Preply booking flow) |
| Dark mode | Підтримати `data-theme`; premium = глибокий charcoal, не pure black |

### 1.1 Спільна тема (shared theme)

Усі екрани ділять **одну** тему — не окремі палітри на сторінку.

| Шар | Де | Роль |
|-----|-----|------|
| Semantic tokens | `apps/web/src/styles/tokens/_theme.scss` | `--text-*`, `--surface`, `--card`, `--border`, accents; mixins `light-theme` / `dark-theme` |
| Layout tokens | `styles/tokens/_layout.scss` | padding, drawer width, containers |
| Typography | `styles/tokens/_typography.scss` | `--font-sans`, `--font-display`, `--fs-*` |
| Застосування | `:root`, `[data-theme='light']`, `[data-theme='dark']` у `_theme.scss` | Default + explicit modes |
| Runtime | `ui-store` + `providers.tsx` | `theme`: `light` \| `dark` \| `auto` → `document.documentElement.setAttribute('data-theme', …)` |
| Font size | `data-font-size` на `<html>` | Appearance у Profile; масштаб через `rem` / `--fs-*` |
| Legacy SCSS | `styles/_variables.scss` | Spacing, **breakpoint constants**, radius — для mixins |
| Global bridge | `styles/global.scss` → `globals.scss` | Імпорт токенів у весь app |

**Правила редизайну:**

- Нові кольори → спочатку в `_theme.scss` (обидві теми), потім `var(--…)` у модулях.
- Page/module SCSS: `[data-theme='dark'] { … }` лише для винятків; уникати дублювання палітри.
- Компоненти UI: тягнути семантику з теми, не `#hex` у `page.module.scss`.
- **SaaS-ready:** токени називати за роллю (`--surface`, `--text-primary`), не за школою (`--soenglish-blue`); майбутній school theme = підміна набору змінних, не перепис усіх сторінок.

### 1.2 SCSS — читабельність і breakpoints

| Правило | Приклад |
|---------|---------|
| Константи breakpoints | `$breakpoint-sm: 768px`, `$breakpoint-md: 1024px` у `_variables.scss` — **не** писати `767px` / `1024px` inline |
| Media queries | `@use '@/styles/mixins' as *;` (або відносний шлях до `styles/_mixins.scss`) + `@include respond-to(sm) { … }` |
| Вкладеність | `.card { …; &:hover { … }; &.isActive { … } }` — уникати довгих селекторів `.card .cardTitle .cardTitleText` |
| Модулі | `*.module.scss` — класи локальні; спільні патерни виносити в mixins/tokens, не копіпаст |
| Кольори в компонентах | `color: var(--text-secondary);` `background: var(--card);` |
| JS sync | `lib/breakpoints.ts` / `use-breakpoint.ts` узгоджені з `$breakpoint-sm` (767 max mobile) — при зміні констант оновити обидва |

**Погано:**

```scss
@media (max-width: 768px) { .sidebar { display: none; } }
.title { color: #3d3d55; }
```

**Добре:**

```scss
@use '../../styles/mixins' as *;

.sidebar {
  @include respond-to(sm) {
    display: none;
  }
}

.title {
  color: var(--text-secondary);
}
```

**Крок F0:** `R-00-05` — аудит page SCSS: прибрати inline breakpoints і hardcoded colors там, де вже є токени.

### 1.3 Рух і анімації (пріоритет: навчання)

**Головне правило:** якщо анімація не допомагає зрозуміти стан, прогрес або наступний крок — її не потрібно.

| Пріоритет | Інструмент | Коли використовувати |
|-----------|------------|----------------------|
| 1 | **CSS** (`transition`, `@keyframes`, `animation-delay`) | Hover/focus, tab panels, skeleton, drawer slide, modal fade — за замовчуванням |
| 2 | **GSAP** | Складніші послідовності: stagger reveal dashboard, progress celebrations, drag/snap у календарі, coordinated modal enter/leave — коли CSS стає нечитабельним |
| 3 | **Three.js** | Рідкі **акцентні** сцени (hero auth, empty state, achievement moment) — лише якщо додає сенс бренду; **не** на кожній сторінці |

**GSAP (дозволено за потреби):**

- Додавати залежність у `@app/web` лише коли крок плану реально потребує motion (`npm i gsap` у workspace web).
- Один `useGsap` / `gsap.context()` на компонент; `cleanup` у `useEffect` return.
- Тривалість UI: ~150–350ms; marketing hero: до ~800ms.
- Поважати `prefers-reduced-motion: reduce` — скоротити або вимкнути timeline.

**Three.js (опційно, низький пріоритет):**

- Lazy import: `const Scene = dynamic(() => import('./HeroScene'), { ssr: false })`.
- Тільки client components; не блокувати LCP (маленький canvas, fallback static).
- Не використовувати в lesson room, forms, tables, chat — там завжди перемога ясності над «вау».
- WebGL off = статичний gradient/SVG fallback.

**Заборонено для learning UI:**

- Безкінечні фонові 3D-сцени на dashboard/chat.
- Autoplay motion без user intent на формах оплати/логіну.
- Важкі анімації на mobile при слабкому CPU (перевірити `use-breakpoint` / `matchMedia`).

**Де motion доречний (приклади):**

| Місце | Рекомендація |
|-------|----------------|
| Dashboard «next lesson» | Легкий GSAP stagger або CSS fade |
| Achievements unlock | Короткий GSAP scale + confetti-lite (CSS), не full 3D |
| Auth hero | CSS або один Three.js фон (optional) |
| Calendar drag | GSAP лише якщо вже є interaction; інакше CSS |
| Modals | CSS transform + opacity; GSAP для shared timeline якщо уніфікуємо F6 |

**Крок F0 (опційно):** `R-00-07` — motion guidelines + `prefers-reduced-motion` у `_base.scss`; додати `gsap` / `three` у `apps/web/package.json` тільки під час першого кроку, що їх використовує.

### 1.4 Структура UI та перевикористання

**Правило:** редизайн = підтягнути **систему**, потім **складати** екрани з неї. Новий код на сторінці — лише композиція + вузькі відмінності.

#### Шари (зверху вниз — не перестрибувати)

```text
1. Tokens (_theme, _layout, _typography)
2. UI primitives (components/ui — Button, Field, SurfaceCard, PageHeader, Tabs, …)
3. Layout patterns (container, page grid, section stack, ActionRow)
4. Feature / domain blocks (ProfileViewShell, DashboardLessonCard, LessonModal, …)
5. Page (app/**/page.tsx) — збирає шари, мінімум власного SCSS
```

#### Перед кожним кроком (checklist агента)

1. Прочитати `components/ui/index.ts` і сусідні feature-компоненти на цій сторінці.
2. Знайти **той самий патерн** на іншій уже оновленій сторінці (після F0/F1) — скопіювати **структуру**, не стилі hex-by-hex.
3. Розширити primitive / shared pattern, якщо відмінність повториться ≥2 рази — **не** третій раз писати однаковий блок у `page.module.scss`.
4. Page SCSS — лише layout сторінки (grid, gaps); вигляд карток/кнопок — з `ui.module.scss` або спільного feature module.

#### Що перевикористовувати в першу чергу

| Потреба | Використати | Не писати з нуля |
|---------|-------------|------------------|
| Заголовок сторінки | `PageHeader`, `SectionHeader` | `<h1>` + custom flex header |
| Картка / секція | `SurfaceCard`, `FeatureCard`, `EmptyStateCard` | `div` + box-shadow у page |
| Форми | `Field`, `Button`, `SegmentedControl` | raw `<input>` / `<button>` |
| Таби | `Tabs`, `ProfileViewShell` | власні tab buttons |
| Списки уроків/студентів | `DashboardLessonCard`, існуючі row components | новий card markup |
| Модалки | `LessonModal`, `ConfirmDialogHost`, існуючі modal SCSS | новий overlay + backdrop кожен раз |
| Порожній стан | `EmptyStateCard` | custom empty div |
| Статистика | `StatTile`, `StatisticsDashboard` | one-off stat boxes |

Детальні правила імпортів: `.cursor/rules/web-component-reuse.mdc`.

#### Структурований макет сторінки (шаблон)

```text
container container--page
  PageHeader (title, subtitle, actions)
  [optional] SegmentedControl / filters
  main grid або stack
    SurfaceCard | FeatureCard | domain section
  [optional] ActionRow (primary CTA внизу на mobile)
```

Однакова структура на `/dashboard`, `/students`, `/payment` — користувач швидше орієнтується (Preply/Edvibe clarity).

#### SCSS reuse

- Спільні відступи секцій → токени `--main-padding-*` / layout mixins, не нові `margin: 24px` на кожній сторінці.
- Повторюваний «filter bar» / «toolbar» — винести в `components/` або shared class у `styles/` після другого використання.
- Modifiers через `&` на одному блоці, не дублювати цілі класи.

#### Коли дозволено новий компонент

- Патерн **дійсно новий** для продукту (не варіація існуючої картки).
- Або reuse вимагає більше props, ніж простий новий wrapper у `components/`.

Новий файл → `components/ui` (якщо generic) або `components/<domain>/` (якщо domain), **не** в `app/**/page.tsx`.

**Крок F0:** `R-00-08` — inventory layout patterns; задокументувати 3–5 «рецептів» сторінок у wiki `ui-design-system` після F1.

---

## 2. Фази та порядок

| Фаза | ID prefix | Зміст |
|------|-----------|--------|
| **F0** | `R-00` | Токени, типографіка, UI primitives |
| **F1** | `R-01` | Shell: header, sidebar, drawer, search |
| **F2** | `R-10` | Auth pages |
| **F3** | `R-20` | Student routes |
| **F4** | `R-30` | Teacher routes + student detail |
| **F5** | `R-40` | Admin / system / payment |
| **F6** | `R-50` | Modals & overlays (уніфікація) |
| **F7** | `R-90` | QA, regression, wiki |

**Правило:** не починати F3, поки F0 + F1 не `done` (інакше роз’їдеться стиль).

---

## 3. Реєстр кроків

`Status`: `todo` | `in_progress` | `done` | `skip`

### F0 — Design foundation

| ID | Surface | Files (primary) | Design intent | Status |
|----|---------|-----------------|---------------|--------|
| R-00-01 | Color & elevation tokens | `styles/tokens/_theme.scss`, `_layout.scss` | Preply-like calm; tinted shadows; прибрати «AI purple» як default accent | todo |
| R-00-02 | Typography scale | `styles/tokens/_typography.scss`, `app/layout.tsx` (fonts) | Display для заголовків сторінок; readable body 65ch у формах | todo |
| R-00-03 | UI primitives pass | `components/ui/ui.module.scss`, `Button`, `Field`, `SurfaceCard` | Primary/secondary/ghost; field focus ring premium; cards однакова elevation | todo |
| R-00-04 | Empty / stat / badge polish | `EmptyStateCard`, `StatTile`, `Badge`, `FeatureCard` | Прогрес і досягнення «дорого», не іграшково | todo |
| R-00-05 | SCSS hygiene | Top page modules + `ui.module.scss` | `&` nesting; `respond-to`; `var(--*)` замість hex; dark via shared theme | todo |
| R-00-06 | Shared theme audit | `_theme.scss`, `providers.tsx`, Appearance | Light/dark parity; document SaaS token naming in wiki | todo |
| R-00-07 | Motion baseline (optional) | `_base.scss`, `lib/motion/` (new if needed) | `prefers-reduced-motion`; when to use CSS vs GSAP; defer Three until a named hero step | todo |
| R-00-08 | Page layout recipes | wiki `ui-design-system`, optional `components/layout/PageStack.tsx` | Document compose patterns; extract only if repeated across 2+ routes | todo |

### F1 — App shell

| ID | Surface | Files | Roles | Design intent | Status |
|----|---------|-------|-------|---------------|--------|
| R-01-01 | Header | `Header.tsx`, `Header.module.scss` | all | Чистий top bar: search, notifications, avatar; mobile menu | todo |
| R-01-02 | Sidebar | `Sidebar.module.scss`, `sidebar-nav.tsx` | all | Edvibe-style sections (Main / Schedule / Account); active state premium | todo |
| R-01-03 | Mobile nav drawer | `MobileNavDrawer.tsx`, module scss | all | Full-height drawer, ті самі групи що sidebar | todo |
| R-01-04 | App shell layout | `AppShell.tsx`, `globals.scss` | all | Main padding, max-width, background depth | todo |
| R-01-05 | Brand mark | `BrandLogo.tsx` | all | Lora + mark; collapsed sidebar | todo |

### F2 — Auth (public)

| ID | Route | Files | Design intent | Status |
|----|-------|-------|---------------|--------|
| R-10-01 | `/login` | `(auth)/login/`, `auth.module.scss` | Preply trust: centered card, warm bg, clear CTA | todo |
| R-10-02 | `/register` | `(auth)/register/` | Той самий auth shell що login | todo |
| R-10-03 | `/forgot-password` | `(auth)/forgot-password/` | Мінімалізм, reassurance copy | todo |
| R-10-04 | `/reset-password` | `(auth)/reset-password/` | Success/error states premium | todo |
| R-10-05 | Auth layout | `(auth)/layout.tsx` | Shared split/hero optional (subtle, not marketing-heavy) | todo |

### F3 — Student journey

| ID | Route | Files | Design intent | Status |
|----|-------|-------|---------------|--------|
| R-20-01 | `/dashboard` | `dashboard/page.tsx`, `page.module.scss`, widgets | «Сьогодні в навчанні»: next lesson, goals, progress hero | todo |
| R-20-02 | `/practice` | `practice/page.tsx` | Hub карток practice (Edvibe modules) | todo |
| R-20-03 | `/practice/speaking` | `practice/speaking/` | Focus mode, один primary action | todo |
| R-20-04 | `/practice/quiz` | `practice/quiz/` | Entry to quiz flow | todo |
| R-20-05 | `/practice/vocabulary` | `practice/vocabulary/` | Entry to vocab practice | todo |
| R-20-06 | `/lessons` | `lessons/page.tsx`, layout | Список уроків як розклад курсу | todo |
| R-20-07 | `/lessons/[id]` | `lessons/[lessonId]/` | Lesson room: materials, homework (Edvibe lesson page) | todo |
| R-20-08 | `/calendar` | `calendar/page.tsx` | Month/week readable; teacher filter mobile | todo |
| R-20-09 | `/chat` | `chat/page.tsx`, `ChatThread.tsx` | Inbox + thread; calm bubbles | todo |
| R-20-10 | `/vocabulary` | `vocabulary/page.tsx`, `sections.tsx` | Dictionary + study modes clarity | todo |
| R-20-11 | `/quiz` | `quiz/page.tsx` | Student quiz list / take flow | todo |
| R-20-12 | `/payment` | `payment/` | Trust + pricing clarity (Preply checkout tone) | todo |
| R-20-13 | `/profile` | `profile/page.tsx`, `panels.tsx` | Tabs shell; hero card premium | todo |
| R-20-14 | Profile tab: Profile | `ProfileDetailsPanel` in panels | Form density balanced | todo |
| R-20-15 | Profile tab: Statistics | `ProfileStatisticsPanel` | Charts readable, not cluttered | todo |
| R-20-16 | Profile tab: Notifications | `NotificationsPanel` | Toggle rows aligned | todo |
| R-20-17 | Profile tab: Connections | `LinkedAccountsPanel` | Trust badges for OAuth | todo |
| R-20-18 | Profile tab: Appearance | `AppearancePanel` | Theme/font preview immediate | todo |
| R-20-19 | Profile tab: Achievements | `ProfileAchievementsPanel` | Gamification refined (not childish) | todo |
| R-20-20 | Profile tab: Account | `AccountPanel` | Danger zone clear separation | todo |

### F4 — Teacher journey

| ID | Route | Files | Design intent | Status |
|----|-------|-------|---------------|--------|
| R-30-01 | `/students` | `students/page.tsx` | Roster: scan names, status, balance hint | todo |
| R-30-02 | `/students/[id]` shell | `StudentDetailsPage.tsx`, layout | Hero + tabs як «картка учня» Preply teacher view | todo |
| R-30-03 | Student tab: Profile | `StudentProfileTab.tsx` | Admin/teacher fields grouped | todo |
| R-30-04 | Student tab: Statistics | `sections` Statistics | Same chart language as profile | todo |
| R-30-05 | Student tab: Lessons | `StudentLessonsTab` | Timeline / list premium | todo |
| R-30-06 | Student tab: Billing | `StudentBillingTab`, ledger component | Money UI: tabular nums, clear ledger | todo |
| R-30-07 | Student tab: Achievements | `StudentAchievementsTab` | | todo |
| R-30-08 | Student tab: Vocabulary | `StudentVocabularyTab.tsx` | | todo |
| R-30-09 | Student tab: Quiz | `StudentQuizTab.tsx` | | todo |
| R-30-10 | Teacher dashboard reuse | `dashboard/` (teacher widgets) | Widgets for teacher role only | todo |
| R-30-11 | Teacher calendar/lessons | calendar + lessons (teacher actions) | Create lesson entry points obvious | todo |

### F5 — Admin & platform

| ID | Route | Files | Design intent | Status |
|----|-------|-------|---------------|--------|
| R-40-01 | `/admin` | `admin/page.tsx` | School admin: tables, actions restrained | todo |
| R-40-02 | `/system` shell | `system/page.tsx` | Super-admin «control room», not consumer playful | todo |
| R-40-03 | System tab: Email | `system/panels` EmailTestPanel | | todo |
| R-40-04 | System tab: Dictionary | `WordDictionaryPanel` | | todo |
| R-40-05 | System tab: Payments | `PaymentsPanel.tsx` | Provider cards premium | todo |

### F6 — Modals & overlays (уніфікація)

| ID | Component | Trigger | Files | Design intent | Status |
|----|-----------|---------|-------|---------------|--------|
| R-50-01 | Confirm dialog (global) | delete, etc. | `ConfirmDialogHost`, store | Єдиний danger/primary pattern | todo |
| R-50-02 | Lesson modal | calendar, lessons, context | `features/lesson-modal/*` | Edvibe lesson editor; tabs Setup/Content | todo |
| R-50-03 | Image preview overlay | lesson | `ImagePreviewOverlay.tsx` | Lightbox premium | todo |
| R-50-04 | Calendar conflict/warning/series/delete | calendar inline | `calendar/page.tsx` modals | Migrate visual to shared confirm style | todo |
| R-50-05 | New direct chat | chat | `NewDirectModal.tsx` | | todo |
| R-50-06 | Create group chat | chat | `CreateGroupModal.tsx` | | todo |
| R-50-07 | Word details | vocabulary, lesson | `WordDetailsModal.tsx` | Dictionary drawer-feel | todo |
| R-50-08 | Quiz assign modal | quiz teacher | `quiz/page.tsx` | | todo |
| R-50-09 | Quiz stats drawer | quiz teacher | `quiz/page.tsx` | Right drawer consistent | todo |
| R-50-10 | Quiz finish confirm | quiz | `quiz/page.tsx` | | todo |
| R-50-11 | Vocabulary finish modal | vocabulary sections | `vocabulary/sections.tsx` | | todo |
| R-50-12 | Avatar modal | profile | `profile/page.tsx` | | todo |
| R-50-13 | Change password modal | profile panels | `profile/panels.tsx` | | todo |
| R-50-14 | Payment method config | system | `PaymentMethodConfigModal.tsx` | Long form: sections, sticky actions | todo |
| R-50-15 | Dashboard lock overlay | dashboard | `dashboard/page.module.scss` | Subtle premium lock state | todo |

### F7 — QA & documentation

| ID | Task | Status |
|----|------|--------|
| R-90-01 | Full `agent-browser-all-pages.sh` + review screenshots | todo |
| R-90-02 | Mobile pass: 375px + 768px on top 5 routes | todo |
| R-90-03 | Dark mode pass on F0–F1 surfaces | todo |
| R-90-04 | Update `docs/llm-wiki/wiki/concepts/ui-design-system.md` from final tokens | todo |
| R-90-05 | a11y spot-check: focus rings, contrast on primary buttons | todo |

---

## 4. Матриця route × роль (для QA)

| Route | Student | Teacher | Admin | Super |
|-------|---------|---------|-------|-------|
| `/dashboard` | ✓ | ✓ | ✓ | ✓ |
| `/practice/*` | ✓ | ✓ | — | — |
| `/chat` | ✓ | ✓ | — | — |
| `/lessons`, `/lessons/:id` | ✓ | ✓ | — | — |
| `/calendar` | ✓ | ✓ | ✓ | — |
| `/students`, `/students/:id` | — | ✓ | ✓ | ✓ |
| `/payment` | ✓ | — | — | — |
| `/vocabulary`, `/quiz` | ✓ | ✓ | — | — |
| `/profile` | ✓ | ✓ | ✓ | ✓ |
| `/admin` | — | — | ✓ | ✓ |
| `/system` | — | — | — | ✓ |
| Auth routes | public | public | public | public |

---

## 5. Шаблони промптів для агента

### Короткий (щоденний)

```text
Крок R-20-01 з docs/redesign/plan.md.
Дизайн: Preply clarity + Edvibe learning focus + premium (docs/redesign/plan.md §1).
Обмеження: .cursor/skills/soenglish-redesign.md.
Після: agent-browser /dashboard як student; Status → done.
```

### Глибокий (складні екрани)

```text
Крок R-50-02 (Lesson modal).

1. Прочитай plan.md §1 і ui-design-system wiki.
2. Audit LessonModal + tabs; уніфікуй header/footer з R-50-01 якщо вже done.
3. Edvibe: матеріали та setup зрозумілі блоками; Preply: не перевантажуй форму.
4. Файли лише features/lesson-modal/** та пов’язані scss.
5. Screenshot: open modal from /calendar (teacher).
6. plan.md Status → done.
```

### Паралель (незалежні)

- `R-10-01` … `R-10-04` можна 4 subagents **після** `R-10-05` layout **або** спочатку layout, потім сторінки.
- Profile tabs `R-20-14`–`R-20-20` — паралельно після `R-20-13`.

---

## 6. Критерії «готово» для всього редизайну

- [ ] F0 + F1 `done` — єдина візуальна мова
- [ ] Усі routes з §3 мають `done` або обґрунтований `skip`
- [ ] Модалки виглядають однією сім’єю (F6)
- [ ] `agent-browser-all-pages.sh` без unexpected redirect/login failures
- [ ] Wiki `ui-design-system` відображає фінальні токени
- [ ] Немає нових Tailwind/shadcn у `apps/web`
- [ ] Спільна тема: нові стилі через токени; light/dark паритет
- [ ] SCSS: breakpoints через `respond-to`, без розсипаних magic media queries у змінених файлах
- [ ] Motion: learning-first; GSAP/Three лише за §1.3; reduced-motion поважається
- [ ] Reuse: сторінки компонуються з primitives/patterns; немає дубльованих one-off card/modal стилів

---

## 7. Changelog плану

| Date | Change |
|------|--------|
| 2026-05-27 | §1.4 structured UI + reuse; principle #10; R-00-08; agent checklist |
| 2026-05-27 | §1.3 motion: CSS → GSAP → Three.js; learning-first; R-00-07 |
| 2026-05-27 | Shared theme §1.1, SCSS rules §1.2, SaaS evolution note; R-00-05, R-00-06 |
| 2026-05-27 | Initial plan: Preply/Edvibe direction, 60+ steps, agent prompts |
