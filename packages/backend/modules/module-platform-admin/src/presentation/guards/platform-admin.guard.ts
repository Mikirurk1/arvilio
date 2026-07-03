import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService, type PlatformRole } from '@be/tenant';

/** Restrict a handler/controller to specific platform roles (empty = any operator). */
export const PLATFORM_ROLES_KEY = 'platformRoles';
export const PlatformAdmin = (...roles: PlatformRole[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);

/**
 * Allows the request only for platform operators (ADR-008/009). Reads the
 * `platformRole` seeded into the CLS tenant context by the auth guard, so it must
 * run AFTER `AuthGuard`: `@UseGuards(AuthGuard, PlatformAdminGuard)`.
 *
 * Platform-operator status is the single source of truth — independent of school
 * `User.role`. Optionally narrows to specific roles via `@PlatformAdmin(...)`.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(
    private readonly tenant: TenantContextService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.tenant.platformRole;
    if (!role) throw new ForbiddenException('Platform operator access required');

    const required =
      this.reflector.getAllAndOverride<PlatformRole[]>(PLATFORM_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (required.length > 0 && !required.includes(role)) {
      throw new ForbiddenException('Insufficient platform role');
    }
    return true;
  }
}
