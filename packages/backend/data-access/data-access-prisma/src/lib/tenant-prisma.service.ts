import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { TenantContextService } from '@be/tenant';
import { PrismaService } from './prisma.service';
import { scopeArgs } from './tenant-scope';

/** CLS flag enabling the audited cross-tenant bypass (set only by asPlatform). */
export const PLATFORM_BYPASS_KEY = 'tenant.asPlatform' as const;

interface ExtensionHooks {
  getSchoolId: () => string | null;
  getIsPlatform: () => boolean;
}

/**
 * Builds the Prisma `$extends` config that auto-scopes every model operation to
 * the active tenant via the pure `scopeArgs`. Extracted as a factory so the
 * wiring (reads schoolId, computes the platform flag, forwards scoped args) is
 * unit-testable without a database.
 */
export function makeTenantExtension(hooks: ExtensionHooks) {
  return {
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $allOperations({ model, operation, args, query }: any) {
          const scoped = scopeArgs({
            model,
            operation,
            args,
            schoolId: hooks.getSchoolId(),
            isPlatform: hooks.getIsPlatform(),
          });
          return query(scoped);
        },
      },
    },
  };
}

/**
 * Tenant-aware Prisma access (ADR-005). Use `.client` for all tenant-scoped data
 * instead of the raw `PrismaService`; queries are automatically constrained to
 * the active `schoolId` from the request CLS context.
 *
 * Cross-tenant access is only possible through `asPlatform()` — the single,
 * audited escape hatch reserved for `@be/platform-admin`. Outside an active
 * context (e.g. cron/webhooks) tenant-model access fails loud unless wrapped in
 * `asPlatform()`, forcing jobs to be explicit about tenancy (G4).
 */
@Injectable()
export class TenantPrismaService {
  /**
   * The tenant-scoped client. Typed as `PrismaClient` because the `$extends`
   * query hooks only intercept arguments — they do not change the model/field
   * shape — so the static surface is identical to the base client. (The inferred
   * `$extends` return type erases to `unknown` across the package boundary, which
   * is useless to consumers; the cast restores the full typed model API.)
   */
  readonly client: PrismaClient;

  constructor(
    base: PrismaService,
    private readonly tenant: TenantContextService,
    private readonly cls: ClsService,
  ) {
    this.client = base.$extends(
      makeTenantExtension({
        getSchoolId: () => this.tenant.schoolId,
        getIsPlatform: () =>
          this.cls.isActive() && this.cls.get(PLATFORM_BYPASS_KEY) === true,
      }),
    ) as unknown as PrismaClient;
  }

  /**
   * Run `fn` with tenant scoping disabled (audited cross-tenant access).
   * Works inside an existing request context or standalone (cron/webhooks),
   * in which case it establishes a fresh CLS context for the duration.
   */
  asPlatform<T>(fn: () => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const prev = this.cls.get(PLATFORM_BYPASS_KEY) === true;
      this.cls.set(PLATFORM_BYPASS_KEY, true);
      try {
        return await fn();
      } finally {
        this.cls.set(PLATFORM_BYPASS_KEY, prev);
      }
    };
    return this.cls.isActive() ? run() : this.cls.run(run);
  }
}
