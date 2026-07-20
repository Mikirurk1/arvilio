# arvilio — Business Model & Commercial Plan

> **Working product/platform name: `arvilio`** (domains `.com/.io/.org/.app/.ai` free as of 2026-06-16).
> `Arvilio` (current codebase) becomes the first school/tenant on the arvilio platform.


> Companion to `docs/multi-tenant-execution-plan.md` (how we build), ADR-005…009 (what we decided),
> [`arvilio-ecosystem-control-plane.md`](./arvilio-ecosystem-control-plane.md) (ecosystem shape, Control Plane, monolith advice),
> and [`arvilio-marketing-site-payload-plan.md`](./arvilio-marketing-site-payload-plan.md) (public `arvilio.app` hub: brand-kit, product registry, i18n — Payload extraction).
> This file = **how we make money and grow**. Numbers below are a proposed v1 — assumptions are tagged
> ⚠️ and the strategic forks are listed in "Open decisions" at the end.

---

## 1. What we are

**Arvilio** is an education ecosystem: **Campus** (run courses) + later **Connect** (match learners, tutors, and campuses) on one shared platform and one User identity.

Product names (see [`arvilio-ecosystem-control-plane.md`](./arvilio-ecosystem-control-plane.md) §1):

- **Arvilio Campus (Pillar 1 — B2B SaaS, core):** a campus / academy / studio runs operations inside Arvilio — teachers, learners, scheduling, lessons (video), materials, vocabulary, quizzes, chat, billing to its own learners, payouts to staff. The organization pays Arvilio a subscription. *(Edvibe is the closest comparable.)*
- **Arvilio Connect (Pillars 2+3 — matching network, later):** one product surface where learners find tutors/campuses, tutors take private learners **and/or** seek a campus role, and campuses hire tutors / receive platform-sourced learners. Monetized by **finder fee** (learner we supply) and **placement fee** (tutor we place) — not an ongoing tax on a campus’s own learners. *(Preply-like discovery + recruiting, without Preply’s ongoing cut on owned students.)*

This is a **hybrid**, not a "Preply clone": Preply taxes every lesson ongoing; we sell the campus its own software (its *own* learners are never taxed) and only charge when **we** supply a learner or **we** supply a tutor.

### Benchmark — how the comparables work (June 2026)
| Platform | Model | Pricing | Lesson for us |
|----------|-------|---------|---------------|
| **Edvibe** | Language-teaching SaaS / virtual classroom for tutors & schools | **Per active student** (~$2–3 / student / mo, first student free); all-in-one | Validates **per-active-student** pricing for our SaaS |
| **Preply** | Tutor↔student marketplace | Free to join; **100% of first trial lesson + 33%→18% sliding commission** by hours taught; students billed every 28 days | High ongoing cut annoys tutors/schools → our **one-time finder fee** is a friendlier wedge |
| TeachWorks | Tutoring-business admin SaaS | Per-seat/student tiers | We add marketplace + recruiting + localized UAH rails |
| Google Classroom / Zoom + sheets | Free generic stack | Free | We are purpose-built: levels, vocab SRS, lesson-balance billing, payouts |

### Positioning vs alternatives
| Competitor | What they are | Our wedge |
|-----------|---------------|-----------|
| Preply / italki | Tutor marketplaces, 15–33% ongoing cut | We don't tax a school's *own* students; only a one-time finder fee on students we bring |
| Edvibe / TeachWorks | Language-school / tutoring SaaS | We add a built-in marketplace **+ tutor recruiting** + localized payments (UAH + intl) |
| Recruiting agencies (offline) | Manual tutor placement | Built into the same platform tutors/schools already use; data-driven matching |

---

## 2. Target customers (ICP)

| Segment | Description | Primary need | Entry tier |
|---------|-------------|--------------|-----------|
| **S1 — Solo / micro tutor** | 1 teacher, 5–30 students | Cheap, simple, scheduling + payments | Free / Starter |
| **S2 — Small language school** (beachhead) | 2–15 teachers, 30–300 students | Multi-teacher ops, branding, payouts | Pro |
| **S3 — Established school / chain** | 15+ teachers, 300+ students | White-label, custom domain, SSO, SLA | Business |
| **S4 — Learners (marketplace)** | Individuals seeking a school/tutor | Find the right school, trial lessons | Free (B2C) |
| **S5 — Independent tutors (recruiting)** | Tutors seeking students or a school position | Get placed / find work / find students | Free profile + premium |

**Beachhead:** S2 small language schools in Ukraine (existing product + local payment rails), then EU/global self-serve. S5 tutors are both a supply source for S4 learners and a feeder into S1/S2 (a recruited tutor brings their school onto the SaaS).

---

## 3. Revenue streams

| # | Stream | Who pays | Type | Pillar |
|---|--------|----------|------|--------|
| R1 | **SaaS subscription** | School → Platform | Recurring MRR (backbone) | 1 |
| R2 | **Student finder fee** | School → Platform, on platform-sourced students | One-time per matched student | 2 |
| R3 | **Tutor placement fee** | School → Platform, on platform-sourced tutors | One-time per hired tutor | 3 |
| R4 | **Recruiting tools / premium tutor profile** | School or tutor | Recurring add-on | 3 |
| R5 | **Add-ons** (AI, SMS, storage, extra domains, white-label) | School | Recurring / metered | 1 |
| R6 | **Payment take** (optional, later) | small % on student→school GMV | Usage | 1 |

Diversification rule: **R1 SaaS MRR must remain the backbone** (predictable); R2/R3 fees and R4/R5/R6 are high-margin upside, not the base. ADR-008's three money layers cover R1 (school→platform), student→school (school's own billing), and R2 attribution; R3/R4 extend the same `StudentAcquisitionLead`-style attribution to tutors.

---

## 4. Pricing & packaging

### 4.1 Value metric — **per active student + storage quota** (DECIDED)
We price on **monthly active students (MAS)** as the primary meter — it scales with the *school's own revenue*, so price feels fair and grows with the customer (matches the proven Edvibe model ~$2–3/student/mo). Teacher seats are bundled generously (not the meter).

**Second meter — storage quota per school.** Each tier includes a disk-space allowance; schools cannot upload materials/recordings indefinitely. Over quota → block new uploads with a clear upgrade/add-on prompt (never silently fail, never delete). This protects infra cost (object storage is a real COGS) and creates a natural upsell. See execution plan G6 + Phase 5.

**R1 SaaS subscription is the primary revenue** (backbone). Marketplace finder fees and recruiting placement fees (R2/R3) are upside that grows the funnel, not the base — and they are the *next stage* the admin console is being built to support (see §6 Phase C).

**Anchor market: Ukraine-first, UAH (DECIDED).** EUR/USD shown as the international expansion reference. Final numbers are a hypothesis to validate with design partners.

### 4.2 Tiers

| Tier | Price (intl) | Price (UA) | Active students | Teachers | **Storage** | Key features |
|------|-------------|-----------|-----------------|----------|-------------|--------------|
| **Free** | €0 | ₴0 | up to 5 | 1 | **1 GB** | Core teaching, `slug.arvilio.app`, Arvilio branding, no payments-out |
| **Starter** | €29/mo | ₴990/mo | up to 30 | up to 3 | **10 GB** | Student billing (Layer A), basic reports, email support |
| **Pro** ⭐ | €79/mo | ₴2 900/mo | up to 150 | up to 15 | **100 GB** | Custom domain, white-label branding, AI assist, staff payouts, priority support |
| **Business** | from €199/mo | from ₴7 500/mo | 150+ (tiered) | unlimited | **500 GB+** (tiered) | SSO, SLA, dedicated success, API, advanced analytics |

⚠️ Storage numbers are a starting hypothesis — tune to real material/recording sizes. Extra storage is also a paid add-on (R5) beyond the tier quota.

- **Annual billing:** 2 months free (≈17% off) — improves cash + retention.
- **Overage:** above-tier MAS → auto-suggest upgrade (soft cap with grace), not hard cutoff mid-month.
- **Trial:** 7 days free, **no card** (→ 14 days with a promo code). See execution plan Phase 4.5.
- **Free tier purpose:** PLG funnel + marketplace supply, deliberately limited (no payouts, Arvilio-branded) so growing schools upgrade.

### 4.3 Add-ons (à la carte, mostly Pro+)
- AI pack (auto lesson summaries, quiz/vocab generation, speaking feedback): €/mo per school or usage-metered.
- Extra storage beyond tier quota.
- SMS / WhatsApp notifications (pass-through + margin).
- Additional verified custom domains.

### 4.4 Student finder fee (R2 — DECIDED: one-time)
Applies **only to students the platform sources** for a school (attribution via `StudentAcquisitionLead`, ADR-008). A school's self-acquired students are **never** charged.

**Model: a one-time finder fee per matched student** (proposed ≈ **50% of the student's first month**, ⚠️ tune by market). Simple and honest — no perpetual tax on the school, unlike Preply's ongoing 18–33%. Trade-off: no recurring marketplace revenue per student, so volume + the recruiting pillar carry growth. Refund/no-show within a guarantee window → fee clawback (double-entry ledger, plan G10).

### 4.5 Tutor-recruiting service (R3/R4 — Pillar 3)
Two-sided talent layer:
- **Tutor placement fee (R3):** when the platform supplies a tutor a school hires → **one-time placement fee** paid by the school (⚠️ proposed ≈ a fixed UAH amount or % of first month of that tutor's billings). Attribution mirrors the student lead model (a `TutorPlacementLead` analogue).
- **Recruiting tools / premium (R4):** schools get lightweight ATS tools (post a role, review tutor applicants, interview scheduling) on Pro+; tutors can buy a **premium profile** (visibility boost, verified badge) — recurring.
- **Guarantee:** replacement window if a placed tutor leaves early (protects the fee's perceived value).
- Cross-pillar effect: recruited tutors are nudged to run *their* school on our SaaS (Pillar 1) and add marketplace supply (Pillar 2).

### 4.6 Payment take (R6, optional, later)
Small platform fee (e.g. +0.5–1%) on student→school GMV processed through integrated checkout, on top of PSP fees. Off by default for local UAH rails to stay competitive; revisit once volume justifies.

---

## 5. Unit economics (model skeleton)

⚠️ Illustrative — fill with real funnel data post-launch.

**Per SaaS customer (Pro example):**
- ARPA ≈ €79/mo → €948/yr.
- Gross margin target ≥ 80% (infra marginal cost per tenant is low; main COGS = PSP fees, support, AI compute).
- Assume logo churn 3%/mo early → avg lifetime ≈ 33 mo; **LTV ≈ €948 × 0.8 × 2.75 yr ≈ €2,085**.
- Target **CAC payback < 12 mo**, **LTV:CAC ≥ 3:1**.

**Marketplace:**
- GMV (platform-sourced) × take rate = revenue. Near-zero COGS beyond payment fees → blended margin pulls upward as marketplace share grows.

**Cost structure:** R&D (largest early), infra/hosting (Cloudflare for SaaS, DB, object storage, video minutes), PSP fees, support/success, sales & marketing, compliance.

---

## 6. Go-to-market

**Phase A — Anchor & design partners (now → launch):** migrate the existing school as tenant #1; recruit 3–5 design-partner schools (UA/EU) at discounted Pro for feedback. Goal: prove retention + isolation in production.

**Phase B — Self-serve PLG (post Phase 4.5):** free trial + promo codes + config wizard + virtual assistant make signup frictionless. Growth via SEO/content ("how to run a language school", teacher tools), templates, referral promo codes. Free tier seeds marketplace supply.

**Phase C — Marketplace + recruiting flywheel (Phase 6):** once enough schools/tutors are on-platform, open learner discovery and tutor placement. Loop: more schools → more tutor demand → recruiting attracts tutors → more tutors → more marketplace supply → more learners → finder/placement fees fund acquisition → attracts more schools. Tutors recruited for one school often bring their *own* school onto the SaaS, closing the loop into Pillar 1.

**Sales motion:** self-serve for S1/S2; assisted/sales-led for S3 Business.

**Referral / promo:** promo-code system (Phase 4.5) doubles as a growth lever — partner codes, referral codes (extend trial / discount), campaign codes.

---

## 7. KPIs (north stars per layer)

| Layer | Primary | Supporting |
|-------|---------|-----------|
| SaaS | **MRR / NRR** | trial→paid conversion, logo churn, ARPA, CAC payback |
| Activation | **trial→paid %** | wizard completion %, tour completion %, time-to-first-lesson |
| Marketplace | **matched students + finder-fee revenue** | leads→enrollment %, fee/student, school fill rate |
| Recruiting | **tutor placements + placement-fee revenue** | tutor applicants, placement→retained %, premium-profile MRR |
| Product health | **WAU/MAU per tenant** | lessons delivered, retention cohorts |
| Trust | isolation incidents = **0** | uptime/SLA, support CSAT |

---

## 8. Risks & moats

**Risks:** schools resisting commission on marketplace students (mitigate: never tax own students, declining rate); marketplace cold-start (mitigate: free tier seeds supply, anchor school + partners); churn if onboarding is hard (mitigate: Phase 4.5 wizard + assistant); pricing mismatch by market (mitigate: localized UAH/EUR/USD).

**Moats:** localized payment rails (UAH + intl) competitors lack; switching cost once a school's whole operation lives in-platform; data network effects in the marketplace; purpose-built language-teaching depth (levels, vocab SRS, lesson-balance billing, payouts).

---

## 9. Decisions (resolved 2026-06-16)

| Fork | Decision |
|------|----------|
| Pricing value metric | **Per active student** (Edvibe-validated) |
| Free tier | **Limited freemium** (PLG funnel + marketplace/recruiting supply) |
| Student marketplace charge | **One-time finder fee** (no ongoing tax) |
| Primary market / currency | **Ukraine-first, UAH** (LiqPay/WayForPay/MonoPay), EU/global later |
| Third pillar | **Tutor-recruiting service** added (placement fee + recruiting tools) |

### Still to validate (with design partners / data)
- Exact UAH price points per tier and per-student rate.
- Finder-fee % and placement-fee amount + guarantee windows.
- Whether recruiting launches alongside the marketplace (Phase 6) or as a separate later phase.
