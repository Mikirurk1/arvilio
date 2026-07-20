import type { TenantPrismaService } from '@be/prisma';
import type { PlatformAuditService } from './platform-audit.service';
import type { PlatformUsersService } from './platform-users.service';
import type { PlatformBillingRailsService } from '@be/billing/platform-billing';
import { PlatformSchoolsService } from './platform-schools.service';

describe('PlatformSchoolsService', () => {
  const client = {
    school: {
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    user: { count: jest.fn() },
    schoolSubscription: { count: jest.fn(), findMany: jest.fn() },
    schoolMembership: { groupBy: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    platformSettings: { findUnique: jest.fn() },
  };
  // asPlatform just runs the callback (the audited bypass is exercised in integration).
  const tenantPrisma = {
    client,
    asPlatform: <T>(fn: () => Promise<T>) => fn(),
  } as unknown as TenantPrismaService;
  const audit = {
    record: jest.fn(),
    list: jest.fn(),
  } as unknown as PlatformAuditService;
  const users = {
    stats: jest.fn(),
  } as unknown as PlatformUsersService;
  const billingRails = {
    getRails: jest.fn(),
    getCampusSubscription: jest.fn(),
  } as unknown as PlatformBillingRailsService;
  const service = new PlatformSchoolsService(tenantPrisma, audit, users, billingRails);

  beforeEach(() => jest.clearAllMocks());

  it('aggregates the dashboard across tenants', async () => {
    client.school.groupBy.mockResolvedValue([
      { status: 'ACTIVE', _count: { _all: 3 } },
      { status: 'TRIAL', _count: { _all: 1 } },
      { status: 'SUSPENDED', _count: { _all: 1 } },
    ]);
    client.user.count.mockResolvedValue(42);
    client.schoolSubscription.count
      .mockResolvedValueOnce(3) // ACTIVE
      .mockResolvedValueOnce(2); // TRIALING
    client.school.aggregate.mockResolvedValue({ _sum: { storageUsedBytes: 1024n } });
    client.school.findMany.mockResolvedValue([
      {
        id: 's1',
        name: 'Acme',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        subscription: { status: 'ACTIVE' },
      },
    ]);
    client.schoolSubscription.findMany
      .mockResolvedValueOnce([]) // trials ending soon
      .mockResolvedValueOnce([
        { plan: 'PRO', school: { billingCountry: null } },
      ]); // active subs for MRR
    (users.stats as jest.Mock).mockResolvedValue({
      totalUsers: 50,
      activeUsers: 42,
      pausedUsers: 1,
      blockedUsers: 2,
      leavedUsers: 0,
      platformOperators: 3,
      usersWithMembership: 40,
      usersWithoutMembership: 10,
    });
    (billingRails.getRails as jest.Mock).mockResolvedValue({
      rails: [
        { enabled: true, configured: true },
        { enabled: true, configured: false },
        { enabled: false, configured: false },
      ],
      defaultRailId: 'stripe_platform',
    });
    (billingRails.getCampusSubscription as jest.Mock).mockResolvedValue({
      default: {
        railId: 'stripe_platform',
        currency: 'EUR',
        prices: { PRO: { amountMinor: 249900 }, STARTER: { amountMinor: 99900 } },
      },
      countryOverrides: [],
      availableRails: [],
    });
    (audit.list as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'a1',
          action: 'school.suspend',
          actorName: 'Ops',
          createdAt: '2026-07-01T00:00:00.000Z',
          targetSchoolId: 's1',
        },
      ],
      hasMore: false,
      nextCursor: null,
      total: 1,
    });

    const dto = await service.dashboard();
    expect(dto).toEqual({
      schoolCount: 5,
      activeSchoolCount: 3,
      trialSchoolCount: 1,
      suspendedSchoolCount: 1,
      activeUserCount: 42,
      activeSubscriptionCount: 3,
      totalStorageUsedBytes: '1024',
      mrrMinor: 249900,
      trialingSubscriptionCount: 2,
      trialsEndingSoon: [],
      recentCampuses: [
        {
          id: 's1',
          name: 'Acme',
          status: 'ACTIVE',
          subscriptionStatus: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      recentAudit: [
        {
          id: 'a1',
          action: 'school.suspend',
          actorName: 'Ops',
          createdAt: '2026-07-01T00:00:00.000Z',
          targetSchoolId: 's1',
        },
      ],
      userStats: {
        totalUsers: 50,
        activeUsers: 42,
        pausedUsers: 1,
        blockedUsers: 2,
        leavedUsers: 0,
        platformOperators: 3,
        usersWithMembership: 40,
        usersWithoutMembership: 10,
      },
      billingHealth: {
        totalRails: 3,
        enabledCount: 2,
        configuredCount: 1,
      },
    });
  });

  it('lists schools with active member counts (paginated)', async () => {
    client.school.findMany.mockResolvedValue([
      {
        id: 's1',
        slug: 'acme',
        name: 'Acme',
        status: 'ACTIVE',
        storageUsedBytes: 10n,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        subscription: { status: 'ACTIVE' },
        memberships: [{ user: { displayName: 'Ada' } }],
      },
    ]);
    client.school.count.mockResolvedValue(1);
    client.schoolMembership.groupBy.mockResolvedValue([{ schoolId: 's1', _count: { _all: 7 } }]);

    const page = await service.listSchools();
    expect(page).toEqual({
      items: [
        {
          id: 's1',
          slug: 'acme',
          name: 'Acme',
          status: 'ACTIVE',
          memberCount: 7,
          storageUsedBytes: '10',
          subscriptionStatus: 'ACTIVE',
          createdAt: '2026-01-01T00:00:00.000Z',
          ownerDisplayName: 'Ada',
        },
      ],
      hasMore: false,
      nextCursor: null,
      total: 1,
    });
  });

  it('throws when a school detail is missing', async () => {
    client.school.findUnique.mockResolvedValue(null);
    await expect(service.getSchool('missing')).rejects.toThrow('School not found');
  });

  it('suspends a school and records an audit entry', async () => {
    client.school.findUnique
      .mockResolvedValueOnce({ status: 'ACTIVE' }) // status check in setSchoolStatus
      .mockResolvedValueOnce({
        id: 's1',
        slug: 'acme',
        name: 'Acme',
        status: 'SUSPENDED',
        storageUsedBytes: 0n,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        billingCountry: null,
        subscription: null,
        domains: [],
      }); // getSchool detail
    client.schoolMembership.groupBy.mockResolvedValue([]);
    client.schoolMembership.findMany.mockResolvedValue([]);

    const dto = await service.setSchoolStatus('s1', 'SUSPENDED', '1.2.3.4');

    expect(client.school.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { status: 'SUSPENDED' },
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'school.suspend',
      targetSchoolId: 's1',
      metadata: { from: 'ACTIVE', to: 'SUSPENDED' },
      ip: '1.2.3.4',
    });
    expect(dto.status).toBe('SUSPENDED');
    expect(dto.owner).toBeNull();
    expect(dto.admins).toEqual([]);
  });

  it('is a no-op (no update/audit) when status is unchanged', async () => {
    client.school.findUnique
      .mockResolvedValueOnce({ status: 'SUSPENDED' })
      .mockResolvedValueOnce({
        id: 's1',
        slug: 'acme',
        name: 'Acme',
        status: 'SUSPENDED',
        storageUsedBytes: 0n,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        billingCountry: null,
        subscription: null,
        domains: [],
      });
    client.schoolMembership.groupBy.mockResolvedValue([]);
    client.schoolMembership.findMany.mockResolvedValue([]);

    await service.setSchoolStatus('s1', 'SUSPENDED');

    expect(client.school.update).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });
});
