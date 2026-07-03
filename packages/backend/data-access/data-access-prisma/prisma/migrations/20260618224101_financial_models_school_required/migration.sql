-- Financial vertical multi-tenancy: add schoolId to Payment, StudentLessonBalance,
-- LessonBalanceLedger, StaffCompensationProfile (ADR-005).
-- Expand/contract: add nullable column -> backfill DEFAULT_SCHOOL_ID -> SET NOT NULL.

-- AlterTable (expand: nullable)
ALTER TABLE "LessonBalanceLedger" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "Payment" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "StaffCompensationProfile" ADD COLUMN     "schoolId" TEXT;
ALTER TABLE "StudentLessonBalance" ADD COLUMN     "schoolId" TEXT;

-- Backfill: all existing financial rows belong to the default (single) school.
UPDATE "LessonBalanceLedger" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "Payment" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "StaffCompensationProfile" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;
UPDATE "StudentLessonBalance" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;

-- Contract: enforce NOT NULL
ALTER TABLE "LessonBalanceLedger" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "StaffCompensationProfile" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "StudentLessonBalance" ALTER COLUMN "schoolId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "LessonBalanceLedger_schoolId_idx" ON "LessonBalanceLedger"("schoolId");
CREATE INDEX "Payment_schoolId_idx" ON "Payment"("schoolId");
CREATE INDEX "StaffCompensationProfile_schoolId_idx" ON "StaffCompensationProfile"("schoolId");
CREATE INDEX "StudentLessonBalance_schoolId_idx" ON "StudentLessonBalance"("schoolId");

-- AddForeignKey
ALTER TABLE "StaffCompensationProfile" ADD CONSTRAINT "StaffCompensationProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentLessonBalance" ADD CONSTRAINT "StudentLessonBalance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonBalanceLedger" ADD CONSTRAINT "LessonBalanceLedger_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
