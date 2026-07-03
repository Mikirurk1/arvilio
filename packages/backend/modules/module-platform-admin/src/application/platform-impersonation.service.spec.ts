import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import type { AuthSessionService } from '@be/auth';
import type { PlatformAuditService } from './platform-audit.service';
import { PlatformImpersonationService } from './platform-impersonation.service';

describe('PlatformImpersonationService', () => {
  const prisma = {
    school: { findUnique: jest.fn() },
    schoolMembership: { findFirst: jest.fn() },
  };
  const sessionAuth = {
    mintImpersonationAccessToken: jest.fn(),
  } as unknown as AuthSessionService;
  const audit = { record: jest.fn() } as unknown as PlatformAuditService;
  const service = new PlatformImpersonationService(
    prisma as unknown as PrismaService,
    sessionAuth,
    audit,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (sessionAuth.mintImpersonationAccessToken as jest.Mock).mockReturnValue({
      accessToken: 'tok',
      expiresInSeconds: 900,
    });
  });

  it('throws when the school does not exist', async () => {
    prisma.school.findUnique.mockResolvedValue(null);
    await expect(
      service.start({ schoolId: 'missing', actorUserId: 'op-1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('impersonates the first active admin by default and audits the action', async () => {
    prisma.school.findUnique.mockResolvedValue({ id: 's1' });
    prisma.schoolMembership.findFirst.mockResolvedValue({ userId: 'admin-1' });

    const result = await service.start({ schoolId: 's1', actorUserId: 'op-1', ip: '1.2.3.4' });

    expect(prisma.schoolMembership.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { schoolId: 's1', status: 'ACTIVE', role: 'ADMIN' } }),
    );
    expect(sessionAuth.mintImpersonationAccessToken).toHaveBeenCalledWith({
      targetUserId: 'admin-1',
      actorUserId: 'op-1',
      schoolId: 's1',
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'school.impersonate',
      targetSchoolId: 's1',
      metadata: { targetUserId: 'admin-1' },
      ip: '1.2.3.4',
    });
    expect(result).toEqual({ accessToken: 'tok', targetUserId: 'admin-1', expiresInSeconds: 900 });
  });

  it('throws when the school has no active admin', async () => {
    prisma.school.findUnique.mockResolvedValue({ id: 's1' });
    prisma.schoolMembership.findFirst.mockResolvedValue(null);
    await expect(service.start({ schoolId: 's1', actorUserId: 'op-1' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('validates an explicit target is an active member', async () => {
    prisma.school.findUnique.mockResolvedValue({ id: 's1' });
    prisma.schoolMembership.findFirst.mockResolvedValue(null);
    await expect(
      service.start({ schoolId: 's1', actorUserId: 'op-1', targetUserId: 'stranger' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.schoolMembership.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { schoolId: 's1', userId: 'stranger', status: 'ACTIVE' },
      }),
    );
  });
});
