-- CreateEnum
CREATE TYPE "SpeakingTopicAssignmentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "SpeakingSubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED');

-- CreateTable
CREATE TABLE "SpeakingTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "wordIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingTopicAssignment" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "personalNote" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "SpeakingTopicAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingTopicAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSubmission" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "studentId" TEXT NOT NULL,
    "audioStorageKey" TEXT,
    "durationSec" INTEGER,
    "mimeType" TEXT,
    "status" "SpeakingSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "teacherFeedback" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeakingTopic_ownerId_idx" ON "SpeakingTopic"("ownerId");

-- CreateIndex
CREATE INDEX "SpeakingTopicAssignment_studentId_idx" ON "SpeakingTopicAssignment"("studentId");

-- CreateIndex
CREATE INDEX "SpeakingTopicAssignment_assignedById_idx" ON "SpeakingTopicAssignment"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingTopicAssignment_topicId_studentId_key" ON "SpeakingTopicAssignment"("topicId", "studentId");

-- CreateIndex
CREATE INDEX "SpeakingSubmission_topicId_idx" ON "SpeakingSubmission"("topicId");

-- CreateIndex
CREATE INDEX "SpeakingSubmission_studentId_idx" ON "SpeakingSubmission"("studentId");

-- CreateIndex
CREATE INDEX "SpeakingSubmission_assignmentId_idx" ON "SpeakingSubmission"("assignmentId");

-- AddForeignKey
ALTER TABLE "SpeakingTopic" ADD CONSTRAINT "SpeakingTopic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingTopicAssignment" ADD CONSTRAINT "SpeakingTopicAssignment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SpeakingTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingTopicAssignment" ADD CONSTRAINT "SpeakingTopicAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingTopicAssignment" ADD CONSTRAINT "SpeakingTopicAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SpeakingTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "SpeakingTopicAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
