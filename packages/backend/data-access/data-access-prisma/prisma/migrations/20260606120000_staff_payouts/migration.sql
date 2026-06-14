-- Staff compensation profiles and manual payout records
CREATE TYPE "StaffCompensationMode" AS ENUM ('PER_LESSON', 'SALARY', 'MIXED');
CREATE TYPE "StaffPayFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

ALTER TABLE "PlatformSettings" ADD COLUMN "staffPayoutDefaults" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "StaffCompensationProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "StaffCompensationMode",
    "perLessonRateMinor" INTEGER,
    "salaryMinor" INTEGER,
    "currency" TEXT,
    "payFrequency" "StaffPayFrequency",
    "payDayOfWeek" INTEGER,
    "payDayOfMonth" INTEGER,
    "graceDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffCompensationProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffCompensationProfile_userId_key" ON "StaffCompensationProfile"("userId");

CREATE TABLE "StaffPayout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "periodFrom" TIMESTAMP(3),
    "periodTo" TIMESTAMP(3),
    "note" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffPayout_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StaffPayout_userId_paidAt_idx" ON "StaffPayout"("userId", "paidAt");
CREATE INDEX "StaffPayout_createdAt_idx" ON "StaffPayout"("createdAt");

ALTER TABLE "StaffCompensationProfile" ADD CONSTRAINT "StaffCompensationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffPayout" ADD CONSTRAINT "StaffPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffPayout" ADD CONSTRAINT "StaffPayout_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
