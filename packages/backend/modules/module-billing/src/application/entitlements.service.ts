import { ForbiddenException, HttpException, HttpStatus, Injectable, PayloadTooLargeException } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import {
  PLAN_CATALOG,
  GRANDFATHERED_PLAN_KEY,
  paidPlanKey,
  type PlanEntitlements,
  type PlanFeature,
} from '../shared/subscription-plans';

export interface StorageUsageDto {
  usedBytes: string;
  quotaBytes: string;
  remainingBytes: string;
  /** Percent used, 0–100 (rounded), for the usage meter. */
  percentUsed: number;
  overQuota: boolean;
}

export interface EntitlementsSummaryDto {
  plan: string;
  maxActiveStudents: number | null;
  activeStudentCount: number;
  seatsRemaining: number | null;
  features: { customDomain: boolean; aiAssist: boolean; recordings: boolean };
  storage: StorageUsageDto;
}

/**
 * Resolves and enforces a school's plan entitlements (Phase 5, Gate 5). Storage
 * accounting reads `School.storageUsedBytes` (BigInt, maintained in Phase 3); seat
 * limits count ACTIVE student memberships. Read with the base PrismaService —
 * entitlements gate tenant actions but are themselves keyed explicitly by schoolId.
 */
@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Effective entitlements for a school:
   *  - a paid subscription (STARTER/PRO) → that tier;
   *  - `School.status === 'TRIAL'` (self-serve trial) → TRIAL limits;
   *  - otherwise (ACTIVE/legacy with no paid plan) → grandfathered top tier, so
   *    the existing single-school deployment is never retroactively capped.
   */
  async resolveForSchool(schoolId: string): Promise<PlanEntitlements> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { status: true, subscription: { select: { plan: true } } },
    });
    const paid = paidPlanKey(school?.subscription?.plan);
    if (paid) return PLAN_CATALOG[paid];
    if (school?.status === 'TRIAL') return PLAN_CATALOG.TRIAL;
    return PLAN_CATALOG[GRANDFATHERED_PLAN_KEY];
  }

  async getStorageUsage(schoolId: string): Promise<StorageUsageDto> {
    const [school, ent] = await Promise.all([
      this.prisma.school.findUnique({ where: { id: schoolId }, select: { storageUsedBytes: true } }),
      this.resolveForSchool(schoolId),
    ]);
    const used = school?.storageUsedBytes ?? 0n;
    const quota = BigInt(ent.storageQuotaBytes);
    const remaining = quota > used ? quota - used : 0n;
    const percentUsed =
      quota > 0n ? Math.min(100, Math.round(Number((used * 100n) / quota))) : 100;
    return {
      usedBytes: used.toString(),
      quotaBytes: quota.toString(),
      remainingBytes: remaining.toString(),
      percentUsed,
      overQuota: used >= quota,
    };
  }

  /**
   * Throws `PayloadTooLargeException` if accepting `incomingBytes` would exceed the
   * school's storage quota (the "no infinite uploads" rule). Call before persisting
   * any upload. Never auto-deletes; the caller surfaces the upgrade prompt.
   */
  async assertCanUpload(schoolId: string, incomingBytes: number): Promise<void> {
    if (!incomingBytes || incomingBytes <= 0) return;
    const [school, ent] = await Promise.all([
      this.prisma.school.findUnique({ where: { id: schoolId }, select: { storageUsedBytes: true } }),
      this.resolveForSchool(schoolId),
    ]);
    const used = school?.storageUsedBytes ?? 0n;
    if (used + BigInt(Math.ceil(incomingBytes)) > BigInt(ent.storageQuotaBytes)) {
      throw new PayloadTooLargeException(
        'Storage quota exceeded — upgrade your plan or free up space to upload more.',
      );
    }
  }

  private activeStudentCount(schoolId: string): Promise<number> {
    return this.prisma.schoolMembership.count({
      where: { schoolId, role: 'STUDENT', status: 'ACTIVE' },
    });
  }

  /** Whether the school's plan includes a feature (customDomain/aiAssist/recordings). */
  async hasFeature(schoolId: string, feature: PlanFeature): Promise<boolean> {
    const ent = await this.resolveForSchool(schoolId);
    return ent.features[feature] === true;
  }

  /** Throws ForbiddenException if the school's plan does not include the feature. */
  async assertFeature(schoolId: string, feature: PlanFeature): Promise<void> {
    if (!(await this.hasFeature(schoolId, feature))) {
      throw new ForbiddenException({
        message: `Your plan does not include this feature (${feature}).`,
        featureBlocked: feature,
      });
    }
  }

  /**
   * Throws TooManyRequestsException (429) if the school has exhausted its daily
   * AI-assist credit quota. Call before any AI-assist operation; pair with
   * `consumeAiCredit` after the operation succeeds.
   */
  async assertAiCredit(schoolId: string): Promise<void> {
    const ent = await this.resolveForSchool(schoolId);
    if (!ent.features.aiAssist) {
      throw new ForbiddenException({
        message: 'Your plan does not include AI-assist.',
        featureBlocked: 'aiAssist' as PlanFeature,
      });
    }
    if (ent.aiCreditsPerDay === 0) return; // unlimited
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { aiCreditsUsedToday: true, aiCreditsResetAt: true },
    });
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const used =
      school?.aiCreditsResetAt && school.aiCreditsResetAt >= todayStart
        ? school.aiCreditsUsedToday
        : 0;
    if (used >= ent.aiCreditsPerDay) {
      throw new HttpException(
        `Daily AI-assist limit of ${ent.aiCreditsPerDay} requests reached. Resets at midnight UTC.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Increment the school's daily AI credit usage counter atomically.
   * Resets the counter when called on a new day (aiCreditsResetAt < today).
   */
  async consumeAiCredit(schoolId: string): Promise<void> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { aiCreditsResetAt: true },
    });
    const isNewDay = !school?.aiCreditsResetAt || school.aiCreditsResetAt < todayStart;
    await this.prisma.school.update({
      where: { id: schoolId },
      data: {
        aiCreditsUsedToday: isNewDay ? 1 : { increment: 1 },
        aiCreditsResetAt: isNewDay ? todayStart : undefined,
      },
    });
  }

  /** Resets daily AI credits for all schools (called by TrialLifecycleScheduler at midnight). */
  async resetDailyAiCredits(): Promise<void> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    await this.prisma.school.updateMany({
      where: { aiCreditsUsedToday: { gt: 0 } },
      data: { aiCreditsUsedToday: 0, aiCreditsResetAt: todayStart },
    });
  }

  /** True if the school can mark another student membership ACTIVE (seat limit). */
  async canAddActiveStudent(schoolId: string): Promise<boolean> {
    const ent = await this.resolveForSchool(schoolId);
    if (ent.maxActiveStudents == null) return true;
    return (await this.activeStudentCount(schoolId)) < ent.maxActiveStudents;
  }

  /** Full entitlements + usage snapshot for the meter UI (plan, seats, storage). */
  async getSummary(schoolId: string): Promise<EntitlementsSummaryDto> {
    const [ent, storage, activeStudentCount] = await Promise.all([
      this.resolveForSchool(schoolId),
      this.getStorageUsage(schoolId),
      this.activeStudentCount(schoolId),
    ]);
    const seatsRemaining =
      ent.maxActiveStudents == null ? null : Math.max(0, ent.maxActiveStudents - activeStudentCount);
    return {
      plan: ent.key,
      maxActiveStudents: ent.maxActiveStudents,
      activeStudentCount,
      seatsRemaining,
      features: ent.features,
      storage,
    };
  }
}
