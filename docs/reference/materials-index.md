# Materials index (reference only)

Design and prototype projects at **`materials/`** in the repo root. They are **not** part of the Turborepo workspace (`apps/`, `packages/`).

**Agent policy:** read-only unless you ask otherwise — see `.cursor/rules/materials-readonly.mdc`.

**Product source of truth:** `apps/web`, `apps/api`, Prisma schema, and [[../llm-wiki/wiki/index|LLM Wiki]].

---

## Top-level folders

| Folder | Stack | Purpose | When to open |
|--------|-------|---------|--------------|
| [`materials/fluent/`](../../materials/fluent/) | Next.js, SCSS modules | Early UI shell: dashboard, calendar, vocabulary, quiz, profile — mock JSON in `public/data/` | Comparing layout/SCSS patterns with `apps/web`; historical UX |
| [`materials/figma_design/`](../../materials/figma_design/) | Vite, React, Tailwind, shadcn/ui | Figma export “Enhance modal design” — full component set, lesson/calendar/vocabulary views | Modal/layout ideas, shadcn patterns (production web uses SCSS, not Tailwind) |
| [`materials/addax_assessment/`](../../materials/addax_assessment/) | React, Node, MongoDB, Emotion | Separate “Calendar Tasks” assessment app — calendar grid, events, roles, real-time | Calendar UX patterns, conflict rules, admin flows — **different stack** from SoEnglish |

---

## fluent/

| Path | Notes |
|------|-------|
| `app/` | Routes: dashboard, calendar, vocabulary, quiz, profile |
| `components/layout/` | Header, Sidebar |
| `public/data/*.json` | Mock lessons, events, vocabulary, quiz |
| `styles/` | Global SCSS (closest to production token approach) |
| `AGENTS.md`, `CLAUDE.md` | Next.js agent notes for this prototype only |

**Not wired** to SoEnglish API or Prisma.

---

## figma_design/

| Path | Notes |
|------|-------|
| `src/app/components/` | Dashboard, CalendarView, LessonsView, LessonDetail, EditLessonModal, VocabularyView, Quiz views, ChatView, etc. |
| `src/app/components/ui/` | shadcn primitives |
| Figma source | Linked in [`materials/figma_design/README.md`](../../materials/figma_design/README.md) |

Use for **visual reference**; implementing in SoEnglish means adapting to `apps/web/src/components/ui/`.

---

## addax_assessment/

| Path | Notes |
|------|-------|
| `client/` | React frontend (app shell, calendar, welcome modal) |
| Server / API | Node + MongoDB (see project README) |

Feature overlap with SoEnglish calendar is **conceptual only** (events, recurrence, conflicts, roles). Do not assume API or data models match.

---

## How this relates to LLM Wiki

- Domain facts (roles, entities, GraphQL) → `docs/llm-wiki/wiki/`
- Your meeting notes / ADRs → `docs/llm-wiki/raw/` then **ingest**
- Design prototypes → **this index** + read `materials/` when you ask

To document a decision taken from a prototype after it ships in production, ask the agent to **update wiki from code** (e.g. lesson modal behavior in `apps/web/src/features/lesson-modal/`).

---

## Obsidian

Open the **repo root** as vault to see both `docs/llm-wiki/wiki/` and `materials/` in one graph. Wiki pages use `[[wikilinks]]`; this file uses relative paths for non-wiki navigation.
