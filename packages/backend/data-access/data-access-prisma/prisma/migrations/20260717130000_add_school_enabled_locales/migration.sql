-- AlterTable School: add enabledLocales (subset of platform SUPPORTED_LOCALES; empty = inherit shipped set)
ALTER TABLE "School" ADD COLUMN "enabledLocales" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
