import { Injectable, Logger } from '@nestjs/common';
import type {
  LlmChatRequest,
  LlmChunk,
  LlmProvider,
} from './llm-provider.interface';
import { publicAdminLlmError } from '../../application/llm-public-error';

function isOfficialOpenAiHost(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host === 'api.openai.com' || host.endsWith('.openai.azure.com');
  } catch {
    return false;
  }
}

/**
 * OpenAI Chat Completions streaming — works with OpenAI, Ollama, NVIDIA NIM,
 * OpenRouter, Azure OpenAI-compatible gateways, vLLM, etc.
 */
@Injectable()
export class OpenAiCompatProvider implements LlmProvider {
  readonly key = 'openai_compat' as const;
  private readonly logger = new Logger(OpenAiCompatProvider.name);

  async *chat(req: LlmChatRequest): AsyncIterable<LlmChunk> {
    const base = (req.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    const url = `${base}/chat/completions`;
    const body: Record<string, unknown> = {
      model: req.model,
      messages: req.messages,
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      stream: true,
    };
    // Many OpenAI-compat gateways reject unknown fields (Ollama, NIM, Cloudflare, …).
    if (isOfficialOpenAiHost(base)) {
      body.stream_options = { include_usage: true };
    }

    this.logger.debug(`POST ${url} model=${req.model}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${req.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '');
      // Log truncated raw body server-side only — never forward to chat clients.
      this.logger.warn(`OpenAI-compat error ${response.status}: ${detail.slice(0, 300)}`);
      throw new Error(publicAdminLlmError(response.status, detail));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let promptTokens = 0;
    let completionTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') {
          if (promptTokens || completionTokens) {
            yield { type: 'usage', promptTokens, completionTokens };
          }
          yield { type: 'done' };
          return;
        }
        try {
          const json = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield { type: 'delta', text: delta };
          if (json.usage) {
            promptTokens = json.usage.prompt_tokens ?? promptTokens;
            completionTokens = json.usage.completion_tokens ?? completionTokens;
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }

    if (promptTokens || completionTokens) {
      yield { type: 'usage', promptTokens, completionTokens };
    }
    yield { type: 'done' };
  }
}
