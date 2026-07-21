jest.mock('@be/assistant/llm-connection-test', () => ({
  testLlmConnection: jest.fn(),
}));

import { testLlmConnection } from '@be/assistant/llm-connection-test';
import type { PlatformIntegrationService } from '@be/vocabulary';
import type { PlatformAuditService } from './platform-audit.service';
import { PlatformLlmService } from './platform-llm.service';

const testLlmConnectionMock = testLlmConnection as jest.MockedFunction<typeof testLlmConnection>;

describe('PlatformLlmService', () => {
  const integrations = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    resolveSettingsDraft: jest.fn(),
  };
  const audit = { record: jest.fn() } as unknown as PlatformAuditService;

  const service = new PlatformLlmService(
    integrations as unknown as PlatformIntegrationService,
    audit,
  );

  const fullSettings = {
    config: {
      llm: {
        enabled: true,
        provider: 'openai_compat' as const,
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        maxTokens: 384,
        temperature: 0.3,
      },
    },
    secrets: { llmApiKey: 'sk-test', anthropicApiKey: null },
    secretStatuses: {
      llmApiKey: { configured: true, source: 'stored' },
      anthropicApiKey: { configured: false, source: 'none' },
    },
    secretsStorageAvailable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    integrations.getSettings.mockResolvedValue(fullSettings);
    integrations.updateSettings.mockResolvedValue(fullSettings);
  });

  it('get maps settings → LLM DTO', async () => {
    const dto = await service.get();
    expect(dto.config).toEqual(fullSettings.config.llm);
    expect(dto.secrets).toEqual({
      llmApiKey: 'sk-test',
      anthropicApiKey: null,
    });
    expect(dto.secretStatuses.llmApiKey).toEqual({ configured: true, source: 'stored' });
    expect(dto.secretsStorageAvailable).toBe(true);
  });

  it('set calls updateSettings with llm patch + audit', async () => {
    const dto = await service.set(
      {
        config: {
          llm: {
            enabled: true,
            provider: 'openai_compat',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4o-mini',
            maxTokens: 512,
            temperature: 0.2,
          },
        },
        secrets: { llmApiKey: 'sk-new' },
      },
      '10.0.0.2',
    );

    expect(integrations.updateSettings).toHaveBeenCalledWith({
      config: {
        llm: {
          enabled: true,
          provider: 'openai_compat',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
          maxTokens: 512,
          temperature: 0.2,
        },
      },
      secrets: { llmApiKey: 'sk-new', anthropicApiKey: undefined },
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'platform.llm.update',
      metadata: {
        enabled: true,
        provider: 'openai_compat',
        model: 'gpt-4o-mini',
      },
      ip: '10.0.0.2',
    });
    expect(dto.config.model).toBe('gpt-4o-mini');
  });

  it('test resolves draft, probes connection, audits', async () => {
    integrations.resolveSettingsDraft.mockResolvedValue({
      llm: {
        provider: 'openai_compat',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        apiKey: 'sk-draft',
      },
    });
    testLlmConnectionMock.mockResolvedValue({
      ok: true,
      message: 'Connection OK',
      latencyMs: 42,
      model: 'gpt-4o-mini',
      provider: 'openai_compat',
    });

    const result = await service.test(
      {
        config: { model: 'gpt-4o-mini' },
        secrets: { llmApiKey: 'sk-draft' },
      },
      null,
    );

    expect(integrations.resolveSettingsDraft).toHaveBeenCalled();
    expect(testLlmConnectionMock).toHaveBeenCalledWith({
      provider: 'openai_compat',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      apiKey: 'sk-draft',
    });
    expect(audit.record).toHaveBeenCalledWith({
      action: 'platform.llm.test',
      metadata: {
        ok: true,
        provider: 'openai_compat',
        model: 'gpt-4o-mini',
        latencyMs: 42,
      },
      ip: null,
    });
    expect(result.ok).toBe(true);
  });
});
