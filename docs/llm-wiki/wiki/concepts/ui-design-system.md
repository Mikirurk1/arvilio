---
tags: [concept, frontend, ui]
updated: 2026-05-16
---

# UI design system

SoEnglish UI primitives live in **`apps/web/src/components/ui/`** — not in `@soenglish/shared-ui`.

## Styling stack

| Layer | Location |
|-------|----------|
| Tokens | `apps/web/src/styles/tokens/` — `_theme.scss`, typography, layout |
| Global | `styles/global.scss` imported from `app/globals.scss` |
| Components | `components/ui/ui.module.scss` (~540 lines, shared) |
| Co-located | `*.module.scss` per page/feature |

- **CSS custom properties** for theming (`data-theme` on `<html>` via `ui-store`)
- **No Tailwind** in production web app
- Icons: **lucide-react**

## Primitives (22 exports)

From `components/ui/index.ts`:

**Actions / inputs:** `Button`, `Field`, `AdaptiveSelect`

**Layout:** `PageHeader`, `SectionHeader`, `ProgressHeader`, `ActionRow`, `SettingsToggleRow`

**Surfaces:** `SurfaceCard`, `FeatureCard`, `EmptyStateCard`, `StatTile`, `Badge`

**Domain cards:** `ProfileHero`, `AchievementCard`, `DashboardLessonCard`, `CalendarEventCard`

**Navigation:** `Tabs`, `SegmentedControl`

**Other:** `Tooltip`

## Patterns

- `Button` — `data-variant`, `data-active`; optional `classNames` slots
- `Field` — polymorphic `as`: input | textarea | select | checkbox | file-button
- `SurfaceCard` — polymorphic `as` prop

## Other component folders

| Folder | Role |
|--------|------|
| `components/layout/` | `AppShell`, `Header`, `Sidebar`, `AuthGate` |
| `components/backend/` | API-connected panels (`LessonMeetButton`, `GenerateQuizPanel`) |
| `components/profile/`, `lessons/`, `students/`, `statistics/` | Domain composites |

## Related

- [[concepts/web-app]]
- [[concepts/frontend-packages]]
