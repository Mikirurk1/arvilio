---
description: Always maintain docs/llm-wiki; ingest/query/lint on request. Read AGENTS.md for workflows.
alwaysApply: true
---

# LLM Wiki — always on

Schema: `docs/llm-wiki/AGENTS.md`. You **maintain** `docs/llm-wiki/wiki/` continuously — not only when the user says "ingest".

**Do this yourself.** Do not wait for the user to ask "update the wiki", "why didn't you document this?", or similar. Wiki maintenance is part of **done**, same as code and tests.

## Priority (conflicts with other rules)

When instructions conflict, for paths under `docs/llm-wiki/wiki/`, `docs/llm-wiki/wiki/log.md`, and `docs/llm-wiki/wiki/index.md`:

| Other rule | Wiki rule wins |
|------------|----------------|
| "Do not edit markdown unless the user asked" | **Update wiki** after durable code/debug work in the **same session** |
| "Avoid drive-by changes" | Wiki updates for what you changed are **required**, not drive-by |
| "Keep final response short" | Still append `log.md` and note wiki pages at end (one short line is enough) |

The user may opt out only with an explicit **skip wiki** on that task. "Don't write docs" without **skip wiki** does **not** exempt you.

**Out of scope for this rule:** `materials/`, `docs/reference/` (unless asked), random READMEs, ADRs outside `docs/llm-wiki/`.

## Before domain / architecture answers

1. Read `wiki/index.md`, then relevant wiki pages.
2. Prefer wiki + code over guessing. Cite `[[concepts/...]]` or file paths.

## After meaningful work — update wiki (same session, before you finish)

**When:** immediately after the code change (or debug conclusion) lands — not "later" and not only if the user reminds you.

Update wiki when you **learn or change** something durable:

- New or changed feature, API, GraphQL field, Prisma model, integration
- Non-obvious flow discovered while debugging (e.g. env not loaded, wrong id type in URL)
- User explains a product/decision rule
- Dev/tooling workflow change (`dev.cjs`, env loading, ports)

**Do not** update wiki for: typos, formatting-only, renames with no behavior change, or if the user says **skip wiki**.

**Multi-step / long debug sessions:** append or extend wiki once you know the root cause, even if fixes are still in progress.

**How to update (lightweight):**

1. Touch only affected pages (`entities/`, `concepts/`, `synthesis/`, code-derived notes in `queries/`).
2. Refresh `wiki/index.md` if pages were added or renamed.
3. Append `wiki/log.md`:

```markdown
## [YYYY-MM-DD] update | Short title
- **Trigger:** code change | debug | user note
- **Pages:** ...
```

For human-provided docs in `raw/`, use full **ingest** (see AGENTS.md).

## Explicit commands

| Command | Action |
|---------|--------|
| **ingest** `raw/...` | Full ingest workflow |
| **wiki query:** … | Query + file under `wiki/queries/` if durable |
| **wiki lint** | Health-check per AGENTS.md |

## End of task (required checklist)

Before sending your final message, verify:

1. If durable behavior changed → affected `wiki/` pages updated + `wiki/log.md` entry appended.
2. Final reply includes: **Wiki:** `concepts/...` (updated) — or **Wiki:** no durable changes.

**Code vs wiki:** code wins on conflict; fix wiki and log the correction.
