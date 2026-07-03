import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '@be/tenant';
import { PrismaService } from '@be/prisma';
import { RolesGuard } from './roles.guard';

function makeContext(userId: string | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: userId ? { id: userId } : undefined }),
      getResponse: () => ({}),
    }),
    switchToWs: () => ({}),
    switchToRpc: () => ({}),
    getType: () => 'http',
    getArgs: () => [],
    getArgByIndex: () => undefined,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const prisma = { user: { findUnique: jest.fn() } } as unknown as PrismaService;
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  let tenant: { membershipRole: string | null };
  let guard: RolesGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    tenant = { membershipRole: null };
    guard = new RolesGuard(reflector, tenant as unknown as TenantContextService, prisma);
  });

  it('passes when no roles required', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
    await expect(guard.canActivate(makeContext('u1'))).resolves.toBe(true);
  });

  it('allows ADMIN membership for SUPER_ADMIN role requirement', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['SUPER_ADMIN']);
    tenant.membershipRole = 'ADMIN';
    await expect(guard.canActivate(makeContext('u1'))).resolves.toBe(true);
  });

  it('allows ADMIN membership for TEACHER role requirement', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['TEACHER']);
    tenant.membershipRole = 'ADMIN';
    await expect(guard.canActivate(makeContext('u1'))).resolves.toBe(true);
  });

  it('denies TEACHER for ADMIN role requirement', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    tenant.membershipRole = 'TEACHER';
    await expect(guard.canActivate(makeContext('u1'))).rejects.toThrow('Insufficient role');
  });

  it('denies STUDENT for TEACHER role requirement', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['TEACHER']);
    tenant.membershipRole = 'STUDENT';
    await expect(guard.canActivate(makeContext('u1'))).rejects.toThrow('Insufficient role');
  });

  it('falls back to DB when no tenant context', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    tenant.membershipRole = null;
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'ADMIN' });
    await expect(guard.canActivate(makeContext('u1'))).resolves.toBe(true);
  });

  it('denies via DB fallback when role does not match', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    tenant.membershipRole = null;
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'STUDENT' });
    await expect(guard.canActivate(makeContext('u1'))).rejects.toThrow('Insufficient role');
  });
});
