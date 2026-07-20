'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field } from '@fe/ui';
import ui from './ui/ui.module.scss';

export type PlatformLlmClientDto = {
  config: {
    enabled: boolean;
    provider: 'openai_compat' | 'anthropic';
    baseUrl: string | null;
    model: string | null;
    maxTokens: number;
    temperature: number;
  };
  secrets: {
    llmApiKey?: string | null;
    anthropicApiKey?: string | null;
  };
  secretStatuses: {
    llmApiKey: { configured: boolean; source: string };
    anthropicApiKey: { configured: boolean; source: string };
  };
  secretsStorageAvailable: boolean;
};

function secretHint(status: { configured: boolean; source: string }): string {
  if (status.source === 'env') return 'From env — edit to override in platform storage';
  if (status.source === 'stored') return 'Saved in platform storage';
  return 'Paste API key';
}

function secretStatusLine(status: { configured: boolean; source: string }): string {
  if (status.source === 'env') return 'Configured via environment variable.';
  if (status.source === 'stored') return 'Saved in encrypted platform storage.';
  return 'Not configured yet.';
}

/**
 * Control Plane default model for Arvi assistant (all campuses inherit unless they override).
 */
export function PlatformLlmEditor({ initial }: { initial: PlatformLlmClientDto }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.config.enabled);
  const [provider, setProvider] = useState(initial.config.provider);
  const [baseUrl, setBaseUrl] = useState(initial.config.baseUrl ?? '');
  const [model, setModel] = useState(initial.config.model ?? '');
  const [maxTokens, setMaxTokens] = useState(initial.config.maxTokens);
  const [temperature, setTemperature] = useState(initial.config.temperature);
  const [llmApiKey, setLlmApiKey] = useState(initial.secrets.llmApiKey ?? '');
  const [anthropicApiKey, setAnthropicApiKey] = useState(initial.secrets.anthropicApiKey ?? '');
  const [secretStatuses, setSecretStatuses] = useState(initial.secretStatuses);
  const [pending, setPending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setEnabled(initial.config.enabled);
    setProvider(initial.config.provider);
    setBaseUrl(initial.config.baseUrl ?? '');
    setModel(initial.config.model ?? '');
    setMaxTokens(initial.config.maxTokens);
    setTemperature(initial.config.temperature);
    setLlmApiKey(initial.secrets.llmApiKey ?? '');
    setAnthropicApiKey(initial.secrets.anthropicApiKey ?? '');
    setSecretStatuses(initial.secretStatuses);
  }, [initial]);

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    setTestResult(null);
    try {
      const res = await fetch('/api/platform/llm', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          config: {
            llm: {
              enabled,
              provider,
              baseUrl: baseUrl.trim() || null,
              model: model.trim() || null,
              maxTokens,
              temperature,
            },
          },
          secrets: {
            llmApiKey: llmApiKey.trim() ? llmApiKey.trim() : undefined,
            anthropicApiKey: anthropicApiKey.trim() ? anthropicApiKey.trim() : undefined,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Save failed (${res.status})`);
      }
      const next = (await res.json()) as PlatformLlmClientDto;
      setEnabled(next.config.enabled);
      setProvider(next.config.provider);
      setBaseUrl(next.config.baseUrl ?? '');
      setModel(next.config.model ?? '');
      setMaxTokens(next.config.maxTokens);
      setTemperature(next.config.temperature);
      setLlmApiKey(next.secrets.llmApiKey ?? '');
      setAnthropicApiKey(next.secrets.anthropicApiKey ?? '');
      setSecretStatuses(next.secretStatuses);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setError(null);
    setSaved(false);
    setTestResult(null);
    try {
      const res = await fetch('/api/platform/llm/test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          config: {
            enabled,
            provider,
            baseUrl: baseUrl.trim() || null,
            model: model.trim() || null,
            maxTokens,
            temperature,
          },
          secrets: {
            ...(llmApiKey.trim() ? { llmApiKey: llmApiKey.trim() } : {}),
            ...(anthropicApiKey.trim() ? { anthropicApiKey: anthropicApiKey.trim() } : {}),
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; latencyMs?: number }
        | null;
      if (!res.ok) {
        throw new Error(data?.message || `Test failed (${res.status})`);
      }
      const ok = Boolean(data?.ok);
      const latency =
        typeof data?.latencyMs === 'number' ? ` (${data.latencyMs}ms)` : '';
      setTestResult({
        ok,
        text: `${data?.message ?? (ok ? 'Connection OK' : 'Connection failed')}${latency}`,
      });
    } catch (err) {
      setTestResult({
        ok: false,
        text: err instanceof Error ? err.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <p className={ui.mutedCopy}>
        Default model for Arvi help chat across all campuses. Schools on Pro can override under
        Campus → System → AI assistant.
      </p>
      <Field
        as="checkbox"
        variant="card"
        checked={enabled}
        onChange={(e) => {
          setSaved(false);
          setEnabled(e.target.checked);
        }}
        label="Enable Arvi assistant (platform default)"
        hint="Schools on Pro can still override under Campus → System → AI assistant."
      />
      <Field
        as="select"
        label="Provider"
        value={provider}
        onChange={(e) => {
          setSaved(false);
          setProvider(e.target.value as 'openai_compat' | 'anthropic');
        }}
      >
        <option value="openai_compat">OpenAI-compatible (ChatGPT, Ollama, NVIDIA, …)</option>
        <option value="anthropic">Anthropic</option>
      </Field>
      {provider === 'openai_compat' ? (
        <Field
          label="Base URL"
          hint="e.g. https://api.openai.com/v1 or http://localhost:11434/v1"
          value={baseUrl}
          onChange={(e) => {
            setSaved(false);
            setBaseUrl(e.target.value);
          }}
        />
      ) : null}
      <Field
        label="Model"
        value={model}
        onChange={(e) => {
          setSaved(false);
          setModel(e.target.value);
        }}
      />
      <Field
        label="Max tokens"
        type="number"
        value={String(maxTokens)}
        onChange={(e) => {
          setSaved(false);
          setMaxTokens(Math.min(2048, Math.max(64, Number(e.target.value) || 384)));
        }}
      />
      <Field
        label="Temperature"
        type="number"
        value={String(temperature)}
        onChange={(e) => {
          setSaved(false);
          setTemperature(Math.min(1, Math.max(0, Number(e.target.value) || 0.3)));
        }}
      />
      {provider === 'openai_compat' ? (
        <div>
          <Field
            label="API key"
            type="password"
            autoComplete="off"
            value={llmApiKey}
            placeholder={secretHint(secretStatuses.llmApiKey)}
            onChange={(e) => {
              setSaved(false);
              setLlmApiKey(e.target.value);
            }}
          />
          <p className={ui.mutedCopy} style={{ marginTop: 6 }}>
            {secretStatusLine(secretStatuses.llmApiKey)}
          </p>
        </div>
      ) : (
        <div>
          <Field
            label="Anthropic API key"
            type="password"
            autoComplete="off"
            value={anthropicApiKey}
            placeholder={secretHint(secretStatuses.anthropicApiKey)}
            onChange={(e) => {
              setSaved(false);
              setAnthropicApiKey(e.target.value);
            }}
          />
          <p className={ui.mutedCopy} style={{ marginTop: 6 }}>
            {secretStatusLine(secretStatuses.anthropicApiKey)}
          </p>
        </div>
      )}
      {!initial.secretsStorageAvailable ? (
        <p className={ui.mutedCopy}>
          Warning: set PLATFORM_SECRETS_ENCRYPTION_KEY on the API to persist keys.
        </p>
      ) : null}
      {error ? <p style={{ color: 'var(--danger, #b42318)' }}>{error}</p> : null}
      {saved ? <p style={{ color: 'var(--success, #027a48)' }}>Saved.</p> : null}
      {testResult ? (
        <p style={{ color: testResult.ok ? 'var(--success, #027a48)' : 'var(--danger, #b42318)' }}>
          {testResult.text}
        </p>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          type="button"
          variant="ghost"
          loading={testing}
          loadingLabel="Testing…"
          disabled={pending}
          onClick={() => void testConnection()}
        >
          Test connection
        </Button>
        <Button type="button" loading={pending} loadingLabel="Saving…" disabled={testing} onClick={() => void save()}>
          Save default LLM
        </Button>
      </div>
    </div>
  );
}
