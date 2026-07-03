-- Child/leaf tables multi-tenancy: add schoolId to NotificationDelivery, TeacherMessage,
-- ScheduledLessonParticipant, QuizAssignment, QuizAttempt, SpeakingSubmission (ADR-005).
-- Expand/contract: add nullable -> backfill DEFAULT_SCHOOL_ID -> SET NOT NULL.

-- AlterTable (expand: nullable)
ALTER TABLE "NotificationDelivery" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "TeacherMessage" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "ScheduledLessonParticipant" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "QuizAssignment" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "QuizAttempt" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "SpeakingSubmission" ADD COLUMN     "schoolId" TEXT;

-- Backfill: existing rows belong to the default (single) school.
UPDATE "NotificationDelivery" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "TeacherMessage" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "ScheduledLessonParticipant" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "QuizAssignment" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "QuizAttempt" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "SpeakingSubmission" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;

-- Contract: enforce NOT NULL
ALTER TABLE "NotificationDelivery" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "TeacherMessage" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "ScheduledLessonParticipant" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "QuizAssignment" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "QuizAttempt" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "SpeakingSubmission" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "NotificationDelivery_schoolId_idx" ON "NotificationDelivery"("schoolId");
CREATE INDEX "TeacherMessage_schoolId_idx" ON "TeacherMessage"("schoolId");
CREATE INDEX "ScheduledLessonParticipant_schoolId_idx" ON "ScheduledLessonParticipant"("schoolId");
CREATE INDEX "QuizAssignment_schoolId_idx" ON "QuizAssignment"("schoolId");
CREATE INDEX "QuizAttempt_schoolId_idx" ON "QuizAttempt"("schoolId");
CREATE INDEX "SpeakingSubmission_schoolId_idx" ON "SpeakingSubmission"("schoolId");

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherMessage" ADD CONSTRAINT "TeacherMessage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledLessonParticipant" ADD CONSTRAINT "ScheduledLessonParticipant_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAssignment" ADD CONSTRAINT "QuizAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
