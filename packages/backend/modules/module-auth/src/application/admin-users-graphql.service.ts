import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { UserRoleName } from '../shared/auth-user-map.util';

export type AdminActor = { id: string; role: UserRoleName };

@Injectable()
export class AdminUsersGraphqlService {
  constructor(private readonly prisma: PrismaService) {}

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
      where:
        actor.role === 'ADMIN'
          ? { role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] } }
          : { role: { not: 'SUPER_ADMIN' } },
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
