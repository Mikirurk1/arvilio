'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field } from '@fe/ui';
import {
  SMTP_PROVIDER_PRESETS,
  matchSmtpProviderPreset,
  type SmtpConfigModeDto,
  type SmtpProviderPresetId,
} from '@pkg/types';
import ui from './ui/ui.module.scss';

export type PlatformSmtpClientDto = {
  config: {
    mode: SmtpConfigModeDto;
    host: string | null;
    port: number | null;
    user: string | null;
    mailFrom: string;
    secure: boolean;
  };
  secrets: {
    smtpPass?: string | null;
  };
  secretStatuses: {
    smtpPass: { configured: boolean; source: string };
  };
  secretsStorageAvailable: boolean;
  runtime: {
    configured: boolean;
    host: string | null;
    port: number | null;
    mailFrom: string;
    source: SmtpConfigModeDto;
  };
};

function secretHint(status: { configured: boolean; source: string }): string {
  if (status.source === 'env') return 'From env — edit to override in platform storage';
  if (status.source === 'stored') return 'Saved in platform storage';
  return 'SMTP password / API key';
}

function secretStatusLine(status: { configured: boolean; source: string }): string {
  if (status.source === 'env') return 'Configured via environment variable.';
  if (status.source === 'stored') return 'Saved in encrypted platform storage.';
  return 'Not configured yet.';
}

/**
 * Control Plane transactional email (SMTP). Same PlatformSettings row as Campus System → Email.
 */
export function PlatformSmtpEditor({ initial }: { initial: PlatformSmtpClientDto }) {
  const router = useRouter();
  const [mode, setMode] = useState<SmtpConfigModeDto>(initial.config.mode);
  const [host, setHost] = useState(initial.config.host ?? '');
  const [port, setPort] = useState(initial.config.port ?? 587);
  const [user, setUser] = useState(initial.config.user ?? '');
  const [mailFrom, setMailFrom] = useState(initial.config.mailFrom ?? '');
  const [secure, setSecure] = useState(initial.config.secure);
  const [smtpPass, setSmtpPass] = useState(initial.secrets.smtpPass ?? '');
  const [secretStatuses, setSecretStatuses] = useState(initial.secretStatuses);
  const [runtime, setRuntime] = useState(initial.runtime);
  const [preset, setPreset] = useState<SmtpProviderPresetId>(() =>
    matchSmtpProviderPreset(initial.config.host, initial.config.port),
  );
  const [testTo, setTestTo] = useState('');
  const [pending, setPending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [actionResult, setActionResult] = useState<{ ok: boolean; text: string } | null>(null);

  const custom = mode === 'custom';
  const activePreset = useMemo(
    () => SMTP_PROVIDER_PRESETS.find((p) => p.id === preset) ?? SMTP_PROVIDER_PRESETS[0],
    [preset],
  );

  useEffect(() => {
    setMode(initial.config.mode);
    setHost(initial.config.host ?? '');
    setPort(initial.config.port ?? 587);
    setUser(initial.config.user ?? '');
    setMailFrom(initial.config.mailFrom ?? '');
    setSecure(initial.config.secure);
    setSmtpPass(initial.secrets.smtpPass ?? '');
    setSecretStatuses(initial.secretStatuses);
    setRuntime(initial.runtime);
    setPreset(matchSmtpProviderPreset(initial.config.host, initial.config.port));
  }, [initial]);

  function applyPreset(id: SmtpProviderPresetId) {
    setPreset(id);
    setSaved(false);
    setActionResult(null);
    const next = SMTP_PROVIDER_PRESETS.find((p) => p.id === id);
    if (!next || id === 'custom') return;
    setMode('custom');
    setHost(next.host);
    setPort(next.port);
    setSecure(next.secure);
    if (next.suggestedUser) setUser(next.suggestedUser);
  }

  function smtpBody() {
    return {
      config: {
        smtp: {
          mode,
          host: host.trim() || null,
          port: Number.isFinite(port) ? port : 587,
          user: user.trim() || null,
          mailFrom: mailFrom.trim() || 'noreply@localhost',
          secure,
        },
      },
      secrets: smtpPass.trim() ? { smtpPass: smtpPass.trim() } : undefined,
    };
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    setActionResult(null);
    try {
      const res = await fetch('/api/platform/smtp', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(smtpBody()),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Save failed (${res.status})`);
      }
      const next = (await res.json()) as PlatformSmtpClientDto;
      setMode(next.config.mode);
      setHost(next.config.host ?? '');
      setPort(next.config.port ?? 587);
      setUser(next.config.user ?? '');
      setMailFrom(next.config.mailFrom ?? '');
      setSecure(next.config.secure);
      setSmtpPass(next.secrets.smtpPass ?? '');
      setSecretStatuses(next.secretStatuses);
      setRuntime(next.runtime);
      setPreset(matchSmtpProviderPreset(next.config.host, next.config.port));
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  async function verify() {
    setVerifying(true);
    setError(null);
    setSaved(false);
    setActionResult(null);
    try {
      const res = await fetch('/api/platform/smtp/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(smtpBody()),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.message || `Verify failed (${res.status})`);
      }
      setActionResult({
        ok: Boolean(data?.ok),
        text: data?.message ?? (data?.ok ? 'SMTP verified' : 'Verification failed'),
      });
    } catch (err) {
      setActionResult({
        ok: false,
        text: err instanceof Error ? err.message : 'Verify failed',
      });
    } finally {
      setVerifying(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setError(null);
    setSaved(false);
    setActionResult(null);
    try {
      const res = await fetch('/api/platform/smtp/test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: testTo.trim() }),
      });
      const data = (await res.json().catch(() => null)) as
        | { sent?: boolean; error?: string; message?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Test send failed (${res.status})`);
      }
      const sent = Boolean(data?.sent);
      setActionResult({
        ok: sent,
        text: sent
          ? `Test welcome email sent to ${testTo.trim()}`
          : data?.error || 'Failed to send test email',
      });
    } catch (err) {
      setActionResult({
        ok: false,
        text: err instanceof Error ? err.message : 'Test send failed',
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <p className={ui.mutedCopy}>
        Platform-default SMTP for welcome mail, password reset, and notification emails across all
        campuses. Same settings as Campus → System → Email. Use Server default for <code>SMTP_*</code>{' '}
        env, or Custom for Resend / Brevo / SES / etc.
      </p>

      <p className={ui.mutedCopy}>
        Runtime:{' '}
        {runtime.configured
          ? `${runtime.host}:${runtime.port ?? '—'} (${runtime.source}) · From ${runtime.mailFrom}`
          : 'Not configured'}
      </p>

      <Field
        as="select"
        label="Mode"
        value={mode}
        onChange={(e) => {
          setSaved(false);
          setMode(e.target.value as SmtpConfigModeDto);
        }}
      >
        <option value="server_default">Server default (SMTP_* env)</option>
        <option value="custom">Custom SMTP</option>
      </Field>

      <Field
        label="From address"
        type="email"
        value={mailFrom}
        onChange={(e) => {
          setSaved(false);
          setMailFrom(e.target.value);
        }}
      />

      {!custom ? (
        <p className={ui.mutedCopy}>
          Using deployment environment variables. Switch to Custom SMTP to override host, port, and
          credentials in platform storage.
        </p>
      ) : (
        <>
          <Field
            as="select"
            label="Provider preset"
            hint={activePreset?.hint}
            value={preset}
            onChange={(e) => applyPreset(e.target.value as SmtpProviderPresetId)}
          >
            {SMTP_PROVIDER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Field>
          <Field
            label="Host"
            value={host}
            onChange={(e) => {
              setSaved(false);
              setPreset('custom');
              setHost(e.target.value);
            }}
          />
          <Field
            label="Port"
            type="number"
            value={String(port)}
            onChange={(e) => {
              setSaved(false);
              setPreset('custom');
              setPort(Number(e.target.value) || 587);
            }}
          />
          <Field
            as="checkbox"
            variant="card"
            checked={secure}
            onChange={(e) => {
              setSaved(false);
              setSecure(e.target.checked);
            }}
            label="Use TLS (secure / port 465)"
          />
          <Field
            label="Username"
            value={user}
            autoComplete="off"
            onChange={(e) => {
              setSaved(false);
              setUser(e.target.value);
            }}
          />
          <div>
            <Field
              label="Password / API key"
              type="password"
              autoComplete="off"
              value={smtpPass}
              placeholder={secretHint(secretStatuses.smtpPass)}
              onChange={(e) => {
                setSaved(false);
                setSmtpPass(e.target.value);
              }}
            />
            <p className={ui.mutedCopy} style={{ marginTop: 6 }}>
              {secretStatusLine(secretStatuses.smtpPass)}
            </p>
          </div>
        </>
      )}

      {!initial.secretsStorageAvailable ? (
        <p className={ui.mutedCopy}>
          Warning: set PLATFORM_SECRETS_ENCRYPTION_KEY on the API to persist a custom SMTP password.
        </p>
      ) : null}

      <Field
        label="Send test to"
        type="email"
        value={testTo}
        placeholder="you@example.com"
        onChange={(e) => setTestTo(e.target.value)}
      />

      {error ? <p style={{ color: 'var(--danger, #b42318)' }}>{error}</p> : null}
      {saved ? <p style={{ color: 'var(--success, #027a48)' }}>Saved.</p> : null}
      {actionResult ? (
        <p style={{ color: actionResult.ok ? 'var(--success, #027a48)' : 'var(--danger, #b42318)' }}>
          {actionResult.text}
        </p>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          type="button"
          variant="ghost"
          loading={verifying}
          loadingLabel="Verifying…"
          disabled={pending || testing}
          onClick={() => void verify()}
        >
          Verify connection
        </Button>
        <Button
          type="button"
          variant="ghost"
          loading={testing}
          loadingLabel="Sending…"
          disabled={pending || verifying || !testTo.trim()}
          onClick={() => void sendTest()}
        >
          Send test email
        </Button>
        <Button
          type="button"
          loading={pending}
          loadingLabel="Saving…"
          disabled={verifying || testing}
          onClick={() => void save()}
        >
          Save SMTP
        </Button>
      </div>
    </div>
  );
}
