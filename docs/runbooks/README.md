# Runbooks

Operational runbooks referenced by the multi-tenant execution plan
(`docs/multi-tenant-execution-plan.md`). Each runbook is a step-by-step
procedure an on-call engineer can follow without prior context.

## Index

| Runbook | Phase | Status |
|---------|-------|--------|
| `seo-phase1-search-console.md` — GSC/Bing verify Hub+Campus, sitemap submit, validators | SEO Phase 1 | ☑ runbook ready; ops on live hosts |
| `custom-domains.md` — Cloudflare for SaaS: add/verify/remove a tenant custom domain + TLS | 2 | ☐ planned |
| `secret-rotation.md` — rotate the per-deploy KEK and re-encrypt school secrets | 3 | ☐ planned |
| `restore-drill.md` — point-in-time restore / "undelete a school" within retention | 7 | ☐ planned |
| `incident-response.md` — outage triage + status-page/incident comms | 7 | ☐ planned |

Add a runbook as its phase lands; keep this index in sync.
