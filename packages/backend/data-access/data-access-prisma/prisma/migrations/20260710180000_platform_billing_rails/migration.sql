-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "platformBillingConfig" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "PlatformSettings" ADD COLUMN IF NOT EXISTS "platformBillingSecrets" TEXT;
