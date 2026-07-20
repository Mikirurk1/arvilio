---
description: Single-school today; future platform SaaS, marketplace leads, and school subscriptions.
alwaysApply: true
---

# Future multi-tenant architecture

Today Arvilio is implemented as a product for **one school**. Build for that reality by default, but do not make new architecture decisions that force a full rewrite when the product grows into the **platform vision** below.

## Target product vision (not built yet)

Arvilio is expected to evolve into a **two-sided platform**:

1. **School SaaS (B2B)** — schools open and run on the product via **subscription** (tenant = school). Each school operates its teachers, students, lessons, billing to its learners, and school-branded workflows inside its tenant.
2. **Student marketplace (B2C / acquisition)** — learners can **register on the platform** to find a tutor / school (discovery, matching, trials — product TBD). The platform may **route or assign learners to partner schools**.
3. **Platform take rate** — when the platform supplies a learner to a school, Arvilio earns a **commission per student** (or per lesson / enrollment event — exact commercial model TBD). This is separate from the school’s own lesson pricing to that student.

**Not the same as “Preply only”:** Preply today is mainly a **tutor marketplace** (student ↔ individual tutor, platform commission on lessons). Our direction is **hybrid**: multi-tenant **school OS** + optional **platform-driven student acquisition** with commission. Tutors belong to schools as tenants; the marketplace layer is platform-wide.

When implementing features today, preserve seams for:

| Concern | Platform-wide | Per school (tenant) |
|--------|----------------|---------------------|
| Student discovery / matching | Yes | School profile & capacity |
| Subscription to “open a school” | Billing product | Entitlement on `School` |
| Commission on platform-sourced students | Ledger / attribution | Payout or fee rules |
| Lessons, vocabulary, chat | — | School-scoped data |
| Payment provider secrets (Stripe, etc.) | — | School settings (one KEK per deploy is OK) |

## Rules

1. **Single-school now, tenant-ready later** — do not over-engineer every feature for SaaS today, but leave clean seams for school context, tenant routing, and platform-vs-school permissions.
2. **Always classify scope first** — for new auth, billing, settings, storage, and admin features, explicitly think: is this platform-wide, school-wide, membership-wide, or user-wide?
3. **Do not hide school-scoped data inside platform singletons** unless it is clearly temporary and the code shape still allows extracting a `School` / tenant model later.
4. **Prefer evolvable names and DTOs** — avoid naming new concepts as globally unique if they are likely to become school-scoped later.
5. **Auth and routing** — avoid adding more client-only route protection or assumptions that one app context equals one school; keep room for future tenant-aware middleware/server-side auth.
6. **Settings and secrets** — separate truly platform-global configuration from school-operated configuration whenever practical.
7. **Permissions** — keep a conceptual distinction between platform operators and school operators, even if the current implementation still maps both onto existing roles.
8. **If you choose a shortcut for today**, leave the boundary visible in code and mention the future extraction point in your explanation or docs.
9. **Marketplace vs school product** — do not fold “platform student” and “school-enrolled student” into one identity model without an explicit link (e.g. lead → enrollment → `schoolId`). Attribution for commission must be recoverable from data, not only from logs.
10. **Money flows** — assume three layers eventually: (a) student pays school for lessons, (b) school pays platform subscription, (c) platform commission on platform-sourced students. Avoid baking “one checkout” that cannot split tenant settlement later.

## Heuristic

If a change would be annoying but localized to extract later, it is acceptable. If it would force rewriting auth/session shape, routing shape, billing ownership, or core data ownership, redesign it now.
