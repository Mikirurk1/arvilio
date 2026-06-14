import { Injectable } from '@nestjs/common';
import { GoogleCalendarService } from '../google-calendar.service';
import type {
  CreateVideoMeetingInput,
  CreateVideoMeetingResult,
  VideoMeetingProvider,
  VideoMeetingProviderKey,
} from './video-meeting-provider.interface';

@Injectable()
export class GoogleMeetProvider implements VideoMeetingProvider {
  readonly key: VideoMeetingProviderKey = 'google';

  constructor(private readonly google: GoogleCalendarService) {}

  async assertHostReady(teacherId: string): Promise<void> {
    await this.google.assertTeacherCalendarReady(teacherId);
  }

  async createMeeting(
    input: CreateVideoMeetingInput,
  ): Promise<CreateVideoMeetingResult | null> {
    const meet = await this.google.createMeetEvent({
      teacherId: input.teacherId,
      summary: input.summary,
      description: input.description,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      timezone: input.timezone,
      studentEmails: input.attendeeEmails,
    });
    if (!meet?.eventId) return null;
    return {
      provider: 'google',
      externalId: meet.eventId,
      rawId: meet.eventId,
      meetingUrl: meet.meetUrl ?? '',
      conferenceId: meet.conferenceId ?? null,
    };
  }

  async getMeetingUrl(
    externalId: string,
    teacherId: string,
  ): Promise<string | null> {
    return this.google.getEventMeetUrl(teacherId, externalId);
  }
}
