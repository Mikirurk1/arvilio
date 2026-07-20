import { headers } from 'next/headers';

/**
 * Server-side fetch to the platform REST surface (`/api/platform/*`). Forwards the
 * incoming request cookies so the backend `AuthGuard` + `PlatformAdminGuard` can
 * authorize the operator. SSR-only: never import from a client component.
 */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000').replace(
  /\/$/,
  '',
);

export class PlatformApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function platformGet<T>(path: string): Promise<T> {
  const cookie = (await headers()).get('cookie') ?? '';
  const res = await fetch(`${API_PROXY_TARGET}/api${path}`, {
    headers: { Accept: 'application/json', cookie },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new PlatformApiError(res.status, `Platform API ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

// --- DTOs (kept in sync with @be/platform-admin; frontend must not import @be/*) ---

export type PlatformPageDto<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
};

export interface PlatformDashboardRecentCampusDto {
  id: string;
  name: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  subscriptionStatus: string | null;
  createdAt: string;
}

export interface PlatformDashboardTrialEndingDto {
  id: string;
  name: string;
  trialEndsAt: string;
}

export interface PlatformDashboardAuditDto {
  id: string;
  action: string;
  actorName: string;
  createdAt: string;
  targetSchoolId: string | null;
}

export interface PlatformDashboardBillingHealthDto {
  enabledCount: number;
  configuredCount: number;
  totalRails: number;
}

export interface PlatformDashboardDto {
  schoolCount: number;
  activeSchoolCount: number;
  trialSchoolCount: number;
  suspendedSchoolCount: number;
  activeUserCount: number;
  activeSubscriptionCount: number;
  totalStorageUsedBytes: string;
  mrrMinor: number;
  trialingSubscriptionCount: number;
  trialsEndingSoon: PlatformDashboardTrialEndingDto[];
  recentCampuses: PlatformDashboardRecentCampusDto[];
  recentAudit: PlatformDashboardAuditDto[];
  userStats: PlatformUserStatsDto;
  billingHealth: PlatformDashboardBillingHealthDto;
}

export interface PlatformUserBriefDto {
  id: string;
  email: string;
  displayName: string;
  status: string;
  createdAt: string;
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
  billingCountry: string | null;
  owner: PlatformUserBriefDto | null;
  admins: PlatformUserBriefDto[];
}

export interface PlatformSchoolMemberRowDto {
  membershipId: string;
  userId: string;
  email: string;
  displayName: string;
  userStatus: string;
  role: string;
  membershipStatus: string;
  joinedAt: string;
  isOwner: boolean;
}

export interface PlatformUserMembershipPreviewDto {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  role: string;
  status: string;
}

export interface PlatformUserRowDto {
  id: string;
  email: string;
  displayName: string;
  status: string;
  accountRole: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  membershipCount: number;
  memberships: PlatformUserMembershipPreviewDto[];
  isPlatformOperator: boolean;
  platformRole: string | null;
}

export interface PlatformUserStatsDto {
  totalUsers: number;
  activeUsers: number;
  pausedUsers: number;
  blockedUsers: number;
  leavedUsers: number;
  platformOperators: number;
  usersWithMembership: number;
  usersWithoutMembership: number;
}

export interface PaymentAllowlistDto {
  allowed: string[];
  allMethods: string[];
}

export interface PromoCodeDto {
  id: string;
  code: string;
  kind: string;
  trialDays: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  validFrom: string | null;
  validTo: string | null;
  active: boolean;
  createdAt: string;
}

export interface PlatformAuditEntryDto {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetSchoolId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}
