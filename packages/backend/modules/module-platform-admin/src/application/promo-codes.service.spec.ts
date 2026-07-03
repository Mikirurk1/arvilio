import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PrismaService } from '@be/prisma';
import type { PlatformAuditService } from './platform-audit.service';
import { PromoCodesService } from './promo-codes.service';

describe('PromoCodesService', () => {
  const prisma = {
    promoCode: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  };
  const audit = { record: jest.fn() } as unknown as PlatformAuditService;
  const service = new PromoCodesService(prisma as unknown as PrismaService, audit);

  const trialRow = {
    id: 'p1',
    code: 'LAUNCH14',
    kind: 'TRIAL_EXTENSION',
    trialDays: 14,
    discountPercent: null,
    discountFixed: null,
    discountCurrency: null,
    maxRedemptions: 100,
    redeemedCount: 3,
    validFrom: null,
    validTo: null,
    active: true,
    createdAt: new Date('2026-06-01T00:00:00Z'),
    updatedAt: new Date('2026-06-01T00:00:00Z'),
  };

  beforeEach(() => jest.clearAllMocks());

  it('creates a TRIAL_EXTENSION code and audits it', async () => {
    prisma.promoCode.create.mockResolvedValue(trialRow);
    const dto = await service.create(
      { kind: 'TRIAL_EXTENSION', code: ' launch14 ', trialDays: 14, maxRedemptions: 100 },
      '1.2.3.4',
    );
    expect(prisma.promoCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'LAUNCH14', trialDays: 14, kind: 'TRIAL_EXTENSION' }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'platform.promo_code.create' }),
    );
    expect(dto.code).toBe('LAUNCH14');
    expect(dto.createdAt).toBe('2026-06-01T00:00:00.000Z');
  });

  it('creates a PERCENT_OFF code', async () => {
    const row = { ...trialRow, code: 'SAVE20', kind: 'PERCENT_OFF', trialDays: null, discountPercent: 20 };
    prisma.promoCode.create.mockResolvedValue(row);
    const dto = await service.create({ kind: 'PERCENT_OFF', code: 'save20', discountPercent: 20 });
    expect(prisma.promoCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'SAVE20', kind: 'PERCENT_OFF', discountPercent: 20, trialDays: null }),
      }),
    );
    expect(dto.discountPercent).toBe(20);
  });

  it('creates a FIXED_OFF code', async () => {
    const row = { ...trialRow, code: 'FIXED50', kind: 'FIXED_OFF', trialDays: null, discountFixed: 5000, discountCurrency: 'usd' };
    prisma.promoCode.create.mockResolvedValue(row);
    const dto = await service.create({
      kind: 'FIXED_OFF', code: 'fixed50', discountFixed: 5000, discountCurrency: 'USD',
    });
    expect(prisma.promoCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: 'FIXED_OFF', discountFixed: 5000, discountCurrency: 'usd' }),
      }),
    );
    expect(dto.discountFixed).toBe(5000);
  });

  it('rejects invalid trialDays for TRIAL_EXTENSION', async () => {
    await expect(
      service.create({ kind: 'TRIAL_EXTENSION', code: 'X', trialDays: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects out-of-range discountPercent', async () => {
    await expect(
      service.create({ kind: 'PERCENT_OFF', code: 'Y', discountPercent: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create({ kind: 'PERCENT_OFF', code: 'Z', discountPercent: 101 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects FIXED_OFF without currency', async () => {
    await expect(
      service.create({ kind: 'FIXED_OFF', code: 'W', discountFixed: 1000, discountCurrency: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps a duplicate-code constraint error to 400', async () => {
    prisma.promoCode.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }),
    );
    await expect(
      service.create({ kind: 'TRIAL_EXTENSION', code: 'DUP', trialDays: 7 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('disables a code and audits it', async () => {
    prisma.promoCode.findUnique.mockResolvedValue(trialRow);
    prisma.promoCode.update.mockResolvedValue({ ...trialRow, active: false });
    const dto = await service.setActive('p1', false);
    expect(prisma.promoCode.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { active: false },
    });
    expect(dto.active).toBe(false);
  });

  it('throws when disabling a missing code', async () => {
    prisma.promoCode.findUnique.mockResolvedValue(null);
    await expect(service.setActive('missing', false)).rejects.toBeInstanceOf(NotFoundException);
  });
});
