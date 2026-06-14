-- AlterTable: staff overlay annotations on a student's book (contextUserId = student id; "" = own book)
ALTER TABLE "LibraryFileUserAnnotation" ADD COLUMN "contextUserId" TEXT NOT NULL DEFAULT '';

-- DropIndex
DROP INDEX "LibraryFileUserAnnotation_userId_fileAttachmentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "LibraryFileUserAnnotation_userId_fileAttachmentId_contextUserId_key" ON "LibraryFileUserAnnotation"("userId", "fileAttachmentId", "contextUserId");

-- CreateIndex
CREATE INDEX "LibraryFileUserAnnotation_contextUserId_idx" ON "LibraryFileUserAnnotation"("contextUserId");
