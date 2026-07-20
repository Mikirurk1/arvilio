# /login extract

## campus-strings

| Key | EN | UK | Action |
|-----|----|----|--------|
| `login.email` | Email | Ел. пошта | Fix UK (was Email) |
| `login.showPassword` | Show password | Показати пароль | New |
| `login.hidePassword` | Hide password | Сховати пароль | New |

## Code

- `Field`: optional `passwordToggleShowLabel` / `passwordToggleHideLabel`
- Login: wire labels; `forgot` link via `withLocalePrefix`

## Not Payload

- Brand «Arvilio / Campus»
- Nest OAuth errors (already keyed)
