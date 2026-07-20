import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import {
  clampPageLimit,
  createdAtIdCursorWhereDesc,
  encodeCreatedAtIdCursor,
  type PlatformPageDto,
} from './platform-page.util';

/**
 * Records platform-operator actions (Phase 4 / ADR-009). The audit log is
 * platform-global (not tenant data), so it uses the base PrismaService — not the
 * scoped client and not `asPlatform()`. The actor is the authenticated operator
 * from the CLS context.
 */
@Injectable()
export class PlatformAuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  async record(params: {
    action: string;
    targetSchoolId?: string | null;
    metadata?: Prisma.InputJsonValue;
    ip?: string | null;
  }): Promise<void> {
    const actorUserId = this.tenant.userId;
    if (!actorUserId) return; // platform actions are always authenticated; no actor → nothing to attribute
    await this.prisma.platformAuditLog.create({
      data: {
        actorUserId,
        action: params.action,
        targetSchoolId: params.targetSchoolId ?? null,
        metadata: params.metadata,
        ip: params.ip ?? null,
      },
    });
  }

  /** Recent audit entries (newest first), optionally filtered by target school. */
  async list(params?: {
    targetSchoolId?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PlatformPageDto<PlatformAuditEntryDto>> {
    const limit = clampPageLimit(params?.limit, 50);
    const q = params?.q?.trim() ?? '';
    const filterWhere: Prisma.PlatformAuditLogWhereInput = {
      AND: [
        params?.targetSchoolId ? { targetSchoolId: params.targetSchoolId } : {},
        q
          ? {
              OR: [
                { action: { contains: q, mode: 'insensitive' } },
                { actor: { displayName: { contains: q, mode: 'insensitive' } } },
                { targetSchoolId: { equals: q } },
              ],
            }
          : {},
      ],
    };
    const where: Prisma.PlatformAuditLogWhereInput = {
      AND: [filterWhere, createdAtIdCursorWhereDesc(params?.cursor)],
    };

    const [rows, total] = await Promise.all([
      this.prisma.platformAuditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        include: { actor: { select: { displayName: true } } },
      }),
      this.prisma.platformAuditLog.count({ where: filterWhere }),
    ]);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const items = page.map((r) => ({
      id: r.id,
      actorUserId: r.actorUserId,
      actorName: r.actor.displayName,
      action: r.action,
      targetSchoolId: r.targetSchoolId,
      metadata: (r.metadata ?? null) as Record<string, unknown> | null,
      ip: r.ip,
      createdAt: r.createdAt.toISOString(),
    }));
    const last = page[page.length - 1];
    return {
      items,
      hasMore,
      nextCursor: hasMore && last ? encodeCreatedAtIdCursor(last) : null,
      total,
    };
  }
}

export interface PlatformAuditEntryDto {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetSchoolId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}
