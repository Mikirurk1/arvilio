---
tags: [concept, frontend, ui]
updated: 2026-07-20
---

# UI design system

Shared primitives live in **`@fe/ui`** (`packages/frontend/shared-ui`). Campus still has app-local composites under `apps/campus/src/components/ui/` (cards, tabs, entitlements, …) that re-export or wrap the shared kit.

| Primitive | Package |
|-----------|---------|
| `Button` | `@fe/ui` — variants: `default` \| `primary` \| `ghost` \| `dashed` \| `danger` \| **`bare`** (no chrome; custom className) |
| `Field` (input / textarea / select / `advancedSelect` / **`checkbox`** / **`radio`** / date / time / password / …) | `@fe/ui` |

Styled choice controls: `<Field as="checkbox" label="…" />` and `<Field as="radio" name="…" label="…" />` — custom face (not native OS chrome). Prefer these **everywhere** in Campus/Platform; do not use bare `<input type="checkbox">`.

- `label` may be a string or React node; `hint` renders inline under the label (next to the control).
- `variant="card"` — bordered preference toggle (System → AI, Platform LLM enable, etc.).
- Styles: `packages/frontend/shared-ui/src/styles/primitives.module.scss` (`.choiceControl*`, `.choiceCard`).
| `AdvancedSelectControl` | `@fe/ui` |

### No raw `<button>` / `<select>` in apps

`apps/campus` and `apps/platform` must use `@fe/ui` (Campus may import via `@/components/ui`). ESLint `no-restricted-syntax` bans JSX `<button>` and `<select>` in those apps. Native elements remain only inside `@fe/ui` primitives. For card/icon hit targets use `<Button variant="bare" className={…}>`.

Campus: `import { Button, Field } from '@/components/ui'` (re-export) or `from '@fe/ui'`.  
Control Plane: `import { Button, Field } from '@fe/ui'`.

### Control Plane shell (ops register)

`apps/platform` uses Editorial Paper at ops density (cooler surface, Source Sans 3, Lora titles). Shell is **full-bleed**: main has no `max-width`; `Panel` is full width by default (`variant="narrow"` for short forms). Nav groups (Fleet / Billing / Ops / System) with Lucide icons + `aria-current` active state. Local chrome: `PageHeader` (optional icon), `PageStack`, `PageGrid`, `StatCard` (+ icon), `InfiniteDataTable`. Tokens: `--content-pad-*`, `--section-gap` in `apps/platform/src/styles/tokens/_theme.scss`.

**Theme:** light / dark / system via `data-theme` on `<html>`. Boot script `serializeInitialAppearanceScript()` (`apps/platform/src/lib/appearance.ts`, localStorage `arvilio-platform-ui`) + sidebar Light/Dark/System toggle in `ConsoleShell`. Dark mixin uses cooler ink surfaces (not Campus warm paper). Login page respects the same `data-theme`.

**Dashboard:** KPI `StatCard` strip + compact secondary metric chips (operators, orphans, blocked, trials ending, rails configured) + optional “Trials ending soon” + two-column Recent campuses / Recent audit panels. Data from enriched `GET /platform/dashboard`.

**Campus plans:** default offer card + country override cards with live currency preview for Starter/Pro; no nested “Offers” panel.

## Styling stack

| Layer | Location |
|-------|----------|
| Tokens | Per app: `apps/campus/src/styles/tokens/`, `apps/platform/src/styles/tokens/` |
| Shared primitive SCSS | `packages/frontend/shared-ui/src/styles/primitives.module.scss` (+ `picker.module.scss`) |
| Campus composites | `apps/campus/src/components/ui/ui.module.scss` |
| Co-located | `*.module.scss` per page/feature |

- **CSS custom properties** for theming (`data-theme` on `<html>` via `ui-store`)
- **Semantic accents** (2026-05-27 redesign F0): prefer `--accent-primary` (maps to green), `--accent-info`, `--accent-warning`, `--accent-danger`, `--accent-premium` over raw `--purple` for new UI
- **Elevation:** `--shadow-xs` … `--shadow-lg`, `--overlay-backdrop`, `--surface-raised`; section spacing `--space-section-*` in `tokens/_layout.scss`
- **SCSS breakpoints:** standard tiers via `@include respond-to(sm|md|…)`; extra widths (`$breakpoint-narrow`, `compact`, etc.) via `@include respond-max($breakpoint-*)` in `styles/_mixins.scss` — no raw `@media (max-width: Npx)` in `*.module.scss`
- **Page title mixin:** `@include page-title-display` for display headings
- **Font size** (Profile → Appearance): `data-font-size` on `<html>` sets root to 14px / 16px / 18px; component text uses `rem` or `var(--fs-N)` from `styles/tokens/_typography.scss` so the whole shell scales, not only page titles
- **No Tailwind** in production web app
- Icons: **lucide-react**

## Shared theme (`data-theme`)

**Source:** `apps/campus/src/styles/tokens/_theme.scss` — mixins `light-theme` / `dark-theme` on `:root`, `[data-theme='light']`, `[data-theme='dark']`.

**Runtime sync:** `lib/appearance/apply-appearance.ts` (`applyAppearanceToElement`, `resolveThemeMode`) used by:

- `app/providers.tsx` → `AppearanceSync` (Zustand `ui-store`: `light` \| `dark` \| `auto` + font size)
- Inline script from `serializeInitialAppearanceScript()` in `layout.tsx` (anti-flash before hydration)

**Rule:** add new colors in **both** theme mixins; consume via `var(--*)` in SCSS. Avoid page-level `[data-theme='dark'] { … }` unless a one-off cannot be expressed as a semantic token.

### Token groups (SaaS-ready names)

| Group | Examples | Use |
|-------|----------|-----|
| Text | `--text-primary` … `--text-faint` | Typography |
| Surfaces | `--surface`, `--card`, `--surface-raised`, `--surface-inset`, `--surface-panel`, `--surface-offer` | Layout layers |
| Accents | `--accent-primary`, `--accent-info`, `--accent-danger`, … | Roles (map to palette vars) |
| Palette | `--green`, `--blue`, `--rose`, … | Rare direct use; prefer accents |
| Elevation | `--shadow-xs` … `--shadow-lg`, `--shadow-focus` | Cards, focus |
| Modals | `--backdrop-modal`, `--modal-bg`, `--modal-header-bg`, `--modal-section-bg` | Overlays |
| Chrome | `--inset-highlight`, `--badge-warning-bg`, `--on-inverse` | Header badges, inverse text |
| Status | `--status-info-*`, `--status-success-*`, `--status-warning-*`, `--status-danger-*` | Cross-page pills/badges |

Future **per-school** theming: override this variable set (not per-page hex). Platform-only screens (`/system`) still use the same shell tokens today.

### 2026-06 consistency hardening

- Added stronger semantic status accents in `tokens/_theme.scss`: `--accent-warning-strong`, `--accent-danger-strong`.
- Added shared status role tokens for chips/pills: `--status-info-*`, `--status-success-*`, `--status-warning-*`, `--status-danger-*`.
- Introduced shared modal SCSS recipe in `apps/campus/src/styles/_modal-recipe.scss` and reused it in:
  - `apps/campus/src/features/materials/media-viewer/media-viewer.module.scss`
  - `apps/campus/src/app/calendar/page.module.scss`
- Added a style guardrail script (`scripts/style-guardrails.cjs`) and npm command `npm run lint:styles` to catch:
  - `transition: all`
  - non-tokenized `font-weight: 650`
  - hardcoded hex text colors in high-traffic page modules

### 2026-06 premium light-theme pass

- Light theme surfaces were shifted to a more premium neutral stack (`--surface`, `--surface-raised`, `--card`) to avoid flat “raw MVP” contrast.
- Elevation now uses stronger layered navy-tinted shadows (`--shadow-sm`/`--shadow-md`/`--shadow-lg`) for clearer depth separation between canvas, cards, and interactive controls.
- Global timing tokens now use a stronger ease-out curve (`cubic-bezier(0.23, 1, 0.32, 1)`) for snappier perceived responsiveness.
- `components/ui/ui.module.scss` updates:
  - added active press feedback (`scale(0.97)`) on base buttons,
  - improved primary button depth,
  - status badges now map to shared `--status-*` tokens,
  - `surfaceCard` and `featureCard` hover/active states tightened for premium interaction feel.

### 2026-06 Design language v2 (Phase 0, tokens-first)

Earlier premium passes over-used borders + gradient + shadow on every card, making the light theme feel "tabular" (grey screen of boxes). v2 fixes depth at the **token + recipe** layer first (see `docs/redesign/page-by-page-skills-plan.md`).

Principles: depth from **surface contrast + subtle shadow + whitespace**, not from heavy borders. Visible borders are **hairline only**, as a secondary edge. One accent focal point per screen. Depth budget: ≤ 2 pronounced shadows per viewport.

- **Surfaces (`tokens/_theme.scss`, light):** light theme is **bright warm-white premium** — subtle warm-white canvas + white cards + cool-navy ink (`--surface: #f6f4ef`, `--surface-raised: #fbfaf6`, `--card: #ffffff`). Key lesson from iteration: a *small* lightness gap canvas→card + a soft card shadow reads premium; a *large* gap (dingy beige bg vs white cards) reads cheap, and a cool-neutral grey reads clinical. Cards separate via shadow + hairline, not a big tonal jump. Verified in-browser (seeded teacher login, forced `data-theme=light`). Softened `--border`/`--border-strong`; added `--border-hairline` (= `--border-subtle`) as the default recipe edge (both themes). Light `--shadow-xs` reworked to a soft 2-layer lift (dropped the `0 0 0 1px` ring that doubled the hairline border). Accent palette (green primary, blue/amber/rose/purple) intentionally unchanged.
- **Typography (`tokens/_typography.scss`):** editorial step — `--fs-display: 2.375rem`, `--fs-page-title: 2rem` (clearly above `--fs-section-title: 1.375rem`); new `--fs-eyebrow` (0.6875rem) + `@mixin eyebrow` in `_mixins.scss` for small uppercase section labels.
- **Component recipes (`components/ui/ui.module.scss`):** `surfaceCard`, `statTile`, `featureCard` no longer stack border+gradient+shadow+inset. They now use flat `--card` background + hairline border + `--shadow-xs` (lift to `--shadow-sm`/`md` only on hover/focal). Removed `accent-info`-tinted borders that blued every card.
- **Empty states:** `.emptyState` is now a designed centered column (icon medallion + title + caption + `.emptyStateAction` slot) instead of a bare `text-align:center` void. Consumed by `EmptyStateCard`.
- **Semantic colored cards (taste pass):** flat white cards read "empty"; the fix is **semantic** color, not decoration. Dashboard stat tiles (`app/dashboard/page.module.scss` `.stat`) carry a per-metric color: a soft accent wash on the card (via `:has(.amber|.green|.blue)`), a **filled** accent medallion with white glyph + soft colored glow, and a colored metric value (strong/dark accent variant for legibility). Each metric keeps its own identity (students=amber, lessons=green, review=blue) without "random colorful dashboard". This is the template to roll across other card-heavy pages. Lessons KPIs use the same pattern (planned=info, completed=primary, cancelled=danger).
- **Per-section identity (anti-monotony):** when a page stacks many sibling sections, fully de-tinted identical cards read monotonous ("every block the same"). Give each section a **colored left spine (3px) + colored eyebrow** via a `--section-accent` CSS var (set per modifier class or `nth-of-type`); differentiation lives in the header/spine, not in heavy fills or nested boxes. See lesson hub (`app/lessons/[lessonId]/page.module.scss`) and shared content tab (`features/lesson-modal/LessonModal.module.scss` `.modalSectionCard`).
- **List pattern (pane + recessed rows):** for card-heavy lists, avoid card-in-card nesting (it reads "tabular"). Pattern: pane is a clean white soft-card; rows are **recessed tiles** (`color-mix(surface 60%, card)`, hairline, no shadow) that lift to white + `--shadow-sm` + 1px translate on hover. See `components/lessons/LessonsListPanel.module.scss` (`.listPane` / `.lessonCard`).
- **Filled icon medallions (`iconTint*`):** the shared `iconTint{Green,Blue,Purple,Amber,Rose}` classes (`components/ui/ui.module.scss`, used by the practice hub `FeatureCard`s) are filled accent-gradient medallions with white glyph + soft colored glow — same recipe as dashboard stat medallions. Use them to give module/feature cards per-card semantic identity. (They are local to the practice hub; safe to evolve there.)
- **Card CTA (inviting, on-brand):** a card's primary action shouldn't be a dull grey `--surface` button. Use a light primary-tinted action: `color-mix(accent-primary 9%, card)` bg, accent border + accent text, hover deepens the mix. See `components/students/StudentSummaryCard.module.scss` `.openBtn`. Reserve the full `--fill-strong` solid button for page-level primary actions.
- **Analytics KPIs stay neutral:** unlike hero/overview stat tiles (which get semantic color), dense analytics KPI grids (`components/statistics/StatisticsDashboard`) keep tiles neutral and let color live in deltas (`kpiUp`/`kpiDown`), the goal gradient, and charts — avoids the "random colorful dashboard". Student detail tabs reuse the already-redesigned shared components (semantic lesson KPIs, `LessonsListPanel` recessed rows, billing medallion cards), so the page is on-etalon without per-page CSS.
- **Batch B coverage (Vocabulary / Quiz / Chat):** Vocabulary word/flashcard/play cards use the soft-card recipe; the add-word bar is a recessed input zone; KPI chips are semantic-colored. Quiz intro/quiz/topic/question/result cards use hairline + shadow; quiz cards take an info left-spine (green when completed); intro mini stat tiles (`.introStat` `nth-of-type`) carry semantic washes; the dashed "Create quiz" card is a deliberate create-slot affordance (not a bug). Chat was already on-system (soft pane, accent active-spine, card/accent bubble pair, accent-muted message-area wash); only the empty thread gained a designed icon medallion (`.threadEmptyIcon`).

## Motion (learning-first)

**Policy:** `docs/redesign/plan.md` §1.3 — motion must clarify state/progress; no decorative loops on lesson/chat/payment.

| Priority | Tool | When |
|----------|------|------|
| 1 | CSS `var(--transition)` / `@keyframes` | Default: hover, tabs, modals, skeletons |
| 2 | GSAP | Stagger/timelines when CSS is unreadable — install only on a plan step that needs it |
| 3 | Three.js | Rare hero accents — `dynamic(..., { ssr: false })`, static fallback |

**Reduced motion:** `_base.scss` shortens `--transition*` and global animation/transition when `prefers-reduced-motion: reduce`. SCSS: `@include motion-allow { … }` for optional decoration only.

**JS:** `lib/motion/` — `prefersReducedMotion()`, `subscribeReducedMotion()`, `motionDurationMs()`, `MOTION_DURATION_*_MS`, `MOTION_RESTRICTED_ROUTES`. Use before GSAP timelines (not installed until a step requires it).

## Page layout recipes

**Compose order** (tokens → ui → layout → feature → thin page): see `docs/redesign/plan.md` §1.4.

### Standard app page

```tsx
<div className={`${styles.page} container container--page`}>
  <PageHeader title="…" subtitle="…" actions={…} titleClassName={styles.pageTitle} />
  {/* filters / Tabs */}
  <div className={styles.stack}>{/* SurfaceCard | feature sections */}</div>
</div>
```

- **Container:** `styles/_containers.scss` — `.container` + modifier (`--page` default for shell routes, `--narrow`, `--form`, `--prose`, `--reading`, `--marketing`). Max widths from `tokens/_layout.scss`.
- **Header:** `PageHeader` (`components/ui/PageHeader.tsx`) — title, subtitle, `back`, `actions`. Page SCSS only tweaks title via `titleClassName` / `@include page-title-display` when needed.
- **Page SCSS:** layout only (grid, gaps, route-specific columns). Card/button look comes from `ui.module.scss` or feature modules.

### Variants

| Pattern | When | Notes |
|---------|------|--------|
| **Stack** | Most list/settings pages | Vertical `gap` between `SurfaceCard` / domain blocks |
| **Grid** | Dashboard, students directory | `styles/_mixins.scss` `@include grid(n)` or CSS grid in page module |
| **Split** | Chat, calendar (master/detail) | Two panes; `min-width: 0` on children for mobile overflow |
| **Auth** | `(auth)/*` | `auth.module.scss` warm radial shell + centered card (`max-width` 440px); no app shell |
| **Profile tabs** | `/profile`, student detail | Shared `ProfileViewShell`: offer hero card, compact `heroAction` card (next lesson / vocab review), contact in `metaExtra`, KPI stat tiles, achievements, tab surfaces |

`PageStack` layout component: **not extracted yet** — same markup repeated across routes; introduce in F1+ only if shell refactor needs one import.

## App shell header (F1)

**Files:** `components/layout/Header.tsx`, `Header.module.scss`.

| Zone | Content |
|------|---------|
| Left | Mobile menu (`Menu`), `BrandLogo` (sidebar width on desktop) |
| Center | `HeaderSearch` (hidden on mobile; toggle via search icon) |
| Right | Create lesson (staff, desktop/tablet), lessons/balance pill, messages (`MessageCircle` → `/chat` + unread badge), profile avatar |

**Mobile:** expandable search strip under bar; notifications use `useChatNavBadge()` (same total as sidebar Chat badge).

## App shell sidebar (F1)

**Files:** `Sidebar.tsx`, `Sidebar.module.scss`, `sidebar-nav.tsx` (`SidebarNav` shared with mobile drawer).

**Sections (RBAC-filtered):** Main → Dashboard, Practice, Chat; Schedule → Lessons, Calendar, Students; Account → Payment, Admin, System, Profile.

**Active item:** tinted `--accent-primary` background, inset left rail, primary icon color (not full dark fill). Collapsed rail: icon-only + `Tooltip` flyout; unread badges as dot (collapsed) or pill.

**Icons:** Lucide via `navIcons` map in `sidebar-nav.tsx`. Collapse control bottom toolbar (`PanelLeftClose` / `PanelLeftOpen`); width synced to `--sidebar-w` on `<html>`.

## Mobile nav drawer (F1)

**Files:** `MobileNavDrawer.tsx`, `MobileNavDrawer.module.scss`; reuses `SidebarNav` (`variant="drawer"`) inside `Sidebar.module.scss` `.drawerNav` wrapper.

Full-height panel (`--nav-drawer-width`, `100dvh`), token backdrop (`--backdrop-modal`), safe-area padding. Header: `BrandLogo` (`showTag={false}`) + close. Footer: **Create lesson** (`Button` `primary`) for staff. **A11y:** `useFocusTrap`, `inert` + `aria-hidden` on `main` while open; `aria-labelledby` on dialog. Animations respect `prefers-reduced-motion` via `motion-allow` / `motion-reduce` mixins.

## App shell layout (F1)

**Files:** `AppShell.tsx`, `app/layout.module.scss`, `app/globals.scss`; gutters in `tokens/_layout.scss` (`--main-padding-*`).

| Layer | Role |
|-------|------|
| `.shell` / `.body` | Chrome (`--card`) — header + sidebar |
| `main` | Scroll canvas (`--surface`) + subtle top gradient + inset border beside sidebar |
| `.mainCanvas` | Full-width slot for route content (no max-width — use `.container` on pages) |

**Skip link:** `AppShell` — “Skip to main content” → `#main-content` on `<main>`.

**Breakpoints (JS ↔ SCSS):** `MOBILE_MAX_WIDTH` = `768` (`BREAKPOINTS.sm`), aligned with `respond-to(sm)` so sidebar hide and hamburger menu share the same tier.

**Sidebar widths:** `--sidebar-w-expanded` (240px), `--sidebar-w-collapsed` (72px); runtime `--sidebar-w` on `<html>`.

**Auth:** `(auth)/` sets `data-auth-route`; `globals.scss` hides `data-app-shell-header`, sidebar, drawer; main loses padding/gradient.

**Full-bleed pages** (e.g. chat): negative margins on `.page` still offset `--main-padding-*` on `main`.

## Auth screens (F2)

**Layout:** `(auth)/layout.tsx` + `auth-layout.module.scss` — single centered column on soft gradient; no trust panel / Arvi (removed: hydrate blink + unused 3D load).

**Shared card:** `auth.module.scss` — `.card`, Lora `.title`, `.intro`, `Button` + `Field` (`.fieldControl`), `.error` / `.success` / `.info`, `.footerLink`.

| Route | Notes |
|-------|--------|
| `/login` | Google + email/password |
| `/forgot-password` | Reassurance copy; success hides form |
| `/reset-password` | Missing-token `.info` panel; match validation errors |

## Lessons list follow-up pass

**Files:** `app/lessons/page.tsx`, `app/lessons/page.module.scss`.

- Removed the temporary `scheduleRail` guidance strip after user feedback to keep lessons IA focused and reduce decorative noise.
- Refined `highlightCard` / `highlightCardClickable` with stronger premium borders, hover depth, and cleaner description panel contrast for core daily workflow cards.

## Lessons page total redesign pass

**Files:** `app/lessons/page.tsx`, `app/lessons/page.module.scss`, `components/lessons/LessonsListPanel.module.scss`.

- `/lessons` now uses a stronger three-step composition: top context strip, highlights workspace, and list workspace.
- Added a compact operations overview (`Schedule control room`) plus KPI row (`planned`, `completed`, `cancelled`) to anchor scanability before navigating cards.
- Reworked highlight cards into clearer head/body/footer rhythm with better homework/materials/status readability and improved empty-state language.
- Aligned list panel styling to the same design dialect as highlights (surface contrast, chip/search rhythm, card hover/focus depth, and tighter mobile wrapping behavior).

## Lessons highlights restyle (second pass)

**Files:** `app/lessons/page.tsx`, `app/lessons/page.module.scss`, `components/lessons/LessonsListPanel.module.scss`.

- Highlights were promoted to the dominant visual anchor by moving them above supporting overview cards and increasing card contrast/shape hierarchy.
- Next/previous cards now use a cleaner premium structure: stronger title scale, softer metadata labels, separated description zone, and a compact status footer container.
- Primary card interactions were tuned for keyboard and pointer clarity (`hover`, `focus-visible`, depth layering) so highlights behave like top-level navigation targets.
- Lessons list was intentionally de-emphasized (lighter surface, softer borders/shadows) to support — not compete with — highlights.

## Lessons contrast and visibility polish

**Files:** `app/lessons/page.tsx`, `app/lessons/page.module.scss`, `components/lessons/LessonsListPanel.module.scss`.

- Fixed the double-focus visual around lessons search by consolidating focus indication on `searchWrap` and suppressing nested input ring artifacts.
- Rebalanced light-theme contrast on lessons surfaces (overview/KPI/highlights/list) to reduce muddy mixes and improve section separation.
- Promoted header `Open calendar` into a clearly visible primary action style for faster navigation discovery.
- Synchronized list-panel tones with highlights so the page remains cohesive while preserving hierarchy.

## Icon-only back controls pattern

**Files:** `app/lessons/[lessonId]/page.tsx`, `app/quiz/page.tsx`, `app/vocabulary/page.tsx`, `app/practice/speaking/page.tsx` (+ related `*.module.scss`).

- Back navigation controls in page headers are standardized to compact icon-only buttons (same shape, border, hover/focus behavior) with explicit `aria-label` for accessibility.
- This keeps header first rows visually cleaner while preserving predictable keyboard/screen-reader navigation semantics.

## Lesson room follow-up pass

**Files:** `app/lessons/[lessonId]/page.tsx`, `app/lessons/[lessonId]/page.module.scss`.

- Added lightweight context badges (`Lesson room`, `Content workspace`) to better anchor users in the edit/read workflow.
- Teacher sidebar now fits viewport better via scrollable `sidebarInner` inside sticky shell, preventing action loss on smaller laptop heights.
- Lesson sidebar is now grouped into clear sections (`identity`, `schedule/people`, `actions`, `previous lesson context`) to reduce scan fatigue on dense lesson screens.
- `Join Google Meet` action now uses a stronger primary CTA treatment; `Open in calendar` now deep-links with lesson/date focus intent.
- Added previous-student-lesson context cards in sidebar:
  - `Previous lesson homework` (text + response/files status),
  - `Previous lesson vocabulary` (linked words preview chips),
  with empty-state fallback when no previous lesson exists.

## Lesson room full redesign pass

**Files:** `app/lessons/[lessonId]/page.tsx`, `app/lessons/[lessonId]/page.module.scss`.

- Rebuilt lesson-room composition into a clearer control-rail + workspace model: sidebar sections are now tightly action-oriented (identity, schedule/people, actions, lesson brief), while contextual continuity moved into workspace hero cards.
- `Join Google Meet`, `Open in calendar`, and primary save action are grouped in one high-priority action stack for faster teacher flow.
- Added a workspace hero strip (`Lesson snapshot` + `Previous lesson context`) above content tabs to reduce context switching before editing materials/homework.
- Updated surfaces, section contrast, and spacing rhythm for denser but cleaner teacher usage on laptop-height screens.

## Calendar lesson deep-link focus

**Files:** `app/calendar/page.tsx`, `app/calendar/page.module.scss`.

- Calendar now supports lesson-focused deep-link params (`date`, `lessonId`, `focus=1`) from lesson room.
- When opened from lesson room, calendar syncs date/month context, preserves last selected view (`week`/`month` via localStorage), scrolls target lesson into view, and applies a short highlight pulse.

## Shared lessons surfaces polish

**Files:** `components/ui/ui.module.scss`, `components/lessons/LessonsListPanel.module.scss`.

- Upgraded shared `surfaceCard` / `surfaceCardDefault` styling with tokenized gradient shell and calmer border contrast so all lesson-related panels feel consistent.
- Fixed `LessonsListPanel.searchWrap` input shell (focus ring, spacing, placeholder contrast) to remove visual glitches in the search toolbar.

## Admin workspace (F5 / R-40-01)

**Files:** `app/admin/page.tsx`, `app/admin/page.module.scss`.

- `/admin` uses the same page recipe (`container container--page` + `PageHeader`) with a restrained school-ops tone.
- Added a compact KPI row (`all accounts`, `students`, `active`) to improve scanability before actions.
- Account creation form is grouped into semantic `fieldset` sections (**Account basics**, **Profile details**) to reduce visual noise and support keyboard/screen-reader navigation.
- Form actions now use shared async button states (`Button loading`) for **Create** and **Refresh**.
- Existing accounts table keeps role chips and now uses status chips (`active`, `paused`, `left`, `blocked`) so state is readable without relying on plain text only.

## System shell (F5 / R-40-02)

**Files:** `app/system/page.tsx`, `app/system/page.module.scss`.

- `/system` title/subtitle now uses a control-room framing (platform operations, not consumer wording).
- Added a lightweight overview row (scope + diagnostics-first guidance) above tabs to reduce "blank panel" feel.
- System tabs use icon labels (`Email`, `Word dictionary`, `Connections`, `Payments`). **Connections** — compact provider cards, per-field `?` tooltips, documentation link in section header, inline verify status.
- Tabs and panel shell use stronger tokenized surfaces/borders/shadows to match the premium admin tone established in `/admin`.

## System email tab (F5 / R-40-03)

**Files:** `app/system/EmailPanel.tsx`, `app/system/EmailPanel.module.scss` (exported as `EmailTestPanel` from `panels.tsx`).

- Two-column layout aligned with Connections: **SMTP configuration** (left) and **Test delivery** (right); stacks on small viewports.
- Compact **runtime bar** (badge + host:port + mode/from + Refresh) replaces the old multi-cell status grid; refresh updates in place without remounting the form.
- Separate feedback for config actions (verify/save) vs test send.
- Server-default mode shows an env callout instead of empty custom fields; custom mode keeps encrypted password field + encryption-key warning.
- Verify uses live form draft; test send requires `systemMailStatus.configured`.

## System dictionary tab (F5 / R-40-04)

**Files:** `app/system/WordDictionaryPanel.tsx`, `app/system/WordDictionaryPanel.module.scss`.

- Runtime bar: active dictionary provider badge, active **translation** provider name, context target ISO, Refresh.
- Three stacked panels: **Dictionary source**, **Translation source**, **Provider configuration**. Translation cards show badge **Requires a paid service subscription** for DeepL, Google Cloud, Microsoft; read-only endpoint links from `translationSettings.apiUrls`.
- **Setup guides** (`word-dictionary-setup-guides.ts`, `ProviderSetupGuide.tsx`): per selected dictionary/translation provider — summary, pricing, env vars, numbered steps with official doc links; Datamuse supplemental note under Dictionary source.
- Separate feedback for dictionary provider save, translation provider save, and language settings save; `TranslationSettingsSection` removed (merged into panel).

## System payments tab (F5 / R-40-05)

**Files:** `app/system/PaymentsPanel.tsx`, `app/system/page.module.scss`.

- Payments panel copy is reframed from a generic settings tone to platform operations wording.
- Added a compact control rail (operations mode + pricing consistency) above the metrics grid to guide super-admin workflow.
- Save action now shows an explicit blocking warning near the primary button when currency compatibility issues exist.

## Global confirm dialog (F6 / R-50-01)

**Files:** `features/confirm/ConfirmDialogHost.tsx`, `features/confirm/ConfirmDialogHost.module.scss`.

- Confirm modal now uses tokenized modal chrome (`--backdrop-modal`, `--modal-bg`, `--shadow-modal`) instead of plain overlay/card defaults.
- Added a compact semantic header badge (`Confirmation` / `Danger action`) so destructive actions are visually explicit before the CTA row.
- Danger confirm button now relies on semantic danger tokens instead of hardcoded red hex values.

## Lesson modal shell (F6 / R-50-02)

**Files:** `features/lesson-modal/LessonModal.module.scss`, `features/lesson-modal/LessonModalHeader.tsx`.

- Lesson modal overlay/chrome is aligned with shared modal tokens (`--backdrop-modal`, `--modal-bg`, `--modal-header-bg`, `--shadow-modal`).
- Header now includes semantic context badges (`Create lesson` / `Edit lesson` / `Lesson details`) for faster orientation.
- Destructive icon actions and primary footer CTA now use semantic accent tokens rather than hardcoded palette values.
- Lesson content blocks are simplified to a calmer surface language: fewer heavy gradients, no left accent rails, tighter section rhythm, and cleaner per-section color tinting.
- `LessonContentTab` now uses short section helper copy (plan/materials/homework/response) to reduce ambiguity and improve scanability in long edit sessions.

## Lesson lightbox overlay (F6 / R-50-03)

**Files:** `features/lesson-modal/ImagePreviewOverlay.tsx`, `features/lesson-modal/LessonModal.module.scss`.

- Image preview now uses a framed lightbox container with tokenized surface, border, and shadow (instead of bare image-on-overlay).
- Added header row (`imagePreviewAlt` label + close action) and a compact hint line (“Esc or click outside”) for clearer affordance.
- Overlay and close control styling now reuse modal tokens for consistency with the rest of lesson/editor dialogs.

## Calendar inline confirms (F6 / R-50-04)

**Files:** `app/calendar/page.module.scss`.

- Inline calendar dialogs (conflict/warning/series/delete) now reuse the same modal token language: tokenized backdrop, modal surface/border, and shared shadow treatment.
- Action row hierarchy now mirrors global confirm patterns (`primary`, `secondary`, `danger`) using semantic accent tokens.
- Conflict list items are softened and aligned with warning accents for better readability without hardcoded red-heavy visuals.

## Chat direct-message modal (F6 / R-50-05)

**Files:** `app/chat/NewDirectModal.tsx`, `app/chat/page.module.scss`.

- `NewDirectModal` now has a compact header system (badge + title + helper copy) so purpose is clear before search/select.
- Added explicit empty-search result state in the contact list for better feedback.
- Chat modal shell now uses shared modal token treatment (`--modal-bg`, border mix, `--shadow-modal`) for consistency with other overlays.

## Chat group-creation modal (F6 / R-50-06)

**Files:** `app/chat/CreateGroupModal.tsx`.

- `CreateGroupModal` now matches the direct-message modal hierarchy (badge, title, helper copy).
- Member selector label now includes live selected count, improving clarity during multi-select.
- Added explicit empty-contact state text for first-run or constrained-role scenarios.

## Word details modal (F6 / R-50-07)

**Files:** `features/vocabulary/WordDetailsModal.tsx`, `features/vocabulary/word-details-modal.module.scss`.

- `WordDetailsModal` now uses the same premium modal chrome language as other overlays: tokenized backdrop (`--backdrop-modal`), modal surface (`--modal-bg`), semantic border mix, and shared modal shadow.
- Header now follows modal hierarchy with a semantic badge (`Dictionary entry`), stronger title context, and helper guidance copy before content scanning.
- Dictionary content blocks were softened to a calmer drawer-feel (cleaner section cards, subtle info accent tinting, better spacing rhythm) while keeping existing vocabulary payload structure unchanged.

## Quiz assign modal (F6 / R-50-08)

**Files:** `app/quiz/page.tsx`, `app/quiz/page.module.scss`.

- Quiz assignment modal now follows the shared overlay language: tokenized backdrop/chrome (`--backdrop-modal`, `--modal-bg`), semantic border mix, and shared modal shadow.
- Header hierarchy is upgraded with a semantic badge (`Assignment`), title/subtitle split, and concise helper hint for teacher workflow context.
- Student-picking step now surfaces clearer state (live selected count in label + explicit empty-list message) while preserving existing assignment logic.

## Quiz stats drawer (F6 / R-50-09)

**Files:** `app/quiz/page.tsx`, `app/quiz/page.module.scss`.

- Quiz right drawer now uses the same tokenized panel language as other overlays (`--modal-bg`, info-accent border mix, shared modal shadow).
- Drawer header now has semantic hierarchy (badge `Quiz stats`, title, helper hint) for clearer context before metrics.
- Stat blocks and assignment list are softened with semantic surfaces; assignment statuses are rendered as explicit styled labels instead of plain text.

## Quiz finish confirm (F6 / R-50-10)

**Files:** `app/quiz/page.tsx`, `app/quiz/page.module.scss`.

- Quiz finish confirmation now uses the same modal chrome system as other confirms (tokenized background, semantic border mix, shared modal shadow).
- Added compact semantic header badge (`Confirmation`) to make the irreversible transition explicit before actions.
- Footer actions now use a structured action row, with a clear primary CTA (`Save & finish`) and secondary continuation action.

## Vocabulary finish confirm (F6 / R-50-11)

**Files:** `app/vocabulary/sections.tsx`, `app/vocabulary/page.module.scss`.

- Vocabulary play finish confirm is now aligned with shared confirm modal language (`--backdrop-modal`, `--modal-bg`, semantic border mix, modal shadow).
- Added semantic confirmation badge in the modal header so quiz/play completion intent is explicit before action.
- Action row now mirrors other overlays: secondary continue action + primary `Save & finish` CTA with semantic primary accent styling.

## Avatar modal (F6 / R-50-12)

**Files:** `app/profile/page.tsx`, `app/profile/page.module.scss`.

- Avatar editor modal now uses shared tokenized modal chrome (`--backdrop-modal`, `--modal-bg`, semantic info border mix, modal shadow) instead of an isolated one-off shell.
- Header follows semantic modal hierarchy (badge `Profile media`, title, helper text) with explicit close action and improved dialog a11y (`aria-labelledby`).
- Crop workspace and action row are visually aligned with other overlay sections (tokenized section surface + structured footer action area).

## Change password modal (F6 / R-50-13)

**Files:** `app/profile/panels.tsx`, `app/profile/page.module.scss`.

- Change password dialog now follows the same tokenized overlay/modal language as other profile overlays (`--backdrop-modal`, `--modal-bg`, semantic info border mix, shared modal shadow).
- Header now includes a semantic security badge (`Security`) for better task context before entering credentials.
- Footer action hierarchy is aligned with shared patterns: neutral cancel + semantic primary submit (`Update password`) styling.

## Payment method config modal (F6 / R-50-14)

**Files:** `app/system/PaymentMethodConfigModal.tsx`, `app/system/page.module.scss`.

- Payment-method settings modal now better supports long-form configuration with a sticky footer action bar that remains visible while scrolling provider fields.
- Header context is clearer for operations users: semantic settings icon in the eyebrow and explicit close-label a11y for the modal close action.
- Modal body spacing was adjusted to avoid content being obscured behind the sticky actions area on long provider forms.

## Dashboard lock overlay (F6 / R-50-15)

**Files:** `app/dashboard/page.module.scss`.

- Cancelled lesson cards keep a muted locked state, but now use softer premium dimming (reduced grayscale intensity and cleaner depth) instead of harsh desaturation.
- Lock chip styling was refined into a subtle warning pill (semantic warning border/text tint + light blur) to communicate “locked” without visual heaviness.

## Brand logo

| Asset | Path | Usage |
|-------|------|--------|
| Favicon | `src/app/icon.svg` + `public/brand/logo-mark.svg`, PNG `public/favicon-*.png` | Browser tab; regenerate with `npm run brand:icons` |
| Apple touch | `src/app/apple-icon.png`, `public/apple-touch-icon.png` | PWA / home screen |

`components/brand/BrandLogo.tsx` — `LogoMarkSvg` (open book + green progress line) + **Lora** wordmark via `var(--font-display)`. Source SVG: `public/brand/logo-mark.svg`. Default link → `/dashboard` (`href={null}` for static).

| Prop | Use |
|------|-----|
| `variant` `full` \| `mark` | Wordmark + tag vs mark only |
| `size` `sm` \| `md` \| `lg` | Header drawer / shell / auth hero |
| `hideTextOnCollapse` | Header: mark-only when `data-sidebar-collapsed` or tablet |
| `showTag` | “English Platform” line (default on) |
| `href` | Dashboard link (default); `null` = no link |

## Primitives (22 exports)

From `components/ui/index.ts`:

**Actions / inputs:** `Button`, `Field` — inputs/textareas use `ui.module.scss` `.fieldControl` (border, padding, focus ring)

**Layout:** `PageHeader`, `SectionHeader`, `ProgressHeader`, `ActionRow`, `SettingsToggleRow`

**Surfaces:** `SurfaceCard`, `FeatureCard`, `EmptyStateCard`, `StatTile`, `Badge`

**Domain cards:** `ProfileHero`, `AchievementCard`, `DashboardLessonCard`, `CalendarEventCard`

**Navigation:** `Tabs`, `SegmentedControl`

**Other:** `Tooltip`

## Agent / contributor conventions

In `apps/campus`, prefer project primitives over raw HTML: **`Link`** (`next/link`) not in-app `<a>`, **`Image`** (`next/image`) not `<img>`, **`Field`** not bare `<input>`/`<textarea>`/`<select>`, **`Button`** not `<button>`. Toggle groups → **`SegmentedControl`**. Navigation/data → `next/navigation` (`useRouter`, `useSearchParams`). Rule file: `.cursor/rules/web-component-reuse.mdc`.

**Left as raw HTML (intentional):** external `<a target="_blank">`, hidden file inputs, color-picker hue `<input type="range">`, crop resize handle, `Button`/`Field` internals (select / checkbox / radio faces). Never use bare `<input type="checkbox">` in apps — use `Field as="checkbox"`.

## Patterns

- `Button` — `variant`: `default` (navy), **`primary`** (green `--accent-primary` — hero/auth CTAs), `ghost`, `dashed`, `danger`. Optional **`href`** renders `Link` with button styles. `data-variant`, `data-active`; async `onClick` / `loading` / `data-icon-only` as before.
- `FeatureCard` — linked module tile; optional **`stat`** pill (top-right); tag-only footer (no spacer when no `cta`). Icon tints: `.iconTintGreen` … in `ui.module.scss`. Practice hub composes without duplicating card shell in page SCSS.
- `Field` — renders optional **`label`**, **`hint`**, **`error`** (`role="alert"`) via `.fieldRoot`. Optional **`rootClassName`** / **`labelClassName`** for inline layouts (e.g. profile statistics custom date filters).
- `Field` — polymorphic `as`: input | textarea | select | checkbox | file-button. **`type="password"`** now renders an inline show/hide eye toggle inside the same control (password `useState` runs on every render path — required for Rules of Hooks when the page mixes select/checkbox/number fields). **`as="select"`** uses adaptive UI: custom dropdown on desktop, native `<select>` at `≤767px` (see breakpoints below).
- **`type="date"` / `type="time"`** — desktop: `DatePickerControl` / `TimePickerControl` (`react-day-picker` calendar + two-column time list, 5‑min steps); mobile (`≤768px`): native `<input type="date|time">` via `use-picker-mobile.ts`. Popover is portaled (`PickerPopover`, `z-index: 2400`) so modals do not clip it; **date** popover uses fixed width (`matchAnchorWidth={false}`), not the wide trigger. Theme: pass `className={pickerStyles.rdpRoot}` on `DayPicker` so `--rdp-*` overrides default library `blue`. Values stay **`YYYY-MM-DD`** / **`HH:mm`** (same as native inputs). `min`/`max` on date fields map to calendar disabled days; read-only mode uses `formatDateLabel` / `formatTimeLabel`. Helpers: `lib/date-picker-utils.ts`; styles: `picker.module.scss` (e.g. `compactTrigger` on profile statistics custom range).
- **Form validation:** app-owned only — `<form noValidate>` on product forms; `Field` strips HTML constraint attrs (`required`, `minLength`, `min`, `max`, `pattern`, `step`) via `lib/strip-native-validation.ts` before rendering native controls. Show errors with `Field` `error` / toast / inline copy; backend remains source of truth.
- **System → secret fields** (`integration-ui.tsx`, `connection-ui.tsx`): super-admin `platformIntegrationSettings` returns effective **`secrets`** (stored + `.env` fallback) so inputs stay filled after save/reload; visible `Field type="text"` for integration secrets. **`PaymentMethodConfigModal`** still uses `type="password"` with write-only draft (status only on load).
- `SurfaceCard` — polymorphic `as` prop
- `PageHeader` — optional `back` slot renders before title; `actions` stays on the right

## Responsive layout

Product NFR: adaptive UI (NFR-05 in coursework). Implementation in `apps/campus`:

| Tier | Width | Shell | Pages |
|------|-------|-------|-------|
| Mobile | `≤767px` | Header menu → `MobileNavDrawer`; sidebar hidden | Single-column layouts; chat inbox/thread panes |
| Tablet | `768–1023px` | Sidebar icon rail (72px, forced collapsed) | Reduced padding; 2-col grids where applicable |
| Desktop | `≥1024px` | Sidebar 240px or user-collapsed 72px (`localStorage`) | Default layouts |

**Tokens:** `styles/tokens/_layout.scss` — `--main-padding-*`, `--nav-drawer-width`, `--container-padding-x-mobile`.

**SCSS:** `styles/_variables.scss` breakpoints (`xs` 480, `sm` 768, `md` 1024, …); `@mixin respond-to($breakpoint)` in `styles/_mixins.scss` (`max-width` queries).

**JS:** `lib/breakpoints.ts` (`MOBILE_MAX_WIDTH = 767`); `hooks/use-breakpoint.ts` → `{ isMobile, isTablet, isDesktop, tier }`. Shared with `Field` select mode.

**Shell components:** `ShellNavProvider` + `useShellNav()` (`shell-nav-context.tsx`); `MobileNavDrawer`; nav items in `sidebar-nav.tsx` (`SidebarNav`, RBAC + badges); `Header` menu button on mobile.

**Overflow on narrow viewports:** tab lists that exceed width scroll horizontally (`ProfileViewShell` `.tabsRow`: `overflow-x: auto`, `flex-shrink: 0` triggers). Tab panels and form cards use `min-width: 0` / single-column grids on `sm` so Profile & Settings content stays inside the page container. Calendar teacher filter uses compact native `<select>` sizing on mobile (`page.module.scss` `.teacherFilter`).

## Other component folders

| Folder | Role |
|--------|------|
| `components/layout/` | `AppShell`, `Header`, `Sidebar`, `AuthGate` |
| `components/backend/` | API-connected panels (`LessonMeetButton`) |
| `components/quiz/` | `CreateQuizCard`, `QuizAssignmentCards`, play session |
| `components/profile/`, `lessons/`, `students/`, `statistics/` | Domain composites |

## Related

- [[concepts/web-app]]
- [[concepts/frontend-packages]]
