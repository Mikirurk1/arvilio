# Custom Domains — Cloudflare for SaaS Runbook

## Overview

Each school can verify a custom hostname (e.g. `lessons.acme.com`) via the school admin
**System → Domains** tab. The platform verifies ownership via a DNS TXT challenge, then
registers the hostname with Cloudflare for SaaS to provision a certificate and route
traffic to the platform origin.

---

## DNS TXT Verification

The platform generates a random `verifyToken` when a school adds a domain.
The school adds a TXT record at their DNS provider:

```
_soe-verify.lessons.acme.com  TXT  "soe-verify=<verifyToken>"
```

Or at the apex if the admin chose `acme.com`:

```
acme.com  TXT  "soe-verify=<verifyToken>"
```

The backend calls `dns.promises.resolveTxt(hostname)` (Node built-in — no HTTP fetch,
SSRF-safe) and checks that any chunk contains `soe-verify=<token>`.

---

## Cloudflare for SaaS — Custom Hostnames

### Prerequisites

- Cloudflare zone for `arvilio.app` (or the platform apex)
- `CLOUDFLARE_API_TOKEN` in env — Zone:Edit + SSL:Edit scopes
- `CLOUDFLARE_ZONE_ID` in env

### Add a custom hostname

```bash
CF_TOKEN=$CLOUDFLARE_API_TOKEN
ZONE=$CLOUDFLARE_ZONE_ID
HOSTNAME=lessons.acme.com

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/custom_hostnames" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "hostname": "'"$HOSTNAME"'",
    "ssl": {
      "method": "http",
      "type": "dv",
      "settings": { "min_tls_version": "1.2" }
    }
  }'
```

The response includes `id` — store it in `SchoolDomain.cfHostnameId` (add column when
Cloudflare for SaaS integration is activated).

### Poll certificate status

```bash
CF_HOSTNAME_ID=<id from above>
curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE/custom_hostnames/$CF_HOSTNAME_ID" \
  -H "Authorization: Bearer $CF_TOKEN" | jq '.result.ssl.status'
```

`status` transitions: `pending_validation` → `pending_issuance` → `active`.

### Fallback origin

The platform origin must be set as the fallback in the zone:

```bash
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE/fallback_origin" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"origin": "api.arvilio.app"}'
```

### Remove a custom hostname

```bash
curl -s -X DELETE \
  "https://api.cloudflare.com/client/v4/zones/$ZONE/custom_hostnames/$CF_HOSTNAME_ID" \
  -H "Authorization: Bearer $CF_TOKEN"
```

Always call this when a school removes their domain from the platform.

---

## Checklist — when activating Cloudflare for SaaS

- [ ] Add `cfHostnameId String?` to `SchoolDomain` model + migration
- [ ] Store CF hostname id in `DomainsService.add` after `createCustomHostname` call
- [ ] Poll + update `verified=true` when `ssl.status === 'active'` (cron job or webhook)
- [ ] Delete CF hostname in `DomainsService.remove`
- [ ] Add `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` to `.env.example` and deployment secrets
- [ ] Set fallback origin in Cloudflare zone (one-time)
- [ ] Verify `TenantResolutionMiddleware` resolves `cfHostname → schoolId` (already does via `SchoolDomain`)
