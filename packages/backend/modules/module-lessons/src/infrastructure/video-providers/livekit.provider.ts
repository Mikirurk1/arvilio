import { Injectable } from '@nestjs/common';
import { LiveKitService } from '../livekit.service';
import type {
  CreateVideoMeetingInput,
  CreateVideoMeetingResult,
  VideoMeetingProvider,
  VideoMeetingProviderKey,
} from './video-meeting-provider.interface';

/**
 * Built-in video provider backed by LiveKit (self-hosted or LiveKit Cloud).
 *
 * The provider only *names* the room — no HTTP call to LiveKit at create-time.
 * LiveKit's SFU lazily creates the room when the first participant joins with
 * a signed JWT (see `LiveKitService.createAccessToken`).
 *
 * `meetingUrl` is an in-app deep link to our lesson page; participants don't
 * paste a LiveKit URL into a browser — they open the lesson and our embed
 * fetches a fresh access token, then connects to `wsUrl`.
 */
@Injectable()
export class LiveKitProvider implements VideoMeetingProvider {
  readonly key: VideoMeetingProviderKey = 'livekit';

  constructor(private readonly livekit: LiveKitService) {}

  async assertHostReady(_teacherId: string): Promise<void> {
    this.livekit.assertReady();
  }

  async createMeeting(
    input: CreateVideoMeetingInput,
  ): Promise<CreateVideoMeetingResult | null> {
    const roomName = this.livekit.roomNameFor(input.lessonId);
    const webOrigin =
      process.env['WEB_ORIGIN']?.replace(/\/$/, '') ??
      'http://localhost:4200';
    return {
      provider: 'livekit',
      externalId: roomName,
      rawId: null,
      meetingUrl: `${webOrigin}/lessons/${input.lessonId}`,
      conferenceId: null,
    };
  }

  async getMeetingUrl(
    externalId: string,
    _teacherId: string,
  ): Promise<string | null> {
    // LiveKit rooms don't have a standalone shareable URL — re-derive deep link
    // from the lesson id encoded in `externalId` is not possible; callers should
    // already have the lesson in context. Returning null is fine: ensureMeetLink
    // will recreate via `createMeeting`.
    void externalId;
    return null;
  }
}
