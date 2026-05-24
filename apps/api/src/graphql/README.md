# GraphQL in `apps/api`

Resolvers live in `@be/*` modules (`module-auth`, `module-chat`, …), not here.

This folder only re-exports shared types for bootstrap:

- `graphql.types.ts` → `@be/graphql`

If your editor still shows `chat.resolver.ts` or `domain.resolvers.ts`, close those tabs **without saving** — they were removed during the backend modularization.
