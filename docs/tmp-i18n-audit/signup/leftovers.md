# /signup leftovers

Screenshots: `uk-desktop.png`, `uk-desktop-after.png`

## Before

Most chrome already via `signup.*`. Leftovers: captcha/failed errors (EN), bare `/login` + `/onboarding` redirects, password toggle aria, `signup.email` UK still mixed Latin «email».

## Extracted

- `signup.error.captcha`, `signup.error.failed`
- `signup.email` UK → Робоча ел. пошта
- Locale-aware login + onboarding hrefs; password toggle labels

Brand Arvilio/Campus ignored.
