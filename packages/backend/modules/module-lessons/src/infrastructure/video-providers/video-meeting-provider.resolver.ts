import { Injectable } from '@nestjs/common';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import { GoogleMeetProvider } from './google-meet.provider';
import { LiveKitProvider } from './livekit.provider';
import { ZoomProvider } from './zoom.provider';
import type {
  VideoMeetingProvider,
  VideoMeetingProviderKey,
} from './video-meeting-provider.interface';

@Injectable()
export class VideoMeetingProviderResolver {
  constructor(
    private readonly googleProvider: GoogleMeetProvider,
    private readonly zoomProvider: ZoomProvider,
    private readonly livekitProvider: LiveKitProvider,
  ) {}

  /** Active provider per platform settings (single-school today; `schoolId` reserved for future per-tenant override). */
  get(_schoolId?: string | null): VideoMeetingProvider {
    return this.byKey(this.activeKey());
  }

  byKey(key: VideoMeetingProviderKey): VideoMeetingProvider {
    switch (key) {
      case 'zoom':
        return this.zoomProvider;
      case 'livekit':
        return this.livekitProvider;
      case 'google':
      default:
        return this.googleProvider;
    }
  }

  activeKey(): VideoMeetingProviderKey {
    const runtime = getPlatformIntegrationRuntime();
    return runtime.videoMeeting?.provider ?? 'google';
  }
}
