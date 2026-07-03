import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '@be/prisma';
import { PlatformAuditService } from './platform-audit.service';

export interface PlatformDashboardDto {
  schoolCount: number;
  activeSchoolCount: number;
  trialSchoolCount: number;
  suspendedSchoolCount: number;
  activeUserCount: number;
  activeSubscriptionCount: number;
  totalStorageUsedBytes: string;
  /** MRR is 0 until subscription pricing lands (Phase 5 billing depth). */
  mrrMinor: number;
}

export interface PlatformSchoolRowDto {
  id: string;
  slug: string;
  name: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  memberCount: number;
  storageUsedBytes: string;
  subscriptionStatus: string | null;
  createdAt: string;
}

export interface PlatformSchoolDetailDto extends PlatformSchoolRowDto {
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  primaryDomain: string | null;
}

/**
 * Cross-tenant read surface for the platform console (Phase 4B / ADR-009).
 * All reads go through the audited `asPlatform()` bypass — the only sanctioned
 * way to read across tenants (enforced by the ESLint allowlist on this module).
 */
@Injectable()
export class PlatformSchoolsService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: PlatformAuditService,
  ) {}

  private get db() {
    return this.tenantPrisma.client;
  }

  /** Suspend or (re)activate a school, recording the action in the audit log. */
  async setSchoolStatus(
    schoolId: string,
    status: 'ACTIVE' | 'SUSPENDED',
    ip?: string | null,
  ): Promise<PlatformSchoolDetailDto> {
    await this.tenantPrisma.asPlatform(async () => {
      const existing = await this.db.school.findUnique({
        where: { id: schoolId },
        select: { status: true },
      });
      if (!existing) throw new NotFoundException('School not found');
      if (existing.status === status) return;
      await this.db.school.update({ where: { id: schoolId }, data: { status } });
      await this.audit.record({
        action: status === 'SUSPENDED' ? 'school.suspend' : 'school.activate',
        targetSchoolId: schoolId,
        metadata: { from: existing.status, to: status },
        ip,
      });
    });
    return this.getSchool(schoolId);
  }

  async dashboard(): Promise<PlatformDashboardDto> {
    return this.tenantPrisma.asPlatform(async () => {
      const [byStatus, activeUserCount, activeSubscriptionCount, storageAgg] = await Promise.all([
        this.db.school.groupBy({ by: ['status'], _count: { _all: true } }),
        this.db.user.count({ where: { status: 'ACTIVE' } }),
        this.db.schoolSubscription.count({ where: { status: 'ACTIVE' } }),
        this.db.school.aggregate({ _sum: { storageUsedBytes: true } }),
      ]);
      const count = (s: 'TRIAL' | 'ACTIVE' | 'SUSPENDED') =>
        byStatus.find((r) => r.status === s)?._count._all ?? 0;
      return {
        schoolCount: byStatus.reduce((sum, r) => sum + r._count._all, 0),
        activeSchoolCount: count('ACTIVE'),
        trialSchoolCount: count('TRIAL'),
        suspendedSchoolCount: count('SUSPENDED'),
        activeUserCount,
        activeSubscriptionCount,
        totalStorageUsedBytes: (storageAgg._sum.storageUsedBytes ?? 0n).toString(),
        mrrMinor: 0,
      };
    });
  }

  async listSchools(): Promise<PlatformSchoolRowDto[]> {
    return this.tenantPrisma.asPlatform(async () => {
      const [schools, memberCounts] = await Promise.all([
        this.db.school.findMany({
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            storageUsedBytes: true,
            createdAt: true,
            subscription: { select: { status: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.db.schoolMembership.groupBy({
          by: ['schoolId'],
          where: { status: 'ACTIVE' },
          _count: { _all: true },
        }),
      ]);
      const countBySchool = new Map(memberCounts.map((m) => [m.schoolId, m._count._all]));
      return schools.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        status: s.status,
        memberCount: countBySchool.get(s.id) ?? 0,
        storageUsedBytes: s.storageUsedBytes.toString(),
        subscriptionStatus: s.subscription?.status ?? null,
        createdAt: s.createdAt.toISOString(),
      }));
    });
  }

  async getSchool(schoolId: string): Promise<PlatformSchoolDetailDto> {
    return this.tenantPrisma.asPlatform(async () => {
      const school = await this.db.school.findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          storageUsedBytes: true,
          createdAt: true,
          subscription: { select: { status: true } },
          domains: { where: { isPrimary: true }, select: { hostname: true }, take: 1 },
        },
      });
      if (!school) throw new NotFoundException('School not found');

      const roleCounts = await this.db.schoolMembership.groupBy({
        by: ['role'],
        where: { schoolId, status: 'ACTIVE' },
        _count: { _all: true },
      });
      const roleCount = (r: 'STUDENT' | 'TEACHER' | 'ADMIN') =>
        roleCounts.find((x) => x.role === r)?._count._all ?? 0;

      return {
        id: school.id,
        slug: school.slug,
        name: school.name,
        status: school.status,
        memberCount: roleCounts.reduce((sum, r) => sum + r._count._all, 0),
        storageUsedBytes: school.storageUsedBytes.toString(),
        subscriptionStatus: school.subscription?.status ?? null,
        createdAt: school.createdAt.toISOString(),
        studentCount: roleCount('STUDENT'),
        teacherCount: roleCount('TEACHER'),
        adminCount: roleCount('ADMIN'),
        primaryDomain: school.domains[0]?.hostname ?? null,
      };
    });
  }
}
