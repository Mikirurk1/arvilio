---
name: soenglish-service-design
description: Use when designing or building any SoEnglish user-facing SERVICE surface (learner app, school workspace, public marketplace, tutor-recruiting, onboarding wizard, virtual assistant) — NOT the platform admin console. Encodes the product's concrete design system (palette, type scale, spacing, motion, component patterns) plus the taste/craft rules to make services feel premium.
---

# SoEnglish Service Design

> **Taste layer:** for craft, animation decisions, and the "invisible details", first invoke the
> **`emil-design-eng`** skill — it is the authority on *how things should feel*. This skill is the
> *concrete system* (palette, type, spacing, components) for **SoEnglish services specifically**.
>
> Scope: **services**, not `/system` or `/platform` admin. Services = learner-facing app, school
> workspace, public marketplace (student discovery), tutor-recruiting, signup wizard, virtual assistant.

## When to use
- Building/redesigning any service screen, component, empty state, onboarding step, or marketplace/recruiting surface.
- Writing a `Design.md`-style brief for an AI agent to implement a SoEnglish service screen.

## How to use (workflow)
1. Invoke `emil-design-eng` for the craft rules (taste, animation gating, defaults).
2. Use the **concrete system below** for exact tokens — never invent hex, sizes, or easings.
3. Reuse `components/ui` primitives (see "Components"); do not hand-roll bare HTML.
4. Pick the **surface profile** (density/tone) for the screen you're building.
5. Honor async/feedback + accessibility rules.

---

## The system (concrete — this is what "premium" means here)

**Source of truth:** `apps/web/src/styles/tokens/` (`_theme.scss`, `_typography.scss`, `_motion.scss`, `_layout.scss`). Consume via `var(--*)`; per-school theming later overrides the *token set*, not per-page hex.

### Color — semantic first
Brand neutral is **ink navy `#1a1a2e`**, never pure black. Always use **role tokens**, not raw palette.

| Role | Token | Light value | Use |
|------|-------|-------------|-----|
| Primary / CTA / success | `--accent-primary` | `#159970` (green) | Main action, progress, positive |
| Info | `--accent-info` | `#3a75b5` (blue) | Neutral highlight, links |
| Warning | `--accent-warning` | `#e8942e` (amber) | Caution, trial-ending |
| Danger | `--accent-danger` | `#d95674` (rose) | Destructive, errors |
| Premium / upsell | `--accent-premium` | `#6b62c4` (purple) | Paid plan, premium tutor badge |
| Text | `--text-primary…--text-faint` | `#1a1a2e`→`#b4b4cc` | Typography hierarchy |
| Surfaces | `--surface` / `--surface-raised` / `--card` | `#f0f2f5` / `#f5f6f8` / `#fff` | Canvas → raised → card |
| Borders | `--border-subtle` / `--border` / `--border-strong` | navy α 0.07 / 0.12 / 0.22 | Hairline default → emphasis |

- **Status pills/badges:** `--status-{info,success,warning,danger}-{bg,text}`.
- **Muted accent fills:** `--accent-*-muted` for soft backgrounds.
- Add new colors in **both** `light-theme` and `dark-theme` mixins; never page-level `[data-theme='dark']` hacks unless unavoidable.

### Typography
- **Sans (UI/body):** Outfit — `var(--font-sans)`. **Display (hero/headings):** Lora serif — `var(--font-display)` with `@include page-title-display`.
- Scale: `--fs-display-xl` (clamp, hero numbers only) · `--fs-display 2.375rem` · `--fs-page-title 2rem` · `--fs-section-title 1.375rem` · `--fs-page-sub 0.9375rem` · body `1rem`/`--fs-sm 0.8125rem` · `--fs-eyebrow 0.6875rem` (uppercase + `--tracking-caps`).
- Stepped `--fs-9…--fs-52` for fine control in module SCSS. Use `rem`/`var(--fs-N)` so `data-font-size` scaling works.
- Weights `--fw-regular…--fw-bold`. Line-height: `--lh-body 1.62`, `--lh-tight 1.35`, `--lh-display 1.2`. Tracking: tighten display (`--tracking-tight`), widen caps.

### Spacing & layout
- Section rhythm via `--space-section-*` (`tokens/_layout.scss`). Keep a consistent vertical rhythm; don't free-style margins.
- Breakpoints: `@include respond-to(sm|md|…)` / `@include respond-max($breakpoint-*)` — **no raw `@media (max-width)`** in `*.module.scss`.
- Elevation ladder: `--shadow-xs`→`--shadow-lg` (navy-tinted, single light source). Cards lift on hover, not by default everywhere (avoid the "grey screen of boxes" — depth comes from tokens/recipes, not a border+gradient+shadow on every card).

### Motion (already aligned with emil-design-eng)
- Easing: `--ease-out` (enter/feedback), `--ease-in-out` (on-screen movement), `--ease-drawer` (sheets). Never raw `ease`/`ease-out` CSS defaults.
- Duration: `--dur-press 140ms`, `--dur-fast 180ms`, `--dur-base 240ms`, `--dur-modal 320ms`. **UI ≤ 300ms; exit faster than enter.**
- Animate **only `transform` / `opacity`**. Buttons press with `scale(0.97)`. Respect `prefers-reduced-motion` (global baseline kills motion; opt back in only with a soft opacity fade).
- Forbidden: `transition: all` (caught by `npm run lint:styles`).

### Components (reuse — do not reinvent)
From `apps/web/src/components/ui/` (see `web-component-reuse` rule): `Button`, `Field` (input/textarea/select/checkbox), `PageHeader`, `SurfaceCard`, `EmptyStateCard`, `Badge`, `Tabs`, `SegmentedControl`. Next built-ins: `Link`, `next/image`, `next/font`. Icons: **lucide-react**. Shared modal recipe: `styles/_modal-recipe.scss`.

### Async & accessibility (non-negotiable for services)
- Every backend action uses `Button` `loading`/`loadingLabel`, disabled while pending, action-specific pending state (`web-async-actions` rule). Success/error feedback next to the action.
- Visible focus (`--shadow-focus`), keyboard nav, real labels via `Field`, sufficient contrast, meaningful empty states with one clear next action.

---

## Surface profiles (density & tone per service)

| Surface | Audience | Density | Tone | Notes |
|---------|----------|---------|------|-------|
| **Learner app** (dashboard, lessons, practice, vocab) | students | comfortable, focused | warm, encouraging, playful-but-calm | Hero numbers in `--fs-display-xl`; progress in `--accent-primary`; generous whitespace; celebrate streaks subtly. |
| **School workspace** (calendar, students, materials, finance) | teachers/admins | information-dense but scannable | confident, efficient, professional | Tables/lists with hairline `--border-subtle`; status via `--status-*`; fast, snappy interactions. |
| **Public marketplace** (school/tutor discovery) | prospective learners (logged-out) | editorial, marketing | inviting, trustworthy, premium | Lora display headings; strong hero; social proof; clear CTA; fast perceived load; mobile-first. |
| **Tutor-recruiting** (job posts, applicants, premium profile) | tutors & school hirers | structured, form-heavy | credible, respectful, motivating | Clear status of applications; premium tutor badge uses `--accent-premium`; never feel like a cold ATS. |
| **Onboarding wizard** (Phase 4.5) | new school admin | one decision per step | guiding, low-friction | Step indicator; sensible defaults pre-filled; skippable; immediate save feedback; never a blank wall. |
| **Virtual assistant / tour** (Phase 4.5) | first-login users | minimal overlay | friendly, named, human | Avatar bubble; anchored tooltips on real elements; ≤300ms motion; per-user "done" state; "replay" available. |

---

## Writing a Design.md brief for an agent (refero method)
Don't say "make it clean/premium". Give the **system behind the screenshot**:
1. **Surface profile** (from the table above) — density, tone, audience.
2. **Concrete tokens** — exact palette roles, type scale steps, spacing, motion to use.
3. **Component list** — which `components/ui` primitives compose the screen.
4. **States** — loading, empty, error, success, disabled.
5. **One component at a time**, not a whole site.

## Red flags (stop and fix)
- Raw hex / px / `ease` defaults instead of tokens.
- Bare `<button>`/`<input>`/`<a>` instead of primitives.
- `transition: all`, motion > 300ms, animating layout props.
- Border + gradient + shadow on every card (flat "tabular" feel).
- Async button with no loading/disabled state; success message far from the action.
- Empty state with no guidance or next action.
