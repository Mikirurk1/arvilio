# /practice leftovers (uk UI)

Screenshots: `uk-student.png`, `uk-student-after.png`  
Scan: `latin-scan-after.json`  
Captured: 2026-07-13

## Chrome — done this stage

Activity cards were already on `practice.activity.*`. Added focus tiles, stats heading/link/error, coming-soon heading, week metric labels (mapped by API metric id), localized time value (`год`/`хв`).

## Remaining Latin under `/uk/practice`

| Text | Classify |
|------|----------|
| Arvilio / Campus | Ignore — brand |
| Cookie line (UK) | OK |

## Do not put in Payload

- Live pending counts / week metric values (numbers from Nest)
- Backend still returns EN metric labels; Campus remaps by `metric.id` — optional later API cleanup
