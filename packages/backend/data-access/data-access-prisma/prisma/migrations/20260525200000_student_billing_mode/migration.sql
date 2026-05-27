-- CreateEnum
CREATE TYPE "StudentBillingMode" AS ENUM ('PER_LESSON', 'PACKAGES', 'BOTH');

-- AlterTable
ALTER TABLE "StudentLessonBalance" ADD COLUMN "billingMode" "StudentBillingMode" NOT NULL DEFAULT 'BOTH';
ALTER TABLE "StudentLessonBalance" ADD COLUMN "packageOverrides" JSONB;
