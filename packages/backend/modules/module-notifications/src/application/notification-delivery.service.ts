import { Injectable } from '@nestjs/common';
import type { NotificationKind } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { DEFAULT_SCHOOL_ID, TenantContextService } from '@be/tenant';

@Injectable()
export class NotificationDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  async wasSent(
    userId: string,
    kind: NotificationKind,
    dedupeKey: string,
    channel: 'email' | 'telegram' = 'email',
  ): Promise<boolean> {
    const row = await this.prisma.notificationDelivery.findUnique({
      where: {
        userId_kind_dedupeKey_channel: { userId, kind, dedupeKey, channel },
      },
    });
    return Boolean(row);
  }

  async recordSent(
    userId: string,
    kind: NotificationKind,
    dedupeKey: string,
    channel: 'email' | 'telegram' = 'email',
  ): Promise<void> {
    await this.prisma.notificationDelivery.upsert({
      where: {
        userId_kind_dedupeKey_channel: { userId, kind, dedupeKey, channel },
      },
      create: {
        userId,
        schoolId: this.tenant.schoolId ?? DEFAULT_SCHOOL_ID,
        kind,
        dedupeKey,
        channel,
      },
      update: { sentAt: new Date() },
    });
  }
}
