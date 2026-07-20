import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { PrismaService } from '@be/prisma';
import { StorageAccountingService } from '@be/billing/entitlements';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';

/**
 * G42 — LiveKit egress webhook.
 *
 * LiveKit calls POST /api/livekit/webhook with a signed JWT body when room/
 * egress events fire. We listen for `egress_ended` to:
 *   1. Stamp `ScheduledLesson.recordingSizeBytes` from the file size.
 *   2. Increment `School.storageUsedBytes` via StorageAccountingService.
 *
 * The endpoint is public (no AuthGuard) — authenticity is verified by the
 * WebhookReceiver JWT signature check using LiveKit's API secret.
 *
 * NestJS rawBody must be enabled for the signature check to work (`rawBody: true`
 * in NestFactory.create — already set in main.ts).
 */
@Controller('livekit')
export class LiveKitWebhookController {
  private readonly logger = new Logger(LiveKitWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageAccounting: StorageAccountingService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Body() _body: unknown,
    @Headers('authorization') authHeader: string | undefined,
  ): Promise<{ ok: true }> {
    const creds = getPlatformIntegrationRuntime().videoMeeting?.livekit;
    if (!creds?.apiKey || !creds?.apiSecret) {
      // LiveKit not configured — silently accept to avoid webhook retry storms.
      return { ok: true };
    }

    const rawBody = req.rawBody?.toString('utf-8') ?? '';
    if (!rawBody) throw new BadRequestException('Missing body');

    const receiver = new WebhookReceiver(creds.apiKey, creds.apiSecret);
    let event: Awaited<ReturnType<typeof receiver.receive>>;
    try {
      event = await receiver.receive(rawBody, authHeader ?? '');
    } catch {
      throw new BadRequestException('Invalid LiveKit webhook signature');
    }

    if (event.event === 'egress_ended') {
      await this.handleEgressEnded(event);
    }

    return { ok: true };
  }

  private async handleEgressEnded(
    event: Awaited<ReturnType<WebhookReceiver['receive']>>,
  ): Promise<void> {
    const egress = event.egressInfo;
    if (!egress) return;

    // Room name encodes the lesson — format: `arvilio-<lessonId8>-<hash10>`
    const roomName = egress.roomName ?? '';
    const match = /^arvilio-([a-z0-9-]{8,})/i.exec(roomName);
    if (!match) return;

    // Derive file size: sum segment sizes or use direct file info
    const fileSizeBytes = this.resolveEgressSize(egress);
    if (!fileSizeBytes) return;

    // Find the lesson by room name pattern (roomName prefix encodes lessonId prefix)
    const lessonPrefix = match[1];
    const lesson = await this.prisma.scheduledLesson.findFirst({
      where: { id: { startsWith: lessonPrefix } },
      select: { id: true, schoolId: true, recordingSizeBytes: true },
    });

    if (!lesson?.schoolId) {
      this.logger.warn(`LiveKit egress_ended: no lesson found for room ${roomName}`);
      return;
    }

    const previous = lesson.recordingSizeBytes ?? 0;
    const delta = fileSizeBytes - previous;

    await this.prisma.scheduledLesson.update({
      where: { id: lesson.id },
      data: { recordingSizeBytes: fileSizeBytes },
    });

    if (delta !== 0) {
      await this.storageAccounting.add(lesson.schoolId, delta);
    }

    this.logger.log(
      `LiveKit egress_ended: lesson ${lesson.id} recording ${fileSizeBytes} bytes (delta ${delta > 0 ? '+' : ''}${delta})`,
    );
  }

  private resolveEgressSize(
    egress: NonNullable<Awaited<ReturnType<WebhookReceiver['receive']>>['egressInfo']>,
  ): number | null {
    // Composed file egress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (egress as any).fileResults?.[0] ?? (egress as any).file;
    if (file?.size) return Number(file.size);
    // Segment list egress (HLS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const segments = (egress as any).segmentResults;
    if (Array.isArray(segments) && segments.length > 0) {
      return segments.reduce((sum: number, s: { size?: number }) => sum + (Number(s.size) || 0), 0);
    }
    return null;
  }
}
