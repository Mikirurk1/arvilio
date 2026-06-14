---
description: Async web actions must show loading, disable repeat clicks, and keep feedback near the action.
globs: apps/web/**/*.tsx
alwaysApply: false
---

# Web Async Actions

For any button or UI action in `apps/web` that triggers backend work (`graphqlRequest`, store mutations, API calls, checkout redirects, save/update/delete actions):

- Use the shared `Button` `loading` state instead of only swapping text manually.
- Disable repeat clicks while the request is pending.
- Keep success/error feedback close to the action that triggered it, not far above the page.
- Prefer action-specific pending state (`savePricing`, `saveMethod`, `checkout`, etc.) over one vague global boolean when a screen has multiple backend actions.

## Preferred pattern

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

## Avoid

- Success messages rendered at the very top of a long form/card.
- Async buttons that remain clickable while the request is in flight.
- Multiple unrelated backend buttons sharing no visible pending state.
