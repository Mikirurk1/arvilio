import type { PrismaService } from '@be/prisma';
import { StorageAccountingService } from './storage-accounting.service';

describe('StorageAccountingService', () => {
  const tx = { school: { findUnique: jest.fn(), update: jest.fn() } };
  const prisma = {
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new StorageAccountingService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('increments usage by a positive delta', async () => {
    tx.school.findUnique.mockResolvedValue({ storageUsedBytes: 100n });
    await service.add('s1', 50);
    expect(tx.school.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { storageUsedBytes: 150n },
    });
  });

  it('decrements and clamps at zero', async () => {
    tx.school.findUnique.mockResolvedValue({ storageUsedBytes: 30n });
    await service.add('s1', -100);
    expect(tx.school.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { storageUsedBytes: 0n },
    });
  });

  it('is a no-op for zero delta or missing school', async () => {
    await service.add('s1', 0);
    expect(prisma.$transaction).not.toHaveBeenCalled();

    tx.school.findUnique.mockResolvedValue(null);
    await service.add('s1', 10);
    expect(tx.school.update).not.toHaveBeenCalled();
  });
});
