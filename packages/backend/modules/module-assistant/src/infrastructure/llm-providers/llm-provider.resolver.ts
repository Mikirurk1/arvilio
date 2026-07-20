import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAiCompatProvider } from './openai-compat.provider';
import type {
  LlmChatRequest,
  LlmChunk,
  LlmProvider,
  LlmProviderKey,
} from './llm-provider.interface';
import { LlmSettingsService } from '../../application/llm-settings.service';

export type ResolvedLlmRuntime = {
  provider: LlmProvider;
  key: LlmProviderKey;
  model: string;
  baseUrl: string | null;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  source: 'school' | 'platform' | 'env';
};

export type AssistantLlmStatus = {
  ready: boolean;
  /** Present when ready is false — safe for UI display. */
  message: string | null;
  enabled: boolean;
  modelConfigured: boolean;
  apiKeyConfigured: boolean;
  source: 'school' | 'platform' | 'env' | null;
};

const MSG_DISABLED =
  'Arvi assistant is disabled. Configure the default model in Platform → Settings, or a school override in Campus → System → AI assistant.';
const MSG_NO_KEY =
  'Arvi assistant has no API key. Set it in Platform → Settings (default) or Campus → System → AI assistant (Pro override).';
const MSG_NO_MODEL =
  'Arvi assistant has no model configured. Set a model name in Platform → Settings or Campus → System → AI assistant.';

@Injectable()
export class LlmProviderResolver {
  constructor(
    private readonly openaiCompat: OpenAiCompatProvider,
    private readonly anthropic: AnthropicProvider,
    private readonly llmSettings: LlmSettingsService,
  ) {}

  byKey(key: LlmProviderKey): LlmProvider {
    return key === 'anthropic' ? this.anthropic : this.openaiCompat;
  }

  /**
   * Non-throwing readiness check for chat UI / ops.
   */
  async status(schoolId?: string | null): Promise<AssistantLlmStatus> {
    const llm = await this.llmSettings.resolveEffectiveLlm(schoolId);
    const enabled = Boolean(llm?.enabled);
    const modelConfigured = Boolean(llm?.model?.trim());
    const apiKeyConfigured = Boolean(llm?.apiKey?.trim());
    if (!enabled) {
      return {
        ready: false,
        message: MSG_DISABLED,
        enabled,
        modelConfigured,
        apiKeyConfigured,
        source: llm?.source ?? null,
      };
    }
    if (!apiKeyConfigured) {
      return {
        ready: false,
        message: MSG_NO_KEY,
        enabled,
        modelConfigured,
        apiKeyConfigured,
        source: llm?.source ?? null,
      };
    }
    if (!modelConfigured) {
      return {
        ready: false,
        message: MSG_NO_MODEL,
        enabled,
        modelConfigured,
        apiKeyConfigured,
        source: llm?.source ?? null,
      };
    }
    return {
      ready: true,
      message: null,
      enabled,
      modelConfigured,
      apiKeyConfigured,
      source: llm.source,
    };
  }

  /**
   * Effective LLM: school override (Pro) → Platform defaults → env.
   */
  async resolve(schoolId?: string | null): Promise<ResolvedLlmRuntime> {
    const llm = await this.llmSettings.resolveEffectiveLlm(schoolId);
    const enabled = Boolean(llm?.enabled);
    const modelConfigured = Boolean(llm?.model?.trim());
    const apiKeyConfigured = Boolean(llm?.apiKey?.trim());
    if (!enabled) {
      throw new ServiceUnavailableException(MSG_DISABLED);
    }
    if (!apiKeyConfigured) {
      throw new ServiceUnavailableException(MSG_NO_KEY);
    }
    if (!modelConfigured || !llm?.apiKey || !llm.model) {
      throw new ServiceUnavailableException(MSG_NO_MODEL);
    }
    const key: LlmProviderKey =
      llm.provider === 'anthropic' ? 'anthropic' : 'openai_compat';
    return {
      provider: this.byKey(key),
      key,
      model: llm.model,
      baseUrl: llm.baseUrl,
      apiKey: llm.apiKey,
      maxTokens: llm.maxTokens,
      temperature: llm.temperature,
      source: llm.source,
    };
  }

  async *streamChat(
    messages: LlmChatRequest['messages'],
    schoolId?: string | null,
  ): AsyncIterable<LlmChunk> {
    const resolved = await this.resolve(schoolId);
    yield* resolved.provider.chat({
      messages,
      model: resolved.model,
      maxTokens: resolved.maxTokens,
      temperature: resolved.temperature,
      baseUrl: resolved.baseUrl,
      apiKey: resolved.apiKey,
    });
  }
}
