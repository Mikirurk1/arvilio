# Speaking topic

Discussion prompts for speaking practice with optional vocabulary word lists, voice submissions, and teacher feedback.

## Models (Prisma)

| Model | Purpose |
|-------|---------|
| `SpeakingTopic` | `title`, `prompt`, `ownerId`, `wordIds[]` (global `Word.id`) |
| `SpeakingTopicAssignment` | Links topic → student; `personalNote`, `dueDate`, status `PENDING \| SUBMITTED \| REVIEWED` |
| `SpeakingSubmission` | Student recording metadata + `audioStorageKey`, `durationSec`, `teacherFeedback`, status `SUBMITTED \| REVIEWED` |

Migration: `20260530120000_speaking_topics`.

## Creation rules

| Actor | Where | Result |
|-------|-------|--------|
| Teacher | `/students/[id]` → Practice → Speaking | Topic + assignment to student |
| Student | `/practice/speaking` | Topic + self-assignment (`studentId = assignedById`) |
| Teacher | `/practice/speaking` (personal) | Topic only — no assignment, no review queue |

## Words

Optional `wordIds` on topic. UI picker loads student `StudentWordCard` deck and supports dictionary lookup add (same flow as vocabulary add bar). Display uses mini chips (`SpeakingWordChip`) resolved via `WORDS_BY_IDS`.

## Recording flow

1. Student opens assigned topic → `SpeakingRecordSession` (`MediaRecorder`)
2. `submitSpeakingRecording` GraphQL → creates `SpeakingSubmission` (**re-record replaces** any prior submission for the same `topicId` + `assignmentId` + student; old row and audio file are deleted)
3. `POST /api/speaking/submissions/:id/audio` uploads blob (disk: `SPEAKING_UPLOAD_DIR` or `data/speaking-uploads`)
4. `GET /api/speaking/submissions/:id/audio` — student or assigned teacher/admin

Practice time: `usePracticeSessionTracker` with `kind: speaking`, wall-clock while recording (`idleTimeoutMs: false`).

## Teacher review

Staff sees the **latest submission per topic** on `StudentSpeakingTab` / **Recordings to review** (`studentSpeakingSubmissions` dedupes by `topicId`; re-record does not stack multiple rows). `reviewSpeakingSubmission` saves text feedback and marks submission + assignment `REVIEWED`.

## Backend

Module: `@be/speaking` (`packages/backend/modules/module-speaking`).

GraphQL: `createSpeakingTopic`, `deleteSpeakingTopic`, `mySpeakingTopics`, `studentSpeakingTopics`, `studentSpeakingSubmissions`, `submitSpeakingRecording`, `reviewSpeakingSubmission`.

## Frontend

- `apps/web/src/features/speaking/` — word chips, picker, create card, record session, review panel
- `apps/web/src/stores/speaking-store.ts`
- `/practice/speaking` — student/teacher topic list + record
- `/students/[studentId]` → Practice → Speaking — assign + review

## Related

- [[entities/student-word-card]] — word picker source
- [[entities/quiz-assignment]] — similar assign-to-student pattern
- [[concepts/web-app]] — practice session tracking
