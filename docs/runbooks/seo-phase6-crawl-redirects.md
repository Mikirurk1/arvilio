# Runbook: SEO Phase 6 — Crawl hygiene & redirects

**Roadmap:** [`docs/arvilio-seo-roadmap.md`](../arvilio-seo-roadmap.md) Phase 6  
**When:** Whenever Hub marketing URLs change, or before a public launch.  
**Time:** ~15 minutes for smoke; ops crawls quarterly.

## What code already does

| Piece | Role |
|-------|------|
| CMS collection **Hub → Redirects** | `fromPath` → `toPath` / `toUrl`, 301/302, `enabled` |
| Hub `middleware.ts` | Applies enabled redirects (locale-aware match) |
| Seed defaults | `/home` → `/`, `/products/campus` → `/campus`, `/products/connect` → `/connect` |
| `npm run seo:smoke` | robots + sitemap + **every sitemap `<loc>` → 200** (+ optional Campus) |

**IndexNow:** skipped for now — publishing cadence is low; revisit when Hub content ships often enough that Bing freshness matters.

## Maintain redirects (ops)

1. Open cms-admin → **Hub → Redirects**.  
2. Add `fromPath` **without** inventing chains (A→B→C). Prefer one hop to the final URL.  
3. Prefer internal `toPath` (`/pricing`) over absolute `toUrl` unless leaving the Hub host.  
4. Use **301** for permanent moves; **302** only for temporary campaigns.  
5. Soft-check: `curl -sI https://<hub>/en/<from>` → `301` + `Location`.  
6. Leave old rows **enabled** until GSC coverage shows no hits, then disable.

After seed: `npm run seed -w @app/cms` upserts the three starter redirects.

## Smoke (local or preview)

```bash
# Hub only
npm run seo:smoke

# Hub + Campus
CAMPUS_URL=http://127.0.0.1:4200 npm run seo:smoke

# Preview deploy
HUB_URL=https://hub-preview.example.com npm run seo:smoke
```

Cap URL checks: `SEO_SMOKE_MAX_URLS=20`.

CI tip: run the same command as a **post-deploy** / preview check with `HUB_URL` set to the preview origin (Hub must be reachable; not wired into default PR CI because CMS+Hub aren’t started there).

## Quarterly crawl (ops)

1. Crawl production Hub with Screaming Frog (or similar) — mode: spider.  
2. Export 404s and redirect chains.  
3. Fix 404s via Redirects or restore pages.  
4. Flatten chains to a single 301.

## Checklist

- [ ] New retired paths added to Redirects before go-live of URL changes  
- [ ] `npm run seo:smoke` green against staging/preview Hub  
- [ ] Optional: Campus smoke with `CAMPUS_URL`  
- [ ] Quarterly crawl logged (date + issue count)
