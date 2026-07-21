# Етап 12 — Ask Arvi (AI chat)

> Дата: 2026-07-21  
> Скоуп: Campus corner mascot → `ArviChatPanel`; mock SSE only (no live LLM).  
> Окремо від B7 (пози) і human `/chat`.

## Playwright

| Файл | Сценарії |
|------|----------|
| `tests/e2e/specs/audit/12-arvi-assistant-mock.spec.ts` | 12.1–12.9 (+ teacher/admin welcome) |

Моки: `GET /api/assistant/status`, `POST /api/assistant/chat` (SSE `delta` / `navigate` / `refused` / `done` / `error`).

## Unit (не Playwright)

| Файл | Покриття |
|------|----------|
| `assistant.service.spec.ts` | stream + credits, NAVIGATE ACL strip, academic refusal, public error copy, 503 resolve |
| `assistant.controller.spec.ts` | 400 empty, 503 not ready, SSE write, sanitization |
| `role-policy.spec.ts` + `retrieve-help.spec.ts` | 12.12 ACL (вже існували) |
| `arvi-chat-history.test.ts` | TTL / max msgs (Campus) |

## Out of CI

Live OpenAI / Anthropic / school override network probes.

## Related

- School LLM UI deep: `06-school-llm-mock.spec.ts` (6.14)
- Platform LLM: `07-platform-llm-mock.spec.ts` (7.6B)
- Wiki: `docs/llm-wiki/wiki/concepts/arvi-assistant.md`
