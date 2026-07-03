import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import type { PlatformAuditService } from './platform-audit.service';
import { PlatformPaymentMethodsService } from './platform-payment-methods.service';

describe('PlatformPaymentMethodsService', () => {
  const prisma = {
    platformSettings: { findUnique: jest.fn(), upsert: jest.fn() },
  };
  const audit = { record: jest.fn() } as unknown as PlatformAuditService;
  const service = new PlatformPaymentMethodsService(prisma as unknown as PrismaService, audit);

  beforeEach(() => jest.clearAllMocks());

  it('returns the allowlist plus the full method catalog', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue({ allowedPaymentMethods: ['STRIPE'] });
    const dto = await service.get();
    expect(dto.allowed).toEqual(['STRIPE']);
    expect(dto.allMethods).toContain('STRIPE');
    expect(dto.allMethods).toContain('MANUAL_INVOICE');
  });

  it('treats a missing settings row as an empty allowlist', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue(null);
    const dto = await service.get();
    expect(dto.allowed).toEqual([]);
  });

  it('persists a deduped allowlist and records an audit entry', async () => {
    prisma.platformSettings.findUnique
      .mockResolvedValueOnce({ allowedPaymentMethods: [] }) // prev (inside set)
      .mockResolvedValueOnce({ allowedPaymentMethods: ['STRIPE', 'PAYPAL'] }); // final get
    prisma.platformSettings.upsert.mockResolvedValue({});

    const dto = await service.set(['STRIPE', 'PAYPAL', 'STRIPE'], '1.2.3.4');

    expect(prisma.platformSettings.upsert).toHaveBeenCalledWith({
      where: { id: 'default' },
      create: { id: 'default', allowedPaymentMethods: ['STRIPE', 'PAYPAL'] },
      update: { allowedPaymentMethods: ['STRIPE', 'PAYPAL'] },
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'platform.payment_methods.update',
      metadata: { from: [], to: ['STRIPE', 'PAYPAL'] },
      ip: '1.2.3.4',
    });
    expect(dto.allowed).toEqual(['STRIPE', 'PAYPAL']);
  });

  it('rejects unknown payment methods', async () => {
    prisma.platformSettings.findUnique.mockResolvedValue({ allowedPaymentMethods: [] });
    await expect(service.set(['STRIPE', 'BITCOIN'])).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.platformSettings.upsert).not.toHaveBeenCalled();
  });
});
