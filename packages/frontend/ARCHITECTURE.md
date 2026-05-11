# Frontend state guardrails

- Server data is fetched on the server by default in route segments and server utilities.
- TanStack Query is allowed only in client components that require interactive cache updates.
- Zustand is restricted to ephemeral UI state (modal visibility, active tab, flashcard session controls).
- Do not duplicate backend payloads into Zustand stores.
- API access should be centralized in feature libraries (for example `libs/frontend/features/vocabulary`).
