-- StudentGroup multi-tenancy: add schoolId (ADR-005).
-- Expand/contract: add nullable -> backfill DEFAULT_SCHOOL_ID -> SET NOT NULL.

-- AlterTable (expand: nullable)
ALTER TABLE "StudentGroup" ADD COLUMN     "schoolId" TEXT;

-- Backfill: existing groups belong to the default (single) school.
UPDATE "StudentGroup" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;

-- Contract: enforce NOT NULL
ALTER TABLE "StudentGroup" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "StudentGroup_schoolId_idx" ON "StudentGroup"("schoolId");

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
