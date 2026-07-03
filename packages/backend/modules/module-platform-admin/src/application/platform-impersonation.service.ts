import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import { AuthSessionService } from '@be/auth';
import { PlatformAuditService } from './platform-audit.service';

/**
 * Platform-operator impersonation (Phase 4 / Gate 4, ADR-009). Mints a short-lived
 * impersonation access token for a target school user and records the action in the
 * platform audit log. Cross-tenant membership lookups use the base PrismaService:
 * the operator has no tenant context, and this establishes the impersonated tenant.
 */
@Injectable()
export class PlatformImpersonationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionAuth: AuthSessionService,
    private readonly audit: PlatformAuditService,
  ) {}

  async start(params: {
    schoolId: string;
    actorUserId: string;
    targetUserId?: string;
    ip?: string | null;
  }): Promise<{ accessToken: string; targetUserId: string; expiresInSeconds: number }> {
    const school = await this.prisma.school.findUnique({
      where: { id: params.schoolId },
      select: { id: true },
    });
    if (!school) throw new NotFoundException('School not found');

    let targetUserId = params.targetUserId;
    if (targetUserId) {
      const membership = await this.prisma.schoolMembership.findFirst({
        where: { schoolId: params.schoolId, userId: targetUserId, status: 'ACTIVE' },
        select: { userId: true },
      });
      if (!membership) {
        throw new NotFoundException('Target user is not an active member of this school');
      }
    } else {
      // Default target: the school's first active admin.
      const admin = await this.prisma.schoolMembership.findFirst({
        where: { schoolId: params.schoolId, status: 'ACTIVE', role: 'ADMIN' },
        select: { userId: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!admin) throw new NotFoundException('School has no active admin to impersonate');
      targetUserId = admin.userId;
    }

    const minted = this.sessionAuth.mintImpersonationAccessToken({
      targetUserId,
      actorUserId: params.actorUserId,
      schoolId: params.schoolId,
    });
    await this.audit.record({
      action: 'school.impersonate',
      targetSchoolId: params.schoolId,
      metadata: { targetUserId },
      ip: params.ip ?? null,
    });
    return {
      accessToken: minted.accessToken,
      targetUserId,
      expiresInSeconds: minted.expiresInSeconds,
    };
  }
}
