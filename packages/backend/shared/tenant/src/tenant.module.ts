import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { TENANT_CLS_KEY, type TenantContext } from './tenant-context';
import { TenantContextService } from './tenant-context.service';
import { TenantLoggerService } from './tenant-logger.service';

/**
 * Establishes a per-request AsyncLocalStorage context (nestjs-cls) and exposes
 * `TenantContextService` app-wide. This is the Phase 0 foundation (G1) for
 * tenant auto-scoping (Phase 1) and tenant-aware auth (Phase 3).
 *
 * The CLS middleware runs before guards, so only request-time primitives are
 * seeded here (requestId, best-effort userId). `schoolId` / roles are populated
 * later by the tenant-resolution middleware (Phase 2) and auth guard (Phase 3).
 *
 * NOTE: this mounts the HTTP middleware which also covers GraphQL-over-HTTP.
 * WebSocket / non-HTTP entrypoints need a separate CLS enhancer (later phase).
 */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: unknown) => {
          const userId =
            (req as { user?: { id?: string } } | undefined)?.user?.id ?? null;
          const ctx: TenantContext = { requestId: randomUUID(), userId };
          cls.set(TENANT_CLS_KEY, ctx);
        },
      },
    }),
  ],
  providers: [TenantContextService, TenantLoggerService],
  exports: [TenantContextService, TenantLoggerService],
})
export class TenantModule {}
