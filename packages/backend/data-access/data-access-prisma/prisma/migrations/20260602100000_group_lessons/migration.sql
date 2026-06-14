-- Group lessons: participants, billing modes, ledger extension

CREATE TYPE "ScheduledLessonKind" AS ENUM ('INDIVIDUAL', 'GROUP');
CREATE TYPE "GroupLessonBillingMode" AS ENUM ('PER_MEMBER', 'FIXED_TOTAL');
CREATE TYPE "GroupFixedSplitMode" AS ENUM ('SINGLE_PAYER', 'EQUAL_SPLIT');
CREATE TYPE "LessonParticipantRole" AS ENUM ('STUDENT', 'PAYER');

ALTER TYPE "LessonBalanceLedgerKind" ADD VALUE 'GROUP_CHARGE';
ALTER TYPE "LessonBalanceLedgerKind" ADD VALUE 'GROUP_CHARGE_REVERSAL';

ALTER TABLE "ScheduledLesson"
  ADD COLUMN "kind" "ScheduledLessonKind" NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN "groupBillingMode" "GroupLessonBillingMode",
  ADD COLUMN "groupPriceMinor" INTEGER,
  ADD COLUMN "groupCurrency" TEXT,
  ADD COLUMN "groupSplitMode" "GroupFixedSplitMode",
  ADD COLUMN "groupPayerUserId" TEXT;

CREATE INDEX "ScheduledLesson_kind_idx" ON "ScheduledLesson"("kind");

ALTER TABLE "ScheduledLesson"
  ADD CONSTRAINT "ScheduledLesson_groupPayerUserId_fkey"
  FOREIGN KEY ("groupPayerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ScheduledLessonParticipant" (
  "id" TEXT NOT NULL,
  "scheduledLessonId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "LessonParticipantRole" NOT NULL DEFAULT 'STUDENT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "studentResponseText" TEXT,
  "studentResponseFiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "studentResponseStatus" "StudentResponseStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
  "homeworkChecked" BOOLEAN NOT NULL DEFAULT false,
  "teacherHomeworkFeedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ScheduledLessonParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScheduledLessonParticipant_scheduledLessonId_userId_key"
  ON "ScheduledLessonParticipant"("scheduledLessonId", "userId");
CREATE INDEX "ScheduledLessonParticipant_userId_idx" ON "ScheduledLessonParticipant"("userId");

ALTER TABLE "ScheduledLessonParticipant"
  ADD CONSTRAINT "ScheduledLessonParticipant_scheduledLessonId_fkey"
  FOREIGN KEY ("scheduledLessonId") REFERENCES "ScheduledLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScheduledLessonParticipant"
  ADD CONSTRAINT "ScheduledLessonParticipant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ScheduledLessonParticipant" (
  "id",
  "scheduledLessonId",
  "userId",
  "role",
  "sortOrder",
  "studentResponseText",
  "studentResponseFiles",
  "studentResponseStatus",
  "homeworkChecked",
  "teacherHomeworkFeedback",
  "updatedAt"
)
SELECT
  'migr_part_' || sl."id",
  sl."id",
  sl."studentId",
  'STUDENT'::"LessonParticipantRole",
  0,
  sl."studentResponseText",
  sl."studentResponseFiles",
  sl."studentResponseStatus",
  sl."homeworkChecked",
  sl."teacherHomeworkFeedback",
  CURRENT_TIMESTAMP
FROM "ScheduledLesson" sl;

ALTER TABLE "LessonBalanceLedger" ADD COLUMN "amountMinor" INTEGER;
ALTER TABLE "LessonBalanceLedger" ADD COLUMN "currency" TEXT;

DROP INDEX IF EXISTS "LessonBalanceLedger_scheduledLessonId_kind_key";

CREATE UNIQUE INDEX "LessonBalanceLedger_scheduledLessonId_userId_kind_key"
  ON "LessonBalanceLedger"("scheduledLessonId", "userId", "kind");
