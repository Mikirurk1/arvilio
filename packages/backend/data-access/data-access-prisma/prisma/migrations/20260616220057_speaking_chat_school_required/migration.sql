/*
  Warnings:

  - Added the required column `schoolId` to the `ChatConversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `SpeakingTopic` table without a default value. This is not possible if the table is not empty.

*/
-- Expand/contract: add nullable, backfill legacy rows to the default tenant,
-- then enforce NOT NULL. school_default is created by backfill-tenancy.ts.
ALTER TABLE "ChatConversation" ADD COLUMN "schoolId" TEXT;
UPDATE "ChatConversation" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
ALTER TABLE "ChatConversation" ALTER COLUMN "schoolId" SET NOT NULL;

ALTER TABLE "SpeakingTopic" ADD COLUMN "schoolId" TEXT;
UPDATE "SpeakingTopic" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
ALTER TABLE "SpeakingTopic" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ChatConversation_schoolId_idx" ON "ChatConversation"("schoolId");

-- CreateIndex
CREATE INDEX "SpeakingTopic_schoolId_idx" ON "SpeakingTopic"("schoolId");

-- AddForeignKey
ALTER TABLE "SpeakingTopic" ADD CONSTRAINT "SpeakingTopic_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
