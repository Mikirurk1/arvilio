/*
  Warnings:

  - Added the required column `schoolId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- Expand/contract: add nullable, backfill legacy rows to the default tenant,
-- then enforce NOT NULL. school_default is created by backfill-tenancy.ts.
ALTER TABLE "Quiz" ADD COLUMN "schoolId" TEXT;
UPDATE "Quiz" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
ALTER TABLE "Quiz" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Quiz_schoolId_idx" ON "Quiz"("schoolId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
