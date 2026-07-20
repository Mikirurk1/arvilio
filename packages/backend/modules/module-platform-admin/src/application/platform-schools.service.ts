import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Prisma, SchoolStatus } from '@prisma/client';
import { TenantPrismaService } from '@be/prisma';
import {
  PlatformBillingRailsService,
  normalizeBillingCountryInput,
} from '@be/billing/platform-billing';
import { PlatformAuditService } from './platform-audit.service';
import {
  clampPageLimit,
  createdAtIdCursorWhereDesc,
  encodeCreatedAtIdCursor,
  type PlatformPageDto,
} from './platform-page.util';
import {
  PlatformUsersService,
  type PlatformUserBriefDto,
  type PlatformUserStatsDto,
} from './platform-users.service';

export type PlatformDashboardRecentCampusDto = {
  id: string;
  name: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  subscriptionStatus: string | null;
  createdAt: string;
};

export type PlatformDashboardTrialEndingDto = {
  id: string;
  name: string;
  trialEndsAt: string;
};

export type PlatformDashboardAuditDto = {
  id: string;
  action: string;
  actorName: string;
  createdAt: string;
  targetSchoolId: string | null;
};

export type PlatformDashboardBillingHealthDto = {
  enabledCount: number;
  configuredCount: number;
  totalRails: number;
};

export interface PlatformDashboardDto {
  schoolCount: number;
  activeSchoolCount: number;
  trialSchoolCount: number;
  suspendedSchoolCount: number;
  activeUserCount: number;
  activeSubscriptionCount: number;
  totalStorageUsedBytes: string;
  /** Sum of ACTIVE Layer-B plan amountMinor when prices are configured; else 0. */
  mrrMinor: number;
  trialingSubscriptionCount: number;
  trialsEndingSoon: PlatformDashboardTrialEndingDto[];
  recentCampuses: PlatformDashboardRecentCampusDto[];
  recentAudit: PlatformDashboardAuditDto[];
  userStats: PlatformUserStatsDto;
  billingHealth: PlatformDashboardBillingHealthDto;
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
  ownerDisplayName: string | null;
}

export interface PlatformSchoolDetailDto extends PlatformSchoolRowDto {
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  primaryDomain: string | null;
  /** ISO alpha-2; Control Plane only (ADR-010). */
  billingCountry: string | null;
  /** Earliest active ADMIN membership (signup owner). */
  owner: PlatformUserBriefDto | null;
  /** All active ADMIN members (usually small). */
  admins: PlatformUserBriefDto[];
}

export type ListSchoolsQuery = {
  q?: string;
  status?: SchoolStatus | 'all';
  subscriptionStatus?: string | 'all' | 'none';
  cursor?: string;
  limit?: number;
};

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
    private readonly users: PlatformUsersService,
    private readonly billingRails: PlatformBillingRailsService,
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

  /** Set Layer-B billing country (Control Plane only — never from IP). */
  async setBillingCountry(
    schoolId: string,
    billingCountryRaw: unknown,
    ip?: string | null,
  ): Promise<PlatformSchoolDetailDto> {
    if (
      billingCountryRaw !== null &&
      billingCountryRaw !== undefined &&
      billingCountryRaw !== '' &&
      typeof billingCountryRaw === 'string' &&
      !/^[A-Za-z]{2}$/.test(billingCountryRaw.trim())
    ) {
      throw new BadRequestException('billingCountry must be ISO 3166-1 alpha-2 or empty');
    }
    const billingCountry = normalizeBillingCountryInput(billingCountryRaw);
    await this.tenantPrisma.asPlatform(async () => {
      const existing = await this.db.school.findUnique({
        where: { id: schoolId },
        select: { billingCountry: true },
      });
      if (!existing) throw new NotFoundException('School not found');
      if (existing.billingCountry === billingCountry) return;
      await this.db.school.update({
        where: { id: schoolId },
        data: { billingCountry },
      });
      await this.audit.record({
        action: 'school.billing_country.update',
        targetSchoolId: schoolId,
        metadata: { from: existing.billingCountry, to: billingCountry },
        ip,
      });
    });
    return this.getSchool(schoolId);
  }

  async dashboard(): Promise<PlatformDashboardDto> {
    const now = new Date();
    const trialHorizon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [core, userStats, railsDto, campusProduct, recentAuditPage] = await Promise.all([
      this.tenantPrisma.asPlatform(async () => {
        const [
          byStatus,
          activeUserCount,
          activeSubscriptionCount,
          trialingSubscriptionCount,
          storageAgg,
          recentCampuses,
          trialsEndingSoon,
          activeSubs,
        ] = await Promise.all([
          this.db.school.groupBy({ by: ['status'], _count: { _all: true } }),
          this.db.user.count({ where: { status: 'ACTIVE' } }),
          this.db.schoolSubscription.count({ where: { status: 'ACTIVE' } }),
          this.db.schoolSubscription.count({ where: { status: 'TRIALING' } }),
          this.db.school.aggregate({ _sum: { storageUsedBytes: true } }),
          this.db.school.findMany({
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 5,
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
              subscription: { select: { status: true } },
            },
          }),
          this.db.schoolSubscription.findMany({
            where: {
              status: 'TRIALING',
              trialEndsAt: { gte: now, lte: trialHorizon },
            },
            orderBy: { trialEndsAt: 'asc' },
            take: 5,
            select: {
              trialEndsAt: true,
              school: { select: { id: true, name: true } },
            },
          }),
          this.db.schoolSubscription.findMany({
            where: { status: 'ACTIVE' },
            select: {
              plan: true,
              school: { select: { billingCountry: true } },
            },
          }),
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
          trialingSubscriptionCount,
          totalStorageUsedBytes: (storageAgg._sum.storageUsedBytes ?? 0n).toString(),
          activeSubs,
          recentCampuses: recentCampuses.map((s) => ({
            id: s.id,
            name: s.name,
            status: s.status as 'TRIAL' | 'ACTIVE' | 'SUSPENDED',
            subscriptionStatus: s.subscription?.status ?? null,
            createdAt: s.createdAt.toISOString(),
          })),
          trialsEndingSoon: trialsEndingSoon
            .filter((row) => row.trialEndsAt)
            .map((row) => ({
              id: row.school.id,
              name: row.school.name,
              trialEndsAt: row.trialEndsAt!.toISOString(),
            })),
        };
      }),
      this.users.stats(),
      this.billingRails.getRails(),
      this.billingRails.getCampusSubscription(),
      this.audit.list({ limit: 8 }),
    ]);

    let mrrMinor = 0;
    for (const sub of core.activeSubs) {
      const amount = resolvePlanAmountMinor(
        campusProduct,
        sub.school.billingCountry,
        sub.plan,
      );
      if (amount > 0) mrrMinor += amount;
    }

    const billingHealth = {
      totalRails: railsDto.rails.length,
      enabledCount: railsDto.rails.filter((r) => r.enabled).length,
      configuredCount: railsDto.rails.filter((r) => r.configured).length,
    };

    const { activeSubs: _omit, ...kpi } = core;

    return {
      ...kpi,
      mrrMinor,
      userStats,
      billingHealth,
      recentAudit: recentAuditPage.items.map((e) => ({
        id: e.id,
        action: e.action,
        actorName: e.actorName,
        createdAt: e.createdAt,
        targetSchoolId: e.targetSchoolId,
      })),
    };
  }

  async listSchools(query: ListSchoolsQuery = {}): Promise<PlatformPageDto<PlatformSchoolRowDto>> {
    const limit = clampPageLimit(query.limit);
    const q = query.q?.trim() ?? '';
    const status = query.status && query.status !== 'all' ? query.status : undefined;
    const sub = query.subscriptionStatus;

    return this.tenantPrisma.asPlatform(async () => {
      const filterWhere: Prisma.SchoolWhereInput = {
        AND: [
          status ? { status } : {},
          q
            ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { slug: { contains: q, mode: 'insensitive' } },
                  { id: { equals: q } },
                ],
              }
            : {},
          sub === 'none'
            ? { subscription: null }
            : sub && sub !== 'all'
              ? { subscription: { status: sub as never } }
              : {},
        ],
      };
      const where: Prisma.SchoolWhereInput = {
        AND: [filterWhere, createdAtIdCursorWhereDesc(query.cursor)],
      };

      const [schools, total] = await Promise.all([
        this.db.school.findMany({
          where,
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            storageUsedBytes: true,
            createdAt: true,
            subscription: { select: { status: true } },
            memberships: {
              where: { status: 'ACTIVE', role: 'ADMIN' },
              orderBy: { createdAt: 'asc' },
              take: 1,
              select: { user: { select: { displayName: true } } },
            },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: limit + 1,
        }),
        this.db.school.count({ where: filterWhere }),
      ]);

      const hasMore = schools.length > limit;
      const page = hasMore ? schools.slice(0, limit) : schools;
      const ids = page.map((s) => s.id);
      const memberCounts =
        ids.length === 0
          ? []
          : await this.db.schoolMembership.groupBy({
              by: ['schoolId'],
              where: { schoolId: { in: ids }, status: 'ACTIVE' },
              _count: { _all: true },
            });
      const countBySchool = new Map(memberCounts.map((m) => [m.schoolId, m._count._all]));
      const items: PlatformSchoolRowDto[] = page.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        status: s.status,
        memberCount: countBySchool.get(s.id) ?? 0,
        storageUsedBytes: s.storageUsedBytes.toString(),
        subscriptionStatus: s.subscription?.status ?? null,
        createdAt: s.createdAt.toISOString(),
        ownerDisplayName: s.memberships[0]?.user.displayName ?? null,
      }));
      const last = page[page.length - 1];
      return {
        items,
        hasMore,
        nextCursor: hasMore && last ? encodeCreatedAtIdCursor(last) : null,
        total,
      };
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
          billingCountry: true,
          subscription: { select: { status: true } },
          domains: { where: { isPrimary: true }, select: { hostname: true }, take: 1 },
        },
      });
      if (!school) throw new NotFoundException('School not found');

      const [roleCounts, adminMemberships] = await Promise.all([
        this.db.schoolMembership.groupBy({
          by: ['role'],
          where: { schoolId, status: 'ACTIVE' },
          _count: { _all: true },
        }),
        this.db.schoolMembership.findMany({
          where: { schoolId, status: 'ACTIVE', role: 'ADMIN' },
          orderBy: { createdAt: 'asc' },
          select: {
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                status: true,
                createdAt: true,
              },
            },
          },
        }),
      ]);
      const roleCount = (r: 'STUDENT' | 'TEACHER' | 'ADMIN') =>
        roleCounts.find((x) => x.role === r)?._count._all ?? 0;

      const admins: PlatformUserBriefDto[] = adminMemberships.map((m) => ({
        id: m.user.id,
        email: m.user.email,
        displayName: m.user.displayName,
        status: m.user.status,
        createdAt: m.user.createdAt.toISOString(),
      }));
      const owner = admins[0] ?? null;

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
        billingCountry: school.billingCountry ?? null,
        ownerDisplayName: owner?.displayName ?? null,
        owner,
        admins,
      };
    });
  }
}

function resolvePlanAmountMinor(
  product: {
    default: {
      prices: {
        STARTER?: { amountMinor?: number | null };
        PRO?: { amountMinor?: number | null };
      };
    };
    countryOverrides: Array<{
      country: string;
      prices: {
        STARTER?: { amountMinor?: number | null };
        PRO?: { amountMinor?: number | null };
      };
    }>;
  },
  billingCountry: string | null | undefined,
  planRaw: string | null | undefined,
): number {
  const plan = planRaw?.trim().toUpperCase();
  if (plan !== 'STARTER' && plan !== 'PRO') return 0;
  const country = billingCountry?.trim().toUpperCase();
  const override =
    country && /^[A-Z]{2}$/.test(country)
      ? product.countryOverrides.find((row) => row.country === country)
      : undefined;
  const offer = override ?? product.default;
  const amount = offer.prices[plan]?.amountMinor;
  return typeof amount === 'number' && amount > 0 ? amount : 0;
}
