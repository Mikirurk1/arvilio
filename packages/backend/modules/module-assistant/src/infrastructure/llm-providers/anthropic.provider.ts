import { Injectable, Logger } from '@nestjs/common';
import type {
  LlmChatRequest,
  LlmChunk,
  LlmProvider,
} from './llm-provider.interface';
import { publicAdminLlmError } from '../../application/llm-public-error';

/**
 * Anthropic Messages API streaming adapter.
 */
@Injectable()
export class AnthropicProvider implements LlmProvider {
  readonly key = 'anthropic' as const;
  private readonly logger = new Logger(AnthropicProvider.name);

  async *chat(req: LlmChatRequest): AsyncIterable<LlmChunk> {
    const system = req.messages
      .filter(m => m.role === 'system')
      .map(m => m.content)
      .join('\n\n');
    const messages = req.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        system: system || undefined,
        messages,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '');
      this.logger.warn(`Anthropic error ${response.status}: ${detail.slice(0, 300)}`);
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
        if (!payload) continue;
        try {
          const json = JSON.parse(payload) as {
            type?: string;
            delta?: { type?: string; text?: string };
            usage?: { input_tokens?: number; output_tokens?: number };
            message?: { usage?: { input_tokens?: number } };
          };
          if (
            json.type === 'content_block_delta' &&
            json.delta?.type === 'text_delta' &&
            json.delta.text
          ) {
            yield { type: 'delta', text: json.delta.text };
          }
          if (json.type === 'message_start' && json.message?.usage?.input_tokens) {
            promptTokens = json.message.usage.input_tokens;
          }
          if (json.type === 'message_delta' && json.usage?.output_tokens) {
            completionTokens = json.usage.output_tokens;
          }
          if (json.type === 'message_stop') {
            if (promptTokens || completionTokens) {
              yield { type: 'usage', promptTokens, completionTokens };
            }
            yield { type: 'done' };
            return;
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
