# SoEnglish — Claude Code Guidelines

## Project overview

SoEnglish is a **single-school** English learning platform (Next.js + NestJS + GraphQL + Prisma). Today it serves one school; it is being built with seams for future **multi-tenant SaaS + marketplace**.

Monorepo structure:
- `apps/web` — Next.js frontend
- `apps/api` — NestJS API gateway
- `packages/backend/` — `@be/*` domain modules
- `docs/llm-wiki/wiki/` — compiled knowledge base (always update after durable changes)
- `materials/` — read-only design reference

---

## Karpathy behavioral guidelines

Bias toward caution over speed. For trivial tasks, use judgment.

### Think before coding

- State assumptions; ask if uncertain.
- Present multiple interpretations — do not pick silently.
- Push back when a simpler approach exists.

### Simplicity first

- Minimum code for the problem; no speculative features or single-use abstractions.
- If the solution is much longer than needed, simplify.

### Surgical changes

- Touch only what the request requires; match existing style.
- Remove orphans your edit created; do not delete unrelated dead code unless asked.

### Goal-driven execution

- Define verifiable success criteria before implementing.
- For bugs: reproduce, then fix. For multi-step work: brief plan with checks.

---

## LLM Wiki (mandatory)

After durable code or debug work, update `docs/llm-wiki/wiki/` in the **same session** without being asked.

**Update wiki when you learn or change something durable:**
- New or changed feature, API, GraphQL field, Prisma model, integration
- Non-obvious flow discovered while debugging
- User explains a product/decision rule
- Dev/tooling workflow change

**Do not update wiki for:** typos, formatting-only, renames with no behavior change, or if the user says **skip wiki**.

**How to update:**
1. Touch only affected pages (`entities/`, `concepts/`, `synthesis/`)
2. Refresh `wiki/index.md` if pages were added or renamed
3. Append `wiki/log.md`:

```markdown
## [YYYY-MM-DD] update | Short title
- **Trigger:** code change | debug | user note
- **Pages:** ...
```

**End of task checklist:** before final message — if durable behavior changed → wiki pages updated + `log.md` entry. Final reply includes: **Wiki:** `concepts/...` (updated) — or **Wiki:** no durable changes.

User opt-out: **skip wiki** only.

---

## Web UI — reuse primitives (`apps/web`)

Do not reach for bare HTML when the project already provides a component. Check `apps/web/src/components/ui/index.ts` first.

| Avoid | Use instead |
|-------|-------------|
| `<a href="...">` (in-app routes) | `Link` from `next/link` |
| `<img>` | `Image` from `next/image` |
| `<input>`, `<textarea>`, `<select>` | `Field` from `@/components/ui` |
| `<button>` | `Button` from `@/components/ui` |

Also reuse: `PageHeader`, `SurfaceCard`, `EmptyStateCard`, `Badge`, `Tabs`, `SegmentedControl`.

**Next.js built-ins:**
- Navigation: `Link`, `useRouter` — not `<a>` or `window.location`
- Images: `next/image` — not `<img>`
- Fonts: `next/font` in layout
- Metadata: `export const metadata` in `app/` — not `<head>` in client components

---

## Web async actions (`apps/web/**/*.tsx`)

For any button that triggers backend work:

- Use `Button` `loading` state.
- Disable repeat clicks while pending.
- Keep success/error feedback close to the action.
- Prefer action-specific pending state over one global boolean.

```tsx
<Button
  loading={pendingAction === 'pricing'}
  loadingLabel="Saving…"
  disabled={isBusy}
  onClick={() => void onSavePricing()}
>
  Save pricing
</Button>
```

---

## Backend modules (`packages/backend/`, `apps/api/`)

Follow `docs/llm-wiki/wiki/concepts/backend-modules.md`.

**Required structure for new/refactored modules:**
```
src/
  index.ts              # public exports only
  {domain}.module.ts
  presentation/graphql/
  presentation/rest/
  application/
  domain/               # pure logic (no Nest, no Prisma)
  infrastructure/       # Prisma repos, external APIs
  shared/
```

**Rules:**
1. Keep files under ~400 LOC; split per feature.
2. GraphQL resolvers belong in `@be/*`, not in `apps/api`.
3. GraphQL types — import from `@be/graphql`, not `apps/api`.
4. Prisma — only via `infrastructure/` or `application/`, not in resolvers.
5. Export only `*Module`, guards, decorators, types from `src/index.ts`.
6. `@be/*` must not import `@app/api` or `@fe/*`.

---

## Materials (read-only)

Path: `materials/` at repo root.

1. **Do not edit** files under `materials/` unless explicitly asked.
2. **Do not copy** large chunks into wiki as product truth — production behavior lives in `apps/` and `packages/`.
3. **Consult on request** when asked about UI/UX from designs.
4. If a design decision is adopted in production, update wiki from **code**, not from materials.

---

## Future multi-tenant architecture

Today: one school. Future: multi-tenant SaaS + marketplace.

**Always classify scope first** — for new auth, billing, settings, storage, admin features:

| Concern | Platform-wide | Per school (tenant) |
|--------|----------------|---------------------|
| Student discovery / matching | Yes | School profile |
| Subscription to "open a school" | Billing product | Entitlement on `School` |
| Commission on platform-sourced students | Ledger | Payout rules |
| Lessons, vocabulary, chat | — | School-scoped |

**Rules:**
1. Single-school now, tenant-ready later — leave clean seams.
2. Do not hide school-scoped data inside platform singletons.
3. Prefer evolvable names — avoid globally unique names for likely school-scoped concepts.
4. Keep distinction between platform operators and school operators in permissions.
5. Three money layers eventually: student → school, school → platform subscription, platform commission on platform-sourced students.

**Heuristic:** annoying-but-localized extraction later = acceptable. Rewriting auth/session/billing/data ownership shape = redesign now.
