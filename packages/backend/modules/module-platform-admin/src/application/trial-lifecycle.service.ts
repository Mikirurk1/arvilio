import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@be/prisma';

/**
 * Grace window after `trialEndsAt` before a trial school is suspended (Phase 4.5.1).
 * During grace the school is still usable (UI shows a "trial ended" banner); after
 * it, the school is suspended (ADR-007 enforcement blocks members until upgrade).
 */
export const TRIAL_GRACE_DAYS = 3;

/**
 * Grace window after a subscription goes PAST_DUE (a failed payment) before the
 * school is suspended (Phase 5 dunning). During this window the school stays
 * ACTIVE while Stripe retries; after it, suspend (ADR-007).
 */
export const DUNNING_GRACE_DAYS = 7;

/**
 * Platform-level trial lifecycle (G4 tenant-aware job, ADR-008/009). Operates on
 * the platform-global School/SchoolSubscription tables via the base PrismaService
 * and **iterates schools explicitly** — it never relies on ambient tenant context
 * (the G4 rule for background jobs). Schools without a subscription (e.g. the
 * legacy default school) never match, so they are never auto-suspended.
 */
@Injectable()
export class TrialLifecycleService {
  private readonly logger = new Logger(TrialLifecycleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async expireTrials(now: Date = new Date()): Promise<{ suspended: number; schoolIds: string[] }> {
    const cutoff = new Date(now.getTime() - TRIAL_GRACE_DAYS * 24 * 60 * 60 * 1000);
    const expired = await this.prisma.school.findMany({
      where: { status: 'TRIAL', subscription: { trialEndsAt: { lt: cutoff } } },
      select: { id: true },
    });
    if (expired.length === 0) return { suspended: 0, schoolIds: [] };

    const schoolIds = expired.map((s) => s.id);
    await this.prisma.school.updateMany({
      where: { id: { in: schoolIds } },
      data: { status: 'SUSPENDED' },
    });
    this.logger.log(`Suspended ${schoolIds.length} school(s) past trial + grace window`);
    return { suspended: schoolIds.length, schoolIds };
  }

  /**
   * Dunning sweep (Phase 5): suspend ACTIVE schools whose subscription has been
   * PAST_DUE longer than the grace window (Stripe retries exhausted). The PAST_DUE
   * timestamp is the subscription's `updatedAt` (bumped when the webhook set it).
   */
  async suspendOverdueSubscriptions(
    now: Date = new Date(),
  ): Promise<{ suspended: number; schoolIds: string[] }> {
    const cutoff = new Date(now.getTime() - DUNNING_GRACE_DAYS * 24 * 60 * 60 * 1000);
    const overdue = await this.prisma.school.findMany({
      where: {
        status: 'ACTIVE',
        subscription: { status: 'PAST_DUE', updatedAt: { lt: cutoff } },
      },
      select: { id: true },
    });
    if (overdue.length === 0) return { suspended: 0, schoolIds: [] };

    const schoolIds = overdue.map((s) => s.id);
    await this.prisma.school.updateMany({
      where: { id: { in: schoolIds } },
      data: { status: 'SUSPENDED' },
    });
    this.logger.log(`Suspended ${schoolIds.length} school(s) past dunning grace window`);
    return { suspended: schoolIds.length, schoolIds };
  }

  /** Reset daily AI-assist credit counters for all schools (G42). */
  async resetDailyAiCredits(): Promise<void> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    await this.prisma.school.updateMany({
      where: { aiCreditsUsedToday: { gt: 0 } },
      data: { aiCreditsUsedToday: 0, aiCreditsResetAt: todayStart },
    });
  }

  /**
   * GDPR audit log retention (G15): hard-delete `PlatformAuditLog` entries older
   * than 7 years. Financial/billing records are kept separately and not touched here.
   * Runs once a day alongside the trial sweep.
   */
  async pruneAuditLogs(): Promise<{ deleted: number }> {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 7);
    const { count } = await this.prisma.platformAuditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) {
      this.logger.log(`Audit log retention: deleted ${count} entries older than 7 years`);
    }
    return { deleted: count };
  }
}
