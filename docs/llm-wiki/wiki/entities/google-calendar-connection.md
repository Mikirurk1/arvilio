---
tags: [entity, integrations]
updated: 2026-05-16
---

# Entity: GoogleCalendarConnection

Stores Google Calendar OAuth tokens for creating lesson events and Meet links.

## Fields

- `userId` (unique), `calendarId` (default `primary`)
- `accessToken`, `refreshToken`, `expiresAt`, `scopes`

## Usage

- `GoogleCalendarService` in `module-lessons`
- Populates `ScheduledLesson.googleMeetUrl`, `googleCalendarEventId`

## Related

- [[concepts/lessons-calendar]]
- [[entities/user]]
