/*
  Warnings:

  - Added the required column `schoolId` to the `ScheduledLesson` table without a default value. This is not possible if the table is not empty.

*/
-- Expand/contract: add nullable, backfill legacy rows to the default tenant,
-- then enforce NOT NULL. school_default is created by backfill-tenancy.ts.
ALTER TABLE "ScheduledLesson" ADD COLUMN "schoolId" TEXT;
UPDATE "ScheduledLesson" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
ALTER TABLE "ScheduledLesson" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ScheduledLesson_schoolId_date_idx" ON "ScheduledLesson"("schoolId", "date");

-- AddForeignKey
ALTER TABLE "ScheduledLesson" ADD CONSTRAINT "ScheduledLesson_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
