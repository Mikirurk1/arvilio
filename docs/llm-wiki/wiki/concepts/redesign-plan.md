---
tags: [concept, frontend, ui, design]
updated: 2026-05-27
sources: [../../redesign/plan.md]
---

# Redesign plan (Preply × Edvibe)

Living execution plan for a **premium edtech** UI: clear for learning, modern, trustworthy — inspired by Preply (clarity, trust, next steps) and Edvibe (lessons, materials, roles).

**Today:** one school, one brand, **shared theme** (`data-theme`, tokens in `styles/tokens/_theme.scss`).  
**Future:** SaaS multi-school — redesign uses semantic tokens and tenant-ready seams (not anti-SaaS styling); see multitenant architecture rule.

## Source of truth

- **Plan + step IDs:** [`docs/redesign/plan.md`](../../../redesign/plan.md)
- **Agent skill:** `.cursor/skills/soenglish-redesign/SKILL.md`
- **Generic redesign patterns:** `.agents/skills/redesign-existing-projects/SKILL.md`
- **Current primitives:** [[concepts/ui-design-system]]

## Constraints (unchanged stack)

- `apps/web`: SCSS modules + `components/ui` — no Tailwind/shadcn in production.
- One brand for one school today; `/system` is platform-scoped but shares the same theme/shell.
- **SCSS:** `&` nesting, `$breakpoint-*` + `respond-to` mixin; colors via `var(--*)` from shared theme.
- **Motion:** CSS first; **GSAP** if needed; **Three.js** rare accents only — learning clarity over spectacle (`plan.md` §1.3).
- **Structure/reuse:** layered tokens → ui → patterns → pages; compose existing components (`plan.md` §1.4, `web-component-reuse.mdc`).

## Phases

| Phase | Prefix | Focus |
|-------|--------|--------|
| F0 | `R-00` | Tokens, typography, UI primitives |
| F1 | `R-01` | Shell (header, sidebar, drawer) |
| F2 | `R-10` | Auth |
| F3–F5 | `R-20`–`R-40` | Role-specific pages & tabs |
| F6 | `R-50` | Modals / overlays unified |
| F7 | `R-90` | agent-browser QA, wiki sync |

## Agent execution

One chat / subagent = **one plan ID**. Prompt template in `docs/redesign/plan.md` §5.

Verification script: `scripts/agent-browser-all-pages.sh` (roles: student, teacher, admin, super).

## References (read-only)

- `materials/fluent/` — SCSS/layout closest to production
- `materials/figma_design/` — composition ideas only (Tailwind/shadcn prototype)

See also [[concepts/web-app]] for routes.
