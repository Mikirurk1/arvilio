# Tour v3 — Chapters workplan

> **Status:** Stages 7.0–7.7 shipped (2026-07-19), including v3.1 chapter Replay. **Help encyclopedia (Stage 8 / §4.13)** — Header `?` = page tips, not Level A. Encyclopedia copy: [`onboarding-journey-tz.md`](./onboarding-journey-tz.md) §4.13. Nested practice surfaces covered: `/vocabulary`, `/quiz`, `/practice/speaking`, `/practice/irregular-verbs` (+ nav matrix routes).  
> **Scope:** **Campus only** (`apps/campus`). No Hub / Platform / marketplace tours.  
> **Decisions locked:** Chapters after Level A; **soft** detects only (open UI, cancel OK); student / teacher / admin; no hard-create; no Hub/Platform tour; **Help ≠ Level A ≠ Replay**.

## Flow

```
Level A (map) → hub (pick scenario) → chapter soft steps → hub
Skip tour / Finish later → tourCompletedAt
First login / Replay → welcome + **full Help encyclopedia** + done → hub (**no soft-nav**; card spotlights click targets)
`Skip to actions` → chapter hub
Session cursor + first-words gate (Vocabulary must not restart the tour)
Corner Arvi stays **mounted** during tour (CSS parked) so WebGL / pose timers do not reset
Chapters: Practice → Vocabulary card → Add word → lookup
Header “?” → Help for **current page only**
```

## Phases

### Phase 7.0 — Spec in TZ — [x]

- [x] Glossary: Level B / Chapters
- [x] Replace flat Level B quest tables with chapter catalogs (§5.4 / §6.4 / §7.5)
- [x] Stage 7 section + phased gates
- [x] FR11–FR13; progress = localStorage chapters
- [x] This workplan file

### Phase 7.1 — Types + chapter tracks — [x]

- [x] `TourChapter` in `tracks/types.ts`
- [x] `teacher-chapters.ts` / `student-chapters.ts` / `admin-chapters.ts`
- [x] `getTourChapters` + flatten `getTourQuestSteps`
- [x] Unit: chapters filter, groups feature gate

### Phase 7.2 — Anchors — [x]

| Anchor | Where | Soft chapter |
|--------|-------|--------------|
| `header-create-lesson` | Header New lesson | tea first lesson |
| `lesson-modal` / `lesson-modal-setup` | Lesson modal | tea first lesson |
| `materials-create` / `materials-upload` | Materials | tea materials |
| `student-card` | StudentSummaryCard | tea students |
| `students-groups-panel` | Students groups pane | tea groups |
| `student-practice-tab` | Student detail Practice tab | (optional soft; roster enough) |
| `chat-new-message` | Chat | chat chapters |
| `profile-connections` (+ `profile-connections-tab`) | Profile Connections | tea video — spotlight tab, detect panel |
| `admin-create-form` | Admin create | adm create learner |
| `system-tab-payments` (+ `system-tab-payments-trigger`) | System Payments | adm payments — spotlight trigger, detect panel |
| `billing-plan` | Billing usage card | adm subscription |
| `finance-record-payout` | Finance table | adm finance |
| `staff-roster` | Staff grid | adm staff |
| `calendar-request-lesson` | Calendar CTA | stu request |
| `payment-balance` | Payment | stu payment |

### Phase 7.3 — ProductTour hub UI — [x]

- [x] Phases `A | hub | chapter`
- [x] Hub list + status todo/done/skipped
- [x] Soft-skip step + Skip chapter + Finish later
- [x] `tour-chapter-progress.ts` localStorage
- [x] Analytics `tour_chapter_*`
- [x] Replay clears chapter LS

### Phase 7.4 — Level A copy + CMS seed — [x]

- [x] Richer Level A done bodies → point to scenarios
- [x] Key anchors on Level A steps
- [x] `CAMPUS_TOUR_SEED` + `tour.hub.*` strings

### Phase 7.5 — Tests — [x]

- [x] Unit chapters + progress
- [x] E2E hub visible + Finish later (student/teacher/admin)
- [x] E2E skip chapter → hub status skipped (teacher)
- [x] E2E soft-complete First lesson (open New lesson modal → chapter done) — UC10
- [x] Groups chapter omitted when flag off — unit (`getTourChapters`)
- [x] Overlay `pointer-events: none` so soft clicks reach the app (card keeps `auto`)

### Phase 7.6 — Wiki — [x]

- [x] `concepts/arvi.md` Tour v3
- [x] `wiki/log.md` + `index.md`

---

## Open follow-ups (next work from this doc)

1. ~~**7.5a** soft-complete First lesson~~ **done**
2. ~~**v3.1** — Replay single chapter from hub~~ **done** (Replay on done/skipped; `clearChapterStatus`; `tour_chapter_replayed`)
3. **Hard-create** — out of scope until product asks.
4. **Hub / Platform tours** — out of scope while we work Campus-only.

### Phase 7.7 — Replay chapter (v3.1) — [x]

- [x] `clearChapterStatus` in `tour-chapter-progress.ts`
- [x] Hub: done/skipped → **Replay** (keeps status badge in title)
- [x] Analytics `tour_chapter_replayed`
- [x] Unit + E2E teacher replay

## Code map

| Piece | Path |
|-------|------|
| Chapters | `apps/campus/src/components/tour/tracks/*-chapters.ts` |
| Registry | `apps/campus/src/components/tour/tracks/index.ts` |
| UI | `apps/campus/src/components/tour/ProductTour.tsx` |
| Progress | `apps/campus/src/components/tour/tour-chapter-progress.ts` |
| Detect | `apps/campus/src/components/tour/tour-quest-detect.ts` |
| E2E | `tests/e2e/specs/tour/*`, `tests/e2e/helpers/tour.ts` |
| TZ encyclopedia | `docs/onboarding-journey-tz.md` |
