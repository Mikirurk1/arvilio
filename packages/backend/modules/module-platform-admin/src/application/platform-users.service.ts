import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, SchoolMembershipRole, SchoolMembershipStatus, UserAccountStatus } from '@prisma/client';
import { TenantPrismaService } from '@be/prisma';
import {
  clampPageLimit,
  createdAtIdCursorWhereDesc,
  encodeCreatedAtIdCursor,
  type PlatformPageDto,
} from './platform-page.util';

export type PlatformUserBriefDto = {
  id: string;
  email: string;
  displayName: string;
  status: UserAccountStatus;
  createdAt: string;
};

export type PlatformUserMembershipPreviewDto = {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  role: SchoolMembershipRole;
  status: SchoolMembershipStatus;
};

export type PlatformUserRowDto = {
  id: string;
  email: string;
  displayName: string;
  status: UserAccountStatus;
  /** Legacy User.role (pre-membership); still useful for operators. */
  accountRole: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  membershipCount: number;
  memberships: PlatformUserMembershipPreviewDto[];
  isPlatformOperator: boolean;
  platformRole: string | null;
};

export type PlatformUserStatsDto = {
  totalUsers: number;
  activeUsers: number;
  pausedUsers: number;
  blockedUsers: number;
  leavedUsers: number;
  platformOperators: number;
  usersWithMembership: number;
  usersWithoutMembership: number;
};

export type PlatformSchoolMemberRowDto = {
  membershipId: string;
  userId: string;
  email: string;
  displayName: string;
  userStatus: UserAccountStatus;
  role: SchoolMembershipRole;
  membershipStatus: SchoolMembershipStatus;
  joinedAt: string;
  /** True when this membership is the earliest active ADMIN (signup owner). */
  isOwner: boolean;
};

export type ListUsersQuery = {
  q?: string;
  status?: UserAccountStatus | 'all';
  membershipRole?: SchoolMembershipRole | 'all';
  schoolId?: string;
  /** `operators` = platform operators only; `members` = has ≥1 membership; `orphan` = no membership */
  scope?: 'all' | 'operators' | 'members' | 'orphan';
  cursor?: string;
  limit?: number;
};

export type ListSchoolMembersQuery = {
  q?: string;
  role?: SchoolMembershipRole | 'all';
  membershipStatus?: SchoolMembershipStatus | 'all';
  cursor?: string;
  limit?: number;
};

/**
 * Cross-tenant user directory for the Control Plane (ADR-009).
 * All reads go through `asPlatform()`.
 */
@Injectable()
export class PlatformUsersService {
  constructor(private readonly tenantPrisma: TenantPrismaService) {}

  private get db() {
    return this.tenantPrisma.client;
  }

  async stats(): Promise<PlatformUserStatsDto> {
    return this.tenantPrisma.asPlatform(async () => {
      const [byStatus, platformOperators, usersWithMembership, totalUsers] = await Promise.all([
        this.db.user.groupBy({ by: ['status'], _count: { _all: true } }),
        this.db.platformOperator.count(),
        this.db.user.count({ where: { schoolMemberships: { some: {} } } }),
        this.db.user.count(),
      ]);
      const statusCount = (s: UserAccountStatus) =>
        byStatus.find((r) => r.status === s)?._count._all ?? 0;
      return {
        totalUsers,
        activeUsers: statusCount('ACTIVE'),
        pausedUsers: statusCount('PAUSED'),
        blockedUsers: statusCount('BLOCKED'),
        leavedUsers: statusCount('LEAVED'),
        platformOperators,
        usersWithMembership,
        usersWithoutMembership: Math.max(0, totalUsers - usersWithMembership),
      };
    });
  }

  async listUsers(query: ListUsersQuery = {}): Promise<PlatformPageDto<PlatformUserRowDto>> {
    const limit = clampPageLimit(query.limit);
    const q = query.q?.trim() ?? '';
    const status = query.status && query.status !== 'all' ? query.status : undefined;
    const membershipRole =
      query.membershipRole && query.membershipRole !== 'all' ? query.membershipRole : undefined;
    const schoolId = query.schoolId?.trim() || undefined;
    const scope = query.scope ?? 'all';

    return this.tenantPrisma.asPlatform(async () => {
      const filterWhere: Prisma.UserWhereInput = {
        AND: [
          status ? { status } : {},
          q
            ? {
                OR: [
                  { email: { contains: q, mode: 'insensitive' } },
                  { displayName: { contains: q, mode: 'insensitive' } },
                  { id: { equals: q } },
                ],
              }
            : {},
          scope === 'operators' ? { platformOperator: { isNot: null } } : {},
          scope === 'members' ? { schoolMemberships: { some: {} } } : {},
          scope === 'orphan' ? { schoolMemberships: { none: {} } } : {},
          schoolId || membershipRole
            ? {
                schoolMemberships: {
                  some: {
                    ...(schoolId ? { schoolId } : {}),
                    ...(membershipRole ? { role: membershipRole } : {}),
                  },
                },
              }
            : {},
        ],
      };
      const where: Prisma.UserWhereInput = {
        AND: [filterWhere, createdAtIdCursorWhereDesc(query.cursor)],
      };

      const [rows, total] = await Promise.all([
        this.db.user.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: limit + 1,
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            role: true,
            emailVerifiedAt: true,
            createdAt: true,
            platformOperator: { select: { role: true } },
            schoolMemberships: {
              orderBy: { createdAt: 'asc' },
              take: 5,
              select: {
                role: true,
                status: true,
                school: { select: { id: true, name: true, slug: true } },
              },
            },
            _count: { select: { schoolMemberships: true } },
          },
        }),
        this.db.user.count({ where: filterWhere }),
      ]);

      const hasMore = rows.length > limit;
      const page = hasMore ? rows.slice(0, limit) : rows;
      const items: PlatformUserRowDto[] = page.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        status: u.status,
        accountRole: u.role,
        emailVerifiedAt: u.emailVerifiedAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        membershipCount: u._count.schoolMemberships,
        memberships: u.schoolMemberships.map((m) => ({
          schoolId: m.school.id,
          schoolName: m.school.name,
          schoolSlug: m.school.slug,
          role: m.role,
          status: m.status,
        })),
        isPlatformOperator: u.platformOperator != null,
        platformRole: u.platformOperator?.role ?? null,
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

  async listSchoolMembers(
    schoolId: string,
    query: ListSchoolMembersQuery = {},
  ): Promise<PlatformPageDto<PlatformSchoolMemberRowDto>> {
    const limit = clampPageLimit(query.limit);
    const q = query.q?.trim() ?? '';
    const role = query.role && query.role !== 'all' ? query.role : undefined;
    const membershipStatus =
      query.membershipStatus && query.membershipStatus !== 'all'
        ? query.membershipStatus
        : undefined;

    return this.tenantPrisma.asPlatform(async () => {
      const school = await this.db.school.findUnique({
        where: { id: schoolId },
        select: { id: true },
      });
      if (!school) throw new NotFoundException('School not found');

      const owner = await this.db.schoolMembership.findFirst({
        where: { schoolId, status: 'ACTIVE', role: 'ADMIN' },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      const ownerMembershipId = owner?.id ?? null;

      const filterWhere: Prisma.SchoolMembershipWhereInput = {
        AND: [
          { schoolId },
          role ? { role } : {},
          membershipStatus ? { status: membershipStatus } : {},
          q
            ? {
                user: {
                  OR: [
                    { email: { contains: q, mode: 'insensitive' } },
                    { displayName: { contains: q, mode: 'insensitive' } },
                    { id: { equals: q } },
                  ],
                },
              }
            : {},
        ],
      };
      const where: Prisma.SchoolMembershipWhereInput = {
        AND: [filterWhere, createdAtIdCursorWhereDesc(query.cursor)],
      };

      const [rows, total] = await Promise.all([
        this.db.schoolMembership.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: limit + 1,
          select: {
            id: true,
            role: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                status: true,
              },
            },
          },
        }),
        this.db.schoolMembership.count({ where: filterWhere }),
      ]);

      const hasMore = rows.length > limit;
      const page = hasMore ? rows.slice(0, limit) : rows;
      const items: PlatformSchoolMemberRowDto[] = page.map((m) => ({
        membershipId: m.id,
        userId: m.user.id,
        email: m.user.email,
        displayName: m.user.displayName,
        userStatus: m.user.status,
        role: m.role,
        membershipStatus: m.status,
        joinedAt: m.createdAt.toISOString(),
        isOwner: ownerMembershipId != null && m.id === ownerMembershipId,
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
}
