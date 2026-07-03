import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PrismaService } from '@be/prisma';
import type { MailService } from '@be/mail';
import { SchoolSignupService, TRIAL_DAYS } from './school-signup.service';

describe('SchoolSignupService', () => {
  const tx = {
    school: { create: jest.fn() },
    user: { create: jest.fn() },
    schoolMembership: { create: jest.fn() },
    schoolSubscription: { create: jest.fn() },
    promoCode: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    promoRedemption: { create: jest.fn() },
  };
  const prisma = {
    user: { findUnique: jest.fn() },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const mail = {
    appUrl: jest.fn(() => 'https://app.test'),
    sendEmailVerification: jest.fn().mockResolvedValue(true),
  };
  const service = new SchoolSignupService(
    prisma as unknown as PrismaService,
    mail as unknown as MailService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(null);
    tx.school.create.mockResolvedValue({ id: 'school-1' });
    tx.user.create.mockResolvedValue({ id: 'user-1', email: 'admin@acme.test', displayName: 'Admin' });
    tx.schoolMembership.create.mockResolvedValue({});
    tx.schoolSubscription.create.mockResolvedValue({});
    mail.sendEmailVerification.mockResolvedValue(true);
  });

  it('provisions school + admin + ADMIN membership + TRIALING subscription', async () => {
    const result = await service.registerSchool({
      schoolName: 'Acme English',
      email: 'Admin@Acme.test',
      password: 'TestPass123!',
    });

    expect(tx.school.create).toHaveBeenCalledWith({
      data: { slug: 'acme-english', name: 'Acme English', status: 'TRIAL' },
    });
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'admin@acme.test',
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerifyToken: expect.any(String),
        }),
      }),
    );
    expect(tx.schoolMembership.create).toHaveBeenCalledWith({
      data: { schoolId: 'school-1', userId: 'user-1', role: 'ADMIN', status: 'ACTIVE' },
    });
    expect(tx.schoolSubscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ schoolId: 'school-1', status: 'TRIALING' }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({ userId: 'user-1', schoolId: 'school-1', slug: 'acme-english' }),
    );
    // ~7 days out
    const days = (result.trialEndsAt.getTime() - Date.now()) / 86_400_000;
    expect(Math.round(days)).toBe(TRIAL_DAYS);
    // Verification email should be sent fire-and-forget after the transaction
    await Promise.resolve(); // flush microtasks
    expect(mail.sendEmailVerification).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@acme.test', verifyUrl: expect.stringContaining('/auth/verify-email?token=') }),
    );
  });

  it('sends verification email without blocking signup when SMTP fails', async () => {
    mail.sendEmailVerification.mockRejectedValue(new Error('SMTP down'));
    const result = await service.registerSchool({
      schoolName: 'Acme English',
      email: 'admin@acme.test',
      password: 'TestPass123!',
    });
    expect(result.userId).toBe('user-1');
  });

  it('rejects a duplicate email before provisioning', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(
      service.registerSchool({ schoolName: 'X', email: 'a@b.test', password: 'TestPass123!' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a disposable email domain', async () => {
    await expect(
      service.registerSchool({ schoolName: 'X', email: 'a@mailinator.com', password: 'TestPass123!' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a short password and missing school name', async () => {
    await expect(
      service.registerSchool({ schoolName: 'X', email: 'a@b.test', password: 'short' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.registerSchool({ schoolName: '  ', email: 'a@b.test', password: 'TestPass123!' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('extends the trial when a valid promo code is redeemed', async () => {
    tx.promoCode.findUnique.mockResolvedValue({
      id: 'promo-1',
      code: 'LAUNCH14',
      active: true,
      trialDays: 14,
      maxRedemptions: 100,
      redeemedCount: 0,
      validFrom: null,
      validTo: null,
    });
    tx.promoCode.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.registerSchool({
      schoolName: 'Acme',
      email: 'a@b.test',
      password: 'TestPass123!',
      promoCode: ' launch14 ',
    });

    expect(tx.promoCode.findUnique).toHaveBeenCalledWith({ where: { code: 'LAUNCH14' } });
    expect(tx.promoCode.updateMany).toHaveBeenCalledWith({
      where: { id: 'promo-1', redeemedCount: { lt: 100 } },
      data: { redeemedCount: { increment: 1 } },
    });
    expect(tx.promoRedemption.create).toHaveBeenCalledWith({
      data: { promoCodeId: 'promo-1', schoolId: 'school-1' },
    });
    const days = (result.trialEndsAt.getTime() - Date.now()) / 86_400_000;
    expect(Math.round(days)).toBe(14);
  });

  it('rejects an unknown promo code', async () => {
    tx.promoCode.findUnique.mockResolvedValue(null);
    await expect(
      service.registerSchool({
        schoolName: 'Acme',
        email: 'a@b.test',
        password: 'TestPass123!',
        promoCode: 'NOPE',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a fully-redeemed promo code', async () => {
    tx.promoCode.findUnique.mockResolvedValue({
      id: 'promo-1',
      code: 'MAXED',
      active: true,
      trialDays: 14,
      maxRedemptions: 5,
      redeemedCount: 5,
      validFrom: null,
      validTo: null,
    });
    tx.promoCode.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.registerSchool({
        schoolName: 'Acme',
        email: 'a@b.test',
        password: 'TestPass123!',
        promoCode: 'MAXED',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retries with a suffix on slug collision', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'x',
      meta: { target: ['slug'] },
    });
    tx.school.create.mockRejectedValueOnce(p2002).mockResolvedValueOnce({ id: 'school-2' });

    const result = await service.registerSchool({
      schoolName: 'Acme',
      email: 'a@b.test',
      password: 'TestPass123!',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(result.slug).toMatch(/^acme-/);
    expect(result.schoolId).toBe('school-2');
  });

  it('retries on a Prisma 7 driver-adapter shaped slug collision (no meta.target)', async () => {
    // pg driver adapter reports the constraint under meta.driverAdapterError,
    // and the error may be re-wrapped so it is not a PrismaClientKnownRequestError.
    const p2002 = Object.assign(new Error('dup'), {
      code: 'P2002',
      meta: {
        modelName: 'School',
        driverAdapterError: { cause: { constraint: { fields: ['slug'] } } },
      },
    });
    tx.school.create.mockRejectedValueOnce(p2002).mockResolvedValueOnce({ id: 'school-3' });

    const result = await service.registerSchool({
      schoolName: 'Acme',
      email: 'a2@b.test',
      password: 'TestPass123!',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(result.slug).toMatch(/^acme-/);
    expect(result.schoolId).toBe('school-3');
  });
});
