/**
 * Minimal LLM connectivity probe (non-streaming, tiny completion).
 * Used by Platform / Campus settings “Test” buttons — does not consume AI credits.
 */

import { publicAdminLlmError } from './llm-public-error';

export type LlmTestTarget = {
  provider: 'openai_compat' | 'anthropic';
  baseUrl: string | null;
  model: string;
  apiKey: string;
};

export type LlmTestResult = {
  ok: boolean;
  message: string;
  latencyMs: number;
  model: string;
  provider: 'openai_compat' | 'anthropic';
};

const PROBE_USER = 'Reply with the single word OK.';
const TIMEOUT_MS = 20_000;

async function testOpenAiCompat(target: LlmTestTarget): Promise<Omit<LlmTestResult, 'latencyMs'>> {
  const base = (target.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const url = `${base}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${target.apiKey}`,
    },
    body: JSON.stringify({
      model: target.model,
      messages: [
        { role: 'system', content: 'You are a connectivity probe. Reply only OK.' },
        { role: 'user', content: PROBE_USER },
      ],
      max_tokens: 8,
      temperature: 0,
      stream: false,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text().catch(() => '');
  if (!response.ok) {
    return {
      ok: false,
      message: `OpenAI-compatible probe failed (${publicAdminLlmError(response.status, text)})`,
      model: target.model,
      provider: 'openai_compat',
    };
  }
  try {
    const json = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() || '(empty reply)';
    return {
      ok: true,
      message: `Connected. Model replied: ${reply.slice(0, 80)}`,
      model: target.model,
      provider: 'openai_compat',
    };
  } catch {
    return {
      ok: true,
      message: 'Connected (response was not JSON chat format, but HTTP OK).',
      model: target.model,
      provider: 'openai_compat',
    };
  }
}

async function testAnthropic(target: LlmTestTarget): Promise<Omit<LlmTestResult, 'latencyMs'>> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': target.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: target.model,
      max_tokens: 8,
      temperature: 0,
      system: 'You are a connectivity probe. Reply only OK.',
      messages: [{ role: 'user', content: PROBE_USER }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text().catch(() => '');
  if (!response.ok) {
    return {
      ok: false,
      message: `Anthropic probe failed (${publicAdminLlmError(response.status, text)})`,
      model: target.model,
      provider: 'anthropic',
    };
  }
  try {
    const json = JSON.parse(text) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const reply =
      json.content?.find(c => c.type === 'text')?.text?.trim() || '(empty reply)';
    return {
      ok: true,
      message: `Connected. Model replied: ${reply.slice(0, 80)}`,
      model: target.model,
      provider: 'anthropic',
    };
  } catch {
    return {
      ok: true,
      message: 'Connected (HTTP OK).',
      model: target.model,
      provider: 'anthropic',
    };
  }
}

export async function testLlmConnection(target: LlmTestTarget): Promise<LlmTestResult> {
  const started = Date.now();
  if (!target.model?.trim()) {
    return {
      ok: false,
      message: 'Model name is required.',
      latencyMs: 0,
      model: '',
      provider: target.provider,
    };
  }
  if (!target.apiKey?.trim()) {
    return {
      ok: false,
      message: 'API key is required.',
      latencyMs: 0,
      model: target.model,
      provider: target.provider,
    };
  }

  try {
    const result =
      target.provider === 'anthropic'
        ? await testAnthropic(target)
        : await testOpenAiCompat(target);
    return { ...result, latencyMs: Date.now() - started };
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    const message =
      name === 'TimeoutError' || name === 'AbortError'
        ? `Timed out after ${TIMEOUT_MS / 1000}s — check Base URL / network.`
        : err instanceof Error
          ? err.message
          : 'LLM probe failed';
    return {
      ok: false,
      message,
      latencyMs: Date.now() - started,
      model: target.model,
      provider: target.provider,
    };
  }
}
