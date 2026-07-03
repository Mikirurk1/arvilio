# Secret Rotation Runbook

Scope: KEK (Key Encryption Key) rotation and other platform secrets.

---

## 1. KEK Rotation

The KEK is the master key used to encrypt per-school secrets (e.g. Telegram bot tokens,
custom SMTP credentials) stored in `PlatformSettings.encryptedSecrets` via AES-256-GCM.

### When to rotate

- Quarterly (scheduled)
- If `SECRET_ENCRYPTION_KEY` is suspected compromised
- After a team member with prod access departs

### Prerequisites

- Access to the production environment's secret store (Doppler / AWS SSM / `.env.production`)
- A maintenance window or zero-downtime window (rotation is hot — old DEK ciphertext remains
  valid until re-encrypted; no service interruption)

### Steps

1. **Generate a new KEK**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Store the output in your secret manager under `SECRET_ENCRYPTION_KEY_NEW`.

2. **Re-encrypt all secrets with the new KEK** (no DB schema change needed — DEK-wrapped blobs):
   ```bash
   # Future: npx ts-node scripts/rotate-kek.ts --dry-run
   # Today (single-school): redeploy PlatformSettings with all secrets re-entered
   # via System → SMTP / Telegram in the platform console.
   ```
   > For multi-school deployments once per-school keys land, this script will iterate
   > `PlatformSettings` rows, decrypt with old KEK, re-encrypt with new KEK, and save.

3. **Swap the env var** — set `SECRET_ENCRYPTION_KEY=<new_value>` in production.

4. **Remove `SECRET_ENCRYPTION_KEY_NEW`** from the secret store.

5. **Verify** — check SMTP / Telegram send in the platform console (`System → Email → Send test`).

6. **Record** — add a `secret_rotation` entry to `PlatformAuditLog` (manual until Step 2 script exists):
   ```sql
   INSERT INTO "PlatformAuditLog" (id, "actorUserId", action, metadata, "createdAt")
   VALUES (gen_random_uuid(), '<operator-id>', 'platform.kek.rotated',
     '{"reason":"quarterly"}', NOW());
   ```

---

## 2. JWT Secret Rotation (`JWT_SECRET`)

JWT_SECRET signs all access and refresh tokens. Rotating it **invalidates all active sessions**.

### Steps

1. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Set `JWT_SECRET=<new_value>` in production.
3. Redeploy the API (`apps/api`). All tokens signed with the old secret are immediately rejected.
4. Users will be forced to log in again (expected; announce in advance if needed).

---

## 3. Stripe Webhook Secret (`STRIPE_PLATFORM_WEBHOOK_SECRET`)

1. Go to Stripe Dashboard → Webhooks → select endpoint → Reveal signing secret.
2. Create a new endpoint (or roll the secret if UI allows) → get new `whsec_*` value.
3. Set `STRIPE_PLATFORM_WEBHOOK_SECRET=<new_value>` and redeploy.
4. Test with `stripe trigger checkout.session.completed`.

---

## 4. Checklist after any secret rotation

- [ ] New secret set in secret manager
- [ ] API redeployed and healthy (`GET /api/health` returns 200)
- [ ] Auth test: login → session resolves correctly
- [ ] Notification test: SMTP send or Telegram message
- [ ] Audit log entry created
- [ ] Old secret removed from secret manager
- [ ] Rotation date recorded in team runbook log

---

*See also: `docs/runbooks/incident-response.md` for breach response procedure.*
