-- Learner-data multi-tenancy: add schoolId to PracticeSession, StudentWordCard,
-- StudentLearningLanguage, StaffPayout (ADR-005).
-- Expand/contract: add nullable -> backfill DEFAULT_SCHOOL_ID -> SET NOT NULL.

-- AlterTable (expand: nullable)
ALTER TABLE "PracticeSession" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "StaffPayout" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "StudentLearningLanguage" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "StudentWordCard" ADD COLUMN     "schoolId" TEXT;

-- Backfill: existing learner data belongs to the default (single) school.
UPDATE "PracticeSession" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "StaffPayout" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "StudentLearningLanguage" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "StudentWordCard" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;

-- Contract: enforce NOT NULL
ALTER TABLE "PracticeSession" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "StaffPayout" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "StudentLearningLanguage" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "StudentWordCard" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PracticeSession_schoolId_idx" ON "PracticeSession"("schoolId");
CREATE INDEX "StaffPayout_schoolId_idx" ON "StaffPayout"("schoolId");
CREATE INDEX "StudentLearningLanguage_schoolId_idx" ON "StudentLearningLanguage"("schoolId");
CREATE INDEX "StudentWordCard_schoolId_idx" ON "StudentWordCard"("schoolId");

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentLearningLanguage" ADD CONSTRAINT "StudentLearningLanguage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentWordCard" ADD CONSTRAINT "StudentWordCard_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffPayout" ADD CONSTRAINT "StaffPayout_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
