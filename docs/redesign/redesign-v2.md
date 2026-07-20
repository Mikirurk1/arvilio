# Arvilio Redesign v2 — «Editorial Paper»

> **Це головний план редизайну.** Попередній `plan.md` — заархівований (superseded).
> Кожен крок має ID. Після виконання кроку — онови `Status` і дату.

**Рішення зафіксовані з власником (2026-06-11):**
- Візуальний напрям: **Editorial Paper** — тепла «паперова» основа, ink-navy, Lora як характер, смілива типографіка, асиметричні layout, великі цифри прогресу.
- Анімації: **CSS-перш + GSAP** для таймлайнів, stagger і scroll-сцен.
- Обсяг: **увесь застосунок**, порядок фаз: shell → dashboard → навчальні флоу → календар/чат → решта.

## 0. Skill stack (обов'язково на кожному кроці)

Перед роботою над кроком завантаж усі чотири дизайн-скіли. Контекст продукту: `PRODUCT.md` + `DESIGN.md` (корінь репо).

| Скіл | Роль у кроці |
|---|---|
| `emil-design-eng` | Motion-рішення: animation decision framework (чи анімувати взагалі → навіщо → easing → тривалість), рецепти press-scale / origin-aware / tooltips, review-таблиця Before/After |
| `impeccable` | Product-register правила (всі states у компонентів, skeleton-loading, restrained color), абсолютні заборони (side-stripe borders, gradient text, hero-metric template, eyebrow над кожною секцією), контраст ≥4.5:1; команди `audit`/`critique`/`polish` для перевірки кроку |
| `ui-ux-pro-max-skill` | Прив'язка до проєкту: примітиви `components/ui`, async-button патерн, a11y-чекліст, Figma-воркфлоу за потреби |
| `frontend-design` | Сміливість напряму: editorial/magazine характер, асиметрія, не конвергувати в шаблон; перевірка «це могло бути будь-де?» |

Конфлікти вирішуються так: правила проєкту (CLAUDE.md, DESIGN.md) > impeccable product-register > решта. Зокрема: display-числа прогресу — **editorial headline у потоці тексту**, не stat-card grid (інакше це забанений hero-metric template); stagger на dashboard — один раз за сесію, сумарно ≤400ms, не «оркестрована завантажувальна сцена»; eyebrow-лейбли — лише де секція справді потребує ярлика.

---

## 1. Філософія дизайну

Платформа для **навчання**: кожен екран відповідає на питання *«що мені робити зараз?»*.
Дизайн не шаблонний не за рахунок декору, а за рахунок **характеру**: editorial-типографіка,
асиметрія, повітря, великі числа, продумані невидимі деталі, що складаються в ціле.

### Принципи (перевіряй на кожному кроці)

1. **Ієрархія дії** — один primary CTA на блок; «наступний крок» завжди найпомітніший елемент.
2. **Editorial, не dashboard** — заголовки Lora великим кеглем; числа прогресу як headline,
   а не як стат-таблиця; асиметричні сітки (2/3 + 1/3, не три рівні картки).
3. **Невидимі деталі компаундяться** — press-scale на кнопках, origin-aware попавери,
   instant tooltips після першого, тіні з navy tint. Користувач не помічає кожну — помічає суму.
4. **Рух має причину** — кожна анімація відповідає на «навіщо?»: feedback, просторовість,
   пояснення стану. «Красиво» — недостатня причина для частих дій.
5. **Стек незмінний** — SCSS modules + CSS variables + `components/ui`. Без Tailwind/shadcn.
6. **SaaS-ready** — семантичні токени (`--surface`, `--accent-primary`), не брендовані імена;
   майбутня школа = підміна змінних, не перепис сторінок.
6a. **Дизайн-система = портативний брендовий актив** — вона переживе цей застосунок:
   попереду окремий сервіс залучення учнів і репетиторів (marketplace/acquisition).
   Тому: (а) впізнаваність через **signature elements** (DESIGN.md «Signature»), не через
   випадкові one-off стилі; (б) примітиви `components/ui` не імпортують нічого
   app-специфічного (stores, GraphQL, фічі) — лише React/Next + токени, щоб екстракція
   в shared-пакет була механічною; (в) система покриває два регістри: product (school app,
   restrained) і brand (acquisition-сайт: та сама ДНК — палітра, Lora, криві — але
   Committed-колір, більший кегль, сміливіший рух).
7. **Структура > polish** — якщо layout кроку заважає ясності, міняй структуру екрана
   (розбий секції, прибери зайві CTA, інша сітка), не лише кольори. Обґрунтуй у коментарі кроку.
8. **Reuse-first: Button/Field замість нативних** — жодних нових `<button>`, `<input>`,
   `<select>`, `<textarea>` у фічах. Бракує функціоналу — **розширюй примітив** (variant,
   prop, новий тип у Field union), а не пиши локальний контрол. Кожен крок редизайну
   попутно мігрує нативні елементи у своїх файлах (інвентар — §3.0).

### Планка крафту: «команда досвідчених дизайнерів», не AI-шаблон

Фінальний фільтр кожного кроку — екран має виглядати так, ніби над ним працювала
senior-команда великого продукту. Конкретні ознаки, які це відрізняють:

| AI-шаблон (відхиляємо) | Досвідчена команда (вимагаємо) |
|---|---|
| Один рефлекс на всі секції: однакові картки, однаковий fade-in всюди, eyebrow над кожним заголовком | Кожна секція вирішена **під свій контент**: список — як список, hero — як hero, таблиця — щільна; ритм варіюється свідомо |
| Рівномірна сітка 3×N карток незалежно від змісту | Ієрархія від задачі: головне — велике й одне, другорядне — компактне; асиметрія і навмисні розриви сітки |
| Перший Google-результат для категорії (LMS = sidebar + stat-картки + таблиця) | Рішення, яке не вгадується з категорії; перевірка «slop test»: якщо палітру/layout можна вгадати зі слова "LMS" — переробити |
| Декор без функції: градієнти, glassmorphism, анімація «бо красиво» | Кожна деталь має причину; краса з точності — оптичні вирівнювання, ідеальні відступи, вивірені стани |
| Generic-мікрокопія («No items yet», «Something went wrong») | Мікрокопія написана під контекст школи й допомагає рухатись далі |
| Стани за залишковим принципом (порожньо/помилка/loading виглядають зламано) | Empty/error/loading спроєктовані як повноцінні екрани — саме тут видно досвід команди |
| Всі екрани однакової «гучності» | Свідома драматургія: dashboard спокійний, celebration яскравий, оплата максимально стримана |

Практично: перед `done` агент дивиться на екран і питає — **«чи могла б це показати на портфоліо senior product-команда?»**. Якщо відповідь «це схоже на адмінку з туторіалу» — крок не завершено, повертайся до структури (§1.5/принцип 7).

### Чого НЕ робимо

- Анімацій на keyboard-діях і діях, що повторюються 100+ разів/день.
- Декоративного руху на уроці-в-процесі, квізі-в-процесі, оплаті.
- `transition: all`, `ease-in` на UI, `scale(0)` на появі, durations > 300ms для UI.
- Purple-gradient «AI template» look; трьох однакових карток у ряд як перше рішення.

---

## 2. Дизайн-токени v2 (фаза V0)

Усе нижче — у `apps/campus/src/styles/tokens/`, в обидві теми (light/dark).

### 2.1 Типографіка — editorial scale

| Токен | Роль | Напрям |
|---|---|---|
| `--font-display` | Lora | Заголовки сторінок/секцій, великі числа прогресу |
| `--font-sans` | поточний sans | UI, body, форми |
| `--fs-display-xl` | ~clamp(2.5rem → 4rem) | Hero-числа (78%, стрік), вітання на dashboard |
| `--fs-display` | ~clamp(1.75rem → 2.5rem) | Заголовки сторінок |
| `--fs-title` | 1.25–1.5rem | Заголовки карток/секцій |
| `--fs-body` / `--fs-caption` | існуючі | Без змін |

Числа (бали, гроші, стрік) — завжди `font-variant-numeric: tabular-nums`.

### 2.2 Motion-токени (нові, `tokens/_motion.scss`)

```scss
:root {
  /* Сильні кастомні криві — вбудовані CSS easings заслабкі */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* enter/exit, відповідь UI */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* рух/морфінг на екрані */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* drawer/sheet, iOS-curve */

  --dur-press: 140ms;     /* кнопки, press feedback */
  --dur-fast: 180ms;      /* tooltips, dropdowns, hover */
  --dur-base: 240ms;      /* popovers, tabs, list items */
  --dur-modal: 320ms;     /* modals, drawers */
}
```

Правила застосування:

| Елемент | Рецепт |
|---|---|
| Кнопки (всі pressable) | `:active { transform: scale(0.97) }`, `transition: transform var(--dur-press) var(--ease-out)` |
| Поява елементів | від `scale(0.95)` + `opacity: 0`, ніколи від `scale(0)` |
| Popover/dropdown | `transform-origin` від тригера; модалки — center |
| Tooltip | delay на перший, instant на сусідні |
| Списки (входи) | stagger 30–60ms між елементами, не блокує взаємодію |
| Exit | швидше за enter |
| Reduced motion | `prefers-reduced-motion`: лишити opacity/color, прибрати рух |
| Transitions > keyframes | для переривчастого UI (toasts, toggles) — transitions |

### 2.3 GSAP — де можна, де ні

Встановлюється в V0-03. `gsap.context()` + cleanup у `useEffect`; respect reduced-motion.

| Можна | Не можна |
|---|---|
| Stagger-входи секцій dashboard | Будь-який рух на quiz-питанні в процесі |
| Целебрація завершення уроку/квізу (rare event) | Анімації відкриття частих меню (CSS досить) |
| Анімація числа прогресу (count-up при першому показі) | Лоадери даних (CSS spinner, швидкий) |
| Onboarding / empty-state ілюстрації | Keyboard-ініційовані дії |

### 2.4 Політика розширення примітивів (reuse-first)

Поточний API вже покриває більшість потреб — спершу перевір його, потім розширюй, і лише в крайньому разі створюй нове:

| Примітив | Вже є | Як розширювати |
|---|---|---|
| `Button` | `variant: default/primary/ghost/dashed/danger`, `loading`/`loadingLabel`, `href` (рендер як Link), `startIcon`/`endIcon`, `active`, `classNames` slots | Іконкові кнопки тулбарів = `variant="ghost"` + `startIcon`, **не** новий компонент. Новий variant — лише якщо це нова семантична роль на ≥2 екранах |
| `Field` | discriminated union: input / textarea / select / advanced-select / checkbox / file-button; `label`, `hint`, `error`, `describedBy` | Новий тип контролу (range/slider, color, search) = новий член union у `Field.tsx`, щоб label/hint/error дістались безкоштовно |
| Інші | `SurfaceCard`, `PanelCard`, `PageHeader`, `SectionHeader`, `EmptyStateCard`, `Badge`, `Tabs`, `SegmentedControl`, `Tooltip`, `StatTile`, `UserAvatar`, pickers | Та сама логіка: prop/variant > новий компонент > копія markup (заборонено) |

**Дозволені винятки для нативних елементів** (фіксуй коментарем у коді):
- Hidden `<input type="file">` для upload-зон.
- Raw element ref, який вимагає third-party API (canvas/Konva, video/LiveKit, pdf.js).
- `<a>` для зовнішніх URL (`target="_blank" rel="noopener noreferrer"`).

Усе інше — мігрується. Один і той самий UI двічі = виноси в примітив/feature block, не копіюй SCSS.

### 2.5 Поверхні й глибина (уточнення наявного)

Зберігаємо: warm `--surface` → `--surface-raised` → `--card`, navy-tinted shadows, hairline borders.
Додаємо: **editorial-розрив** — секції розділяються типографікою (overline + rule) частіше,
ніж картками; картка — для *дієвого* контенту (урок, завдання), не для кожного блока.

---

## 3. Фази і кроки

**Статуси:** `todo` → `wip` → `done`. Один ID за один прохід агента, якщо явно не згруповано.

### 3.0 Інвентар нативних контролів для міграції (знято з коду 2026-06-11)

Мігруються **в рамках кроку відповідної фази** (не окремим мега-рефактором). `btn` = `<button>` → `Button`, `inp` = `<input>`/`<select>`/`<textarea>` → `Field`.

| Фаза | Файли |
|---|---|
| V2 | `app/dashboard/dashboard-widgets.tsx` (btn) |
| V3 | `features/materials/*` — 8 файлів btn + 4 inp (MaterialAssetLink, LibraryMaterialPicker, MaterialFormModal, MediaViewer*, AnnotationToolbar, SessionNotesPanel, PageNavigator, LessonLibraryMaterialPanel); `features/speaking/*` — 5 btn + 2 inp (RecordSession, AudioPlayer, CreateSpeakingTopicCard, TopicWordPicker, WordChip); `components/quiz/CreateQuizCard.tsx`; `components/backend/LessonVideoRoom.tsx`, `LessonPreJoin.tsx` (btn; LiveKit — можливі винятки за §2.4) |
| V4 | `app/chat/ChatThread.tsx` (inp) |
| V5 | `app/payment/PackageSelector.tsx` (btn); `app/profile/AvatarCropModal.tsx` (btn+inp; crop-slider — кандидат на Field range type); `components/profile/UserColorPicker.tsx` (inp; кандидат на Field color type) |
| V6 | `app/system/*` — VideoMeetingsPanel, payment-config-primitives, connection-ui (btn); EmailPanel, MediaCaptionsPanel, PaymentsPricingSection, ConnectionsPanel, word-dictionary ×3 (inp); `app/students/GroupEditorCard.tsx` (btn), `app/students/[studentId]/billing/*` ×2 (inp) |

Також 5 файлів з `<img>` → `next/image` — мігрувати у відповідних фазах.

### V0 — Фундамент (блокує все інше)

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V0-01 | Motion-токени: `tokens/_motion.scss`, підключити в `global.scss`; видалити/замінити слабкі keyframes у `_animations.scss` | `styles/tokens/_motion.scss`, `styles/global.scss`, `styles/_animations.scss` | done | 2026-06-11 |
| V0-02 | Editorial type scale: `--fs-display-xl`, `--fs-display`, ролі Lora/sans; tabular-nums helper | `styles/tokens/_typography.scss`, `styles/_typography.scss` | done | 2026-06-11 |
| V0-03 | Встановити `gsap` у `apps/campus`; створити `lib/motion/` (gsap context helper + reduced-motion hook) | `apps/campus/package.json`, `src/lib/motion/*` | done | 2026-06-11 |
| V0-04 | Button v2: press-scale, кастомні easing, loading-морфінг із blur-маскою | `components/ui/Button.tsx`, `ui.module.scss` | done | 2026-06-11 |
| V0-05 | Popover/Tooltip v2: origin-aware, instant-наступні tooltips, нові durations | `components/ui/Tooltip.tsx`, `PickerPopover.tsx`, `picker.module.scss` | done | 2026-06-11 |
| V0-06 | Modal recipe v2: enter від scale(0.96)+opacity, exit швидший, backdrop fade | `styles/_modal-recipe.scss` | done | 2026-06-11 |
| V0-07 | Аудит page SCSS: inline breakpoints → `respond-to()`, hardcoded hex → токени. Breakpoints: усі 6 виправлено. Hex: ядро (`ui.module.scss`) чисте; page-рівневі hex (~30 файлів, топ: word-details-modal 44, system 18, payment 18) мігруються у кроках своїх фаз — сліпа масова заміна без візуальної перевірки ризикована | усі `*.module.scss` з порушеннями | done | 2026-06-11 |
| V0-08 | Field v2: editorial-стилі контролів; `range` і `color` — реалізовано простіше за план: без нових членів union, через нативний `type` (детекція в input-пайплайні + класи `fieldRange`/`fieldColor`). Закриває AvatarCropModal, AudioPlayer, UserColorPicker без нативних `<input>` | `components/ui/Field.tsx`, `ui.module.scss` | done | 2026-06-11 |
| V0-09 | Portability seam: аудит чистий — `components/ui` імпортує лише pure lib-утиліти, без stores/GraphQL/features; список дозволених імпортів зафіксовано в DESIGN.md; Signature elements нормативні (DESIGN.md) | `components/ui/*`, `DESIGN.md` | done | 2026-06-11 |

### V1 — Shell + навігація (видно на кожному екрані)

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V1-01 | Sidebar: «навігація курсу» — групи Learn / Schedule / Connect / Account / Platform (порожні після RBAC ховаються); активний пункт — editorial-риска зліва (scaleY-анімація) замість filled pill; заголовки секцій — eyebrow + чорнильна лінія | `components/layout/sidebar-nav.tsx`, `Sidebar.module.scss` | done | 2026-06-11 |
| V1-02 | Header: editorial-полір (hairline-межі, motion-токени, tabular-nums у лічильниках). Інспекція спростувала план: «Create lesson» — не дублікат (єдина персистентна точка створення для викладача; calendar створює через слоти) — збережено; display-заголовок сторінки лишається в PageHeader на сторінках, дублювати його в shell — гірше | `components/layout/Header.module.scss` | done | 2026-06-12 |
| V1-03 | Mobile drawer: `--ease-drawer`, swipe-to-close з velocity-dismiss, damping на краях; exit-анімація перед unmount (closing-стан + transitionend + fallback-таймаут) | `components/layout/MobileNavDrawer.*`, `use-drawer-swipe.ts` | done | 2026-06-12 |
| V1-04 | Page transitions: `app/template.tsx` — fade+rise 240ms `--ease-out` на навігацію; той самий розділ (перший сегмент шляху) не анімується (module-scope пам'ять переживає remount). Прибрано 15 дубль-анімацій slideUp з page-роотів (тепер ними володіє template); порожні правила заякорені, бо Sass викидає їх з виводу і клас зник би з CSS-модуля | `app/template.tsx` + `.module.scss` (нові), 15 page-модулів | done | 2026-06-12 |

### V2 — Dashboard учня

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V2-01 | **«Sokovyti» direction** — deep green hero with Lora display number, colored stat card tints + 3px accent borders, editorial `--fs-36` Lora stat values, `data-value` ghost watermark, asymmetric `2fr 320px` layout, quick actions migrated to `Button variant="ghost"` with chunky padding + green hover wash | `app/dashboard/*` | wip | 2026-06-14 |
| V2-02 | GSAP stagger-вхід секцій (один раз за сесію), count-up прогресу; reduced-motion fallback | ті ж + `lib/motion` | todo | |
| V2-03 | Empty states: новий учень без уроків бачить зрозумілий «з чого почати», не порожні картки | `EmptyStateCard.tsx`, dashboard | todo | |

### V3 — Навчальні флоу (ядро)

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V3-01 | Lessons list: розділити «активний/наступний урок» (велика картка) від архіву (компактний список); статус = колір + текст | `app/lessons/page.tsx`, `page.module.scss` | todo | |
| V3-02 | Lesson page: фокус-режим — матеріали/завдання в один потік, мінімум хрому; жодного декоративного руху | `app/lessons/[lessonId]/*` | todo | |
| V3-03 | Practice hub: вибір активності як «полиця» (vocabulary / quiz / speaking), великі зрозумілі входи | `app/practice/page.tsx`, `sections.tsx` | todo | |
| V3-04 | Quiz: прогрес-смуга, перехід між питаннями ease-in-out ≤240ms, feedback відповіді (правильно/ні) — миттєвий колір+текст; целебрація лише на результаті (rare event, можна GSAP) | `app/practice/quiz/*`, `app/quiz/*` | todo | |
| V3-05 | Vocabulary + flashcards: 3D flip картки (CSS preserve-3d), swipe-жести з velocity; статуси повторення зрозумілі | `app/practice/vocabulary/*`, `app/vocabulary/*` | todo | |
| V3-06 | Speaking: стан запису очевидний (pulse — постійний рух = linear), результат поруч із дією | `app/practice/speaking/*` | todo | |
| V3-07 | Materials: бібліотека з ясним групуванням, прев’ю без перевантаження | `app/materials/*` | todo | |

### V4 — Календар + чат

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V4-01 | Calendar: тиждень/місяць через SegmentedControl, події = картки з чіткою ієрархією час→предмет→викладач; «сьогодні» — editorial-акцент | `app/calendar/*` | todo | |
| V4-02 | Chat inbox + thread: список діалогів і повідомлення — щільніше, нові повідомлення входять transition (не keyframes, переривчасте) | `app/chat/*` | todo | |

### V5 — Профіль, оплата, фінанси

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V5-01 | Profile: hero + панелі налаштувань, async-кнопки за правилом web-async-actions | `app/profile/*` | todo | |
| V5-02 | Payment: довіра — ясні суми (tabular-nums), статуси, нуль декоративного руху | `app/payment/*` | todo | |
| V5-03 | Finance: таблиці/звіти читабельні, числа вирівняні | `app/finance/*` | todo | |

### V6 — Операційні зони (admin / staff / students / system)

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V6-01 | Admin + staff: той самий shell і тема (не «інший продукт»), форми через Field, таблиці через спільний рецепт | `app/admin/*`, `app/staff/*` | todo | |
| V6-02 | Students (деталі учня): hero + вкладки, узгодити з новою системою | `app/students/*` | todo | |
| V6-03 | System: platform-зона, той самий каркас | `app/system/*` | todo | |

### V7 — Auth + фінальний полір

| ID | Крок | Файли | Status | Done |
|---|---|---|---|---|
| V7-01 | Auth-екрани: перше враження — editorial (Lora, повітря, один CTA) | `app/(auth)/*` | todo | |
| V7-02 | Dark mode прохід: усі нові токени в dark-мікстіні, контраст AA | `tokens/_theme.scss` + вибірково | todo | |
| V7-03 | Motion-аудит: чекліст §4 по всьому застосунку, slow-motion перевірка ключових анімацій | всюди | todo | |
| V7-04 | Reduced-motion аудит + touch hover-гейти `@media (hover: hover)` | всюди | todo | |

---

## 4. Чекліст ревʼю кроку (перед `done`)

- [ ] `transition` із конкретними властивостями (не `all`); тільки `transform`/`opacity` анімуються
- [ ] Кастомні easing-токени, не вбудовані `ease-in`/built-ins
- [ ] Durations ≤ 300ms для UI; exit швидший за enter
- [ ] Поява від `scale(0.95)+opacity`, не від нуля; popover origin-aware
- [ ] Кнопки мають press-feedback; async-кнопки — `loading` за web-async-actions
- [ ] Жодних анімацій на keyboard-діях і частих діях
- [ ] `prefers-reduced-motion` врахований; hover за `@media (hover: hover)`
- [ ] Кольори лише з токенів; breakpoints лише через `respond-to()`
- [ ] Один primary CTA на блок; статус = колір + текст
- [ ] Light і dark перевірені; мобільний layout перевірений
- [ ] RBAC і маршрути не змінені; поведінка без регресій
- [ ] Контраст: body ≥4.5:1, large text ≥3:1 (включно з placeholder)
- [ ] Інтерактивні компоненти мають усі states (hover/focus/active/disabled/loading/error)
- [ ] Loading = skeleton, не спінер посеред контенту; empty state навчає
- [ ] Заборони impeccable: без side-stripe borders, gradient text, glassmorphism-за-замовчуванням, однакових card-grid, eyebrow над кожною секцією
- [ ] Display-шрифт (Lora) не потрапив у кнопки/лейбли/таблиці
- [ ] Жодних нових нативних `<button>`/`<input>`/`<select>`/`<textarea>`/`<img>`; нативні в зачеплених файлах мігровані на `Button`/`Field`/`Image` або виняток зафіксовано коментарем (§2.4)
- [ ] Повторюваний UI винесено в примітив/feature block, SCSS не скопійовано

## 5. Робочий процес кроку

0. Завантаж skill stack (§0) і прочитай `PRODUCT.md` + `DESIGN.md`.
1. Прочитай рядок кроку тут (ID, файли, інтент) + §1–2.
2. Перевір існуючі примітиви (`components/ui/index.ts`) і найближчу вже редизайнену сторінку — **компонуй, не переписуй**.
3. Зміни лише файли кроку; нові кольори/криві — спершу токен, потім використання.
4. Прожени чекліст §4; перевір route у браузері.
5. Постав `done` + дату в таблиці.
6. Онови wiki (`docs/llm-wiki/wiki/concepts/ui-design-system.md`), якщо токени чи примітиви змінились суттєво.
