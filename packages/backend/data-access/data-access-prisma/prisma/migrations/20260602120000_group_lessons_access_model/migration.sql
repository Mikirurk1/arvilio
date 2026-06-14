-- CreateEnum
CREATE TYPE "StudentLessonFormat" AS ENUM ('INDIVIDUAL_ONLY', 'GROUP_ONLY', 'MIXED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "lessonFormat" "StudentLessonFormat" NOT NULL DEFAULT 'MIXED';

-- CreateTable
CREATE TABLE "StudentGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT,
    "groupBillingMode" "GroupLessonBillingMode" NOT NULL DEFAULT 'PER_MEMBER',
    "groupPriceMinor" INTEGER,
    "groupCurrency" TEXT,
    "groupSplitMode" "GroupFixedSplitMode",
    "groupPayerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGroupMember" (
    "id" TEXT NOT NULL,
    "studentGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentGroupMember_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ScheduledLesson" ADD COLUMN "studentGroupId" TEXT;

-- CreateIndex
CREATE INDEX "StudentGroup_teacherId_idx" ON "StudentGroup"("teacherId");

-- CreateIndex
CREATE INDEX "StudentGroupMember_userId_idx" ON "StudentGroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGroupMember_studentGroupId_userId_key" ON "StudentGroupMember"("studentGroupId", "userId");

-- CreateIndex
CREATE INDEX "ScheduledLesson_studentGroupId_idx" ON "ScheduledLesson"("studentGroupId");

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_groupPayerUserId_fkey" FOREIGN KEY ("groupPayerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroupMember" ADD CONSTRAINT "StudentGroupMember_studentGroupId_fkey" FOREIGN KEY ("studentGroupId") REFERENCES "StudentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroupMember" ADD CONSTRAINT "StudentGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledLesson" ADD CONSTRAINT "ScheduledLesson_studentGroupId_fkey" FOREIGN KEY ("studentGroupId") REFERENCES "StudentGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
