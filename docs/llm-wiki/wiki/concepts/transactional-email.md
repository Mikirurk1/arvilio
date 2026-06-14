---
tags: [concept, email, auth]
updated: 2026-05-16
---

# Transactional email

Outbound mail for account lifecycle and profile notifications. Templates are **React Email** components in `packages/backend/email-templates/src/`; built to `dist/` via `npm run build -w @be/email-templates`. Rendered with `@react-email/render` in `@be/mail`.

## Welcome account

Sent when an admin creates a user via [[concepts/auth-rbac#Account provisioning]]. Includes login URL, email, and a one-time generated password.

| Template ID | Props (main) |
|-------------|----------------|
| `welcome-account` | `displayName`, `email`, `password`, `loginUrl` |
| `password-reset` | `displayName`, `resetUrl`, `expiresInMinutes` |
| `lesson-reminder` | `lessonTitle`, `lessonDate`, `startTime`, `timezone`, `meetUrl` |
| `streak-alert` | `streakDays`, `appUrl` |
| `weekly-report` | `lessonsThisWeek`, `lessonsCompleted`, `vocabularyCount`, `reviewCount`, `appUrl` |
| `new-vocabulary` | `word`, `definition`, `appUrl` |
| `teacher-message` | `teacherName`, `body`, `appUrl` |

Implementation: `renderEmail()` in `@be/email-templates`; `MailService.sendTemplated` / `sendWelcomeAccount` / `sendPasswordReset` in `@be/mail`. Notification cron uses the same renderer via `NotificationsMailService` → `MailService`.

See [[concepts/profile-notifications]] for prefs and schedules.

## SMTP configuration

Super-admin configures delivery in **System → Email**:

| Mode | Behavior |
|------|----------|
| **Server default** | Uses deployment `SMTP_*` / `MAIL_FROM` from the API process environment (e.g. Mailtrap in dev). |
| **Custom SMTP** | Host, port, user, password, and from address stored in `PlatformSettings.integrationConfig` / encrypted `integrationSecrets` (same key as payment secrets: `PAYMENT_SECRETS_ENCRYPTION_KEY`). |

`platformIntegrationSettings.secretsStorageAvailable` reflects whether the API has that encryption key loaded. **Config-only** SMTP saves (from address, host, port, user — without a new password field) do not re-encrypt secrets and work without the key. Saving a **new** custom SMTP password (or other integration secrets) requires the key; the API returns `400` with an explicit message if it is missing.

`MailService` resolves SMTP via `getPlatformIntegrationRuntime()` (DB + env fallback). If no host is available, user creation still succeeds; `welcomeEmailSent` is `false`.

## Super-admin test tools

Route: `/system` → **Email** tab (super-admin only): verify connection (form draft), save SMTP, then send test. After **Save SMTP**, the **runtime bar** refetches `systemMailStatus` in place (silent refresh; form stays mounted). UI: `EmailPanel.tsx`.

GraphQL:

- `platformIntegrationSettings` / `updatePlatformIntegrationSettings` — translation, SMTP, OAuth, Telegram (see [[concepts/web-app#System control room]])
- `systemMailStatus` — resolved SMTP snapshot (`smtpMode`: `server_default` \| `custom`)
- `verifySmtpConnection(input!)` — required `config.smtp` draft from the Email form (tests exact host/port in the form, not only saved runtime / `.env`). Returns `{ ok, message }` with the host:port verified. **Does not send mail** — only opens SMTP; use `sendTestWelcomeEmail` for delivery.
- `sendTestWelcomeEmail(input: { to })` — sends `welcome-account` template with sample password `Example-Temp-Pass1`

## Related

- [[entities/user]]
- [[concepts/auth-rbac]]
