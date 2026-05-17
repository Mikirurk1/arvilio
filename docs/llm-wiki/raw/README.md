# Raw sources (immutable)

Place **source-of-truth** documents here. The LLM agent **reads** but does **not edit** these files unless you explicitly ask.

## What to add

- Meeting notes, ADRs, product specs
- Pasted Slack/email threads (as markdown)
- External docs (API guides, Stripe notes) — prefer `.md`; link PDFs from a stub `.md`
- Exports from calls or interviews

## Naming

- `YYYY-MM-DD-short-slug.md`
- Or subfolders: `meetings/`, `adr/`, `external/`

## After adding a file

Tell the agent: **ingest** `raw/your-file.md` (see [../AGENTS.md](../AGENTS.md)).
