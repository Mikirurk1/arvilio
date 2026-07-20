# /reset-password leftovers (uk UI)

Screenshots: `uk-desktop.png` (+ `uk-missing-token.png` after fix)  
Captured: 2026-07-13

## With token

| Text | Action |
|------|--------|
| Back to sign in | → `reset.back` |
| Updating… | → `reset.updating` |
| Validation / catch errors (EN) | → `reset.error.*` |
| Password toggle aria | reuse `login.showPassword` / `hidePassword` |

## Missing token

| Text | Action |
|------|--------|
| This reset link is incomplete… | → `reset.missingTokenSubtitle` |
| Open the full link… | → `reset.missingTokenBody` |
| Request a new reset link | → `reset.requestNewLink` |
| Bare `/forgot-password`, `/login` | → `withLocalePrefix` |
