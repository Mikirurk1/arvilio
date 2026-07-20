# Runbook: SEO Phase 5 — Core Web Vitals

**Roadmap:** [`docs/arvilio-seo-roadmap.md`](../arvilio-seo-roadmap.md) Phase 5  
**When:** After Hub/Campus public HTTPS (or local smoke before release).  
**Time:** ~20–40 minutes.

## What we already fixed in code

| Change | Why |
|--------|-----|
| Hub `next/font` (Fraunces + Source Sans 3) | Remove render-blocking Google Fonts CSS |
| Hub `CmsLogo` + reserved height | Reduce CLS on product logos |
| CMS `Cache-Control` on `/media` + `/payload-api/media` | Faster repeat visits / crawlers |
| Payload Media `imageSizes` (`og` 1200×630, `logo`, `thumb`) | Right-sized assets after re-upload |
| Campus login logo `priority` + brand `min-height` | LCP + CLS on auth |

**Note:** Existing media files get `og`/`logo`/`thumb` only after re-upload (or regenerate). Seed OG PNG still works at full URL; Hub prefers `sizes.og` when present.

## Local smoke (optional)

With Hub (:4400) and Campus (:4200) running:

```bash
# Mobile Lighthouse on Hub home (needs Chrome)
npx lighthouse http://127.0.0.1:4400/en \
  --only-categories=performance \
  --form-factor=mobile \
  --chrome-flags="--headless=new" \
  --output=json --output-path=/tmp/hub-lighthouse.json \
  --quiet

node -e "const r=require('/tmp/hub-lighthouse.json'); const a=r.audits; console.log({
  score: r.categories.performance.score,
  LCP: a['largest-contentful-paint']?.displayValue,
  CLS: a['cumulative-layout-shift']?.displayValue,
  FCP: a['first-contentful-paint']?.displayValue,
});"
```

Campus login:

```bash
npx lighthouse http://127.0.0.1:4200/login \
  --only-categories=performance \
  --form-factor=mobile \
  --chrome-flags="--headless=new" \
  --quiet --output=json --output-path=/tmp/campus-lighthouse.json
```

Dev-mode scores are noisy (HMR, no CDN). Prefer **production** build or PageSpeed Insights on the live host for the roadmap exit criterion.

## Production / ops

1. Open [PageSpeed Insights](https://pagespeed.web.dev/) → Hub home + Campus login (mobile).  
2. Target: LCP / CLS not in “Poor” (red).  
3. If LCP is still image-heavy: re-upload OG/logos in CMS so `og`/`logo` sizes exist; confirm `Cache-Control` on media responses.  
4. Re-run PSI after deploy.

## Checklist

- [ ] PSI mobile Hub home — no Poor LCP/CLS  
- [ ] PSI mobile Campus login — no Poor LCP/CLS  
- [ ] Media responses send long-lived `Cache-Control` on prod  
- [ ] New OG uploads use ~1200×630 (or rely on `og` size generation)
