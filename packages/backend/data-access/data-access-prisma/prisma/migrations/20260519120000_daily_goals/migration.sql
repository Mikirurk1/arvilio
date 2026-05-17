-- CreateTable
CREATE TABLE "DailyGoalCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyGoalCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyGoalCompletion_userId_dateKey_difficulty_key" ON "DailyGoalCompletion"("userId", "dateKey", "difficulty");

-- CreateIndex
CREATE INDEX "DailyGoalCompletion_userId_dateKey_idx" ON "DailyGoalCompletion"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "DailyGoalCompletion" ADD CONSTRAINT "DailyGoalCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
