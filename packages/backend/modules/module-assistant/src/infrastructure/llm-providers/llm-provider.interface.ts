export type LlmProviderKey = 'openai_compat' | 'anthropic';

export type LlmMessageRole = 'system' | 'user' | 'assistant';

export type LlmMessage = {
  role: LlmMessageRole;
  content: string;
};

export type LlmChatRequest = {
  messages: LlmMessage[];
  model: string;
  maxTokens: number;
  temperature: number;
  /** OpenAI-compatible base URL (ignored by Anthropic adapter). */
  baseUrl?: string | null;
  apiKey: string;
};

export type LlmChunk =
  | { type: 'delta'; text: string }
  | { type: 'usage'; promptTokens: number; completionTokens: number }
  | { type: 'done' };

export interface LlmProvider {
  readonly key: LlmProviderKey;
  chat(req: LlmChatRequest): AsyncIterable<LlmChunk>;
}
