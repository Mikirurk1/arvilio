---
tags: [concept, email, auth]
updated: 2026-07-21
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

Transport is **provider-agnostic SMTP** (nodemailer). Mailtrap is only one possible host — any SMTP works.

### Where to configure (platform-global)

| UI | Who | Notes |
|----|-----|--------|
| **Control Plane → Settings → Transactional email** | Platform operators | Primary. REST `GET/PUT /api/platform/smtp`, verify, test |
| **Campus → System → Email** | SUPER_ADMIN | Same `PlatformSettings` row; presets shared |

School-level SMTP override is **not** built yet (future multi-tenant seam).

| Mode | Behavior |
|------|----------|
| **Server default** | Uses deployment `SMTP_*` / `MAIL_FROM` from the API process environment. |
| **Custom SMTP** | Host, port, user, password, and from address stored in `PlatformSettings.integrationConfig` / encrypted `integrationSecrets` (`PAYMENT_SECRETS_ENCRYPTION_KEY` / `PLATFORM_SECRETS_ENCRYPTION_KEY`). |

Presets (host/port/secure only): Resend, Brevo, Amazon SES, Mailtrap, Custom — see `SMTP_PROVIDER_PRESETS` in `@pkg/types`.

`platformIntegrationSettings.secretsStorageAvailable` reflects whether the API has that encryption key loaded. **Config-only** SMTP saves (from address, host, port, user — without a new password field) do not re-encrypt secrets and work without the key. Saving a **new** custom SMTP password requires the key.

`MailService` resolves SMTP via `getPlatformIntegrationRuntime()` (DB + env fallback). If no host is available, user creation still succeeds; `welcomeEmailSent` is `false`.

### Provider alternatives (when Mailtrap limits hit)

| Provider | Typical SMTP | Notes |
|----------|--------------|--------|
| **Resend** | `smtp.resend.com:465` (user `resend`, pass = API key) | Good DX; verify domain for prod |
| **Brevo** | `smtp-relay.brevo.com:587` | Generous free tier |
| **Amazon SES** | `email-smtp.<region>.amazonaws.com:587` | Cheap at volume |
| **Postmark / Mailgun** | their SMTP hosts | Paid; reliable |
| **Mailtrap** | `sandbox.smtp.mailtrap.io:2525` | Dev capture only |

No HTTP SDK required for this slice — SMTP only.

## Super-admin / platform test tools

- Platform Settings: verify connection (form draft), save, send test welcome.
- Campus `/system` → **Email** tab: same via GraphQL.

GraphQL (Campus):

- `platformIntegrationSettings` / `updatePlatformIntegrationSettings`
- `systemMailStatus` — resolved SMTP snapshot (`smtpMode`: `server_default` \| `custom`)
- `verifySmtpConnection(input!)` — draft from the Email form
- `sendTestWelcomeEmail(input: { to })`

REST (Control Plane):

- `GET/PUT /api/platform/smtp`
- `POST /api/platform/smtp/verify`
- `POST /api/platform/smtp/test` — `{ to }`

## Test surface (CI / audit)

Live delivery to Resend/Brevo/Mailtrap is **out of CI**. Coverage is mock-only:

| Layer | Spec | What |
|-------|------|------|
| Unit | `smtp-provider-presets.test.ts` (`@pkg/types`) | `SMTP_PROVIDER_PRESETS`, `matchSmtpProviderPreset` |
| Unit | `platform-smtp.service.spec.ts` | `get` / `set` / `verify` / `test` (+ audit, bad `to`, unconfigured) |
| Campus e2e | `tests/e2e/specs/audit/06-smtp-mock.spec.ts` | GraphQL mock: verify, Resend preset, Save SMTP, Send test |
| Platform e2e | `tests/e2e/specs/audit/07-platform-smtp-mock.spec.ts` | REST mock on `/api/platform/smtp*`; soft-skip if `:4300` down |

## Related

- [[entities/user]]
- [[concepts/auth-rbac]]
- [[concepts/multi-tenancy]] — platform vs future school SMTP
