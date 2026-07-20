import type {
  IntegrationSecretFieldStatusDto,
  LlmProviderId,
  PlatformLlmConfigDto,
  PlatformLlmSettingsDto,
  SchoolLlmSettingsDto,
  UpdateSchoolLlmSettingsRequestDto,
} from '@pkg/types';
import {
  buildIntegrationSettingsDto,
  parsePlatformIntegrationConfig,
  readStoredSecretsFromRow,
  resolvePlatformIntegration,
  type ResolvedPlatformIntegration,
} from '@be/platform-integration';
import {
  encryptIntegrationSecrets,
  hasIntegrationSecretUpdates,
  integrationSecretStatus,
  mergeIntegrationSecrets,
  normalizeIntegrationSecrets,
  type StoredIntegrationSecrets,
} from '@be/platform-integration';

export type SchoolLlmStored = {
  overrideEnabled: boolean;
  config: PlatformLlmConfigDto;
  secrets: StoredIntegrationSecrets;
};

function masterKey(): string | null {
  return (
    process.env['PLATFORM_SECRETS_ENCRYPTION_KEY']?.trim() ||
    process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim() ||
    null
  );
}

export function secretsStorageAvailable(): boolean {
  return Boolean(masterKey());
}

export function defaultLlmConfig(): PlatformLlmConfigDto {
  return parsePlatformIntegrationConfig({}).llm;
}

export function parseSchoolLlmOverride(raw: unknown): SchoolLlmStored {
  const defaults = defaultLlmConfig();
  if (!raw || typeof raw !== 'object') {
    return {
      overrideEnabled: false,
      config: defaults,
      secrets: {},
    };
  }
  const obj = raw as Record<string, unknown>;
  const llm = (obj['llm'] ?? {}) as Record<string, unknown>;
  const provider: LlmProviderId =
    llm['provider'] === 'anthropic' ? 'anthropic' : 'openai_compat';
  return {
    overrideEnabled: llm['overrideEnabled'] === true,
    config: {
      enabled:
        llm['enabled'] === false
          ? false
          : llm['enabled'] === true
            ? true
            : defaults.enabled,
      provider,
      baseUrl:
        typeof llm['baseUrl'] === 'string' && llm['baseUrl'].trim()
          ? llm['baseUrl'].trim()
          : null,
      model:
        typeof llm['model'] === 'string' && llm['model'].trim()
          ? llm['model'].trim()
          : null,
      maxTokens: (() => {
        const n = Number(llm['maxTokens']);
        return Number.isFinite(n) && n > 0
          ? Math.min(Math.round(n), 2048)
          : defaults.maxTokens;
      })(),
      temperature: (() => {
        const n = Number(llm['temperature']);
        return Number.isFinite(n) ? Math.min(Math.max(n, 0), 1) : defaults.temperature;
      })(),
    },
    secrets: {},
  };
}

export function llmSecretStatuses(
  secrets: StoredIntegrationSecrets,
): PlatformLlmSettingsDto['secretStatuses'] {
  return {
    llmApiKey: integrationSecretStatus(
      secrets.llmApiKey,
      process.env['LLM_API_KEY']?.trim() ??
        process.env['OPENAI_API_KEY']?.trim() ??
        undefined,
    ),
    anthropicApiKey: integrationSecretStatus(
      secrets.anthropicApiKey,
      process.env['ANTHROPIC_API_KEY']?.trim() ?? undefined,
    ),
  };
}

export function toPlatformLlmSettingsDto(
  resolvedFull: ResolvedPlatformIntegration,
  storedSecrets: StoredIntegrationSecrets,
  config: PlatformLlmConfigDto,
): PlatformLlmSettingsDto {
  const statuses = llmSecretStatuses(storedSecrets);
  return {
    config,
    secrets: {
      llmApiKey:
        resolvedFull.llm.provider === 'openai_compat'
          ? (resolvedFull.llm.apiKey ?? undefined)
          : undefined,
      anthropicApiKey:
        resolvedFull.llm.provider === 'anthropic'
          ? (resolvedFull.llm.apiKey ?? undefined)
          : storedSecrets.anthropicApiKey ??
            process.env['ANTHROPIC_API_KEY']?.trim() ??
            undefined,
    },
    secretStatuses: statuses,
    secretsStorageAvailable: secretsStorageAvailable(),
  };
}

export type MergedLlm = ResolvedPlatformIntegration['llm'] & {
  source: 'school' | 'platform' | 'env';
};

/**
 * school override → platform resolved → already includes env in platform resolve.
 */
export function mergeLlmRuntime(
  platform: ResolvedPlatformIntegration['llm'],
  school: SchoolLlmStored | null,
): MergedLlm {
  const envOnly =
    !platform.apiKey &&
    !platform.model &&
    Boolean(process.env['LLM_API_KEY'] || process.env['ANTHROPIC_API_KEY']);

  if (!school?.overrideEnabled) {
    return {
      ...platform,
      source: envOnly && !platform.apiKey ? 'env' : 'platform',
    };
  }

  const cfg = school.config;
  const schoolKey =
    cfg.provider === 'anthropic'
      ? school.secrets.anthropicApiKey
      : school.secrets.llmApiKey;

  return {
    enabled: cfg.enabled,
    provider: cfg.provider,
    baseUrl:
      cfg.baseUrl ??
      platform.baseUrl ??
      (cfg.provider === 'openai_compat' ? 'https://api.openai.com/v1' : null),
    model:
      cfg.model ??
      platform.model ??
      (cfg.provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4.1-mini'),
    maxTokens: cfg.maxTokens || platform.maxTokens,
    temperature:
      typeof cfg.temperature === 'number' ? cfg.temperature : platform.temperature,
    apiKey: schoolKey ?? platform.apiKey,
    source: 'school',
  };
}

export function buildSchoolLlmSettingsDto(opts: {
  platformResolved: ResolvedPlatformIntegration;
  platformStoredSecrets: StoredIntegrationSecrets;
  platformConfig: PlatformLlmConfigDto;
  schoolRawConfig: unknown;
  schoolSecretsPayload: string | null;
  canOverride: boolean;
}): SchoolLlmSettingsDto {
  const schoolParsed = parseSchoolLlmOverride(opts.schoolRawConfig);
  const schoolSecrets = readStoredSecretsFromRow(
    opts.schoolSecretsPayload,
    masterKey(),
  );
  schoolParsed.secrets = schoolSecrets;

  const merged = mergeLlmRuntime(opts.platformResolved.llm, schoolParsed);
  const platformDto = toPlatformLlmSettingsDto(
    opts.platformResolved,
    opts.platformStoredSecrets,
    opts.platformConfig,
  );

  const overrideStatuses: Record<string, IntegrationSecretFieldStatusDto> = {
    llmApiKey: integrationSecretStatus(schoolSecrets.llmApiKey, undefined),
    anthropicApiKey: integrationSecretStatus(
      schoolSecrets.anthropicApiKey,
      undefined,
    ),
  };

  return {
    effective: {
      enabled: merged.enabled,
      provider: merged.provider,
      baseUrl: merged.baseUrl,
      model: merged.model,
      maxTokens: merged.maxTokens,
      temperature: merged.temperature,
      source: merged.source,
      apiKeyConfigured: Boolean(merged.apiKey),
    },
    platformDefaults: {
      ...platformDto.config,
      secretStatuses: platformDto.secretStatuses,
    },
    override: {
      overrideEnabled: schoolParsed.overrideEnabled,
      config: schoolParsed.config,
      secrets: {
        llmApiKey: schoolSecrets.llmApiKey,
        anthropicApiKey: schoolSecrets.anthropicApiKey,
      },
      secretStatuses: overrideStatuses as SchoolLlmSettingsDto['override']['secretStatuses'],
    },
    canOverride: opts.canOverride,
    secretsStorageAvailable: secretsStorageAvailable(),
  };
}

export function applySchoolLlmUpdate(
  currentConfigJson: unknown,
  currentSecretsPayload: string | null,
  body: UpdateSchoolLlmSettingsRequestDto,
): { nextConfigJson: Record<string, unknown>; nextSecretsPayload: string | null } {
  const current = parseSchoolLlmOverride(currentConfigJson);
  const currentSecrets = readStoredSecretsFromRow(
    currentSecretsPayload,
    masterKey(),
  );
  const nextOverrideEnabled =
    body.overrideEnabled === undefined
      ? current.overrideEnabled
      : body.overrideEnabled === true;

  const nextConfig: PlatformLlmConfigDto = {
    ...current.config,
    ...(body.config ?? {}),
    provider:
      body.config?.provider === 'anthropic' ||
      body.config?.provider === 'openai_compat'
        ? body.config.provider
        : current.config.provider,
  };

  const nextSecrets = hasIntegrationSecretUpdates(body.secrets)
    ? mergeIntegrationSecrets(currentSecrets, {
        llmApiKey: body.secrets?.llmApiKey,
        anthropicApiKey: body.secrets?.anthropicApiKey,
      })
    : currentSecrets;

  const base =
    currentConfigJson && typeof currentConfigJson === 'object'
      ? { ...(currentConfigJson as Record<string, unknown>) }
      : {};

  base['llm'] = {
    overrideEnabled: nextOverrideEnabled,
    enabled: nextConfig.enabled,
    provider: nextConfig.provider,
    baseUrl: nextConfig.baseUrl,
    model: nextConfig.model,
    maxTokens: nextConfig.maxTokens,
    temperature: nextConfig.temperature,
  };

  let nextSecretsPayload = currentSecretsPayload;
  if (hasIntegrationSecretUpdates(body.secrets)) {
    const key = masterKey();
    if (!key) {
      throw new Error('Secrets encryption key is not configured on the API');
    }
    const full = normalizeIntegrationSecrets({
      ...currentSecrets,
      ...nextSecrets,
    });
    nextSecretsPayload = encryptIntegrationSecrets(full, key);
  }

  return { nextConfigJson: base, nextSecretsPayload };
}

/** Re-export helpers used by services that already have full integration DTOs. */
export function platformLlmFromIntegrationRow(
  integrationConfig: unknown,
  integrationSecrets: string | null,
): {
  settings: PlatformLlmSettingsDto;
  resolved: ResolvedPlatformIntegration;
  storedSecrets: StoredIntegrationSecrets;
  config: PlatformLlmConfigDto;
} {
  const storedSecrets = readStoredSecretsFromRow(integrationSecrets, masterKey());
  const config = parsePlatformIntegrationConfig(integrationConfig);
  const resolved = resolvePlatformIntegration(config, storedSecrets);
  const fullDto = buildIntegrationSettingsDto(
    config,
    storedSecrets,
    secretsStorageAvailable(),
  );
  return {
    settings: {
      config: fullDto.config.llm,
      secrets: {
        llmApiKey: fullDto.secrets.llmApiKey,
        anthropicApiKey: fullDto.secrets.anthropicApiKey,
      },
      secretStatuses: {
        llmApiKey: fullDto.secretStatuses.llmApiKey,
        anthropicApiKey: fullDto.secretStatuses.anthropicApiKey,
      },
      secretsStorageAvailable: fullDto.secretsStorageAvailable,
    },
    resolved,
    storedSecrets,
    config: config.llm,
  };
}
