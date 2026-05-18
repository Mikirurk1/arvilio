# Wiki log

Append-only timeline. Prefix: `## [YYYY-MM-DD] <operation> | Title`

---

## [2026-05-18] update | BrandLogo back to SVG (no PNG)

- **Trigger:** user note + code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** Restored inline SVG + text logo; removed PNG wordmarks from `public/brand/`.

## [2026-05-18] update | Restore missing BrandLogo module

- **Trigger:** debug (build error)
- **Pages:** `log.md`
- **Notes:** `components/brand/BrandLogo.tsx` and `public/brand/soenglish-logo*.png` were referenced but absent on disk; recreated component and restored PNGs.

## [2026-05-18] update | Brand logo (favicon, header, login)

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** `BrandLogo` + PNGs under `public/brand/`; `app/icon.png` / `apple-icon.png`; header swaps full vs mark by breakpoint/collapsed sidebar.

## [2026-05-18] update | Dashboard density (quick actions, teacher panels)

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** Quick actions row; week lessons list; teacher right column (homework, students, month glance); role-specific stat tiles.

## [2026-05-18] update | Lesson content on create + lesson page

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** Create/update persist `materials`/`homework`/`lessonPlan`; GraphQL create passes content; modal form syncs to lessons store (`syncLessonFormChange`).

## [2026-05-18] update | Profile Account tab Log out

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `AccountPanel` — Session row with `useAuth().logout()` + redirect `/login` when session exists.

## [2026-05-18] update | Profile tabs + calendar teacher filter (mobile)

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `log.md`
- **Notes:** Calendar `teacherFilter` compact on sm/md; `ProfileViewShell` tabs horizontal scroll + `tabPanel` overflow; profile form grids/linked rows stack on mobile.

## [2026-05-18] update | Calendar page responsive

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `/calendar` — `calLayout` 1 col on md/sm; header controls stack; month cells dots-only on mobile; week grid min-width + horizontal scroll; sidebar/event cards touch-friendly.

## [2026-05-18] update | Responsive UI (mobile + tablet)

- **Trigger:** code change
- **Pages:** `concepts/ui-design-system.md`, `concepts/web-app.md`, `log.md`
- **Notes:** `useBreakpoint`, `ShellNavProvider`/`MobileNavDrawer`, `sidebar-nav.tsx`; shell + route SCSS (`respond-to`); chat master-detail on mobile; dashboard grids stack.

## [2026-05-18] update | Coursework expanded (~50 pp)

- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `coursework-expanded.mjs` — tech stack prose, React/Next hooks tables, §3.6–3.8, GraphQL/routes tables; DOCX regen.

## [2026-05-18] update | Coursework Word template (SoEnglish)

- **Trigger:** user request
- **Pages:** `log.md`
- **Notes:** `docs/coursework/Курсова_SoEnglish.docx`, generator scripts, FR/NFR tables, figure placeholders 1–21.

## [2026-05-16] update | Dashboard live data

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `concepts/graphql-api.md`, `log.md`
- **Notes:** `learningStreak` + `wordOfDay` GraphQL; `StreakService` exported from notifications; hero/lessons/vocab/streak/WOD wired on `/dashboard`; role-aware layout.

## [2026-05-19] update | Daily goals (backend + dashboard)

- **Trigger:** code change
- **Pages:** `concepts/daily-goals.md`, `index.md`, `log.md`
- **Notes:** `DailyGoalCompletion` Prisma model; `dailyGoals` / `setDailyGoalDone` GraphQL; shared `daily-goals.ts`; interactive `DailyGoalsCard` for students.

## [2026-05-18] update | Chat attachments + emoji

- **Trigger:** code change
- **Pages:** `concepts/chat.md`, `log.md`
- **Notes:** `ChatMessageAttachment` (24h TTL, REST upload/download); composer emoji picker; attach with confirm; removed thread action buttons.

## [2026-05-17] update | Realtime chat (Figma → production)

- **Trigger:** code change
- **Pages:** `concepts/chat.md`, `index.md`, `log.md`
- **Notes:** Prisma chat models; `module-chat` + Socket.IO gateway; GraphQL inbox/messages; `/chat` UI; sidebar badge; super-admin masked as admin; groups by admin/super-admin only.

## [2026-05-17] update | App confirm dialog replaces native alerts

- **Trigger:** code change
- **Pages:** `log.md`
- **Notes:** `ConfirmDialogHost` + `confirmDialog()` / `alertDialog()` in providers; delete word/quiz/user and lesson unlink/delete use modal; validation uses `toast.warning`.

## [2026-05-17] update | Practice quiz badge after generate

- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** Students: count from `studentQuizzes` (not stale `quizList`); staff: count from `quizzes` list; force refetch on `/practice`; backend auto-assigns generated quiz when vocabulary target is a student.

## [2026-05-17] update | Practice statPill layout + incomplete quiz count

- **Trigger:** code change
- **Pages:** `log.md`
- **Notes:** `statPill` top-right on activity cards; incomplete quizzes = assigned without `attempt.finishedAt`; sidebar badge uses same hook.

## [2026-05-17] update | Calendar drag/resize persists + Google Calendar patch

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** DnD/resize calls `persistScheduleUpdate`; backend `GoogleCalendarService.updateEvent` on schedule change when `googleCalendarEventId` set.

## [2026-05-17] update | Fix super-admin vocabulary delete

- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** `deleteStudentCard` no longer blocks when actor id equals target id; staff self-list delete allowed; admin/super bypass student teacher check.

## [2026-05-17] update | Staff delete quiz and vocabulary cards

- **Trigger:** code change
- **Pages:** `concepts/vocabulary.md`, `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** GraphQL `deleteStudentWordCard`; quiz `delete` for teacher (own/assigned students), admin/super any. UI: trash on student vocab cards, Delete on quiz cards + GenerateQuizPanel list.

## [2026-05-17] update | Practice page stat pills & no CTA

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `/practice` cards: no footer CTA; Vocabulary/Quiz `statPill` uses `usePracticePendingCounts` (new + `mistakes_work`, incomplete assigned quizzes).

## [2026-05-17] update | Practice badge, quiz completion UI, Create Quiz

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `concepts/quizzes-flashcards.md`, `log.md`
- **Notes:** Sidebar Practice badge = incomplete assigned quizzes + vocab (`new` + `mistakes_work`) via `usePracticeNavBadge` (tooltip when collapsed). Quiz page: student cards show attempt score; `QuizPlaySession` + `submitQuizAttempt`; Create New Quiz calls `generateQuiz`.

## [2026-05-17] update | Admin delete student with lessons

- **Trigger:** debug
- **Pages:** `log.md`
- **Notes:** `deleteAdminUser` removes `ScheduledLesson` rows first (`onDelete: Restrict` blocked user delete).

## [2026-05-16] update | Telegram localhost bot-link flow

- **Trigger:** code change
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `TelegramLinkToken`, `link/start` + polling on localhost; Login Widget unchanged on production.

## [2026-05-16] update | Telegram widget-config for Profile Connect

- **Trigger:** code change
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `GET /auth/telegram/widget-config`; username via `getMe` if only token set; UI warns on localhost.

## [2026-05-17] update | Telegram notification delivery

- **Trigger:** user note
- **Pages:** `concepts/profile-notifications.md`, `log.md`
- **Notes:** `NotificationDispatchService` sends email + Telegram; per-channel dedupe; welcome on Telegram link.

## [2026-05-17] update | Facebook and Telegram profile connections

- **Trigger:** user note
- **Pages:** `concepts/auth-rbac.md`, `log.md`
- **Notes:** `GET /auth/facebook/link` + callback; `POST /auth/telegram/link` with Login Widget hash verify; Profile Connections UI.

## [2026-05-17] update | Profile Google link (Connections tab)

- **Trigger:** user note
- **Pages:** `concepts/auth-rbac.md`, `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `GET /auth/google/link` for logged-in users; `myProfile.linkedAccounts`; Connect Google on Profile → Connections; lesson error points to Connections.

## [2026-05-17] update | Require Google Calendar to schedule lessons

- **Trigger:** user note
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `assertTeacherCalendarReady` before create; rollback lesson if Calendar event fails; toast/dialog with clear message.

## [2026-05-17] update | Meet auto on lesson create (no Create link UI)

- **Trigger:** user note
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Meet + Calendar on `LessonsService.create` with URL retry; removed manual Create Meet button; `LessonMeetButton` join-only.

## [2026-05-17] update | Scheduled lesson Meet ensure API

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `ensureScheduledLessonMeet` GraphQL mutation; `POST /lessons/scheduled/meet`; dev watcher includes backend modules.

## [2026-05-16] update | Lesson modal "Open lesson page" link after create

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** `LessonModal` uses `lessonBackendId` for link; after create modal stays in edit mode with link; `getLessonBackendId` in editor.

## [2026-05-16] update | Student lessons visibility + profile email after save

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `concepts/web-app.md`, `log.md`
- **Notes:** Filter lessons with `lessonIncludesViewer` + `partyNumericId(auth id)`; `UPDATE_MY_PROFILE` returns `email`; profile store merges email on mutation.

## [2026-05-16] update | Vocabulary Play button / round building

- **Trigger:** debug
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** Play `canStart` uses `canBuildVocabularyPlayRound`; translation fallback to definition; ≥2 unique answers (not 4); last-lesson pool falls back when empty.

## [2026-05-16] update | Lessons list duplicate React keys fix

- **Trigger:** debug
- **Pages:** `concepts/lessons-calendar.md`, `log.md`
- **Notes:** Split lesson vs party numeric id maps; dedupe/upsert in `ScheduledLessonsProvider` + `LessonsListPanel` keys via `backendId`.

## [2026-05-17] update | Practice sessions in PostgreSQL

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `concepts/graphql-api.md`, `log.md`
- **Notes:** `PracticeSession` model; `recordPracticeSession` / `practiceWeekSummary`; practice page uses API not mock log.

## [2026-05-17] update | Practice session tracking for vocab play and quiz

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `usePracticeSessionTracker` on vocab play + quiz (superseded by DB-backed sessions).

## [2026-05-17] update | React Email for all transactional templates

- **Trigger:** code change
- **Pages:** `concepts/transactional-email.md`, `log.md`
- **Notes:** Replaced file-based `subject.txt`/`body.html` with `@soenglish/email-templates` (React Email); API dev/build compiles package first.

## [2026-05-17] update | Profile notifications persistence + email delivery

- **Trigger:** code change
- **Pages:** `concepts/profile-notifications.md`, `concepts/web-app.md`, `concepts/transactional-email.md`, `entities/user.md`, `index.md`, `log.md`
- **Notes:** User notification booleans, `NotificationDelivery`, `TeacherMessage`, `module-notifications` cron jobs, Profile tab API save, `sendTeacherMessage` + student compose UI.

## [2026-05-17] update | Lesson save via REST PATCH + backendId

- **Trigger:** bug fix
- **Pages:** `concepts/web-app.md`, `log.md`
- **Notes:** `updateScheduledLesson` uses `PATCH /api/lessons/scheduled/:id` (not GraphQL); `ScheduledLessonDto.backendId`; no post-save full refetch that wiped content.

## [2026-05-17] update | Dark toasts + lesson content save

- **Trigger:** bug fix
- **Pages:** `concepts/web-app.md`, `log.md`

## [2026-05-16] update | Toast notifications (addax port)

- **Trigger:** code change
- **Pages:** `concepts/web-app.md`, `log.md`

## [2026-05-16] update | Lesson materials & student response persist

- **Trigger:** bug fix
- **Pages:** `concepts/graphql-api.md`, `concepts/lessons-calendar.md`, `log.md`

## [2026-05-16] update | Student quiz tab & staff-only generate

- **Trigger:** code change
- **Pages:** `concepts/quizzes-flashcards.md`, `log.md`

## [2026-05-16] update | Vocabulary Play uses word translation

- **Trigger:** code change
- **Pages:** `concepts/vocabulary.md`, `log.md`

## [2026-05-16] update | Vocabulary add validation & UI

- **Trigger:** code change
- **Pages:** `concepts/vocabulary.md`, `log.md`

## [2026-05-16] ingest | LLM Wiki bootstrap

- **Raw:** _(pattern doc — conversational)_
- **Pages touched:** `index.md`, `log.md`, `overview.md`, `synthesis/architecture.md`
- **Notes:** Initial wiki scaffold for SoEnglish.

## [2026-05-16] ingest | Monorepo inventory audit

- **Raw:** `raw/code-audit/2026-05-16-monorepo-inventory.md`
- **Pages touched:** `synthesis/product`, `synthesis/tech-stack`, `synthesis/architecture`, `overview`, `sources/2026-05-16-monorepo-inventory`

## [2026-05-16] ingest | RBAC audit

- **Raw:** `raw/code-audit/2026-05-16-rbac.md`
- **Pages touched:** `concepts/auth-rbac`, `concepts/roles-matrix`, `entities/user`, `sources/2026-05-16-rbac`

## [2026-05-16] update | Domain entities & concepts

- **Trigger:** code audit (Phase 3)
- **Pages touched:** all `entities/*` (12), `concepts/graphql-api`, `lessons-calendar`, `vocabulary`, `quizzes-flashcards`, `progress-tracking`

## [2026-05-16] update | Frontend documentation

- **Trigger:** code audit (Phase 4)
- **Pages touched:** `concepts/web-app`, `concepts/ui-design-system`, `concepts/frontend-packages`

## [2026-05-16] update | Materials reference policy

- **Trigger:** user
- **Pages touched:** `overview` (link); added `docs/reference/materials-index.md`, `.cursor/rules/materials-readonly.mdc`
- **Notes:** `materials/` read-only for agent; not product truth

## [2026-05-16] update | System page — test email (super-admin)

- **Trigger:** user request
- **Pages:** `concepts/transactional-email`, `concepts/web-app`

## [2026-05-16] update | Admin provisioning + welcome email

- **Trigger:** user request
- **Pages:** `concepts/auth-rbac`, `entities/user`; added `packages/backend/email-templates/`, `module-mail`

## [2026-05-16] update | Disable public registration

- **Trigger:** user request
- **Pages:** `concepts/auth-rbac`, `concepts/roles-matrix`, `concepts/web-app`, `overview`

## [2026-05-16] update | Profile statistics — API only

- **Trigger:** user bug (mock Lesson hours 3.7h on Profile)
- **Pages:** `concepts/web-app`
- **Notes:** `ProfileLiveStatistics`, `useProfileLiveStats`; mock `StatisticsDashboard` removed from profile.

## [2026-05-16] update | Wiki rules — proactive maintenance

- **Trigger:** user note (agent should update wiki without being asked)
- **Pages:** _(rules only)_ `.cursor/rules/llm-wiki-triggers.mdc`, `llm-wiki.mdc`, `karpathy-guidelines.mdc`
- **Notes:** Explicit priority over "don't edit markdown"; same-session checklist; opt-out only via **skip wiki**.

## [2026-05-16] update | Student profile route uses API UUID

- **Trigger:** debug (Student not found after admin create)
- **Pages:** `concepts/web-app`
- **Notes:** `/students/[studentId]` resolves via `students` GraphQL + `lib/student-profile.ts`; list links use `row.id` (UUID).

## [2026-05-16] update | API env + dev script hardening

- **Trigger:** debug (SMTP not configured; EADDRINUSE / ECONNREFUSED)
- **Pages:** `concepts/graphql-api`, `concepts/transactional-email`
- **Notes:** `load-env.ts`, `--env-file` in dev/start; `dev.cjs` serial restarts, no `freePort` on every rebuild.

## [2026-05-16] update | API dev — compile then run dist

- **Trigger:** debug (systemMailStatus missing — stale/crashed tsx dev)
- **Pages:** `concepts/graphql-api` (dev note)
- **Notes:** `apps/api` dev uses `tsc` watch + `node --watch` on `dist/` so Nest decorators and workspace packages work.

## [2026-05-16] update | Vocabulary enrichment + lesson vocab UX

- **Trigger:** plan implementation
- **Pages:** `entities/word`, `concepts/vocabulary`, `concepts/graphql-api`, `log.md`
- **Notes:** WordEnrichmentService (dictionaryapi + Datamuse + CEFR JSON); `lookupWord` GraphQL; lesson form `linkedWordIds`; `LessonVocabularyAddPanel` replaces mock add in `LessonContentTab`.

## [2026-05-16] update | Plan lesson persists to DB

- **Trigger:** code change
- **Pages:** `entities/scheduled-lesson`, `concepts/graphql-api`, `log.md`
- **Notes:** `createScheduledLesson` wired from calendar + lessons Plan lesson modal; GraphQL input extended (`teacherId`, `duration`, `timezone`, notes, series).

## [2026-05-16] update | Assignable teachers & lesson party selects

- **Trigger:** code change (admin teacher assignment + Plan lesson modal)
- **Pages:** `concepts/graphql-api`, `log.md`
- **Notes:** `assignableTeachers` query (TEACHER/ADMIN/SUPER_ADMIN); `createUserAsAdmin` accepts those roles as `teacherId`; admin UI + Plan lesson Teacher/Student selects load from API (`useLessonPartyOptions`).

## [2026-05-16] update | Remove CEFR from Word vocabulary

- **Trigger:** user request
- **Pages:** `entities/word.md`, `concepts/vocabulary.md`, `log.md`
- **Notes:** Dropped `CefrLookupService`, `cefr-lemmas.json`, `Word.cefrLevel`, GraphQL/UI fields.

## [2026-05-16] update | Word audio + dictionary enrichment

- **Trigger:** code change
- **Pages:** `entities/word.md`, `log.md`
- **Notes:** `origin` on Word; dictionaryapi parsing (audio URL `https:`, POS priority, phonetic from audio row); `WordCardAudioButton` on vocabulary/lesson cards and add-word preview.

## [2026-05-16] update | Languages, WordDefinition, word details modal

- **Trigger:** code change
- **Pages:** `entities/language.md` (new), `entities/user.md`, `entities/word.md`, `concepts/vocabulary.md`, `index.md`, `log.md`
- **Notes:** `Language` catalog; `nativeLanguageId`; admin-only `StudentLearningLanguage`; `WordDefinition` + MyMemory translations; `wordDetails` / modal; scripts `prisma:seed:languages`, `prisma:backfill:languages-words`.

## [2026-05-16] update | System word dictionary provider (super-admin)

- **Trigger:** code change | user request
- **Pages:** `concepts/vocabulary.md`, `log.md`
- **Notes:** `PlatformSettings.wordDictionaryProvider` (`dictionary_api_dev` | `wiktionary`); System → Word dictionary tab; Wiktionary REST `/page/definition/{word}`; fallback to dictionaryapi.dev on miss.

## [2026-05-16] update | Multi–part-of-speech vocabulary

- **Trigger:** code change | user report (homograph `kind`)
- **Pages:** `concepts/vocabulary.md`, `entities/word.md`, `log.md`
- **Notes:** Dictionary API full array stored; `WordDefinition.partOfSpeech` + unique `(wordId, languageId, partOfSpeech)`; modal shows all POS badges and per-POS native translations; `getWordDetails` backfills legacy rows.

## [2026-05-16] lint | Full project bootstrap

- **Trigger:** Phase 5 health check
- **Pages touched:** `index.md` (full rebuild)
- **Notes:** 29 wiki pages cataloged; cross-links verified; no orphan entity pages; known gaps documented in `concepts/auth-rbac`. Added `karpathy-guidelines.mdc` for coding discipline.
