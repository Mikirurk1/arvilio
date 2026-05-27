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

## SMTP (development)

Use [Mailtrap](https://mailtrap.io/) Email Testing inbox:

- `SMTP_HOST=sandbox.smtp.mailtrap.io`
- `SMTP_PORT=2525`
- `SMTP_USER` / `SMTP_PASS` from inbox credentials
- `MAIL_FROM` — visible sender

If `SMTP_HOST` is unset in the **API process** env, user creation still succeeds; `welcomeEmailSent` is `false`. The UI default `MAIL_FROM` (`SoEnglish <noreply@soenglish.local>`) matches the code fallback — seeing that **From** alone does not prove `.env` was loaded; check **Host** / **configured**.

API loads repo-root `.env` via `apps/api/src/load-env.ts` and `node --env-file` in dev (`apps/api/scripts/dev.cjs`). Restart API after editing `.env`.

## Super-admin test tools

Route: `/system` → **Email** tab (super-admin only).

GraphQL:

- `systemMailStatus` — current SMTP env snapshot
- `verifySmtpConnection` — nodemailer transport verify
- `sendTestWelcomeEmail(input: { to })` — sends `welcome-account` template with sample password `Example-Temp-Pass1`

## Related

- [[entities/user]]
- [[concepts/auth-rbac]]
