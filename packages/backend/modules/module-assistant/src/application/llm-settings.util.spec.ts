import {
  mergeLlmRuntime,
  parseSchoolLlmOverride,
  type SchoolLlmStored,
} from './llm-settings.util';

describe('mergeLlmRuntime', () => {
  const platform = {
    enabled: true,
    provider: 'openai_compat' as const,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4.1-mini',
    maxTokens: 384,
    temperature: 0.3,
    apiKey: 'platform-key',
  };

  it('inherits platform when override disabled', () => {
    const school: SchoolLlmStored = {
      overrideEnabled: false,
      config: {
        enabled: true,
        provider: 'anthropic',
        baseUrl: null,
        model: 'claude-x',
        maxTokens: 100,
        temperature: 0.1,
      },
      secrets: { anthropicApiKey: 'school-key' },
    };
    const merged = mergeLlmRuntime(platform, school);
    expect(merged.source).toBe('platform');
    expect(merged.model).toBe('gpt-4.1-mini');
    expect(merged.apiKey).toBe('platform-key');
  });

  it('uses school BYOK when override enabled', () => {
    const school: SchoolLlmStored = {
      overrideEnabled: true,
      config: {
        enabled: true,
        provider: 'openai_compat',
        baseUrl: 'http://localhost:11434/v1',
        model: 'llama3.1:8b',
        maxTokens: 256,
        temperature: 0.2,
      },
      secrets: { llmApiKey: 'ollama-local' },
    };
    const merged = mergeLlmRuntime(platform, school);
    expect(merged.source).toBe('school');
    expect(merged.model).toBe('llama3.1:8b');
    expect(merged.baseUrl).toBe('http://localhost:11434/v1');
    expect(merged.apiKey).toBe('ollama-local');
  });

  it('falls back to platform api key when school override has no key', () => {
    const school: SchoolLlmStored = {
      overrideEnabled: true,
      config: {
        enabled: true,
        provider: 'openai_compat',
        baseUrl: null,
        model: 'gpt-custom',
        maxTokens: 384,
        temperature: 0.3,
      },
      secrets: {},
    };
    const merged = mergeLlmRuntime(platform, school);
    expect(merged.apiKey).toBe('platform-key');
    expect(merged.model).toBe('gpt-custom');
  });
});

describe('parseSchoolLlmOverride', () => {
  it('defaults overrideEnabled to false', () => {
    expect(parseSchoolLlmOverride({}).overrideEnabled).toBe(false);
    expect(parseSchoolLlmOverride({ llm: { overrideEnabled: true } }).overrideEnabled).toBe(
      true,
    );
  });
});
