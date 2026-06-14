import { Injectable } from '@nestjs/common';
import { ZoomService } from '../zoom.service';
import type {
  CreateVideoMeetingInput,
  CreateVideoMeetingResult,
  VideoMeetingProvider,
  VideoMeetingProviderKey,
} from './video-meeting-provider.interface';

@Injectable()
export class ZoomProvider implements VideoMeetingProvider {
  readonly key: VideoMeetingProviderKey = 'zoom';

  constructor(private readonly zoom: ZoomService) {}

  async assertHostReady(teacherId: string): Promise<void> {
    await this.zoom.assertTeacherZoomReady(teacherId);
  }

  async createMeeting(
    input: CreateVideoMeetingInput,
  ): Promise<CreateVideoMeetingResult | null> {
    const meeting = await this.zoom.createMeeting({
      teacherId: input.teacherId,
      topic: input.summary,
      agenda: input.description,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      timezone: input.timezone,
      attendeeEmails: input.attendeeEmails,
    });
    if (!meeting) return null;
    return {
      provider: 'zoom',
      externalId: meeting.meetingId,
      rawId: meeting.uuid,
      meetingUrl: meeting.joinUrl,
    };
  }

  async getMeetingUrl(
    externalId: string,
    teacherId: string,
  ): Promise<string | null> {
    return this.zoom.getMeetingJoinUrl(externalId, teacherId);
  }

  async endMeeting(externalId: string, teacherId: string): Promise<void> {
    await this.zoom.endMeeting(externalId, teacherId);
  }
}
