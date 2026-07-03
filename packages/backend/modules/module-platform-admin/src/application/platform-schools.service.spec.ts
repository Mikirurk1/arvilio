import type { TenantPrismaService } from '@be/prisma';
import type { PlatformAuditService } from './platform-audit.service';
import { PlatformSchoolsService } from './platform-schools.service';

describe('PlatformSchoolsService', () => {
  const client = {
    school: {
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: { count: jest.fn() },
    schoolSubscription: { count: jest.fn() },
    schoolMembership: { groupBy: jest.fn() },
  };
  // asPlatform just runs the callback (the audited bypass is exercised in integration).
  const tenantPrisma = {
    client,
    asPlatform: <T>(fn: () => Promise<T>) => fn(),
  } as unknown as TenantPrismaService;
  const audit = { record: jest.fn() } as unknown as PlatformAuditService;
  const service = new PlatformSchoolsService(tenantPrisma, audit);

  beforeEach(() => jest.clearAllMocks());

  it('aggregates the dashboard across tenants', async () => {
    client.school.groupBy.mockResolvedValue([
      { status: 'ACTIVE', _count: { _all: 3 } },
      { status: 'TRIAL', _count: { _all: 1 } },
      { status: 'SUSPENDED', _count: { _all: 1 } },
    ]);
    client.user.count.mockResolvedValue(42);
    client.schoolSubscription.count.mockResolvedValue(3);
    client.school.aggregate.mockResolvedValue({ _sum: { storageUsedBytes: 1024n } });

    const dto = await service.dashboard();
    expect(dto).toEqual({
      schoolCount: 5,
      activeSchoolCount: 3,
      trialSchoolCount: 1,
      suspendedSchoolCount: 1,
      activeUserCount: 42,
      activeSubscriptionCount: 3,
      totalStorageUsedBytes: '1024',
      mrrMinor: 0,
    });
  });

  it('lists schools with active member counts', async () => {
    client.school.findMany.mockResolvedValue([
      {
        id: 's1',
        slug: 'acme',
        name: 'Acme',
        status: 'ACTIVE',
        storageUsedBytes: 10n,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        subscription: { status: 'ACTIVE' },
      },
    ]);
    client.schoolMembership.groupBy.mockResolvedValue([{ schoolId: 's1', _count: { _all: 7 } }]);

    const rows = await service.listSchools();
    expect(rows).toEqual([
      {
        id: 's1',
        slug: 'acme',
        name: 'Acme',
        status: 'ACTIVE',
        memberCount: 7,
        storageUsedBytes: '10',
        subscriptionStatus: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
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
        subscription: null,
        domains: [],
      }); // getSchool detail
    client.schoolMembership.groupBy.mockResolvedValue([]);

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
        subscription: null,
        domains: [],
      });
    client.schoolMembership.groupBy.mockResolvedValue([]);

    await service.setSchoolStatus('s1', 'SUSPENDED');

    expect(client.school.update).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });
});
