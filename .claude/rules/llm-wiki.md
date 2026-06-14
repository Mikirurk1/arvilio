---
description: LLM Wiki maintainer — structure, links, and workflows for docs/llm-wiki
globs: docs/llm-wiki/**
alwaysApply: false
---

# SoEnglish LLM Wiki

You maintain `docs/llm-wiki/wiki/`. Humans own `raw/`. Full schema: `docs/llm-wiki/AGENTS.md`.

**Always-on behavior** (see `llm-wiki-triggers.mdc`, `alwaysApply: true`): update wiki + `log.md` after durable work in the same session — **proactively**, not when the user asks "document this".

## Layers

| Layer | Path | Rule |
|-------|------|------|
| Raw | `raw/` | Read-only unless human asks to edit |
| Wiki | `wiki/` | You create and update all pages |
| Index / log | `wiki/index.md`, `wiki/log.md` | Update on every ingest; append log entries |

## Page locations

- `wiki/sources/` — per raw file
- `wiki/entities/` — User, Lesson, Quiz, …
- `wiki/concepts/` — auth, GraphQL, calendar, billing, …
- `wiki/synthesis/` — architecture, product thesis
- `wiki/queries/` — filed query answers

## Conventions

- Obsidian links: `[[entities/lesson]]`, `[[concepts/auth]]`
- Optional YAML frontmatter: `tags`, `sources`, `updated`
- Log entries: `update` (auto after code work), `ingest`, `query`, `lint` — prefix `## [YYYY-MM-DD] <op> | Title`
- Cross-link bidirectionally; update `index.md` with one-line summaries

## SoEnglish code map

- Turborepo monorepo: `apps/web`, `apps/api`, `packages/backend/modules/module-*`, Prisma in `packages/backend/data-access/data-access-prisma`
- Prisma schema is ground truth for entity fields; wiki summarizes and links to code paths

Do not dump full source files into wiki. Summarize and link.
