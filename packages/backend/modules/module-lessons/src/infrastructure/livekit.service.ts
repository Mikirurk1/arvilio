import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AccessToken, type AccessTokenOptions } from 'livekit-server-sdk';
import { createHmac } from 'node:crypto';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';

type LiveKitCredentials = {
  wsUrl: string;
  apiKey: string;
  apiSecret: string;
};

export type LiveKitTokenInput = {
  roomName: string;
  identity: string;
  displayName?: string;
  /** Teachers get host-level metadata; students join as participants. */
  isHost?: boolean;
  /** Token validity in seconds (default 4 hours — covers a long lesson + buffer). */
  ttlSeconds?: number;
};

export type LiveKitTokenResult = {
  wsUrl: string;
  token: string;
  roomName: string;
};

function livekitCredentials(): LiveKitCredentials | null {
  const livekit = getPlatformIntegrationRuntime().videoMeeting?.livekit;
  if (!livekit?.wsUrl || !livekit.apiKey || !livekit.apiSecret) return null;
  return {
    wsUrl: livekit.wsUrl,
    apiKey: livekit.apiKey,
    apiSecret: livekit.apiSecret,
  };
}

/**
 * Thin LiveKit access-token signer. We don't talk to LiveKit's HTTP API for
 * room creation — rooms are created lazily by the SFU on first publisher join,
 * keyed by the room name we sign into the JWT.
 */
@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);

  assertReady(): void {
    if (!livekitCredentials()) {
      throw new BadRequestException(
        'LiveKit is not configured. Set wsUrl, API key and secret in System → General → Video meetings.',
      );
    }
  }

  /**
   * Generate a deterministic, non-guessable room name for a lesson. Same lesson
   * id always maps to the same room (so the resolver can rejoin), but a casual
   * attacker can't enumerate room ids.
   */
  roomNameFor(lessonId: string): string {
    const key =
      process.env['PLATFORM_SECRETS_ENCRYPTION_KEY']?.trim() ||
      process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim();
    if (!key) throw new Error('PLATFORM_SECRETS_ENCRYPTION_KEY is required for room name generation');
    const hash = createHmac('sha256', key).update(lessonId).digest('hex');
    return `soenglish-${lessonId.slice(0, 8)}-${hash.slice(0, 10)}`;
  }

  async createAccessToken(
    input: LiveKitTokenInput,
  ): Promise<LiveKitTokenResult | null> {
    const credentials = livekitCredentials();
    if (!credentials) {
      this.logger.warn('LiveKit credentials missing; skipping token signing');
      return null;
    }

    const options: AccessTokenOptions = {
      identity: input.identity,
      name: input.displayName,
      ttl: input.ttlSeconds ?? 60 * 60 * 4,
      metadata: input.isHost ? JSON.stringify({ role: 'host' }) : undefined,
    };
    const at = new AccessToken(credentials.apiKey, credentials.apiSecret, options);
    at.addGrant({
      roomJoin: true,
      room: input.roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    return {
      wsUrl: credentials.wsUrl,
      token,
      roomName: input.roomName,
    };
  }
}
