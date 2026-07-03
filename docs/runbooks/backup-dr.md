# Backup & Disaster Recovery Runbook

**Owner:** Platform Engineering  
**Last updated:** 2026-06-27  
**RTO target:** 4 hours | **RPO target:** 1 hour

---

## 1. What we back up

| Asset | Method | Retention | Location |
|-------|--------|-----------|----------|
| PostgreSQL (Prisma) | PITR via provider (Neon / Supabase / RDS) | 7 days rolling | Provider-managed |
| File storage (S3/R2) | S3 Versioning + lifecycle rules | 30 days versions | Same bucket + cross-region replica |
| `.env` secrets | Manual — store in 1Password / Vault | Indefinite | Out-of-band |
| Stripe subscription state | Stripe event log (immutable) | Indefinite | Stripe |

---

## 2. Daily health check (automated)

The following should be verified daily in CI or a monitoring cron:

```bash
# 1. Confirm latest DB snapshot exists and is < 25h old
# (Neon / Supabase / RDS console → Backups tab)

# 2. Confirm S3 bucket versioning is ON
aws s3api get-bucket-versioning --bucket $STORAGE_BUCKET_NAME

# 3. Check API health
curl -sf https://api.yourdomain.com/api/health | jq .
```

---

## 3. Restore drill (run monthly)

### 3a. Database point-in-time restore

1. Pick a restore point (e.g. yesterday at 14:00 UTC).
2. **Neon:** `neon branches create --name restore-drill --timestamp <ISO8601>` → spin up a temporary branch.
   **Supabase/RDS:** use console "Restore to point in time" → new instance.
3. Run smoke queries against the restored instance:
   ```sql
   SELECT COUNT(*) FROM "User";
   SELECT COUNT(*) FROM "ScheduledLesson";
   SELECT COUNT(*) FROM "School";
   ```
4. Verify counts are consistent with expected range.
5. **Delete the restored branch/instance** — do not leave it running.
6. Log result in `docs/runbooks/drill-log.md`.

### 3b. File storage restore

```bash
# List versions of a known file
aws s3api list-object-versions \
  --bucket $STORAGE_BUCKET_NAME \
  --prefix "schools/<schoolId>/materials/<fileId>" \
  --query 'Versions[*].{Key:Key,VersionId:VersionId,LastModified:LastModified}'

# Restore a specific version
aws s3api copy-object \
  --bucket $STORAGE_BUCKET_NAME \
  --copy-source "$STORAGE_BUCKET_NAME/<key>?versionId=<versionId>" \
  --key "<key>"
```

---

## 4. Disaster scenarios

### 4.1 Database corrupted / accidental bulk delete

1. **Do not restart the API** — keep writes paused if possible (set `MAINTENANCE_MODE=true` in env and redeploy).
2. Identify the last clean point-in-time (check audit logs or Stripe events for last known-good event).
3. Restore to a new database instance (3a above).
4. Update `DATABASE_URL` in environment to point to restored instance.
5. Redeploy API — verify health endpoint.
6. Notify affected schools via email (use `apps/api` mail module directly if needed).

### 4.2 S3 bucket objects deleted

1. S3 Versioning retains deleted objects as delete markers — restore via 3b above.
2. If entire bucket is gone: restore from cross-region replica (if configured).
3. Verify `School.storageUsedBytes` is still accurate — run:
   ```bash
   # Reconcile script (TODO: add to scripts/)
   npx ts-node scripts/reconcile-storage.ts
   ```

### 4.3 API server unreachable

1. Check provider status page.
2. `docker logs <container>` or provider log stream for crash reason.
3. If OOM: scale up container memory, redeploy.
4. If bad deploy: roll back to previous image tag.
5. If DB connection refused: check `DATABASE_URL`, network ACLs, provider status.

### 4.4 Stripe webhook secret rotated / lost

See `docs/runbooks/secret-rotation.md` → Stripe section.

---

## 5. "Undelete school" (soft-delete recovery)

Schools are **suspended**, not hard-deleted. To restore a suspended school within the 30-day data retention window:

```sql
-- Reactivate school
UPDATE "School"
SET status = 'ACTIVE', "updatedAt" = NOW()
WHERE id = '<schoolId>';

-- Reactivate subscription if it was cancelled
UPDATE "PlatformSubscription"
SET status = 'ACTIVE', "updatedAt" = NOW()
WHERE "schoolId" = '<schoolId>'
  AND status = 'CANCELED';
```

After SQL update: notify the school admin via email and ask them to log in.

> Hard-delete is not implemented — personal data is anonymized on GDPR erasure request (7-year accounting retention applies to financial rows).

---

## 6. Contacts & escalation

| Role | Contact |
|------|---------|
| On-call engineer | Set in PagerDuty / Slack #incidents |
| Database provider support | Neon: neon.tech/support |
| Cloud storage | Cloudflare R2 / AWS S3 support |
| Stripe | dashboard.stripe.com/support |

---

## 7. Drill log

Keep a record of each drill in `docs/runbooks/drill-log.md`:

```markdown
## YYYY-MM-DD — Monthly restore drill
- **DB restore point:** ...
- **Restored instance:** ...
- **Smoke query results:** User=N, School=N, Lesson=N
- **Time to restore:** N min
- **Issues found:** none / ...
- **Engineer:** @name
```
