# Security

## HTTP Security Headers

### NestJS API (`apps/api/src/main.ts`)
- `helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })` — вмикає 11 security headers. CSP вимкнено через GraphQL/Apollo (потребує налаштування nonces).
- CORS: `WEB_ORIGIN` env var, `credentials: true`.

### Next.js (`apps/web/next.config.mjs`)
Headers застосовані до всіх маршрутів `/(.*)*`:
- `X-Frame-Options: SAMEORIGIN` — захист від clickjacking
- `X-Content-Type-Options: nosniff` — захист від MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-XSS-Protection: 1; mode=block`

## Rate Limiting

`@nestjs/throttler` — `ThrottlerGuard` глобально: 120 запитів / 60 сек на IP. Ендпоінти можна анотувати `@Throttle({ default: { ttl: 60000, limit: 5 } })` для жорсткіших лімітів (наприклад, `/auth/login`).

## Input Validation

`ValidationPipe({ whitelist: true, transform: true })` глобально в NestJS:
- `whitelist: true` — зайві поля в DTO відкидаються (захист від mass assignment)
- `transform: true` — автоматична конвертація типів

## File Uploads

`materialFileFilter` у `module-materials/src/presentation/rest/material-files.controller.ts`:
- Дозволені префікси: `image/`, `audio/`, `video/`
- Дозволені точні MIME: PDF, Word, PowerPoint, Excel (docx/xlsx/pptx)
- Заборонені: `application/x-php`, `text/html`, `application/javascript` та всі інші
- Помилка: `400 File type '...' is not allowed`

## Fail-Secure Startup Checks

Three env vars are now **required** (app throws on startup if missing):

| Variable | Location | Impact if missing |
|----------|----------|-------------------|
| `JWT_SECRET` | `module-auth/src/shared/auth-cookies.ts` | Throws `Error: JWT_SECRET env var is required` |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | `platform-integration.config.util.ts` | Falls back to `null` → `livekitCredentials()` returns `null` → LiveKit disabled (fail-secure) |
| `PLATFORM_SECRETS_ENCRYPTION_KEY` | `module-lessons/livekit.service.ts:roomNameFor` | Throws if neither `PLATFORM_SECRETS_ENCRYPTION_KEY` nor `PAYMENT_SECRETS_ENCRYPTION_KEY` set |

Previously `JWT_SECRET` fell back to `'soenglish-dev-secret'` (critical auth bypass) and LiveKit used `'devkey'`/`'devsecret'` (bypassed null guard).

## Password Hashing

`bcryptjs` з 12 раундами (`auth.service.ts`, `users.service.ts`). Не SHA-256.

## Crypto

- AES-256-GCM для payment secrets (`module-billing/src/shared/payment-secrets.util.ts`): `deriveKey = SHA-256(masterKey)` — прийнятно бо masterKey є випадковим секретом, не password.
- HMAC-SHA256 для LiveKit токенів і Zoom webhook verification.
- SHA-1 для LiqPay підпису — вимога LiqPay API.

## Dependency CVEs (стан 2026-06-15)

Після оновлень: 0 critical, 3 high, 11 moderate.
- 3 HIGH залишились через `@payloadcms→drizzle-kit→esbuild` — dev build tools, не production runtime.
- `npm overrides`: `ws ^8.21.0`, `fast-uri ^4.0.0`, `brace-expansion ^2.0.1`.

## Attack Surface аналіз

| Вектор | Статус |
|--------|--------|
| SQL Injection | ✅ Безпечно — Prisma ORM, нема raw SQL |
| XSS | ✅ React + helmet + security headers |
| IDOR (lessons) | ✅ `isLessonMember()` перевірка в REST і GraphQL |
| Clickjacking | ✅ `X-Frame-Options: SAMEORIGIN` |
| Brute force | ✅ ThrottlerGuard 120/60s |
| Mass assignment | ✅ ValidationPipe whitelist |
| File upload abuse | ✅ MIME whitelist filter |
| Open redirect | ✅ Відсутній |
| passwordHash leak | ✅ GraphQL повертає тільки `hasPassword: Boolean` |
