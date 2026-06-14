---
tags: [concept, lessons, integrations]
updated: 2026-06-09
---

# Video Meeting Providers

SoEnglish lets the platform admin pick which video provider creates the meeting link for new scheduled lessons. The choice is **platform-wide** (single-school today; resolver accepts an optional `schoolId` as a seam for future per-tenant override).

## Active provider config

Stored on `PlatformSettings.integrationConfig.videoMeeting`:

```ts
{
  provider: 'google' | 'zoom' | 'livekit'; // default 'google'
  livekit: { wsUrl: string; apiKey: string | null };
  zoom: {
    clientId: string | null;
    callbackUrl: string;
    useServerToServer: boolean;
  };
}
```

Secrets (`zoomClientSecret`, `zoomWebhookSecret`, `livekitApiSecret`) live in the encrypted `integrationSecrets` blob. UI: **System → General → Video meetings** for provider switch; **System → Connections** for credentials (Google / Facebook / Telegram / Zoom / LiveKit).

## Backend architecture

- `VideoMeetingProvider` interface (`packages/backend/modules/module-lessons/src/infrastructure/video-providers/video-meeting-provider.interface.ts`).
- Implementations under the same folder: `google-meet.provider.ts`, `zoom.provider.ts`, `livekit.provider.ts`.
- `VideoMeetingProviderResolver` reads the runtime config and returns the active provider.
- `LessonsService.create()` and `LessonsService.ensureMeetLink()` delegate via the resolver — no direct calls to `GoogleCalendarService` for meeting creation any more (`GoogleCalendarService` stays for legacy event update/delete on schedule changes and as the implementation underneath `GoogleMeetProvider`).
- `applyVideoMeetingToLesson()` persists `videoProvider`, `videoMeetingUrl`, `videoMeetingExternalId`, `videoMeetingRawId`, and mirrors to legacy `googleMeetUrl`/`googleCalendarEventId` when the provider is Google.

## Providers

### Google Meet
- Wraps the existing `GoogleCalendarService.createMeetEvent()`.
- Host requirement: per-teacher Google Calendar OAuth link (`GoogleCalendarConnection` row with a refresh token).
- Schedule updates and deletions flow back to Google Calendar (kept from the original code path).

### Zoom
- `ZoomService` calls Zoom Meetings API (`POST /v2/users/me/meetings`).
- Auth: either per-teacher OAuth (`ZoomConnection` row) or platform-level **Server-to-Server OAuth** (needs `ZOOM_ACCOUNT_ID`, no per-user link required).
- Zoom **rotates the refresh token on every refresh** — `ZoomService` persists the new token atomically.
- OAuth link/callback: `/api/auth/zoom/link`, `/api/auth/zoom/callback` (controller in `module-lessons/presentation/rest/zoom-oauth.controller.ts`).
- Webhook: `/api/integrations/zoom/webhook` — handles the `endpoint.url_validation` handshake (HMAC, `HttpCode(200)`) and `meeting.started` / `meeting.ended` events, updating `videoMeetingStartedAt` / `videoMeetingEndedAt` by `videoMeetingRawId`.

### Built-in (LiveKit)
- `LiveKitService` signs short-lived JWT access tokens with `livekit-server-sdk`. No HTTP call to LiveKit at create-time — rooms are created lazily by the SFU on the first publisher join, keyed by room name.
- Room name = `soenglish-<lessonId8>-<hmacShort>`, keyed off `PLATFORM_SECRETS_ENCRYPTION_KEY` (prevents room-id enumeration).
- Token endpoint: `GET /api/lessons/scheduled/:id/livekit-token` — auth-guarded + lesson-membership check; returns `{ wsUrl, token, roomName }`. Token TTL: 4h. Teacher identity gets `metadata.role = 'host'`.
- Frontend embed: `LessonVideoEmbed` uses `@livekit/components-react` (`<LiveKitRoom>` + `<VideoConference>`) — inline classroom UI on the lesson page; no external tab.
- Deployment: **self-hosted only** — run `docker compose -f infra/docker/docker-compose.yml up -d` — LiveKit is a service in the main compose file. Keys live in `infra/docker/livekit.yaml`. Credentials go into **System → Connections → LiveKit (built-in video)**. TURN is built into LiveKit via `use_external_ip: true`; no separate coturn needed for typical deployments.

## Frontend

- Lesson page (`apps/web/src/app/lessons/[lessonId]/page.tsx`):
  - LiveKit → inline `<LessonVideoEmbed>` (fetches token, connects).
  - Google / Zoom → external `<LessonVideoButton>` (provider-aware label).
- DTO fallback: `videoMeetingUrl ?? googleMeetUrl` everywhere.
- Profile → Connections: Zoom row alongside Google/Facebook/Telegram (LiveKit is **not** a per-user connection — it's platform-level only).
- Admin: provider switch in **System → General → Video meetings**; provider credentials in **System → Connections**.

## Backward compatibility

- Migration `20260608120000_add_video_meeting_providers_and_zoom_connection` (applied earlier when Jitsi was the built-in option): adds the generalized fields and `ZoomConnection`. Built-in provider key changed from `'jitsi'` to `'livekit'` in code; no DB migration needed because no rows had `videoProvider='jitsi'` in production.
- Legacy fields (`googleMeetUrl`, `googleCalendarEventId`, `googleConferenceId`, `meetCreatedAt`) are kept and updated when the active provider is Google.

## Related

- [[entities/scheduled-lesson]]
- [[entities/google-calendar-connection]]
- [[entities/zoom-connection]]
- [[concepts/lessons-calendar]]
- [[concepts/auth-rbac]]
