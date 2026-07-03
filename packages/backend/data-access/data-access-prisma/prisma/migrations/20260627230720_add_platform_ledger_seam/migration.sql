-- CreateEnum
CREATE TYPE "AcquisitionChannel" AS ENUM ('DIRECT', 'PLATFORM_MATCH', 'IMPORT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('PENDING', 'ENROLLED', 'REJECTED', 'CLAWBACK');

-- CreateEnum
CREATE TYPE "LedgerEntryKind" AS ENUM ('COMMISSION_CHARGE', 'COMMISSION_CLAWBACK', 'SUBSCRIPTION_CHARGE', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "StudentAcquisitionLead" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" "AcquisitionChannel" NOT NULL DEFAULT 'PLATFORM_MATCH',
    "status" "LeadStatus" NOT NULL DEFAULT 'PENDING',
    "metaJson" JSONB NOT NULL DEFAULT '{}',
    "enrolledAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "clawbackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAcquisitionLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLedger" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "leadId" TEXT,
    "kind" "LedgerEntryKind" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UAH',
    "description" TEXT NOT NULL DEFAULT '',
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedByOperatorId" TEXT,

    CONSTRAINT "PlatformLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAcquisitionLead_schoolId_idx" ON "StudentAcquisitionLead"("schoolId");

-- CreateIndex
CREATE INDEX "StudentAcquisitionLead_userId_idx" ON "StudentAcquisitionLead"("userId");

-- CreateIndex
CREATE INDEX "StudentAcquisitionLead_status_idx" ON "StudentAcquisitionLead"("status");

-- CreateIndex
CREATE INDEX "PlatformLedger_schoolId_idx" ON "PlatformLedger"("schoolId");

-- CreateIndex
CREATE INDEX "PlatformLedger_leadId_idx" ON "PlatformLedger"("leadId");

-- CreateIndex
CREATE INDEX "PlatformLedger_createdAt_idx" ON "PlatformLedger"("createdAt");

-- AddForeignKey
ALTER TABLE "StudentAcquisitionLead" ADD CONSTRAINT "StudentAcquisitionLead_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcquisitionLead" ADD CONSTRAINT "StudentAcquisitionLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformLedger" ADD CONSTRAINT "PlatformLedger_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformLedger" ADD CONSTRAINT "PlatformLedger_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "StudentAcquisitionLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformLedger" ADD CONSTRAINT "PlatformLedger_recordedByOperatorId_fkey" FOREIGN KEY ("recordedByOperatorId") REFERENCES "PlatformOperator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
