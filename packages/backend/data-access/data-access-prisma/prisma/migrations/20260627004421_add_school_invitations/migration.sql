-- CreateTable
CREATE TABLE "SchoolInvitation" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "SchoolMembershipRole" NOT NULL DEFAULT 'STUDENT',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolInvitation_token_key" ON "SchoolInvitation"("token");

-- CreateIndex
CREATE INDEX "SchoolInvitation_schoolId_idx" ON "SchoolInvitation"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolInvitation_token_idx" ON "SchoolInvitation"("token");

-- CreateIndex
CREATE INDEX "SchoolInvitation_email_schoolId_idx" ON "SchoolInvitation"("email", "schoolId");

-- AddForeignKey
ALTER TABLE "SchoolInvitation" ADD CONSTRAINT "SchoolInvitation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolInvitation" ADD CONSTRAINT "SchoolInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
