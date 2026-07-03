# ADR-007: Tenant Resolution via Subdomains and Custom Domains

- **Status:** proposed
- **Date:** 2026-06-16
- **Authors:** SoEnglish engineering
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —
- **Depends-on:** ADR-005, ADR-008

## Context

Each school needs its own web address: a platform subdomain (`slug.soenglish.app`) by default, and optionally a custom domain (`learn.school.com`) it owns. The app currently has **no Next.js `middleware.ts`** and no host-based tenant resolution. Custom domains require automatic TLS certificate issuance, which should not live in application code.

## Decision

1. **Subdomains:** `*.soenglish.app`. A new `SchoolDomain { schoolId, hostname, kind (SUBDOMAIN|CUSTOM), verified, verifyToken, isPrimary }` model maps hostnames to schools. The bare apex (`soenglish.app`) serves the platform marketing/landing surface.

2. **Custom domains:** verified by DNS challenge — the school adds a CNAME (to the platform target) plus a TXT record matching `verifyToken`; a "verify" action flips `verified=true`. Unverified domains do not resolve to tenant content.

3. **TLS for custom domains:** **Cloudflare for SaaS** issues and renews certificates automatically via its API. The application only stores the `hostname → schoolId` mapping and verification state; it does not manage certificates. (Vercel Domains API and self-hosted Caddy on-demand TLS were rejected to avoid platform lock-in / extra ops respectively.)

4. **Next.js `middleware.ts`** reads the `Host` header, resolves `schoolId` (subdomain slug or `SchoolDomain` lookup, edge-cached), and forwards `x-school-id` to RSC/API. Unknown host → "school not found" / platform landing.

5. **Authorization never trusts the host alone.** The host-derived `schoolId` is used only for public surfaces (e.g. a school's public landing). For authenticated requests the backend uses `schoolId` from the validated JWT (ADR-008) and **cross-checks** it against the host-resolved school; mismatch → 403 (prevents using a token from school A on school B's domain).

## Consequences

### Positive
- Schools get branded subdomains immediately and custom domains with automatic TLS.
- Certificate lifecycle is fully offloaded to Cloudflare.

### Negative
- Hard dependency on Cloudflare for SaaS for the custom-domain feature.
- Domain-resolution lookup is on the hot path → must be cached at the edge/KV.

### Neutral
- `School.status = SUSPENDED` is enforced in middleware (show "school suspended") driven by billing (ADR-008).

## Compliance

```bash
test -f apps/web/src/middleware.ts || test -f apps/web/middleware.ts
# Authorization must not derive schoolId solely from request headers
grep -rn "x-school-id" packages/backend --include="*.ts"
```

## Links

- Related ADRs: ADR-005, ADR-006, ADR-008
