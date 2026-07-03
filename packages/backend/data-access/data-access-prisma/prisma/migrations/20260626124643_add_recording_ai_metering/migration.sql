-- AlterTable
ALTER TABLE "ScheduledLesson" ADD COLUMN     "recordingSizeBytes" INTEGER;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "aiCreditsResetAt" TIMESTAMP(3),
ADD COLUMN     "aiCreditsUsedToday" INTEGER NOT NULL DEFAULT 0;
