import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import { PlatformBillingRailsService } from './platform-billing-rails.service';

describe('PlatformBillingRailsService', () => {
  const prisma = {
    platformSettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const service = new PlatformBillingRailsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.platformSettings.findUnique.mockResolvedValue(null);
    prisma.platformSettings.upsert.mockResolvedValue({});
  });

  it('getRails returns catalog rails with stripe default enabled', async () => {
    const dto = await service.getRails();
    expect(dto.defaultRailId).toBe('stripe_platform');
    expect(dto.rails.map((r) => r.id)).toEqual(
      expect.arrayContaining(['stripe_platform', 'liqpay_platform']),
    );
    const stripe = dto.rails.find((r) => r.id === 'stripe_platform');
    expect(stripe?.enabled).toBe(true);
  });

  it('setRails rejects unknown rail id', async () => {
    await expect(
      service.setRails({ rails: [{ id: 'not_a_rail', enabled: true }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.platformSettings.upsert).not.toHaveBeenCalled();
  });

  it('setRails persists enabled flag via upsert', async () => {
    await service.setRails({
      defaultRailId: 'stripe_platform',
      rails: [{ id: 'stripe_platform', enabled: true, config: {} }],
    });
    expect(prisma.platformSettings.upsert).toHaveBeenCalled();
    const arg = prisma.platformSettings.upsert.mock.calls[0][0];
    expect(arg.update.platformBillingConfig.defaultRailId).toBe('stripe_platform');
    expect(arg.update.platformBillingConfig.rails.stripe_platform.enabled).toBe(true);
  });

  it('getCampusSubscription includes availableRails for enabled configured rails', async () => {
    const dto = await service.getCampusSubscription();
    expect(dto.default.railId).toBeTruthy();
    expect(Array.isArray(dto.availableRails)).toBe(true);
    expect(Array.isArray(dto.countryOverrides)).toBe(true);
  });

  it('testRail rejects unknown id', async () => {
    await expect(service.testRail('nope')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('testRail returns not configured when secrets missing', async () => {
    const result = await service.testRail('liqpay_platform');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/not configured/i);
  });
});
