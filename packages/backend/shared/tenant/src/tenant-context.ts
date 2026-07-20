/**
 * Tenant request-context (Phase 0, G1).
 *
 * The shape of the per-request tenant context carried via AsyncLocalStorage
 * (nestjs-cls). Populated incrementally across phases:
 *  - Phase 0: `requestId` (+ best-effort `userId` if already on the request).
 *  - Phase 2: `schoolId` from host resolution (public) / cross-checked with JWT.
 *  - Phase 3: `userId`, `membershipRole`, `platformRole` from the auth guard.
 *
 * `TenantPrismaService` (Phase 1) reads `schoolId` from here to auto-scope queries,
 * which is why this lives in a shared `@be/*` package — `@be/prisma` must be able
 * to import it without depending on `@app/api`.
 */

export type PlatformRole = 'PLATFORM_ADMIN' | 'PLATFORM_SUPPORT' | 'PLATFORM_BILLING';

export type MembershipRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface TenantContext {
  /** Correlation id for logs/traces (set once per request). */
  requestId?: string;
  /** Active tenant. Null on public/platform surfaces until resolved. */
  schoolId?: string | null;
  /** Authenticated user id, if any. */
  userId?: string | null;
  /** Caller's role within the active school. */
  membershipRole?: MembershipRole | null;
  /** Platform-operator role (separate axis from membership). */
  platformRole?: PlatformRole | null;
  /**
   * Resolved UI locale for this request (G33). Derived by resolveLocale:
   * user.locale → school.defaultLocale → Accept-Language → platform default ('en').
   * Null until AuthGuard seeds tenant context.
   */
  locale?: string | null;
}

/** CLS store key under which the `TenantContext` object lives. */
export const TENANT_CLS_KEY = 'tenant' as const;

/**
 * The single-school tenant id created by the tenancy backfill. Used as a
 * **temporary** fallback at write sites that don't yet receive `schoolId` from
 * the tenant context (pre Phase 2/3). Every such use carries a
 * `TODO(multitenant)` and must be replaced by the active context's school.
 */
export const DEFAULT_SCHOOL_ID = 'school_default' as const;
