/*
  Warnings:

  - Made the column `schoolId` on table `LibraryMaterial` required. This step will fail if there are existing NULL values in that column.

*/
-- Data backfill (expand/contract): assign legacy rows to the default tenant
-- before enforcing NOT NULL. school_default is created by backfill-tenancy.ts.
UPDATE "LibraryMaterial" SET "schoolId" = 'school_default' WHERE "schoolId" IS NULL;

-- AlterTable
ALTER TABLE "LibraryMaterial" ALTER COLUMN "schoolId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "LibraryMaterial" ADD CONSTRAINT "LibraryMaterial_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
