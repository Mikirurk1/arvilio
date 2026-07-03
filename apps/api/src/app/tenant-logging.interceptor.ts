import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TenantContextService } from '@be/tenant';

/**
 * G14 — Observability: logs every HTTP/GraphQL request with tenant tags
 * (schoolId, userId, requestId) so operators can correlate issues per tenant.
 *
 * Output format: `[method] path | status ms {schoolId, userId, requestId}`
 * Designed to be concise — structured fields travel in the JSON suffix.
 */
@Injectable()
export class TenantLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly tenant: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType<'http' | 'graphql'>();
    const start = Date.now();

    const label =
      type === 'http'
        ? (() => {
            const req = context.switchToHttp().getRequest<{
              method: string;
              url: string;
            }>();
            return `${req.method} ${req.url}`;
          })()
        : `GQL ${context.getHandler().name}`;

    return next.handle().pipe(
      tap({
        next: () => this.log(label, start, 200),
        error: (err: { status?: number }) =>
          this.log(label, start, err?.status ?? 500),
      }),
    );
  }

  private log(label: string, start: number, status: number): void {
    const ms = Date.now() - start;
    const ctx = {
      schoolId: this.tenant.schoolId,
      userId: this.tenant.userId,
      requestId: this.tenant.requestId,
    };
    const hasCtx = Object.values(ctx).some((v) => v !== null);
    const suffix = hasCtx ? ` ${JSON.stringify(ctx)}` : '';
    const msg = `${label} | ${status} ${ms}ms${suffix}`;
    if (status >= 500) {
      this.logger.error(msg);
    } else if (status >= 400) {
      this.logger.warn(msg);
    } else {
      this.logger.log(msg);
    }
  }
}
