import { PayloadTooLargeException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import { EntitlementsService } from './entitlements.service';
import { PLAN_CATALOG } from '../shared/subscription-plans';

const GB = 1024 * 1024 * 1024;

describe('EntitlementsService', () => {
  const prisma = {
    school: { findUnique: jest.fn() },
    schoolMembership: { count: jest.fn() },
  };
  const service = new EntitlementsService(prisma as unknown as PrismaService);

  // `school.findUnique` backs both resolveForSchool (status+plan) and getStorageUsage
  // (storageUsedBytes), so the mock returns all fields.
  function mockSchool(opts: { plan?: string | null; status?: string; usedBytes?: bigint }) {
    prisma.school.findUnique.mockResolvedValue({
      status: opts.status ?? 'ACTIVE',
      storageUsedBytes: opts.usedBytes ?? 0n,
      subscription: { plan: opts.plan ?? null },
    });
  }

  beforeEach(() => jest.clearAllMocks());

  it('resolves a paid plan; TRIAL status → TRIAL; legacy ACTIVE-no-plan → grandfathered PRO', async () => {
    mockSchool({ plan: 'PRO' });
    expect((await service.resolveForSchool('s1')).key).toBe('PRO');
    mockSchool({ plan: null, status: 'TRIAL' });
    expect((await service.resolveForSchool('s1')).key).toBe('TRIAL');
    mockSchool({ plan: null, status: 'ACTIVE' });
    expect((await service.resolveForSchool('s1')).key).toBe('PRO'); // grandfathered
  });

  it('computes storage usage with percent + remaining', async () => {
    mockSchool({ plan: 'STARTER', usedBytes: BigInt(5 * GB) }); // 10 GB quota
    const usage = await service.getStorageUsage('s1');
    expect(usage.quotaBytes).toBe(String(PLAN_CATALOG.STARTER.storageQuotaBytes));
    expect(usage.usedBytes).toBe(String(5 * GB));
    expect(usage.remainingBytes).toBe(String(5 * GB));
    expect(usage.percentUsed).toBe(50);
    expect(usage.overQuota).toBe(false);
  });

  it('flags over-quota and clamps remaining at 0', async () => {
    mockSchool({ status: 'TRIAL', usedBytes: BigInt(2 * GB) }); // 1 GB quota
    const usage = await service.getStorageUsage('s1');
    expect(usage.overQuota).toBe(true);
    expect(usage.remainingBytes).toBe('0');
    expect(usage.percentUsed).toBe(100);
  });

  it('assertCanUpload throws when the upload would exceed quota', async () => {
    mockSchool({ status: 'TRIAL', usedBytes: BigInt(GB - 100) }); // 1 GB quota
    await expect(service.assertCanUpload('s1', 500)).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
  });

  it('assertCanUpload allows an upload that fits (and ignores non-positive sizes)', async () => {
    mockSchool({ plan: 'STARTER', usedBytes: BigInt(GB) });
    await expect(service.assertCanUpload('s1', 1000)).resolves.toBeUndefined();
    await expect(service.assertCanUpload('s1', 0)).resolves.toBeUndefined();
  });

  it('getSummary composes plan + seats + storage', async () => {
    mockSchool({ status: 'TRIAL', usedBytes: BigInt(GB / 2) }); // cap 10, 1GB
    prisma.schoolMembership.count.mockResolvedValue(4);

    const dto = await service.getSummary('s1');
    expect(dto.plan).toBe('TRIAL');
    expect(dto.maxActiveStudents).toBe(10);
    expect(dto.activeStudentCount).toBe(4);
    expect(dto.seatsRemaining).toBe(6);
    expect(dto.storage.percentUsed).toBe(50);
  });

  it('getSummary reports null seatsRemaining for unlimited (PRO)', async () => {
    mockSchool({ plan: 'PRO', usedBytes: 0n });
    prisma.schoolMembership.count.mockResolvedValue(120);
    const dto = await service.getSummary('s1');
    expect(dto.maxActiveStudents).toBeNull();
    expect(dto.seatsRemaining).toBeNull();
  });

  it('hasFeature/assertFeature reflect the plan feature flags', async () => {
    mockSchool({ plan: 'PRO' }); // customDomain + aiAssist + recordings
    expect(await service.hasFeature('s1', 'customDomain')).toBe(true);
    await expect(service.assertFeature('s1', 'aiAssist')).resolves.toBeUndefined();

    mockSchool({ status: 'TRIAL' }); // no premium features
    expect(await service.hasFeature('s1', 'customDomain')).toBe(false);
    await expect(service.assertFeature('s1', 'customDomain')).rejects.toBeTruthy();
  });

  it('seat limit: blocks when TRIAL at cap, allows under cap and for unlimited (PRO)', async () => {
    mockSchool({ status: 'TRIAL' }); // cap 10
    prisma.schoolMembership.count.mockResolvedValue(10);
    expect(await service.canAddActiveStudent('s1')).toBe(false);
    prisma.schoolMembership.count.mockResolvedValue(9);
    expect(await service.canAddActiveStudent('s1')).toBe(true);

    mockSchool({ plan: 'PRO' }); // unlimited
    expect(await service.canAddActiveStudent('s1')).toBe(true);
  });
});
