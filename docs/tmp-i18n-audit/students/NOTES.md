# P1.2 /students

**Role:** teacher on `/uk/students` (+ Groups tab).

## Wired
- Page: title/subtitle, Students/Groups switcher, loading/empty/error
- Cards: teacher line, status (активний), Lessons/Words/Streak, Email, Open profile
- Groups: admin-only empty for teacher; admin panel + GroupEditorCard chrome when admin
- Catalog: `students.*` / `students.groups.*`; seed `npm run seed:campus-ui -w @app/cms`

## Ignored
- Student names, emails, proficiency codes (A1) — content
- P1.3 `/students/[id]` detail (separate stage)

## Status
Done 2026-07-13.
