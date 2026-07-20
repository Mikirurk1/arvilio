# P1.3 /students/[studentId]

**Role:** admin/teacher on `/uk/students/cmrgd44fe0001wodzg4wbuu0q`.

## Wired
- Shell: title, subtitle, back, tabs (Профіль/Статистика/Уроки/Оплата/Досягнення/Практика), hero stats/badges, chat aria
- Tabs: Profile (save label), Lessons, Statistics intro, Practice (+ vocab/quiz/speaking chrome), Billing workspace hero + summary + toasts
- Catalog: `students.detail.*`; seed `npm run seed:campus-ui -w @app/cms`

## Deferred / leftovers
- `billing/BillingRulesSection.tsx`, `BillingPricingSection.tsx`, `BillingPackagesSection.tsx` — deep form chrome
- Student profile form **School settings** block → `profile.school.*` (wired same session)
- Summary status value `active` (raw enum name in form definition)
- Achievement titles, student PII, `STUDENT_BILLING_MODE_OPTIONS` labels

## Status
Done 2026-07-16.
