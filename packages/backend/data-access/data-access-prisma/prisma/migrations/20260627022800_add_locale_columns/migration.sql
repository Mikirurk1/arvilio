-- AlterTable School: add defaultLocale column (nullable, inherits platform default)
ALTER TABLE "School" ADD COLUMN "defaultLocale" TEXT;

-- AlterTable User: add locale column (nullable, inherits school default)
ALTER TABLE "User" ADD COLUMN "locale" TEXT;
