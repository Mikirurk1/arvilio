---
description: Behavioral guidelines to reduce common LLM coding mistakes (Karpathy-style).
alwaysApply: true
---

# Karpathy behavioral guidelines

Bias toward caution over speed. For trivial tasks, use judgment.

## Think before coding

- State assumptions; ask if uncertain.
- Present multiple interpretations — do not pick silently.
- Push back when a simpler approach exists.

## Simplicity first

- Minimum code for the problem; no speculative features or single-use abstractions.
- If the solution is much longer than needed, simplify.

## Surgical changes

- Touch only what the request requires; match existing style.
- Remove orphans your edit created; do not delete unrelated dead code unless asked.

## Goal-driven execution

- Define verifiable success criteria before implementing.
- For bugs: reproduce, then fix. For multi-step work: brief plan with checks.

## Wiki (mandatory, not optional)

After durable code or debug work, update `docs/llm-wiki/wiki/` in the **same session** without being asked. Full workflow: `llm-wiki-triggers.mdc` (overrides "don't edit markdown" for `docs/llm-wiki/**`). User opt-out: **skip wiki** only.
