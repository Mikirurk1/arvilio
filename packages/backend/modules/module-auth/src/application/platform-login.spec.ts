import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService.platformLogin', () => {
  const password = 'StrongPass!23';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(password, 4);
  });

  function build(overrides?: {
    user?: { id: string; email: string; passwordHash: string | null; status: string } | null;
    platformRole?: string | null;
  }) {
    const user =
      overrides && 'user' in overrides
        ? overrides.user
        : {
            id: 'user-1',
            email: 'ops@example.com',
            passwordHash,
            status: 'ACTIVE',
            oauthAccounts: [],
          };

    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
      },
      platformAuditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const sessionAuth = {
      resolvePlatformRole: jest.fn().mockResolvedValue(
        overrides?.platformRole === undefined ? 'PLATFORM_ADMIN' : overrides.platformRole,
      ),
    };
    const service = new AuthService(
      prisma as never,
      {} as never,
      sessionAuth as never,
      {} as never,
      {} as never,
      {} as never,
    );
    return { service, prisma, sessionAuth };
  }

  it('returns the user when credentials and PlatformOperator are valid', async () => {
    const { service, prisma } = build();
    const user = await service.platformLogin(
      { email: 'ops@example.com', password },
      { ip: '127.0.0.1' },
    );
    expect(user.id).toBe('user-1');
    expect(prisma.platformAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorUserId: 'user-1',
          action: 'platform.auth.login',
          metadata: { ok: true, role: 'PLATFORM_ADMIN' },
        }),
      }),
    );
  });

  it('rejects non-operators with neutral Invalid credentials', async () => {
    const { service, prisma } = build({ platformRole: null });
    await expect(
      service.platformLogin({ email: 'ops@example.com', password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.platformAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'platform.auth.login',
          metadata: { ok: false, reason: 'denied' },
        }),
      }),
    );
  });

  it('rejects unknown email without auditing a user id', async () => {
    const { service, prisma } = build({ user: null });
    await expect(
      service.platformLogin({ email: 'nobody@example.com', password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.platformAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects wrong password', async () => {
    const { service } = build();
    await expect(
      service.platformLogin({ email: 'ops@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
