ALTER TABLE "PlatformSettings"
ADD COLUMN "integrationConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "integrationSecrets" TEXT;
