import { BadRequestException, ForbiddenException } from '@nestjs/common';

jest.mock('@be/billing', () => ({
  PaymentSettingsService: class PaymentSettingsService {},
}));

import type { PrismaService } from '@be/prisma';
import type { TenantContextService } from '@be/tenant';
import type { InvitationsService } from './invitations.service';
import type { SampleContentService } from './sample-content.service';
import type { SchoolBrandingService } from './school-branding.service';
import type { SchoolLocaleService } from './school-locale.service';
import type { SchoolTeachingPrefsService } from './school-teaching-prefs.service';
import { SchoolOnboardingService } from './school-onboarding.service';

describe('SchoolOnboardingService', () => {
  const prisma = {
    school: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
  };
  const tenant = {
    requireSchoolId: jest.fn(() => 'school-1'),
    membershipRole: 'ADMIN' as 'ADMIN' | 'TEACHER' | 'STUDENT' | null,
    userId: 'user-admin',
  };
  const invitations = { create: jest.fn().mockResolvedValue({}) };
  const sampleContent = { seed: jest.fn().mockResolvedValue({ created: 3 }) };
  const paymentSettings = {
    getPaymentSettings: jest.fn().mockResolvedValue({
      enabledMethods: [],
      config: { packages: [], manualInvoiceMethods: [], minPackageLessons: 1 },
    }),
    updatePaymentSettings: jest.fn().mockResolvedValue({}),
  };
  const branding = { update: jest.fn().mockResolvedValue({ brandColor: '#336699', logoUrl: null }) };
  const schoolLocale = {
    get: jest.fn().mockResolvedValue({ defaultLocale: 'en', enabledLocales: ['en'] }),
    update: jest.fn().mockResolvedValue({ defaultLocale: 'uk', enabledLocales: ['en', 'uk'] }),
  };
  const teachingPrefs = {
    update: jest.fn().mockResolvedValue({ languages: [], lessonFormat: 'online' }),
  };
  const service = new SchoolOnboardingService(
    prisma as unknown as PrismaService,
    tenant as unknown as TenantContextService,
    invitations as unknown as InvitationsService,
    sampleContent as unknown as SampleContentService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentSettings as any,
    branding as unknown as SchoolBrandingService,
    schoolLocale as unknown as SchoolLocaleService,
    teachingPrefs as unknown as SchoolTeachingPrefsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    tenant.membershipRole = 'ADMIN';
    prisma.school.findUnique.mockResolvedValue({ onboardingState: null });
    prisma.school.update.mockResolvedValue({});
    prisma.user.findUnique.mockResolvedValue({ emailVerifiedAt: new Date() });
    prisma.user.update.mockResolvedValue({});
    schoolLocale.get.mockResolvedValue({ defaultLocale: 'en', enabledLocales: ['en'] });
  });

  it('returns an empty default state when none is stored', async () => {
    expect(await service.getState()).toEqual({ completed: false, currentStep: null, steps: {} });
  });

  it('merges a step write idempotently and tracks currentStep', async () => {
    prisma.school.findUnique.mockResolvedValue({
      onboardingState: { completed: false, currentStep: 'profile', steps: { profile: { name: 'A' } } },
    });

    const next = await service.saveStep('teaching', { languages: ['en'] });

    expect(next.currentStep).toBe('teaching');
    expect(next.steps).toEqual({ profile: { name: 'A' }, teaching: { languages: ['en'] } });
    expect(prisma.school.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'school-1' } }),
    );
  });

  it('rejects an unknown step', async () => {
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
    const next = await service.complete();
    expect(next.completed).toBe(true);
    expect(next.currentStep).toBeNull();
  });

  describe('profile step side-effects', () => {
    it('applies accent color, locale, and admin timezone', async () => {
      await service.saveStep('profile', {
        accentColor: '#336699',
        locale: 'uk',
        timezone: 'Europe/Kyiv',
      });

      expect(branding.update).toHaveBeenCalledWith('school-1', { brandColor: '#336699' });
      expect(schoolLocale.update).toHaveBeenCalledWith('school-1', {
        defaultLocale: 'uk',
        enabledLocales: ['en', 'uk'],
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-admin' },
        data: { timezone: 'Europe/Kyiv' },
      });
    });

    it('no-ops empty profile fields', async () => {
      await service.saveStep('profile', { accentColor: '  ', locale: '', timezone: '' });
      expect(branding.update).not.toHaveBeenCalled();
      expect(schoolLocale.update).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('teaching step side-effects', () => {
    it('writes teachingPrefs via SchoolTeachingPrefsService', async () => {
      await service.saveStep('teaching', {
        languages: 'English, Ukrainian',
        lessonFormat: 'hybrid',
      });

      expect(teachingPrefs.update).toHaveBeenCalledWith('school-1', {
        languages: ['English', 'Ukrainian'],
        lessonFormat: 'hybrid',
      });
    });

    it('defaults lessonFormat to online when missing/invalid', async () => {
      await service.saveStep('teaching', { languages: '', lessonFormat: 'bogus' });
      expect(teachingPrefs.update).toHaveBeenCalledWith('school-1', {
        languages: [],
        lessonFormat: 'online',
      });
    });
  });

  describe('payments step side-effects', () => {
    it('updates enabled payment methods and preserves config', async () => {
      await service.saveStep('payments', { methods: ['stripe', 'manual_invoice'] });
      expect(paymentSettings.getPaymentSettings).toHaveBeenCalled();
      expect(paymentSettings.updatePaymentSettings).toHaveBeenCalledWith({
        enabledMethods: ['stripe', 'manual_invoice'],
        config: { packages: [], manualInvoiceMethods: [], minPackageLessons: 1 },
      });
    });

    it('does nothing when methods are empty', async () => {
      await service.saveStep('payments', { methods: [] });
      expect(paymentSettings.updatePaymentSettings).not.toHaveBeenCalled();
    });
  });

  describe('invite step side-effects', () => {
    beforeEach(() => {
      invitations.create.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ emailVerifiedAt: new Date() });
    });

    it('dispatches invitations for each valid email', async () => {
      await service.saveStep('invite', { emails: 'a@x.com\nb@x.com' });
      expect(invitations.create).toHaveBeenCalledTimes(2);
      expect(invitations.create).toHaveBeenCalledWith({ email: 'a@x.com', role: 'TEACHER' }, 'user-admin');
      expect(invitations.create).toHaveBeenCalledWith({ email: 'b@x.com', role: 'TEACHER' }, 'user-admin');
    });

    it('silently skips malformed email lines', async () => {
      await service.saveStep('invite', { emails: 'good@x.com\nnot-an-email\n' });
      expect(invitations.create).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch when emails field is empty', async () => {
      await service.saveStep('invite', { emails: '' });
      expect(invitations.create).not.toHaveBeenCalled();
    });

    it('does not dispatch on non-invite steps', async () => {
      await service.saveStep('teaching', { languages: ['en'] });
      expect(invitations.create).not.toHaveBeenCalled();
    });

    it('rejects when admin email is not verified and emails are provided', async () => {
      prisma.user.findUnique.mockResolvedValue({ emailVerifiedAt: null });
      await expect(service.saveStep('invite', { emails: 'a@x.com' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(invitations.create).not.toHaveBeenCalled();
    });

    it('continues even if one invite throws', async () => {
      invitations.create
        .mockRejectedValueOnce(new Error('already member'))
        .mockResolvedValueOnce({});
      await service.saveStep('invite', { emails: 'a@x.com\nb@x.com' });
      expect(invitations.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('sample-content step side-effects', () => {
    beforeEach(() => {
      sampleContent.seed.mockResolvedValue({ created: 3 });
    });

    it('seeds sample content when seed=yes', async () => {
      await service.saveStep('sample-content', { seed: 'yes' });
      expect(sampleContent.seed).toHaveBeenCalledWith('school-1', 'user-admin');
    });

    it('does not seed when seed=no', async () => {
      await service.saveStep('sample-content', { seed: 'no' });
      expect(sampleContent.seed).not.toHaveBeenCalled();
    });

    it('seeds by default when seed field is absent', async () => {
      await service.saveStep('sample-content', {});
      expect(sampleContent.seed).toHaveBeenCalled();
    });

    it('does not seed on other steps', async () => {
      await service.saveStep('teaching', { languages: ['en'] });
      expect(sampleContent.seed).not.toHaveBeenCalled();
    });
  });
});
