import {
  defaultPlatformIntegrationConfig,
  parsePlatformIntegrationConfig,
  resolvePlatformIntegration,
} from './platform-integration.config.util';
import type { ResolvedPlatformIntegration } from './platform-integration.config.util';

let cached: ResolvedPlatformIntegration | null = null;

function resolveFromEnvOnly(): ResolvedPlatformIntegration {
  const config = defaultPlatformIntegrationConfig();
  return resolvePlatformIntegration(config, {});
}

/** Process-wide resolved integration (DB + env). Updated by PlatformIntegrationService. */
export function getPlatformIntegrationRuntime(): ResolvedPlatformIntegration {
  return cached ?? resolveFromEnvOnly();
}

export function setPlatformIntegrationRuntime(next: ResolvedPlatformIntegration | null): void {
  cached = next;
}

/** Re-read process.env into the runtime cache (unit tests after env changes). */
export function resetPlatformIntegrationRuntimeFromEnv(): void {
  cached = resolveFromEnvOnly();
}

export function refreshPlatformIntegrationRuntime(
  integrationConfig: unknown,
  storedSecrets: import('./platform-integration-secrets.util').StoredIntegrationSecrets,
): ResolvedPlatformIntegration {
  const config = parsePlatformIntegrationConfig(integrationConfig);
  const resolved = resolvePlatformIntegration(config, storedSecrets);
  cached = resolved;
  return resolved;
}
