import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import type { TenantContextService } from '@be/tenant';
import type { InvitationsService } from './invitations.service';
import type { SampleContentService } from './sample-content.service';
import { SchoolOnboardingService } from './school-onboarding.service';

describe('SchoolOnboardingService', () => {
  const prisma = {
    school: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
  };
  const tenant = {
    requireSchoolId: jest.fn(() => 'school-1'),
    membershipRole: 'ADMIN' as 'ADMIN' | 'TEACHER' | 'STUDENT' | null,
    userId: 'user-admin',
  };
  const invitations = { create: jest.fn().mockResolvedValue({}) };
  const sampleContent = { seed: jest.fn().mockResolvedValue({ created: 3 }) };
  const paymentSettings = {
    getPaymentSettings: jest.fn().mockResolvedValue({ enabledMethods: [], config: { packages: [], manualInvoiceMethods: [], minPackageLessons: 1 } }),
    updatePaymentSettings: jest.fn().mockResolvedValue({}),
  };
  const service = new SchoolOnboardingService(
    prisma as unknown as PrismaService,
    tenant as unknown as TenantContextService,
    invitations as unknown as InvitationsService,
    sampleContent as unknown as SampleContentService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentSettings as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    tenant.membershipRole = 'ADMIN';
  });

  it('returns an empty default state when none is stored', async () => {
    prisma.school.findUnique.mockResolvedValue({ onboardingState: null });
    expect(await service.getState()).toEqual({ completed: false, currentStep: null, steps: {} });
  });

  it('merges a step write idempotently and tracks currentStep', async () => {
    prisma.school.findUnique.mockResolvedValue({
      onboardingState: { completed: false, currentStep: 'profile', steps: { profile: { name: 'A' } } },
    });
    prisma.school.update.mockResolvedValue({});

    const next = await service.saveStep('teaching', { languages: ['en'] });

    expect(next.currentStep).toBe('teaching');
    expect(next.steps).toEqual({ profile: { name: 'A' }, teaching: { languages: ['en'] } });
    expect(prisma.school.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'school-1' } }),
    );
  });

  it('rejects an unknown step', async () => {
    prisma.school.findUnique.mockResolvedValue({ onboardingState: null });
    await expect(service.saveStep('bogus', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forbids non-admins from writing', async () => {
    tenant.membershipRole = 'TEACHER';
    await expect(service.saveStep('profile', {})).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.complete()).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('marks onboarding complete', async () => {
    prisma.school.findUnique.mockResolvedValue({
      onboardingState: { completed: false, currentStep: 'sample-content', steps: {} },
    });
    prisma.school.update.mockResolvedValue({});
    const next = await service.complete();
    expect(next.completed).toBe(true);
    expect(next.currentStep).toBeNull();
  });

  describe('invite step side-effects', () => {
    beforeEach(() => {
      prisma.school.findUnique.mockResolvedValue({ onboardingState: null });
      prisma.school.update.mockResolvedValue({});
      jest.clearAllMocks();
      invitations.create.mockResolvedValue({});
      // Default: admin email is verified
      prisma.user.findUnique.mockResolvedValue({ emailVerifiedAt: new Date() });
    });

    it('dispatches invitations for each valid email', async () => {
      await service.saveStep('invite', { emails: 'a@x.com\nb@x.com' });
      // fire-and-forget — wait for microtasks
      await Promise.resolve();
      expect(invitations.create).toHaveBeenCalledTimes(2);
      expect(invitations.create).toHaveBeenCalledWith({ email: 'a@x.com', role: 'TEACHER' }, 'user-admin');
      expect(invitations.create).toHaveBeenCalledWith({ email: 'b@x.com', role: 'TEACHER' }, 'user-admin');
    });

    it('silently skips malformed email lines', async () => {
      await service.saveStep('invite', { emails: 'good@x.com\nnot-an-email\n' });
      await Promise.resolve();
      expect(invitations.create).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch when emails field is empty', async () => {
      await service.saveStep('invite', { emails: '' });
      await Promise.resolve();
      expect(invitations.create).not.toHaveBeenCalled();
    });

    it('does not dispatch on non-invite steps', async () => {
      await service.saveStep('profile', { name: 'My School' });
      await Promise.resolve();
      expect(invitations.create).not.toHaveBeenCalled();
    });

    it('skips dispatch when admin email is not verified', async () => {
      prisma.user.findUnique.mockResolvedValue({ emailVerifiedAt: null });
      await service.saveStep('invite', { emails: 'a@x.com' });
      await Promise.resolve();
      expect(invitations.create).not.toHaveBeenCalled();
    });

    it('continues even if one invite throws', async () => {
      invitations.create
        .mockRejectedValueOnce(new Error('already member'))
        .mockResolvedValueOnce({});
      await service.saveStep('invite', { emails: 'a@x.com\nb@x.com' });
      await Promise.resolve();
      expect(invitations.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('sample-content step side-effects', () => {
    beforeEach(() => {
      prisma.school.findUnique.mockResolvedValue({ onboardingState: null });
      prisma.school.update.mockResolvedValue({});
      jest.clearAllMocks();
      sampleContent.seed.mockResolvedValue({ created: 3 });
      prisma.user.findUnique.mockResolvedValue({ emailVerifiedAt: new Date() });
    });

    it('seeds sample content when seed=yes', async () => {
      await service.saveStep('sample-content', { seed: 'yes' });
      await Promise.resolve();
      expect(sampleContent.seed).toHaveBeenCalledWith('school-1', 'user-admin');
    });

    it('does not seed when seed=no', async () => {
      await service.saveStep('sample-content', { seed: 'no' });
      await Promise.resolve();
      expect(sampleContent.seed).not.toHaveBeenCalled();
    });

    it('seeds by default when seed field is absent', async () => {
      await service.saveStep('sample-content', {});
      await Promise.resolve();
      expect(sampleContent.seed).toHaveBeenCalled();
    });

    it('does not seed on other steps', async () => {
      await service.saveStep('teaching', { languages: ['en'] });
      await Promise.resolve();
      expect(sampleContent.seed).not.toHaveBeenCalled();
    });
  });
});
