import { Injectable, Logger } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

// Optional Sentry — only active when SENTRY_DSN is configured.
let Sentry: { setTag: (key: string, value: string) => void } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require('@sentry/node') as typeof Sentry;
} catch {
  // Sentry not installed — skip tagging.
}

/**
 * Drop-in replacement for NestJS `Logger` that automatically tags every log
 * entry with the current request's `schoolId`, `userId`, and `requestId`
 * from the CLS tenant context (G14 observability).
 *
 * Usage: inject `TenantLoggerService` instead of `new Logger(...)` in any
 * tenant-scoped service.
 */
@Injectable()
export class TenantLoggerService {
  private readonly logger: Logger;

  constructor(private readonly tenant: TenantContextService) {
    this.logger = new Logger(TenantLoggerService.name);
  }

  /** Create a child logger with a specific context label. */
  forContext(context: string): TenantLoggerService {
    const child = Object.create(this) as TenantLoggerService;
    (child as unknown as { logger: Logger }).logger = new Logger(context);
    return child;
  }

  private ctx(): Record<string, string | null> {
    return {
      schoolId: this.tenant.schoolId,
      userId: this.tenant.userId,
      requestId: this.tenant.requestId,
    };
  }

  log(message: string, extra?: Record<string, unknown>): void {
    this.logger.log(this.format(message, extra));
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    this.logger.warn(this.format(message, extra));
  }

  error(message: string, stack?: string, extra?: Record<string, unknown>): void {
    if (Sentry && this.tenant.schoolId) {
      Sentry.setTag('schoolId', this.tenant.schoolId);
    }
    this.logger.error(this.format(message, extra), stack);
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    this.logger.debug(this.format(message, extra));
  }

  verbose(message: string, extra?: Record<string, unknown>): void {
    this.logger.verbose(this.format(message, extra));
  }

  private format(message: string, extra?: Record<string, unknown>): string {
    const tags = this.ctx();
    const hasCtx = Object.values(tags).some((v) => v !== null);
    if (!hasCtx && !extra) return message;
    const meta = { ...tags, ...extra };
    return `${message} ${JSON.stringify(meta)}`;
  }
}
