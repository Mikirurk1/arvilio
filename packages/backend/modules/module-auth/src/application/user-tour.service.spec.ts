import type { PrismaService } from '@be/prisma';
import { UserTourService } from './user-tour.service';

describe('UserTourService', () => {
  const prisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
  };
  const service = new UserTourService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('reports not-completed when tourCompletedAt is null', async () => {
    prisma.user.findUnique.mockResolvedValue({ tourCompletedAt: null });
    expect(await service.getState('u1')).toEqual({ completed: false, completedAt: null });
  });

  it('reports completed with timestamp', async () => {
    const at = new Date('2026-06-25T00:00:00Z');
    prisma.user.findUnique.mockResolvedValue({ tourCompletedAt: at });
    expect(await service.getState('u1')).toEqual({
      completed: true,
      completedAt: at.toISOString(),
    });
  });

  it('sets the timestamp on first completion', async () => {
    prisma.user.findUnique.mockResolvedValue({ tourCompletedAt: null });
    prisma.user.update.mockResolvedValue({});
    const dto = await service.complete('u1');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'u1' }, data: { tourCompletedAt: expect.any(Date) } }),
    );
    expect(dto.completed).toBe(true);
  });

  it('is idempotent — keeps the first timestamp, no second write', async () => {
    const at = new Date('2026-06-01T00:00:00Z');
    prisma.user.findUnique.mockResolvedValue({ tourCompletedAt: at });
    const dto = await service.complete('u1');
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(dto.completedAt).toBe(at.toISOString());
  });

  it('clears tourCompletedAt on reset', async () => {
    prisma.user.update.mockResolvedValue({});
    const dto = await service.reset('u1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { tourCompletedAt: null },
    });
    expect(dto).toEqual({ completed: false, completedAt: null });
  });
});
