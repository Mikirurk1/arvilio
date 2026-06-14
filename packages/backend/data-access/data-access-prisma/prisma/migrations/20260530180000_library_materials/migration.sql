-- CreateEnum
CREATE TYPE "LibraryMaterialKind" AS ENUM ('BOARD', 'PRESENTATION', 'BOOK', 'OTHER');

-- CreateEnum
CREATE TYPE "LibraryMaterialAssetRole" AS ENUM ('STUDENT_BOOK', 'TEACHER_BOOK', 'WORKBOOK', 'AUDIO', 'VIDEO', 'SLIDES', 'LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "LibraryMaterialDeliveryKind" AS ENUM ('URL', 'FILE');

-- CreateTable
CREATE TABLE "LibraryMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "LibraryMaterialKind" NOT NULL,
    "tags" TEXT[],
    "level" TEXT,
    "publisher" TEXT,
    "schoolId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryMaterialAsset" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "role" "LibraryMaterialAssetRole" NOT NULL,
    "deliveryKind" "LibraryMaterialDeliveryKind" NOT NULL,
    "url" TEXT,
    "fileAttachmentId" TEXT,
    "label" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LibraryMaterialAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryFileAttachment" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryFileAttachment_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "LessonMaterial" ADD COLUMN "libraryMaterialId" TEXT;

-- CreateIndex
CREATE INDEX "LibraryMaterial_kind_idx" ON "LibraryMaterial"("kind");

-- CreateIndex
CREATE INDEX "LibraryMaterial_schoolId_kind_idx" ON "LibraryMaterial"("schoolId", "kind");

-- CreateIndex
CREATE INDEX "LibraryMaterial_createdById_idx" ON "LibraryMaterial"("createdById");

-- CreateIndex
CREATE INDEX "LibraryMaterialAsset_materialId_idx" ON "LibraryMaterialAsset"("materialId");

-- CreateIndex
CREATE INDEX "LibraryFileAttachment_materialId_idx" ON "LibraryFileAttachment"("materialId");

-- CreateIndex
CREATE INDEX "LessonMaterial_libraryMaterialId_idx" ON "LessonMaterial"("libraryMaterialId");

-- AddForeignKey
ALTER TABLE "LibraryMaterial" ADD CONSTRAINT "LibraryMaterial_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryMaterialAsset" ADD CONSTRAINT "LibraryMaterialAsset_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LibraryMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryMaterialAsset" ADD CONSTRAINT "LibraryMaterialAsset_fileAttachmentId_fkey" FOREIGN KEY ("fileAttachmentId") REFERENCES "LibraryFileAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFileAttachment" ADD CONSTRAINT "LibraryFileAttachment_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LibraryMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_libraryMaterialId_fkey" FOREIGN KEY ("libraryMaterialId") REFERENCES "LibraryMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
