import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import { NotificationDeliveryService } from './notification-delivery.service';

describe('NotificationDeliveryService', () => {
  let service: NotificationDeliveryService;
  const prisma = {
    notificationDelivery: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: { schoolId: 'school_default' } },
      ],
    }).compile();
    service = moduleRef.get(NotificationDeliveryService);
  });

  it('wasSent returns false when no row', async () => {
    prisma.notificationDelivery.findUnique.mockResolvedValue(null);
    await expect(service.wasSent('u1', 'STREAK_ALERT', '2026-05-20')).resolves.toBe(false);
  });

  it('wasSent returns true when row exists', async () => {
    prisma.notificationDelivery.findUnique.mockResolvedValue({ id: 'd1' });
    await expect(service.wasSent('u1', 'STREAK_ALERT', '2026-05-20', 'telegram')).resolves.toBe(
      true,
    );
  });

  it('recordSent upserts delivery row', async () => {
    prisma.notificationDelivery.upsert.mockResolvedValue({});
    await service.recordSent('u1', 'STREAK_ALERT', '2026-05-20', 'email');
    expect(prisma.notificationDelivery.upsert).toHaveBeenCalled();
  });
});
