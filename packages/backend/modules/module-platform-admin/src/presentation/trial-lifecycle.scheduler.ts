import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TrialLifecycleService } from '../application/trial-lifecycle.service';

/**
 * Daily sweep that suspends schools whose trial (+ grace) has lapsed (Phase 4.5.1,
 * G4). Thin wrapper — all logic lives in `TrialLifecycleService` so it stays unit
 * testable without the scheduler.
 */
@Injectable()
export class TrialLifecycleScheduler {
  private readonly logger = new Logger(TrialLifecycleScheduler.name);

  constructor(private readonly trials: TrialLifecycleService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sweepExpiredTrials(): Promise<void> {
    try {
      await this.trials.expireTrials();
    } catch (error) {
      this.logger.error('Trial expiry sweep failed', error as Error);
    }
    try {
      await this.trials.suspendOverdueSubscriptions();
    } catch (error) {
      this.logger.error('Dunning suspension sweep failed', error as Error);
    }
    try {
      await this.trials.resetDailyAiCredits();
    } catch (error) {
      this.logger.error('AI credit reset failed', error as Error);
    }
    try {
      await this.trials.pruneAuditLogs();
    } catch (error) {
      this.logger.error('Audit log pruning failed', error as Error);
    }
  }
}
