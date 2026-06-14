import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '@be/prisma';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';

type ZoomWebhookEvent = {
  event?: string;
  payload?: {
    plainToken?: string;
    object?: {
      id?: number | string;
      uuid?: string;
    };
  };
  event_ts?: number;
};

/**
 * Zoom webhook receiver.
 *
 * - Handles `endpoint.url_validation` handshake (signed plainToken response).
 * - Verifies request signature using webhook secret token (`x-zm-signature` +
 *   `x-zm-request-timestamp`).
 * - Updates lesson `videoMeetingStartedAt` / `videoMeetingEndedAt` on
 *   `meeting.started` / `meeting.ended`.
 */
@Controller('integrations/zoom')
export class ZoomWebhookController {
  private readonly logger = new Logger(ZoomWebhookController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Post('webhook')
  @HttpCode(200)
  async receive(
    @Headers('x-zm-signature') signature: string | undefined,
    @Headers('x-zm-request-timestamp') timestamp: string | undefined,
    @Body() body: ZoomWebhookEvent,
  ): Promise<unknown> {
    const secret =
      getPlatformIntegrationRuntime().videoMeeting?.zoom?.webhookSecret;
    if (!secret) {
      throw new BadRequestException('Zoom webhook secret is not configured');
    }

    // URL validation handshake — must respond synchronously.
    if (body?.event === 'endpoint.url_validation' && body.payload?.plainToken) {
      const plainToken = body.payload.plainToken;
      const encryptedToken = createHmac('sha256', secret)
        .update(plainToken)
        .digest('hex');
      return { plainToken, encryptedToken };
    }

    if (!signature || !timestamp) {
      throw new BadRequestException('Missing Zoom signature headers');
    }

    const message = `v0:${timestamp}:${JSON.stringify(body)}`;
    const expected =
      'v0=' + createHmac('sha256', secret).update(message).digest('hex');
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signature);
    if (
      expectedBuf.length !== receivedBuf.length ||
      !timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw new BadRequestException('Invalid Zoom signature');
    }

    const meetingUuid = body.payload?.object?.uuid?.trim();
    if (!meetingUuid) return { ok: true };

    const lesson = await this.prisma.scheduledLesson.findFirst({
      where: { videoMeetingRawId: meetingUuid },
      select: { id: true },
    });
    if (!lesson) {
      this.logger.warn(`No lesson found for Zoom meeting uuid=${meetingUuid}`);
      return { ok: true };
    }

    if (body.event === 'meeting.started') {
      await this.prisma.scheduledLesson.update({
        where: { id: lesson.id },
        data: { videoMeetingStartedAt: new Date() },
      });
    } else if (body.event === 'meeting.ended') {
      await this.prisma.scheduledLesson.update({
        where: { id: lesson.id },
        data: { videoMeetingEndedAt: new Date() },
      });
    }

    return { ok: true };
  }
}
