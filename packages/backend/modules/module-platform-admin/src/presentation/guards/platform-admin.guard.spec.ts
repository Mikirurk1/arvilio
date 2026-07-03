import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { TenantContextService } from '@be/tenant';
import { PlatformAdminGuard } from './platform-admin.guard';

describe('PlatformAdminGuard', () => {
  const ctx = {
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;

  function makeGuard(platformRole: string | null, requiredRoles: string[] = []) {
    const tenant = { platformRole } as unknown as TenantContextService;
    const reflector = {
      getAllAndOverride: () => requiredRoles,
    } as unknown as Reflector;
    return new PlatformAdminGuard(tenant, reflector);
  }

  it('rejects non-operators (no platformRole)', () => {
    expect(() => makeGuard(null).canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows any operator when no specific role is required', () => {
    expect(makeGuard('PLATFORM_SUPPORT').canActivate(ctx)).toBe(true);
  });

  it('allows when the operator role is in the required set', () => {
    expect(makeGuard('PLATFORM_ADMIN', ['PLATFORM_ADMIN']).canActivate(ctx)).toBe(true);
  });

  it('rejects when the operator role is not in the required set', () => {
    expect(() => makeGuard('PLATFORM_SUPPORT', ['PLATFORM_ADMIN']).canActivate(ctx)).toThrow(
      ForbiddenException,
    );
  });
});
