import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import { PrismaService } from '@be/prisma';

export type CreateZoomMeetingInput = {
  teacherId: string;
  topic: string;
  agenda?: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  attendeeEmails: string[];
};

export type CreateZoomMeetingResult = {
  /** Numeric meeting id (used in user-facing join URL). */
  meetingId: string;
  /** UUID — used to correlate webhook events. */
  uuid: string | null;
  joinUrl: string;
};

export const ZOOM_CONNECTION_REQUIRED_MESSAGE =
  'Cannot create a Zoom meeting: connect Zoom in Profile → Connections (or enable Server-to-Server OAuth in System → Video meetings).';

type ZoomCredentials = {
  clientId: string;
  clientSecret: string;
  useServerToServer: boolean;
};

function zoomServerCredentials(): ZoomCredentials | null {
  const zoom = getPlatformIntegrationRuntime().videoMeeting?.zoom;
  if (!zoom?.clientId || !zoom?.clientSecret) return null;
  return {
    clientId: zoom.clientId,
    clientSecret: zoom.clientSecret,
    useServerToServer: zoom.useServerToServer === true,
  };
}

/**
 * Thin Zoom Meetings API client.
 *
 * - User OAuth: refresh tokens rotate on every use; we persist the new refresh
 *   token atomically (Zoom behaviour, mirrors Google flow).
 * - Server-to-Server OAuth: uses account-level token without per-user link.
 */
@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);

  constructor(private readonly prisma: PrismaService) {}

  async assertTeacherZoomReady(teacherId: string): Promise<void> {
    const credentials = zoomServerCredentials();
    if (!credentials) {
      throw new BadRequestException(
        'Zoom is not configured on the server. Configure Zoom OAuth in System → Video meetings.',
      );
    }
    if (credentials.useServerToServer) return;
    const connection = await this.prisma.zoomConnection.findUnique({
      where: { userId: teacherId },
    });
    if (!connection?.refreshToken) {
      throw new BadRequestException(ZOOM_CONNECTION_REQUIRED_MESSAGE);
    }
  }

  async createMeeting(
    input: CreateZoomMeetingInput,
  ): Promise<CreateZoomMeetingResult | null> {
    const credentials = zoomServerCredentials();
    if (!credentials) {
      this.logger.warn('Zoom credentials not configured; skipping creation');
      return null;
    }
    const accessToken = await this.getAccessTokenForTeacher(
      input.teacherId,
      credentials,
    );
    if (!accessToken) return null;

    const durationMinutes = Math.max(
      1,
      Math.round(
        (new Date(input.endDateTime).getTime() -
          new Date(input.startDateTime).getTime()) /
          60000,
      ),
    );

    try {
      const response = await fetch(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: input.topic,
            type: 2, // scheduled meeting
            start_time: input.startDateTime,
            duration: durationMinutes,
            timezone: input.timezone,
            agenda: input.agenda?.slice(0, 2000),
            settings: {
              join_before_host: true,
              waiting_room: false,
              auto_recording: 'none',
            },
          }),
        },
      );
      if (!response.ok) {
        this.logger.error(
          `Zoom createMeeting failed: ${response.status} ${await response.text()}`,
        );
        return null;
      }
      const data = (await response.json()) as {
        id?: number | string;
        uuid?: string;
        join_url?: string;
      };
      if (!data.id || !data.join_url) return null;
      return {
        meetingId: String(data.id),
        uuid: data.uuid ?? null,
        joinUrl: data.join_url,
      };
    } catch (err) {
      this.logger.error('Failed to create Zoom meeting', err as Error);
      return null;
    }
  }

  async getMeetingJoinUrl(
    meetingId: string,
    teacherId: string,
  ): Promise<string | null> {
    const credentials = zoomServerCredentials();
    if (!credentials) return null;
    const accessToken = await this.getAccessTokenForTeacher(
      teacherId,
      credentials,
    );
    if (!accessToken) return null;
    try {
      const response = await fetch(
        `https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) return null;
      const data = (await response.json()) as { join_url?: string };
      return data.join_url ?? null;
    } catch (err) {
      this.logger.error('Failed to fetch Zoom meeting', err as Error);
      return null;
    }
  }

  async endMeeting(meetingId: string, teacherId: string): Promise<void> {
    const credentials = zoomServerCredentials();
    if (!credentials) return;
    const accessToken = await this.getAccessTokenForTeacher(
      teacherId,
      credentials,
    );
    if (!accessToken) return;
    await fetch(
      `https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}/status`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'end' }),
      },
    ).catch((err) => this.logger.error('Failed to end Zoom meeting', err));
  }

  /**
   * OAuth callback exchange: trade authorization code for tokens and persist a
   * ZoomConnection for the given user.
   */
  async exchangeAuthorizationCode(
    userId: string,
    code: string,
    redirectUri: string,
  ): Promise<void> {
    const credentials = zoomServerCredentials();
    if (!credentials) {
      throw new BadRequestException(
        'Zoom OAuth is not configured on the server.',
      );
    }
    const tokenResponse = await this.requestTokens(credentials, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
    if (!tokenResponse.access_token || !tokenResponse.refresh_token) {
      throw new BadRequestException('Zoom did not return tokens');
    }
    const userInfo = await this.fetchZoomUserInfo(tokenResponse.access_token);
    await this.prisma.zoomConnection.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_in
          ? new Date(Date.now() + tokenResponse.expires_in * 1000)
          : null,
        scopes: tokenResponse.scope ?? null,
        zoomUserId: userInfo?.id ?? null,
        accountId: userInfo?.account_id ?? null,
        email: userInfo?.email ?? null,
      },
      update: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_in
          ? new Date(Date.now() + tokenResponse.expires_in * 1000)
          : null,
        scopes: tokenResponse.scope ?? null,
        zoomUserId: userInfo?.id ?? null,
        accountId: userInfo?.account_id ?? null,
        email: userInfo?.email ?? null,
      },
    });
  }

  private async getAccessTokenForTeacher(
    teacherId: string,
    credentials: ZoomCredentials,
  ): Promise<string | null> {
    if (credentials.useServerToServer) {
      return this.getServerToServerToken(credentials);
    }
    const connection = await this.prisma.zoomConnection.findUnique({
      where: { userId: teacherId },
    });
    if (!connection?.refreshToken) {
      this.logger.warn(
        `Teacher ${teacherId} has no Zoom connection; skipping meeting`,
      );
      return null;
    }
    const expired =
      !connection.accessToken ||
      !connection.expiresAt ||
      connection.expiresAt.getTime() - Date.now() < 60_000;
    if (!expired && connection.accessToken) return connection.accessToken;

    const tokens = await this.requestTokens(credentials, {
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
    });
    if (!tokens.access_token) return null;
    // Zoom rotates the refresh token on each refresh — persist atomically.
    await this.prisma.zoomConnection.update({
      where: { userId: teacherId },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? connection.refreshToken,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scopes: tokens.scope ?? connection.scopes,
      },
    });
    return tokens.access_token;
  }

  private async getServerToServerToken(
    credentials: ZoomCredentials,
  ): Promise<string | null> {
    const accountId = process.env['ZOOM_ACCOUNT_ID']?.trim();
    if (!accountId) {
      this.logger.warn(
        'ZOOM_ACCOUNT_ID is not set; cannot use Server-to-Server OAuth',
      );
      return null;
    }
    const tokens = await this.requestTokens(credentials, {
      grant_type: 'account_credentials',
      account_id: accountId,
    });
    return tokens.access_token ?? null;
  }

  private async requestTokens(
    credentials: ZoomCredentials,
    body: Record<string, string>,
  ): Promise<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  }> {
    const basic = Buffer.from(
      `${credentials.clientId}:${credentials.clientSecret}`,
    ).toString('base64');
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    });
    if (!response.ok) {
      this.logger.error(
        `Zoom token request failed: ${response.status} ${await response.text()}`,
      );
      return {};
    }
    return (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };
  }

  private async fetchZoomUserInfo(accessToken: string): Promise<{
    id?: string;
    account_id?: string;
    email?: string;
  } | null> {
    try {
      const response = await fetch('https://api.zoom.us/v2/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      return (await response.json()) as {
        id?: string;
        account_id?: string;
        email?: string;
      };
    } catch {
      return null;
    }
  }
}
