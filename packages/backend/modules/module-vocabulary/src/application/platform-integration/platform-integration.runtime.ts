import { ClsServiceManager } from 'nestjs-cls';
import { TENANT_CLS_KEY, type TenantContext } from '@be/tenant';
import {
  defaultPlatformIntegrationConfig,
  parsePlatformIntegrationConfig,
  resolvePlatformIntegration,
} from './platform-integration.config.util';
import type { ResolvedPlatformIntegration } from './platform-integration.config.util';

/**
 * Per-tenant resolved integration runtime (G3).
 *
 * Previously a single process-wide `let cached`, which would leak one school's
 * integration config/secrets into another's once integrations become
 * school-operated. The cache is now keyed by the active `schoolId` (read from
 * the CLS tenant context), with a platform-global entry used as the default.
 *
 * Today every school shares the platform-global config (sourced from the
 * `PlatformSettings` singleton), so no per-school entries are written and every
 * caller falls back to `PLATFORM_KEY` — behaviour is unchanged. When a school
 * gets its own integration config (per-school PSP / white-label), the admin
 * save path calls `refreshPlatformIntegrationRuntime(config, secrets, schoolId)`
 * to populate `cache[schoolId]`.
 */

/** Sentinel key for the platform-global integration config (cuids never collide). */
const PLATFORM_KEY = '__platform__';

const cache = new Map<string, ResolvedPlatformIntegration>();

/** Active tenant id from the CLS context, or null outside a request/context. */
function currentSchoolId(): string | null {
  const cls = ClsServiceManager.getClsService();
  if (!cls || !cls.isActive()) return null;
  const ctx = cls.get<TenantContext | undefined>(TENANT_CLS_KEY);
  return ctx?.schoolId ?? null;
}

function resolveFromEnvOnly(): ResolvedPlatformIntegration {
  const config = defaultPlatformIntegrationConfig();
  return resolvePlatformIntegration(config, {});
}

/**
 * Resolved integration for the active tenant: a per-school entry when present,
 * otherwise the platform-global default (env-only fallback before any refresh).
 */
export function getPlatformIntegrationRuntime(): ResolvedPlatformIntegration {
  const schoolId = currentSchoolId();
  if (schoolId) {
    const perSchool = cache.get(schoolId);
    if (perSchool) return perSchool;
  }
  return cache.get(PLATFORM_KEY) ?? resolveFromEnvOnly();
}

/**
 * Set (or clear, when `next` is null) the resolved runtime for a school, or for
 * the platform-global default when `schoolId` is omitted.
 */
export function setPlatformIntegrationRuntime(
  next: ResolvedPlatformIntegration | null,
  schoolId?: string,
): void {
  const key = schoolId ?? PLATFORM_KEY;
  if (next === null) cache.delete(key);
  else cache.set(key, next);
}

/** Re-read process.env into the platform-global cache (unit tests after env changes). */
export function resetPlatformIntegrationRuntimeFromEnv(): void {
  cache.clear();
  cache.set(PLATFORM_KEY, resolveFromEnvOnly());
}

/**
 * Resolve config+secrets and store under the school (or platform-global when
 * `schoolId` is omitted). Returns the resolved value.
 */
export function refreshPlatformIntegrationRuntime(
  integrationConfig: unknown,
  storedSecrets: import('./platform-integration-secrets.util').StoredIntegrationSecrets,
  schoolId?: string,
): ResolvedPlatformIntegration {
  const config = parsePlatformIntegrationConfig(integrationConfig);
  const resolved = resolvePlatformIntegration(config, storedSecrets);
  cache.set(schoolId ?? PLATFORM_KEY, resolved);
  return resolved;
}

/** Invalidate a school's cached runtime (platform-global when omitted). */
export function invalidatePlatformIntegrationRuntime(schoolId?: string): void {
  cache.delete(schoolId ?? PLATFORM_KEY);
}
