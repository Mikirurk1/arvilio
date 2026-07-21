import type { TenantPrismaService } from '@be/prisma';
import { PlatformUsersService } from './platform-users.service';

describe('PlatformUsersService', () => {
  const db = {
    user: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    platformOperator: { count: jest.fn() },
  };

  const tenantPrisma = {
    client: db,
    asPlatform: jest.fn(async (fn: () => Promise<unknown>) => fn()),
  };

  const service = new PlatformUsersService(tenantPrisma as unknown as TenantPrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('stats aggregates account statuses and memberships', async () => {
    db.user.groupBy.mockResolvedValue([
      { status: 'ACTIVE', _count: { _all: 10 } },
      { status: 'BLOCKED', _count: { _all: 2 } },
      { status: 'PAUSED', _count: { _all: 1 } },
      { status: 'LEAVED', _count: { _all: 1 } },
    ]);
    db.platformOperator.count.mockResolvedValue(3);
    db.user.count
      .mockResolvedValueOnce(8) // with membership
      .mockResolvedValueOnce(14); // total

    const stats = await service.stats();

    expect(tenantPrisma.asPlatform).toHaveBeenCalled();
    expect(stats).toEqual({
      totalUsers: 14,
      activeUsers: 10,
      pausedUsers: 1,
      blockedUsers: 2,
      leavedUsers: 1,
      platformOperators: 3,
      usersWithMembership: 8,
      usersWithoutMembership: 6,
    });
  });
});
