-- AlterTable: add generalized video meeting fields on ScheduledLesson.
ALTER TABLE "ScheduledLesson"
  ADD COLUMN "videoProvider"          TEXT,
  ADD COLUMN "videoMeetingUrl"        TEXT,
  ADD COLUMN "videoMeetingExternalId" TEXT,
  ADD COLUMN "videoMeetingRawId"      TEXT,
  ADD COLUMN "videoMeetingStartedAt"  TIMESTAMP(3),
  ADD COLUMN "videoMeetingEndedAt"    TIMESTAMP(3);

-- Backfill: existing lessons with a Google Meet link become 'google' provider.
UPDATE "ScheduledLesson"
SET
  "videoProvider"          = 'google',
  "videoMeetingUrl"        = "googleMeetUrl",
  "videoMeetingExternalId" = "googleCalendarEventId"
WHERE "googleMeetUrl" IS NOT NULL;

-- CreateTable: Zoom OAuth connections (mirror of GoogleCalendarConnection).
CREATE TABLE "ZoomConnection" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "zoomUserId"   TEXT,
  "accountId"    TEXT,
  "email"        TEXT,
  "accessToken"  TEXT,
  "refreshToken" TEXT,
  "expiresAt"    TIMESTAMP(3),
  "scopes"       TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ZoomConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ZoomConnection_userId_key" ON "ZoomConnection"("userId");

ALTER TABLE "ZoomConnection"
  ADD CONSTRAINT "ZoomConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
