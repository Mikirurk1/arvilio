-- CreateEnum
CREATE TYPE "LibraryCaptionTrackKind" AS ENUM ('SOURCE', 'TRANSLATION');

-- CreateEnum
CREATE TYPE "LibraryCaptionTrackStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "LibraryFileCaptionTrack" (
    "id" TEXT NOT NULL,
    "fileAttachmentId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "kind" "LibraryCaptionTrackKind" NOT NULL,
    "sourceTrackId" TEXT,
    "status" "LibraryCaptionTrackStatus" NOT NULL DEFAULT 'PENDING',
    "vttStorageKey" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryFileCaptionTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibraryFileCaptionTrack_fileAttachmentId_idx" ON "LibraryFileCaptionTrack"("fileAttachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryFileCaptionTrack_fileAttachmentId_language_kind_key" ON "LibraryFileCaptionTrack"("fileAttachmentId", "language", "kind");

-- AddForeignKey
ALTER TABLE "LibraryFileCaptionTrack" ADD CONSTRAINT "LibraryFileCaptionTrack_fileAttachmentId_fkey" FOREIGN KEY ("fileAttachmentId") REFERENCES "LibraryFileAttachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
