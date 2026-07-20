# /dashboard extract → campus-strings

Source: Playwright UK student + teacher screenshots, 2026-07-13.

## Added / wired keys (catalog + seed)

- `dashboard.subtitle.withStreak`, hero labels/CTAs/mastered/vocab review/practice hints
- `dashboard.stat.*`, `dashboard.tile.*`, empty/fetch/clear/words due
- `dashboard.goals.*`, `dashboard.word.*`, `dashboard.streak.*`, `dashboard.verb.*`
- `dashboard.homework.*`, `dashboard.students.*`, `dashboard.month.*`, `dashboard.week.*`
- `dashboard.cal.*`, `dashboard.date.*`, `dashboard.lessonStatus.*`, `dashboard.goalTier.*`
- `dashboard.vocabStatus.*`, `dashboard.min`, `dashboard.locked`, arrows/open links
- `nav.vocabulary`, `nav.quizzes`
- `header.searchPlaceholder`
- `students.status.active|inactive|archived`

## campus-pages

No new page body — dashboard chrome is string-map driven.

## Implementation surfaces

- `apps/campus/src/app/dashboard/page.tsx`
- `sections.tsx`, `dashboard-widgets.tsx`
- `lib/dashboard-hero.ts` (`formatDashboardDate`, locale-aware time/month, `t` in hero)
- `DashboardLessonCard` duration/lock label
- `HeaderSearch` placeholder
