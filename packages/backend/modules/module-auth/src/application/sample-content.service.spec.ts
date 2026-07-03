import type { PrismaService } from '@be/prisma';
import { SampleContentService } from './sample-content.service';

describe('SampleContentService', () => {
  const prisma = {
    libraryMaterial: {
      count: jest.fn(),
      create: jest.fn(),
    },
  };
  const service = new SampleContentService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('creates 3 sample materials when school has none', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create.mockResolvedValue({});

    const result = await service.seed('school-1', 'admin-1');

    expect(result.created).toBe(3);
    expect(prisma.libraryMaterial.create).toHaveBeenCalledTimes(3);
    const firstCall = prisma.libraryMaterial.create.mock.calls[0][0];
    expect(firstCall.data.schoolId).toBe('school-1');
    expect(firstCall.data.createdById).toBe('admin-1');
    expect(firstCall.data.assets.create.length).toBeGreaterThan(0);
    expect(firstCall.data.assets.create[0].deliveryKind).toBe('URL');
    expect(firstCall.data.assets.create[0].url).toBeTruthy();
  });

  it('skips seed when school already has materials', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(2);

    const result = await service.seed('school-1', 'admin-1');

    expect(result.created).toBe(0);
    expect(prisma.libraryMaterial.create).not.toHaveBeenCalled();
  });

  it('continues seeding if one material creation fails', async () => {
    prisma.libraryMaterial.count.mockResolvedValue(0);
    prisma.libraryMaterial.create
      .mockRejectedValueOnce(new Error('db error'))
      .mockResolvedValue({});

    const result = await service.seed('school-1', 'admin-1');

    expect(result.created).toBe(2); // 1 failed, 2 succeeded
  });
});
