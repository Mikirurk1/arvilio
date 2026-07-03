import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';

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
  async list(params?: { targetSchoolId?: string; limit?: number }): Promise<PlatformAuditEntryDto[]> {
    const limit = Math.min(Math.max(params?.limit ?? 50, 1), 200);
    const rows = await this.prisma.platformAuditLog.findMany({
      where: params?.targetSchoolId ? { targetSchoolId: params.targetSchoolId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { displayName: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      actorUserId: r.actorUserId,
      actorName: r.actor.displayName,
      action: r.action,
      targetSchoolId: r.targetSchoolId,
      metadata: (r.metadata ?? null) as Record<string, unknown> | null,
      ip: r.ip,
      createdAt: r.createdAt.toISOString(),
    }));
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
