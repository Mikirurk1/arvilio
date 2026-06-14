export type VideoMeetingProviderKey = 'google' | 'zoom' | 'livekit';

export type CreateVideoMeetingInput = {
  lessonId: string;
  teacherId: string;
  summary: string;
  description?: string;
  /** RFC3339 dateTime in `timezone` (e.g. "2026-05-12T10:00:00"). */
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  attendeeEmails: string[];
};

export type CreateVideoMeetingResult = {
  provider: VideoMeetingProviderKey;
  /** Provider-specific id (Google event id, Zoom meeting id, Jitsi room name). */
  externalId: string;
  /** Raw provider id used to correlate webhooks (Zoom UUID). */
  rawId: string | null;
  meetingUrl: string;
  /** Optional provider-specific conference id (e.g. Google conferenceId). */
  conferenceId?: string | null;
};

export interface VideoMeetingProvider {
  readonly key: VideoMeetingProviderKey;

  /**
   * Throw a user-readable BadRequestException if the host can't create meetings
   * (missing OAuth link, missing server credentials, etc).
   */
  assertHostReady(teacherId: string): Promise<void>;

  createMeeting(
    input: CreateVideoMeetingInput,
  ): Promise<CreateVideoMeetingResult | null>;

  /** Resolve a meeting URL for an already-created external id (used by ensureMeetLink). */
  getMeetingUrl(
    externalId: string,
    teacherId: string,
  ): Promise<string | null>;

  endMeeting?(externalId: string, teacherId: string): Promise<void>;
}
