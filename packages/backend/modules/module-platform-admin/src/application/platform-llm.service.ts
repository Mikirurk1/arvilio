import { Injectable } from '@nestjs/common';
import { PlatformIntegrationService } from '@be/vocabulary';
import { testLlmConnection } from '@be/assistant/llm-connection-test';
import type {
  PlatformLlmSettingsDto,
  TestLlmConnectionRequestDto,
  TestLlmConnectionResultDto,
  UpdatePlatformIntegrationSettingsRequestDto,
} from '@pkg/types';
import { PlatformAuditService } from './platform-audit.service';

/**
 * Control Plane default LLM (PlatformSettings.integration*.llm).
 * School Pro overrides live under Campus `/api/system/llm`.
 */
@Injectable()
export class PlatformLlmService {
  constructor(
    private readonly integrations: PlatformIntegrationService,
    private readonly audit: PlatformAuditService,
  ) {}

  async get(): Promise<PlatformLlmSettingsDto> {
    const full = await this.integrations.getSettings();
    return {
      config: full.config.llm,
      secrets: {
        llmApiKey: full.secrets.llmApiKey,
        anthropicApiKey: full.secrets.anthropicApiKey,
      },
      secretStatuses: {
        llmApiKey: full.secretStatuses.llmApiKey,
        anthropicApiKey: full.secretStatuses.anthropicApiKey,
      },
      secretsStorageAvailable: full.secretsStorageAvailable,
    };
  }

  async set(
    body: UpdatePlatformIntegrationSettingsRequestDto,
    ip: string | null,
  ): Promise<PlatformLlmSettingsDto> {
    const full = await this.integrations.updateSettings({
      config: body.config?.llm ? { llm: body.config.llm } : undefined,
      secrets: {
        llmApiKey: body.secrets?.llmApiKey,
        anthropicApiKey: body.secrets?.anthropicApiKey,
      },
    });
    await this.audit.record({
      action: 'platform.llm.update',
      metadata: {
        enabled: full.config.llm.enabled,
        provider: full.config.llm.provider,
        model: full.config.llm.model,
      },
      ip,
    });
    return {
      config: full.config.llm,
      secrets: {
        llmApiKey: full.secrets.llmApiKey,
        anthropicApiKey: full.secrets.anthropicApiKey,
      },
      secretStatuses: {
        llmApiKey: full.secretStatuses.llmApiKey,
        anthropicApiKey: full.secretStatuses.anthropicApiKey,
      },
      secretsStorageAvailable: full.secretsStorageAvailable,
    };
  }

  /**
   * Probe LLM with optional unsaved draft (same pattern as SMTP verify).
   */
  async test(
    body: TestLlmConnectionRequestDto | undefined,
    ip: string | null,
  ): Promise<TestLlmConnectionResultDto> {
    const full = await this.integrations.resolveSettingsDraft({
      config: body?.config ? { llm: body.config } : undefined,
      secrets: body?.secrets
        ? {
            llmApiKey: body.secrets.llmApiKey ?? undefined,
            anthropicApiKey: body.secrets.anthropicApiKey ?? undefined,
          }
        : undefined,
    });
    const llm = full.llm;
    const result = await testLlmConnection({
      provider: llm.provider,
      baseUrl: llm.baseUrl,
      model: llm.model ?? '',
      apiKey: llm.apiKey ?? '',
    });
    await this.audit.record({
      action: 'platform.llm.test',
      metadata: {
        ok: result.ok,
        provider: result.provider,
        model: result.model,
        latencyMs: result.latencyMs,
      },
      ip,
    });
    return result;
  }
}
