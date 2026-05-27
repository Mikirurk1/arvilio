---
name: soenglish-redesign
description: Redesign SoEnglish web UI toward premium edtech (Preply clarity + Edvibe learning structure). Single-school brand. Use on any docs/redesign/plan.md step or when the user asks for UI redesign, visual refresh, or design system work in apps/web.
---

# SoEnglish redesign

## Product direction

- **North star:** trustworthy tutoring platform (Preply) + structured classroom (Edvibe).
- **Scope today:** one school, one brand, **one shared theme** (light/dark/auto).
- **Future:** SaaS (many schools + platform) — use semantic tokens and clean seams; do not paint yourself into a single-tenant corner (see `.cursor/rules/future-multitenant-architecture.mdc`).
- **Feel:** clear for learning, modern, **premium** (spacing, typography, subtle depth) — not playful chaos, not generic AI purple gradients.
- **Motion:** learning UX first. Default CSS transitions; use **GSAP** when motion needs timelines/stagger; **Three.js** only for rare accent scenes (lazy, no SSR), never at the cost of clarity on lesson/chat/payment flows.

## Hard constraints

1. **Stack:** `apps/web` — SCSS modules, CSS variables in `styles/tokens/`, primitives in `components/ui/`. **No Tailwind, no shadcn** in production web.
2. **Shared theme:** Colors from `styles/tokens/_theme.scss` via `var(--*)`; runtime `data-theme` on `<html>` (`ui-store` / `providers.tsx`). Add new colors to both light and dark mixins first.
3. **SCSS style:** Readable nesting with `&`; breakpoints only via `$breakpoint-*` + `@include respond-to(sm|md|…)` from `styles/_mixins.scss` — no inline `768px` in new/edited rules.
4. **Components:** `Link`, `Image`, `Field`, `Button` per `.cursor/rules/web-component-reuse.mdc`.
5. **Materials:** `materials/fluent/` for SCSS/layout ideas; `materials/figma_design/` for composition only — do not copy Tailwind classes into `apps/web`.
6. **Wiki:** `docs/llm-wiki/wiki/concepts/ui-design-system.md` — align with documented patterns.
7. **Plan:** Execute **one** ID from `docs/redesign/plan.md` per agent run unless the user explicitly groups IDs.

## Structure and reuse (required)

- Design is **layered**: tokens → `components/ui` → layout patterns → feature blocks → thin pages.
- **Compose, do not rewrite** each screen from scratch. Check `components/ui/index.ts` and similar pages first.
- Extend a primitive or shared pattern when the same UI appears twice; do not copy markup/SCSS into another `page.module.scss`.
- Page files orchestrate; visual styling lives in ui/feature modules. See `docs/redesign/plan.md` §1.4 and `.cursor/rules/web-component-reuse.mdc`.

## Workflow per step

1. Read the step row in `docs/redesign/plan.md` (ID, files, design intent).
2. Run §1.4 checklist: existing primitives, nearest redesigned page, then edit.
3. Read `redesign-existing-projects` skill (`.agents/skills/redesign-existing-projects/SKILL.md`) for audit/fix patterns.
4. Change only listed files; extend tokens before page one-offs.
5. Preserve RBAC and routes; no behavior regressions.
6. Verify: `agent-browser` on relevant route(s) or `./scripts/agent-browser-all-pages.sh` when appropriate.
7. Mark step `done` in `docs/redesign/plan.md`.
8. Update wiki if tokens or primitives changed materially.

## Visual rules (SoEnglish)

- Background: warm `--surface`, cards `--card`, tinted `--shadow-*` (navy tint, not black 0.1).
- Text: `--text-primary` for titles; limit line length in prose/forms.
- **One** primary accent for progress/CTA (green family); blue for info links; amber sparingly; purple only for rare premium badges.
- Brand: `BrandLogo` + Lora; do not replace with Inter/system defaults.
- Modals: shared overlay, header (title + subtitle), footer actions; match `ConfirmDialogHost` when built.
- Mobile: respect 767 / 1024 breakpoints; test drawer and horizontal tab scroll.

## Motion (GSAP / Three.js)

1. Prefer CSS; add `gsap` to `apps/web` only when a plan step requires it.
2. GSAP: `gsap.context()` + cleanup; honor `prefers-reduced-motion`.
3. Three.js: dynamic import, `ssr: false`, small canvas, static fallback; avoid on data-heavy screens.
4. See `docs/redesign/plan.md` §1.3.

## Do not

- Introduce Tailwind or install shadcn into `apps/web`.
- Redesign multiple plan IDs in one diff without user approval.
- Break `data-theme` / `data-font-size` appearance system.
- Copy large chunks from `materials/` into production verbatim.
- Add decorative 3D or heavy motion to core learning surfaces (lessons, chat, quiz in progress, payment).
