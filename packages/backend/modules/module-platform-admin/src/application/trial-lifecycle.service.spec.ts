import type { PrismaService } from '@be/prisma';
import {
  TrialLifecycleService,
  TRIAL_GRACE_DAYS,
  DUNNING_GRACE_DAYS,
} from './trial-lifecycle.service';

describe('TrialLifecycleService', () => {
  const prisma = {
    school: { findMany: jest.fn(), updateMany: jest.fn() },
  };
  const service = new TrialLifecycleService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('suspends TRIAL schools past trialEndsAt + grace, using an explicit cutoff', async () => {
    const now = new Date('2026-06-25T00:00:00Z');
    prisma.school.findMany.mockResolvedValue([{ id: 's1' }, { id: 's2' }]);
    prisma.school.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.expireTrials(now);

    const where = prisma.school.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('TRIAL');
    const cutoff: Date = where.subscription.trialEndsAt.lt;
    const expectedCutoff = new Date(now.getTime() - TRIAL_GRACE_DAYS * 86_400_000);
    expect(cutoff.getTime()).toBe(expectedCutoff.getTime());

    expect(prisma.school.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['s1', 's2'] } },
      data: { status: 'SUSPENDED' },
    });
    expect(result).toEqual({ suspended: 2, schoolIds: ['s1', 's2'] });
  });

  it('is a no-op when no trials have lapsed', async () => {
    prisma.school.findMany.mockResolvedValue([]);
    const result = await service.expireTrials(new Date());
    expect(prisma.school.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual({ suspended: 0, schoolIds: [] });
  });

  it('suspends ACTIVE schools PAST_DUE beyond the dunning grace window', async () => {
    const now = new Date('2026-06-26T00:00:00Z');
    prisma.school.findMany.mockResolvedValue([{ id: 'd1' }]);
    prisma.school.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.suspendOverdueSubscriptions(now);

    const where = prisma.school.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('ACTIVE');
    expect(where.subscription.status).toBe('PAST_DUE');
    const cutoff: Date = where.subscription.updatedAt.lt;
    expect(cutoff.getTime()).toBe(now.getTime() - DUNNING_GRACE_DAYS * 86_400_000);
    expect(prisma.school.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['d1'] } },
      data: { status: 'SUSPENDED' },
    });
    expect(result).toEqual({ suspended: 1, schoolIds: ['d1'] });
  });

  it('dunning sweep is a no-op when none are overdue', async () => {
    prisma.school.findMany.mockResolvedValue([]);
    const result = await service.suspendOverdueSubscriptions(new Date());
    expect(prisma.school.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual({ suspended: 0, schoolIds: [] });
  });
});
