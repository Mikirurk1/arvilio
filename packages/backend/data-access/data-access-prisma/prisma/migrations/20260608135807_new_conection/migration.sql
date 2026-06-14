-- AlterTable
ALTER TABLE "ScheduledLessonParticipant" ALTER COLUMN "studentResponseFiles" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "LibraryFileUserAnnotation_userId_fileAttachmentId_contextUserId" RENAME TO "LibraryFileUserAnnotation_userId_fileAttachmentId_contextUs_key";
