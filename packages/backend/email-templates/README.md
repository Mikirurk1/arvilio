# Email templates (React Email)

Transactional emails are React components rendered with [`@react-email/render`](https://react.email).

| Template ID | Component | Used when |
|-------------|-----------|-----------|
| `welcome-account` | `WelcomeAccountEmail` | Admin creates a user |
| `lesson-reminder` | `LessonReminderEmail` | Cron ~30 min before lesson |
| `streak-alert` | `StreakAlertEmail` | Daily streak at-risk |
| `weekly-report` | `WeeklyReportEmail` | Monday weekly summary |
| `new-vocabulary` | `NewVocabularyEmail` | Daily word of the day |
| `teacher-message` | `TeacherMessageEmail` | Staff sends student message |

## Build

```bash
npm run build -w @soenglish/email-templates
```

API `build` and `dev` compile this package first (`dist/`). Nest mail code imports `renderEmail` from `@soenglish/email-templates`.

## Preview (optional)

From repo root, after installing dev CLI:

```bash
npx react-email dev --dir packages/backend/email-templates/src/templates
```

## SMTP

Configure Mailtrap / production SMTP in repo-root `.env` (see `.env.example`). Without `SMTP_HOST`, sends are skipped (logged).
