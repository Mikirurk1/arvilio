---
tags: [concept, frontend, ux]
updated: 2026-07-20
---

# Arvi mascot (B7)

**Arvi** — school product mascot (“Speaker-puff”). Render island under `apps/campus/src/components/mascot/`.

## API

| Piece | Role |
|-------|------|
| `Mascot` | Lazy R3F 3D (`arvi.glb`) or 2D SVG fallback; `data-mascot` / `data-mascot-pose` / `data-mascot-ready` for E2E |
| `MascotPose` | `idle\|greet\|point\|celebrate\|think\|encourage\|sleep\|wave` (`lib/mascot-capability.ts`) |
| `ArviProvider` / `useArvi()` | Global pose; `celebrate()` / `encourage()` / … auto-return to `idle` (~2.2s) |
| `ArviSlot` | Inline or corner mount; IntersectionObserver lazy unless `eager` |
| `GlobalArviSlot` | Fixed corner for logged-in app shell; hidden on auth routes + when tour open |
| `useArviSound` / `useArviVoice` | Tour SFX + optional per-step voice (`voiceSrc`); shared mute via `arvi.sfxMuted` |

## Presence map

- Auth layout: no Arvi (card + brand only — avoids hydrate blink / heavy GLB on login)
- Product tour: per-step pose; hides corner slot while open
- Dashboard mount: brief `greet`
- Vocabulary / quiz / irregular verbs: answer → celebrate/encourage; quiz load → `think`
- `EmptyStateCard` with `showArvi`: `sleep`
- `app/not-found.tsx`: `encourage`
- Profile logout: `wave` then redirect

Preview: `/mascot-preview` (public). Asset: `public/mascot/arvi.glb`.

## AI help chat

Clicking the corner dock opens [[concepts/arvi-assistant]] (SSE `/api/assistant/chat`). Separate from Header `?` Help encyclopedia and human `/chat`.

**Multi-instance 3D:** each `Mascot` Canvas clones the GLB scene (`SkeletonUtils.clone`) so corner + empty-state + chat header can coexist without one stealing the shared `useGLTF` cache.

**Loading:** 2D SVG stays visible (soft pulse) under an invisible canvas until `MascotModel` signals ready, then crossfade — no SVG→blank→3D flicker. Corner dock stays mounted (`.parked`) while Ask Arvi chat is open so closing chat does not remount WebGL.

## Role-based onboarding journey (spec)

Expanded SPARC TZ (product surface encyclopedia + page-by-page plots for student / teacher / admin, money-layer vocabulary, anchors inventory, Level A/B, SFX+mute, stages 0–7):

→ [`docs/onboarding-journey-tz.md`](../../../../docs/onboarding-journey-tz.md)

**Stage 1 shipped (2026-07-10):** `TOUR_TRACKS` + `resolveTourTrack` / `getTourSteps` under `components/tour/tracks/`; `ProductTour` selects Level A by `useActiveRoleKey()`.

**Also shipped (Stage 2–6):** page anchors, card placement, Replay (Profile → Account), SFX + Mute, Level B quests, E2E `specs/tour/*`, voice seam (`TourStep.voiceSrc`, `useArviVoice`, shared mute). **CMS voice:** upload MP3 under Campus → Tour audio, attach on Tours → step → Voice (per locale); Campus merges `voiceSrc` via `mergeTourCopy`.

**Tour v3 (Stage 7, 2026-07-19):** After guided Finish → **chapter hub** → soft scenario chapters. Soft detects only (open modal/tab; cancel OK). Overlay `pointer-events: none`. **First login ≡ Replay:** `beginFullProductTour()` → `/dashboard` + **`getFullProductTourSteps`**. **No soft-nav** during the walk (forced `router.replace` remounted Vocabulary and reset hosts). Card spotlights where to click. **After user nav click** (Practice, Vocabulary, …) Level A jumps forward via `resolveLevelAIndexAfterNavigation`; chapter soft detects auto-advance on mid-steps only (rising edge; Strict Mode–safe timer); **last chapter step** waits for Continue so Payments/etc. tip is not skipped. **Tab try-its** spotlight the **tab trigger** (`system-tab-payments-trigger`, `profile-connections-tab`); detect still waits for the panel. **Scroll-into-view** on each step (`scrollTourTargetIntoView`) so off-screen anchors/nav land in viewport before spotlight remasure. **Skip to actions** → hub. **Session cursor** + first-words gate. Corner Arvi uses CSS `parked` while tour open (stays mounted — no WebGL / pose-timer reset). Shared Add words: Practice → Vocabulary card → Add word → lookup. Header `?` page-scoped Help. Checklist: [`docs/tour-v3-chapters.md`](../../../../docs/tour-v3-chapters.md).

**Practice hub links (2026-07-21):** Activity shelf on `/practice` must use Next `<Link>`, not raw `<a href>`. Plain anchors force a full document load → tour overlay, modals, and Arvi vanish/reappear. Sidebar already used client navigation; Vocabulary felt unique because the hub card was the hard link. Elsewhere: prefer `Link` for CTAs/docs/`target=_blank`; keep raw `<a>` for Google OAuth (Nest rewrite), `mailto:`, and `download`.

**Learning mode + Help encyclopedia (2026-07-20):** Client pref `arvi.learningMode` (default on). Header `?` (**Довідка**) opens **page-scoped Help** from `getHelpSteps` / §4.13 via `filterHelpStepsForPage` — path aliases + visible anchors. **Not** full Replay (that is Profile → Account / first login). **Mount:** `ProductTour` lives in `AppShell` so soft-login sessions still get the Help listener. **CMS:** Payload `campus-tours` tracks `helpStudent` / `helpTeacher` / `helpAdmin` + `firstWords`; `mergeTourCopy` overlays title/body/`voiceSrc`. Spec: [`onboarding-journey-tz.md`](../../../../docs/onboarding-journey-tz.md) §4.13.

## Related

- [[concepts/multi-tenancy]] (Phase 4.5 tour)
- [[concepts/testing]] (`expectArvi`)
