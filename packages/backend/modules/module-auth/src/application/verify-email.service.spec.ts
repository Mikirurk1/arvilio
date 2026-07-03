import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import type { TenantContextService } from '@be/tenant';
import type { MailService } from '@be/mail';
import type { EntitlementsService } from '@be/billing/entitlements';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';
import { LanguagesService } from './languages.service';

describe('AuthService.verifyEmail', () => {
  const prisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
  };

  const service = new AuthService(
    prisma as unknown as PrismaService,
    {} as unknown as TenantContextService,
    {} as unknown as AuthSessionService,
    {} as unknown as MailService,
    {} as unknown as LanguagesService,
    {} as unknown as EntitlementsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('sets emailVerifiedAt and clears token on valid token', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.user.update.mockResolvedValue({});

    const result = await service.verifyEmail('valid-token-abc');

    expect(result).toEqual({ ok: true });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { emailVerifyToken: 'valid-token-abc' },
      select: { id: true },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { emailVerifiedAt: expect.any(Date), emailVerifyToken: null },
    });
  });

  it('throws on unknown token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.verifyEmail('bad-token')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('throws on empty token', async () => {
    await expect(service.verifyEmail('')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
