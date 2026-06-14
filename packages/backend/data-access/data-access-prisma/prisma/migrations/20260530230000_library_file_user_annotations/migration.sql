-- CreateTable
CREATE TABLE "LibraryFileUserAnnotation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileAttachmentId" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "fileRevision" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryFileUserAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibraryFileUserAnnotation_fileAttachmentId_idx" ON "LibraryFileUserAnnotation"("fileAttachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryFileUserAnnotation_userId_fileAttachmentId_key" ON "LibraryFileUserAnnotation"("userId", "fileAttachmentId");

-- AddForeignKey
ALTER TABLE "LibraryFileUserAnnotation" ADD CONSTRAINT "LibraryFileUserAnnotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFileUserAnnotation" ADD CONSTRAINT "LibraryFileUserAnnotation_fileAttachmentId_fkey" FOREIGN KEY ("fileAttachmentId") REFERENCES "LibraryFileAttachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
