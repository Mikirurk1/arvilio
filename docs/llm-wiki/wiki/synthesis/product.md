---
tags: [synthesis, product]
updated: 2026-07-11
---

# Product synthesis — Arvilio

**Arvilio** is an education **ecosystem**: one company brand, one shared `User`, several products on a shared Platform kernel. Strategic naming and Control Plane plan: [`docs/arvilio-ecosystem-control-plane.md`](../../../arvilio-ecosystem-control-plane.md). Money: [`docs/business-model.md`](../../../business-model.md). Marketing site + Payload: [`docs/arvilio-marketing-site-payload-plan.md`](../../../arvilio-marketing-site-payload-plan.md).

## Ecosystem products

| Name | Role | Status |
|------|------|--------|
| **Arvilio** | Company + ecosystem brand | Now |
| **Arvilio Platform** | Shared kernel: User, tenants, money A/B/C, Control Plane | Now (internal) |
| **Arvilio Campus** | Product #1 — run courses (schedule, materials, vocab, chat, bill learners, staff) | **Now — what we built** (`apps/campus`) |
| **Arvilio Connect** | Product #2 — discovery & matching (learners ↔ tutors ↔ campuses) | **Later** |
| **Arvilio Control Plane** | Operator console for the fleet (`apps/platform` seed → evolve) | Seed shipped |
| **Marketing site** | Public brand `arvilio.app` (`apps/hub`; content from `apps/cms` Payload) | **Scaffolded** (Phase B+C) — [plan v2](../../../arvilio-marketing-site-payload-plan.md) |

**Do not use as product brands:** School OS, Marketplace, Tutor Recruiting. Internal DB model may still be `School` — marketing copy = campus / organization.

**Hybrid vs Preply:** Campus SaaS does **not** tax a campus’s own learners. Connect charges only when the platform supplies a learner (finder fee) or places a tutor (placement fee).

## Today vs target

| | **Today (Campus)** | **Target** |
|---|-----------|---------------------|
| Tenants | Multi-tenant foundation shipped (Phases 0–5, 7); Phase 6 Connect deferred | Many campuses + Connect on one Platform |
| Who pays whom | Layer A (learner→campus) + Layer B (campus→platform SaaS) | Same + Layer C / R2–R3 on Connect |
| Identity | Global `User` + `SchoolMembership` (ADR-006) | Same User across Campus **and** Connect |
| Comparison | Edvibe-style campus ops | Hybrid: Campus SaaS + Connect matching |

Cursor rule: `.cursor/rules/future-multitenant-architecture.mdc`. Live architecture: [[concepts/multi-tenancy]].

## Architecture rules (locked)

1. **Modular monolith** in one monorepo — do not split microservices while solo; extract only with hard reasons.
2. **Control Plane** = one operator brain (`apps/platform`); Campus System/Admin stays tenant-local.
3. **New product** = Nest module(s) + optional `apps/<product>` + Control Plane nav section — not a new org/DB.
4. **Marketing site** = `apps/hub` + Payload (brand-kit, `products` registry, extensible UI locales); not product data ([[concepts/payload-cms]]). **UI locale ≠ learning language** ([[entities/language]]).
5. **Three money layers:** A learner→campus, B campus→platform, C platform fees on platform-sourced matches.
6. **PlatformOperator ≠ campus ADMIN** — separate axis (ADR-008 / ADR-009).
7. **Learning languages** are catalog-driven (`Language`); do not hard-code English-only in new Campus/Connect features.

## Primary users (Campus)

| Persona | Goal |
|---------|------|
| **Student / learner** | Attend lessons, vocabulary, quizzes/practice, homework |
| **Teacher** | Schedule lessons, manage students, review homework |
| **Campus admin** | Accounts, payments, school settings (tenant-scoped) |
| **Platform operator** | Fleet health, Layer B billing, allowlists — Control Plane only |

See [[concepts/roles-matrix]] and [[concepts/auth-rbac]].

## Core Campus product areas

### Scheduled lessons

- [[entities/scheduled-lesson]] — calendar, Meet/Zoom/LiveKit, homework
- [[concepts/lessons-calendar]], [[concepts/video-meeting-providers]], [[concepts/group-lessons]]

### Vocabulary & practice

- [[entities/word]], [[entities/student-word-card]], [[entities/review-queue]]
- [[concepts/vocabulary]], [[concepts/quizzes-flashcards]]

### Materials & chat

- [[concepts/materials-library]], [[concepts/chat]]

### Billing (Layer A)

- [[entities/student-lesson-balance]], [[concepts/billing-payments]]

### Onboarding & mascot

- Arvi tour / presence — [[concepts/arvi]]

## Out of scope (now)

- **Arvilio Connect UI** — after Campus retention with design partners (business-model Phase A)
- Full marketplace trust/safety, Stripe Connect KYC (Phase 6 deferred)
- Renaming Prisma `School` → Campus (internal name OK for now)

## Related

- [[overview]]
- [[synthesis/tech-stack]]
- [[synthesis/architecture]]
- [[concepts/multi-tenancy]]
