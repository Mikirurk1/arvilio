---
tags: [concept, ai, campus, security]
updated: 2026-07-20
---

# Arvi AI Assistant

Campus help chat opened by clicking the corner [[concepts/arvi]] mascot. **Not** human `/chat` and **not** ProductTour Help encyclopedia — free-form product Q&A grounded in a curated help corpus. **Fail-closed** when no effective LLM is configured.

## Product rules

| Does | Does not |
|------|----------|
| Explain UI / navigation for the user’s role | Solve homework, quizzes, exercises |
| Suggest deep links (`NAVIGATE: /path`) within a **role allowlist** | Invent school balances, other users, secrets |
| Cite retrieved help chunks (corpus ACL by audience) | Expose admin/finance corpus or routes to students/teachers |

### Role scope (`role-policy.ts`)

| Role | May help with | Must not | NAVIGATE allowlist |
|------|---------------|----------|-------------------|
| **Student** | Dashboard, Calendar, Practice, Vocabulary, Chat, Payment, Profile | Homework answers; Finance/System/Billing/Materials admin; other students | student paths only |
| **Teacher** | Calendar scheduling, Materials, Students, Vocabulary, Chat, Profile; *how* to assign work in UI | Student answer keys; Finance/System secrets; Billing | + `/materials`, `/students` — no `/finance` `/system` `/billing` |
| **Admin** | System, Finance, Billing, Staff, Students, Materials + shared | Invent live balances; repeat API keys; homework keys | full school ops set |

Layers: (1) corpus `audience` filter (`chunk.audience.includes(role)`) → (2) role system-prompt policy → (3) server strips disallowed `NAVIGATE` → (4) role-specific refusal + welcome copy in Campus UI.

**Staff helpfulness:** teachers/admins may get short **Materials/lesson product facts** and **UI label translations** (EN↔UK). Academic refusal only fires on clear graded-work cheat intent (not bare «переклади» / «дай відповідь»).

Plan feature: `aiAssist` (Pro). Credits via `EntitlementsService.assertAiCredit` / `consumeAiCredit`.

## LLM configuration (scope)

| Layer | Where | Storage |
|-------|--------|---------|
| **Platform default** | Control Plane → Settings → “Arvi AI — default model” | `PlatformSettings.integrationConfig.llm` + secrets (admin GET returns decrypted keys so the form stays filled) |
| **School override (Pro)** | Campus → System → AI assistant | `School.integrationConfig.llm` (`overrideEnabled`) + school secrets |
| **Env fallback** | API process | `LLM_*`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` |

**Resolve order:** school override (if `overrideEnabled`) → platform defaults → env.

### Provider shapes (today vs later)

| Adapter | Fields | Covers |
|---------|--------|--------|
| `openai_compat` | `baseUrl`, `model`, `apiKey`, maxTokens, temperature | ChatGPT, Ollama, vLLM, NVIDIA NIM, OpenRouter, Groq, DeepSeek, many Azure “compat” endpoints |
| `anthropic` | `model`, `anthropicApiKey` (fixed host) | Claude Messages API |

**Different wire formats** (not yet adapters — would need new fields): Azure OpenAI (resource + deployment + `api-version`), Google Gemini/Vertex (project/location), AWS Bedrock (region + IAM). Until then use a gateway that speaks OpenAI-compat, or Anthropic.

REST:

- `GET /api/assistant/status` — readiness (`ready`, `message`); requires `aiAssist`
- `POST /api/assistant/chat` — SSE; **503 before stream** if LLM not enabled / no API key / no model
- `GET/PUT /api/platform/llm` — platform operators (`arvilio_pat`)
- `POST /api/platform/llm/test` — connectivity probe with optional unsaved draft (no AI credits)
- `GET/PUT /api/system/llm` — school ADMIN; PUT requires `aiAssist`
- `POST /api/system/llm/test` — school ADMIN probe (override draft or platform default)

Chat is **fail-closed**: without a configured effective model (platform default, school Pro override, or env), the panel opens but composer is disabled and chat returns 503.

**Error safety:** end-user chat never receives provider response bodies or API key material — only generic status copy. Admin **Test connection** may show redacted provider detail (`[REDACTED]` for keys). Raw provider bodies stay in API logs only.

## Architecture

```
Campus GlobalArviSlot click → ArviChatPanel
  → POST /api/assistant/chat (SSE)
    → AuthGuard + FeatureGuard(aiAssist)
    → academic/jailbreak heuristics (may skip LLM)
    → role-scoped FTS retrieval (ASSISTANT_CORPUS)
    → LlmProviderResolver (school → platform → env)
    → stream delta / navigate / done
```

### Backend (`@be/assistant`)

- Module: `packages/backend/modules/module-assistant`
- REST: `assistant.controller.ts` (chat SSE), `school-llm.controller.ts` (override)
- `LlmSettingsService` — merge + school/platform persistence
- Providers: OpenAI-compatible + Anthropic
- Corpus: keyword FTS in `retrieve-help.ts`
- Policy: `academic-refusal.ts`, `system-prompt.ts`, **`role-policy.ts`** (prompt + NAV allowlist + refusal copy)

### Frontend

- Platform: `apps/platform/.../settings` + `PlatformLlmEditor`
- Campus: `LlmAssistantPanel` (defaults read-only + Pro override)
- Chat: `ArviChatPanel` / clickable `GlobalArviSlot`
- Empty open (no session history): role-scoped **welcome** (`assistant.welcome.{student|teacher|admin}.*`) + subtitle — not sent to the LLM / not stored in history
- Panel styles use Campus theme tokens (`--card`, `--surface`, `--accent-primary-muted`, `--text-*`) so dark mode stays readable
- Open/close: enter keyframes + exit via `closing` class (`transform`/`opacity`, `--dur-modal` / `--dur-fast`); unmount after `transitionend` (mascot stays hidden until exit finishes)
- Chat transcript in `sessionStorage` (`arvi.assistant.history`): max **20** messages, TTL **30 min** since last save — expired / legacy payloads are deleted on load (`arvi-chat-history.ts`)

## Related

- [[concepts/arvi]] — mascot + tour/help
- [[concepts/auth-rbac]] — roles
- [[concepts/billing-payments]] — `aiAssist` / AI credits
- [[concepts/multi-tenancy]] — school vs platform secrets
