import type { PrismaService } from '@be/prisma';
import { StorageAccountingService } from './storage-accounting.service';

describe('StorageAccountingService', () => {
  const tx = { school: { findUnique: jest.fn(), update: jest.fn() } };
  const prisma = {
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    school: { findUnique: jest.fn(), update: jest.fn() },
    libraryFileAttachment: { aggregate: jest.fn() },
    lessonFileAttachment: { aggregate: jest.fn() },
    speakingSubmission: { aggregate: jest.fn() },
    scheduledLesson: { aggregate: jest.fn() },
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

  it('reconcile sums attachment tables and writes storageUsedBytes', async () => {
    prisma.school.findUnique.mockResolvedValue({ storageUsedBytes: 0n });
    prisma.libraryFileAttachment.aggregate.mockResolvedValue({ _sum: { sizeBytes: 1000 } });
    prisma.lessonFileAttachment.aggregate.mockResolvedValue({ _sum: { sizeBytes: 200 } });
    prisma.speakingSubmission.aggregate.mockResolvedValue({ _sum: { audioSizeBytes: 50 } });
    prisma.scheduledLesson.aggregate.mockResolvedValue({ _sum: { recordingSizeBytes: 25 } });

    const result = await service.reconcile('s1');

    expect(prisma.school.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { storageUsedBytes: 1275n },
    });
    expect(result).toEqual({
      schoolId: 's1',
      previousBytes: '0',
      usedBytes: '1275',
      breakdown: {
        materials: '1000',
        lessonFiles: '200',
        speaking: '50',
        recordings: '25',
      },
    });
  });
});
