'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SCHOOL_APP_URL = process.env.NEXT_PUBLIC_SCHOOL_APP_URL || 'http://localhost:4200';

/**
 * Suspend/activate + impersonate actions for a school (Phase 4D). Same-origin POST
 * to the platform REST surface; the browser carries the operator's cookies.
 * Impersonation sets a school-app session cookie — in production it is shared with
 * the school app via `AUTH_COOKIE_DOMAIN` (cross-app SSO seam, ADR-009); we then
 * redirect the operator into the school app where the banner shows.
 */
export function SchoolActions({
  schoolId,
  status,
}: {
  schoolId: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
}) {
  const router = useRouter();
  const [pending, setPending] = useState<null | 'status' | 'impersonate'>(null);
  const [error, setError] = useState<string | null>(null);

  const suspended = status === 'SUSPENDED';
  const busy = pending !== null;

  async function act(action: 'suspend' | 'activate') {
    setPending('status');
    setError(null);
    try {
      const res = await fetch(`/api/platform/schools/${schoolId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setPending(null);
    }
  }

  async function impersonate() {
    setPending('impersonate');
    setError(null);
    try {
      const res = await fetch(`/api/platform/schools/${schoolId}/impersonate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Impersonate failed (${res.status})`);
      // Session cookie is now set (shared with the school app in prod) — land there.
      window.location.href = SCHOOL_APP_URL;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impersonate failed');
      setPending(null);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void act(suspended ? 'activate' : 'suspend')}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: suspended ? 'var(--green)' : 'var(--red)',
          color: '#fff',
          fontWeight: 600,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {pending === 'status' ? 'Working…' : suspended ? 'Activate school' : 'Suspend school'}
      </button>
      <button
        type="button"
        disabled={busy || suspended}
        onClick={() => void impersonate()}
        title={suspended ? 'Activate the school before impersonating' : undefined}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text)',
          fontWeight: 600,
          cursor: busy || suspended ? 'default' : 'pointer',
          opacity: busy || suspended ? 0.5 : 1,
        }}
      >
        {pending === 'impersonate' ? 'Starting…' : 'Impersonate admin'}
      </button>
      {error ? <span style={{ color: 'var(--red)', fontSize: 'var(--fs-14)' }}>{error}</span> : null}
    </div>
  );
}
