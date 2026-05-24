---
tags: [concept, frontend, ui]
updated: 2026-05-18
---

# UI design system

SoEnglish UI primitives live in **`apps/web/src/components/ui/`** — not in `@fe/ui`.

## Styling stack

| Layer | Location |
|-------|----------|
| Tokens | `apps/web/src/styles/tokens/` — `_theme.scss`, typography, layout |
| Global | `styles/global.scss` imported from `app/globals.scss` |
| Components | `components/ui/ui.module.scss` (~540 lines, shared) |
| Co-located | `*.module.scss` per page/feature |

- **CSS custom properties** for theming (`data-theme` on `<html>` via `ui-store`)
- **Font size** (Profile → Appearance): `data-font-size` on `<html>` sets root to 14px / 16px / 18px; component text uses `rem` or `var(--fs-N)` from `styles/tokens/_typography.scss` so the whole shell scales, not only page titles
- **No Tailwind** in production web app
- Icons: **lucide-react**

## Brand logo

| Asset | Path | Usage |
|-------|------|--------|
| Favicon | `src/app/icon.png` (32×32) | Browser tab |
| Apple touch | `src/app/apple-icon.png` | PWA / home screen |

`components/brand/BrandLogo.tsx` — inline SVG mark + Lora wordmark (“SoEnglish” / “English Platform”). Props: `variant` `full` \| `mark`, `size` `sm` \| `md` \| `lg`, `hideTextOnCollapse` (header: hides text when sidebar collapsed or below `md`).

## Primitives (22 exports)

From `components/ui/index.ts`:

**Actions / inputs:** `Button`, `Field`

**Layout:** `PageHeader`, `SectionHeader`, `ProgressHeader`, `ActionRow`, `SettingsToggleRow`

**Surfaces:** `SurfaceCard`, `FeatureCard`, `EmptyStateCard`, `StatTile`, `Badge`

**Domain cards:** `ProfileHero`, `AchievementCard`, `DashboardLessonCard`, `CalendarEventCard`

**Navigation:** `Tabs`, `SegmentedControl`

**Other:** `Tooltip`

## Agent / contributor conventions

In `apps/web`, prefer project primitives over raw HTML: **`Link`** (`next/link`) not in-app `<a>`, **`Image`** (`next/image`) not `<img>`, **`Field`** not bare `<input>`/`<textarea>`/`<select>`, **`Button`** not `<button>`. Toggle groups → **`SegmentedControl`**. Navigation/data → `next/navigation` (`useRouter`, `useSearchParams`). Rule file: `.cursor/rules/web-component-reuse.mdc`.

**Left as raw HTML (intentional):** external `<a target="_blank">`, hidden file inputs, color-picker hue `<input type="range">`, crop resize handle, `Button`/`Field` internals (select dropdown triggers).

## Patterns

- `Button` — `data-variant`, `data-active`; optional `classNames` slots. Async `onClick` (returning a Promise) sets `data-loading`, disables the control, and shows a spinner; optional `loading` / `loadingLabel` / `onPendingChange` for controlled or parent-coordinated states (e.g. disable Cancel in a confirm row). **`data-icon-only="true"`** when `children` has no text (Lucide-only children count as icon-only; mixed icon + label does not). Icon-only buttons drop default `6px 12px` padding so fixed-size module classes (e.g. `deleteIconBtn`, `iconBtn`) are not squeezed; pair with explicit `width`/`height`/`padding: 0` and `svg { width; height }` in co-located SCSS when the hit target is smaller than the default button.
- `Field` — polymorphic `as`: input | textarea | select | checkbox | file-button. **`as="select"`** uses adaptive UI: custom dropdown on desktop, native `<select>` at `≤767px` (see breakpoints below).
- `SurfaceCard` — polymorphic `as` prop
- `PageHeader` — optional `back` slot renders before title; `actions` stays on the right

## Responsive layout

Product NFR: adaptive UI (NFR-05 in coursework). Implementation in `apps/web`:

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
