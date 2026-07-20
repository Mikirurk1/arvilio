# /dashboard leftovers (uk UI)

Screenshots: `uk-student-after.png`, `uk-teacher-after.png`  
Scan: `latin-scan-after.json`  
Captured: 2026-07-13

## Chrome — done this stage

Hero labels/CTAs/stats, stat tiles, empty states, quick actions (`nav.*` + `dashboard.quick.*`), daily goals chrome (load/retry/progress/tiers), word-of-day chrome, streak calendar, irregular-verb chrome, teacher homework/students/month panels, week list, lesson status badges, duration (`хв`), header search placeholder, Today/Tomorrow.

## Remaining Latin under `/uk/dashboard`

| Text | Classify |
|------|----------|
| Arvilio / Campus | Ignore — brand |
| Jest / Jest Student* | Ignore — seed users |
| Seed lesson — planned/completed | Ignore — seed lesson titles (Prisma) |
| Daily goal bodies (`Save 3 lesson words…`, quiz/speaking copy) | Ignore — Nest daily-goal definitions / API content (not Payload chrome) |
| `0/3 words`, `0/60%` units | Partial — progress labels from goal API; chrome wrapper already UK |
| Past simple / Past participle | OK intentional — grammar terms kept EN in UK catalog |
| `let` / `let → let → let` / seed word N | Ignore — vocab / irregular-verb content |
| `general` | Ignore — POS / seed metadata |
| Cookie line (already UK) | OK |
| ~~Manage plan / Storage / Students~~ | **Fixed** — `entitlements.*` in EntitlementsWidget |

## Do not put in Payload

- Lesson titles, student names, vocab card text, goal prompt copy from backend
- Counts / streak numbers / times from live APIs
