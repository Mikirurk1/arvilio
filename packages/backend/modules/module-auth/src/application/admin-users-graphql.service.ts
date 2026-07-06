import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import type { UserRoleName } from '../shared/auth-user-map.util';

export type AdminActor = { id: string; role: UserRoleName };

@Injectable()
export class AdminUsersGraphqlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {}

  /**
   * Restrict a user query to the active tenant. `User` is a global identity (not
   * row-scoped by schoolId), so isolation is enforced via an ACTIVE
   * `SchoolMembership` in the current school. Without this, a school admin's
   * "Accounts overview" would list every account on the platform.
   */
  private tenantMemberFilter(): Prisma.UserWhereInput {
    const schoolId = this.tenant.schoolId;
    if (!schoolId) return {};
    return { schoolMemberships: { some: { schoolId, status: 'ACTIVE' } } };
  }

  async assertAdmin(userId: string): Promise<AdminActor> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!actor) throw new UnauthorizedException();
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can manage accounts');
    }
    return { id: actor.id, role: actor.role };
  }

  async listAdminUserSummaries(actorUserId: string) {
    const actor = await this.assertAdmin(actorUserId);
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          actor.role === 'ADMIN'
            ? { role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] } }
            : { role: { not: 'SUPER_ADMIN' } },
          this.tenantMemberFilter(),
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return users.map((user) => ({
      ...user,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
    }));
  }
}
