ALTER TABLE "LessonMaterial" ADD COLUMN "sharedLibraryAssetIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "LessonMaterial" ADD COLUMN "libraryMediaSelectionApplied" BOOLEAN NOT NULL DEFAULT false;
