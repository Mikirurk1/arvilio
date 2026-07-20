# Design

Візуальна система Arvilio, знята з коду (`apps/campus/src/styles/`). Код — ground truth; цей файл — компас для агентів. Напрям редизайну: **Editorial Paper** (`docs/redesign/redesign-v2.md`).

**Статус системи:** портативний брендовий актив. Вона розрахована на повторне використання поза цим застосунком — попереду окремий acquisition-сервіс для залучення учнів і репетиторів. Унікальність тримається на Signature-елементах нижче, а портативність — на семантичних токенах і чистих примітивах (без app-специфічних імпортів).

## Signature — що робить дизайн впізнаваним (нормативно)

Це підпис бренду. Кожен новий екран (і майбутній проєкт) має відтворювати ці елементи; губити їх — значить розчинити бренд у «як у всіх».

1. **Ink & Paper** — тепла паперова основа `#f6f4ef` + чорнильний navy `#1a1a2e` + **один** зелений `#159970`. Не стерильний SaaS-білий, не purple-AI, не пастельна веселка.
2. **Серифні display-числа** — Lora для чисел прогресу/стріку/балів (tabular-nums) як headline. В edtech усі ставлять округлий sans — серифні цифри миттєво відрізняють нас.
3. **Editorial rule** — секції розділяє типографіка: заголовок + тонка чорнильна лінія, а не нескінченні картки. Картка — лише для дієвого контенту.
4. **Чорнильна глибина** — тіні navy-tinted (не black), hairline-межі 7% navy. Глибина як у друку: мінімальний тональний крок + тінь.
5. **Фірмовий рух** — `--ease-out: cubic-bezier(0.23,1,0.32,1)`, press-scale 0.97, поява від scale(0.95); стриманий, швидкий (≤300ms), однаковий усюди. Рух — теж підпис.
6. **Асиметрія наступного кроку** — головна дія в сітці 2/3+1/3, не три рівні картки.

## Регістри — одна ДНК, дві інтенсивності

| | School app (зараз) | Acquisition-сервіс (майбутнє) |
|---|---|---|
| Регістр | product — дизайн служить задачі | brand — дизайн і є продукт |
| Колір | Restrained: нейтрали + зелений ≤10% | Committed: зелений/navy можуть нести 30–60% поверхні |
| Типографіка | фіксована rem-шкала, Lora лише display | fluid clamp, Lora сміливіше і більше |
| Рух | стан і feedback, ≤300ms | дозволені scroll-сцени, stagger-hero, довші тривалості |
| Спільне | токени, Signature 1–5, примітиви Button/Field, криві руху | те саме ядро — інша гучність |

## Theme

- Light default на `:root`; dark через `data-theme="dark"` на `<html>` (runtime: `ui-store` + `providers.tsx`).
- Усі кольори — semantic CSS variables з `styles/tokens/_theme.scss`. Нові кольори додаються в **обидві** теми (mixins `light-theme` / `dark-theme`). Жодних hex у page SCSS.
- Масштаб шрифту: `data-font-size` = small (14px) / medium (16px) / large (18px) — все в `rem`.

## Color

| Роль | Token | Light |
|---|---|---|
| Текст | `--text-primary` → `--text-faint` | ink-navy ramp: `#1a1a2e` → `#b4b4cc` |
| Канвас | `--surface` | warm `#f6f4ef` |
| Секції | `--surface-raised` | `#fbfaf6` |
| Контент | `--card` | `#ffffff` |
| Primary accent | `--green` (`--accent-primary`) | `#159970` — прогрес, success, головний CTA |
| Info / links | `--blue` | `#3a75b5` |
| Увага | `--amber` | `#e8942e` — обережно |
| Danger | `--rose` | `#d95674` |
| Premium (рідко) | `--purple` / `--lilac` | desaturated, лише бейджі |

Стратегія: **Restrained** — теплі нейтрали + один зелений акцент; акцент лише для дій/стану/прогресу, не для декору. Кожна light-палітра має `*-light` пару для тінтів.

- Borders: hairline `--border-subtle` (7% navy) за замовчуванням; `--border` 10%; `--border-strong` 20%.
- Тіні: navy-tinted (не black), 4 ступені `--shadow-xs..lg`; глибина = маленький тональний крок + тінь + hairline, не великий стрибок кольору.

## Typography

- `--font-display`: **Lora** (serif) — заголовки сторінок/секцій, display-числа. Через `next/font`.
- `--font-sans`: **Outfit** — увесь UI, body, форми, дані. Display-шрифт ніколи в кнопках/лейблах/таблицях.
- Scale (fixed rem, не fluid): `--fs-display` 2.375 / `--fs-page-title` 2 / `--fs-section-title` 1.375 / body 0.9375 / `--fs-sm` 0.8125; повна сходинкова шкала `--fs-9..52`.
- `--lh-body: 1.62`, `--lh-display: 1.2`; tracking: tight −0.02em (display), caps +0.06em.
- Числа (бали, гроші, стрік): `font-variant-numeric: tabular-nums`.
- Eyebrow (`--fs-eyebrow` caps-label): **рідко і за призначенням**, не над кожною секцією.

## Layout

- App shell: sidebar 240px (collapsed 72px) + `<main>` з gutters `--main-padding-*`; mobile — drawer `--nav-drawer-width`.
- Контейнери: `.container` + модифікатори (`--container-max-default` 1200, narrow 760, prose 720, form 560).
- Вертикальний ритм: `--space-section-xs..lg` (12/20/28/40), картка `--space-card-padding` 20/24.
- Breakpoints лише через `$breakpoint-*` + `@include respond-to(...)` з `styles/_mixins.scss`: xs 480 / sm 768 / md 1024 / lg 1200 / xl 1440 (+ проміжні tight/compact/stacked/narrow).
- Radius: 6 / 8 / 12 (`$border-radius-*`); карткам не більше 16px; full-pill лише теги/кнопки.
- Z-index — семантична шкала в `_layout.scss`, не довільні 999.

## Components

Примітиви в `apps/campus/src/components/ui/` (експорт через `index.ts`) — **завжди спершу вони**:

`Button` (variant, loading, startIcon) · `Field` (input/textarea/select/checkbox, адаптивний select) · `SurfaceCard` · `PanelCard` · `PageHeader` · `SectionHeader` · `EmptyStateCard` · `Badge` · `Tabs` · `SegmentedControl` · `Tooltip` · `StatTile` · `UserAvatar` · `PickerPopover` + date/time pickers.

- Кожен інтерактивний компонент: default / hover / focus / active / disabled / loading / error.
- Async-дії: `Button loading` + per-action pending state (`.claude/rules/web-async-actions.md`).
- Loading контенту: skeleton, не спінер посеред екрана. Empty state навчає інтерфейсу.
- Модалки: спільний рецепт `styles/_modal-recipe.scss`; перед модалкою — спершу inline/progressive варіант.
- **Reuse-first:** жодних нативних `<button>`/`<input>`/`<select>`/`<textarea>` у фічах — лише `Button`/`Field`. Бракує функціоналу → розшир примітив (variant/prop, новий тип у Field union), не пиши локальний контрол. Винятки (hidden file input, third-party refs) — за `docs/redesign/redesign-v2.md` §2.4.
- **Portability (перевірено 2026-06-11):** `components/ui` імпортує лише React/Next/lucide + pure-утиліти з `lib/` (breakpoints, date-picker-utils, tel-mask, strip-native-validation, tag-list, avatar) і `hooks/use-infinite-scroll-sentinel` — без stores/GraphQL/features. Екстракція в shared-пакет = ui + ці утиліти. Нові імпорти в ui поза цим списком — заборонені; дані заходять через props.
- `Field type="range"` і `type="color"` — стилізовані примітиви (editorial slider, color swatch) — нативні `<input type=range/color>` у фічах більше не потрібні.

## Motion

Цільова система — `docs/redesign/redesign-v2.md` §2.2 (V0-01 створює `tokens/_motion.scss`):

- Криві: `--ease-out cubic-bezier(0.23,1,0.32,1)` (enter/feedback), `--ease-in-out cubic-bezier(0.77,0,0.175,1)` (рух на екрані), `--ease-drawer cubic-bezier(0.32,0.72,0,1)`.
- Durations: press 140ms / fast 180ms / base 240ms / modal 320ms. UI ≤ 300ms; exit швидший за enter.
- Тільки `transform` + `opacity`; конкретні властивості в `transition` (не `all`); поява від `scale(0.95)+opacity`, не від 0.
- GSAP — лише таймлайни/stagger/celebration у рідкі моменти; ніколи на частих діях, keyboard-діях, quiz-в-процесі, оплаті.
- `prefers-reduced-motion` — обов'язково; рух прибирається, opacity лишається.

## Don'ts

- Tailwind / shadcn у `apps/campus`; hex-кольори в page SCSS; inline `768px` у media queries.
- `border-left` як кольоровий акцент-смужка; gradient text; glassmorphism за замовчуванням.
- Три однакові stat-картки в ряд як перше рішення; nested cards.
- Display-шрифт у UI-контролах; повносатуровані акценти на неактивних станах.
