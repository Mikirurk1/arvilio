---
tags: [entity, integrations]
updated: 2026-06-08
---

# Entity: ZoomConnection

Stores Zoom OAuth tokens for creating Zoom meetings when the platform's active video provider is `zoom`.

Mirrors [[entities/google-calendar-connection]]; only the host (teacher) connection is stored — meeting participants don't need a Zoom account.

## Fields

- `userId` (unique)
- `zoomUserId`, `accountId`, `email` — populated from `https://api.zoom.us/v2/users/me` after OAuth.
- `accessToken`, `refreshToken`, `expiresAt`, `scopes`

> Zoom **rotates the refresh token on every refresh** — `ZoomService` persists the new value atomically (mirrors Google flow).

## Usage

- `ZoomService` (`module-lessons/infrastructure/zoom.service.ts`) — token refresh, meeting create/get/end.
- `ZoomProvider` (`module-lessons/infrastructure/video-providers/zoom.provider.ts`) — adapter behind `VideoMeetingProvider`.
- Populates `ScheduledLesson.videoMeetingUrl`, `videoMeetingExternalId` (Zoom meeting id), `videoMeetingRawId` (Zoom UUID, used to correlate webhooks).

## OAuth flow

- `GET /api/auth/zoom/link` (cookie-state) → redirect to `https://zoom.us/oauth/authorize`.
- `GET /api/auth/zoom/callback` → exchange code → upsert `ZoomConnection`.

## Server-to-Server mode

When `PlatformSettings.integrationConfig.videoMeeting.zoom.useServerToServer = true`, `ZoomService` skips per-user OAuth entirely and uses account-level token (env `ZOOM_ACCOUNT_ID` + stored client credentials). No `ZoomConnection` row is required in that case.

## Related

- [[concepts/video-meeting-providers]]
- [[entities/scheduled-lesson]]
- [[entities/user]]
- [[concepts/auth-rbac]]
