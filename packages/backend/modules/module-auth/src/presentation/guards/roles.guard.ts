import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '@be/tenant';
import { PrismaService } from '@be/prisma';
import { getReqRes } from '../../shared/auth-request.util';
import type { AuthenticatedRequest } from './auth.guard';
import { ROLES_KEY, type RoleName } from './roles.decorator';

/**
 * Maps the CLS `membershipRole` ('STUDENT' | 'TEACHER' | 'ADMIN') to the set of
 * legacy `@Roles()` names it satisfies.
 *
 * ADR-006: authorization is read from SchoolMembership.role (now in CLS), not
 * from `User.role`. SUPER_ADMIN in the old schema is equivalent to ADMIN here.
 * We fall back to a DB lookup only when the tenant context is not active (e.g.
 * platform-operator requests that bypass school context).
 */
const MEMBERSHIP_ROLE_SATISFIES: Record<string, RoleName[]> = {
  STUDENT: ['STUDENT'],
  TEACHER: ['TEACHER', 'STUDENT'],
  ADMIN: ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenant: TenantContextService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { req } = getReqRes(context);
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) throw new UnauthorizedException();

    // Fast path: read from CLS (set by AuthGuard via seedTenantContext).
    const membershipRole = this.tenant.membershipRole;
    if (membershipRole) {
      const satisfies = MEMBERSHIP_ROLE_SATISFIES[membershipRole] ?? [];
      if (required.some((r) => satisfies.includes(r))) return true;
      throw new ForbiddenException('Insufficient role for this action');
    }

    // Fallback: no tenant context (e.g. platform-operator scope) — use User.role.
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !required.includes(user.role as RoleName)) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return true;
  }
}
