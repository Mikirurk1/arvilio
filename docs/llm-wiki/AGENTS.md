# Arvilio LLM Wiki — Agent Schema

You maintain a **persistent, compounding knowledge base** for the Arvilio monorepo. You write and update `wiki/`; humans curate `raw/` and direct analysis. Read this file at the start of any **ingest**, **query**, or **lint** operation.

## Project context (code layout)

- **Monorepo:** npm workspaces + Turborepo (`turbo run dev|build|lint|typecheck`, filters `@app/campus`, `@app/api`)
- **`apps/campus`** — Next.js frontend
- **`apps/api`** — NestJS + GraphQL API
- **`packages/backend/modules/`** — domain modules: `module-auth`, `module-lessons`, `module-progress`, `module-vocabulary`, `module-flashcards`
- **`packages/backend/data-access/data-access-prisma/`** — Prisma schema (PostgreSQL)
- **`packages/frontend/`** — shared UI and feature packages

When wiki claims conflict with code, **code wins**. Update wiki and note the correction in `log.md`.

**Cursor rule:** `.cursor/rules/llm-wiki-triggers.mdc` (`alwaysApply: true`) requires the agent to **continuously** update the wiki after durable code/discovery work — not only on explicit ingest/query/lint.

---

## Directory layout

```
docs/llm-wiki/
  AGENTS.md          ← this file (schema)
  raw/               ← immutable sources (human-added)
  wiki/
    index.md         ← catalog (update every ingest)
    log.md           ← append-only timeline
    overview.md      ← high-level project map
    sources/         ← one summary page per raw source
    entities/        ← nouns: User, Lesson, Quiz, …
    concepts/        ← cross-cutting: auth, billing, calendar, graphql
    synthesis/       ← evolving thesis, architecture, decisions
    queries/         ← filed answers from query operations (optional)
```

### Raw layer (`raw/`)

- **Never modify** files in `raw/` except when the human explicitly asks to fix a typo or rename.
- Prefer markdown; PDFs/images go in `raw/` with a sibling `.md` ingest note if needed.
- Suggested naming: `YYYY-MM-DD-slug.md` or `type/YYYY-MM-DD-slug.md` (e.g. `meetings/`, `adr/`, `external/`).

### Wiki layer (`wiki/`)

- **You own** creation and updates of all files under `wiki/`.
- Use `[[wikilink]]` style links (Obsidian-compatible): `[[entities/lesson]]`, `[[concepts/auth]]`.
- Optional YAML frontmatter on wiki pages:

```yaml
---
tags: [entity, lessons]
sources: [sources/2026-05-16-google-meet-flow]
updated: 2026-05-16
---
```

---

## Operations

### 0. Continuous updates (automatic)

**Trigger:** Any Cursor session where you implement, debug, or explain something **durable** about Arvilio (default: always unless the user says **skip wiki**).

**Update when:**

- Behavior, API, schema, or integration changed
- You mapped a non-obvious flow while debugging
- The user stated a product rule or decision

**Skip when:** cosmetic-only edits, trivial renames, or user opted out.

**Steps (lightweight — not a full ingest):**

1. Update only affected `wiki/entities/`, `wiki/concepts/`, `wiki/synthesis/` pages (create if missing).
2. Optionally add `wiki/queries/YYYY-MM-DD-slug.md` for a reusable explanation you just gave in chat.
3. Refresh `wiki/index.md` if pages were added or titles changed.
4. Append `wiki/log.md`:

```markdown
## [YYYY-MM-DD] update | Short title
- **Trigger:** code | debug | user
- **Pages touched:** ...
- **Notes:** contradictions vs code, open questions
```

5. In your final reply to the user, one line: **Wiki:** pages touched (or "no durable changes").

**Raw vs code-derived knowledge:** Human documents → `raw/` then **ingest**. Knowledge learned from code during dev → **update** (no raw file required); link to code paths.

### 1. Ingest

**Trigger:** Human adds a file under `raw/` and asks to ingest (one source at a time by default).

**Steps:**

1. Read the full raw source.
2. Briefly discuss key takeaways with the human if anything is ambiguous — do not guess silently.
3. Create or update `wiki/sources/<slug>.md` — structured summary with link back to raw path.
4. Update **all affected** entity/concept/synthesis pages (often 5–15 files).
5. Add cross-references (`[[...]]`) both ways where relevant.
6. Refresh `wiki/index.md` (every page, one-line summary, grouped by category).
7. Append to `wiki/log.md`:

```markdown
## [YYYY-MM-DD] ingest | Short title
- **Raw:** `raw/...`
- **Pages touched:** list
- **Notes:** contradictions flagged, open questions
```

**Do not** ingest into chat-only memory; persist everything in wiki files.

### 2. Query

**Trigger:** Human asks a question about domain, architecture, or “how does X work?”

**Steps:**

1. Read `wiki/index.md` first; open relevant pages.
2. If index is insufficient, skim `wiki/overview.md` and grep `wiki/`.
3. Synthesize an answer with **citations** — wiki paths and/or raw paths, e.g. `[[concepts/auth]]`, `apps/api/src/...`.
4. If the answer is durable (comparison, decision record, multi-doc synthesis), **file it** under `wiki/queries/YYYY-MM-DD-slug.md` and link from `index.md` + `log.md`:

```markdown
## [YYYY-MM-DD] query | Question summary
- **Output:** `wiki/queries/...`
```

### 3. Lint

**Trigger:** Human asks for wiki lint / health check (periodic).

**Check for:**

- Contradictions between wiki pages or wiki vs code
- Stale claims superseded by newer sources or code
- Orphan pages (no inbound `[[links]]`)
- Concepts mentioned repeatedly without a `concepts/` page
- Missing cross-references
- Gaps worth a new raw source or code read

**Output:** Report in chat + append `wiki/log.md` lint entry + fix safe issues (orphan links, index gaps) unless human asked report-only.

---

## Page templates

### Source page (`wiki/sources/<slug>.md`)

- Title, date, link to `raw/...`
- TL;DR (3–5 bullets)
- Key facts, decisions, open questions
- Links to entities/concepts updated

### Entity page (`wiki/entities/<name>.md`)

- What it is in Arvilio
- Fields/relationships (align with Prisma when applicable)
- Related code paths (`apps/`, `packages/`)
- Related concepts and sources

### Concept page (`wiki/concepts/<name>.md`)

- Cross-cutting behavior (auth, GraphQL, Google Calendar, Meet links, Stripe, etc.)
- Flow diagrams in mermaid if helpful
- Code entry points

### Synthesis page (`wiki/synthesis/<name>.md`)

- Evolving narrative: architecture, product thesis, migration notes
- Explicit “last reviewed” date
- Section **Open questions**

---

## Index format (`wiki/index.md`)

Organize sections:

- Overview & synthesis
- Entities
- Concepts
- Sources
- Filed queries

Each entry: `- [[path]] — one-line summary` (optional: `updated: YYYY-MM-DD`)

---

## Log format (`wiki/log.md`)

Append-only. Entry prefix must be parseable:

```markdown
## [YYYY-MM-DD] update | Title
## [YYYY-MM-DD] ingest | Title
## [YYYY-MM-DD] query | Title
## [YYYY-MM-DD] lint | Title
```

---

## Relationship to application code

| Task | Primary source |
|------|----------------|
| Implement / fix bug | Code in `apps/`, `packages/` |
| Understand “why” / domain / history | Wiki first, then code |
| New meeting note / ADR / spec | `raw/` → ingest → wiki |

Do not duplicate entire codebases into wiki. Link to modules and summarize behavior.

---

## Optional tooling

At small scale, `index.md` + grep is enough. If the human adds `qmd` or a search script, use it for query/lint. Document tooling changes here.

---

## Co-evolution

Humans may edit this `AGENTS.md` when workflows change. Propose schema updates when you hit repeated friction. Keep rules actionable and specific to Arvilio.
