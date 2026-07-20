# 01 — Control Plane Stage 1: secure login + brand shell

> Companion: [`docs/arvilio-ecosystem-control-plane.md`](../arvilio-ecosystem-control-plane.md).

## Locked decisions

| Topic | Decision |
|-------|----------|
| Registration | None on platform |
| Login | `:4300/login` → `POST /api/auth/platform/login`; require `PlatformOperator` |
| OAuth | None on Control Plane login |
| Recovery | Break-glass CLI only (`SUPER_ADMIN_CLI_SECRET` + `npm run platform-operator`) |
| UI | Editorial Paper tokens + Field/Button copy (not import from campus) |

## Acceptance checklist

- [x] `docs/tmp-plans/` exists with this file
- [x] `POST /api/auth/platform/login` — operator OK; non-operator 401; no session for non-ops
- [x] Stricter rate-limit on platform login (5 / 15 min)
- [x] Audit `platform.auth.login` (success / fail when attributable)
- [x] CLI upsert/reset `PlatformOperator` behind CLI secret
- [x] `/login` branded UI (Field/Button); no signup / forgot / Google
- [x] Unauthenticated → `/login`; Unauthorized CTA → `/login`
- [x] Console shell uses Editorial tokens (light restyle)
- [x] Wiki `auth-rbac` + handoff updated

## CLI recovery

```bash
TOKEN=$(npm run --silent platform-operator -- token)
npm run platform-operator -- upsert --token "$TOKEN" \
  --email ops@example.com --password 'StrongPass!23' --role PLATFORM_ADMIN --name 'Ops'
```

## Out of scope (Stage 2+)

Full table restyle, Layer B Stripe UI, TOTP/WebAuthn, Connect nav, `@fe/ui` extract.
