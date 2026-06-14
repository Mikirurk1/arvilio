-- Material cover image + PDF title-page previews on file attachments
ALTER TABLE "LibraryMaterial" ADD COLUMN "coverAttachmentId" TEXT;

ALTER TABLE "LibraryFileAttachment" ADD COLUMN "previewStorageKey" TEXT;

CREATE UNIQUE INDEX "LibraryMaterial_coverAttachmentId_key" ON "LibraryMaterial"("coverAttachmentId");

ALTER TABLE "LibraryMaterial" ADD CONSTRAINT "LibraryMaterial_coverAttachmentId_fkey" FOREIGN KEY ("coverAttachmentId") REFERENCES "LibraryFileAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
