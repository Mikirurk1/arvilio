'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fe/ui';
import ui from './ui/ui.module.scss';

const CAMPUS_APP_URL = process.env.NEXT_PUBLIC_SCHOOL_APP_URL || 'http://localhost:4200';

/**
 * Suspend/activate + impersonate actions for a campus tenant. Same-origin POST
 * to the platform REST surface; the browser carries the operator's cookies.
 * Impersonation sets a Campus app session cookie — in production it is shared via
 * `AUTH_COOKIE_DOMAIN` (cross-app SSO seam, ADR-009); we then redirect into Campus.
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
      window.location.href = CAMPUS_APP_URL;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impersonate failed');
      setPending(null);
    }
  }

  return (
    <div className={ui.actionRow}>
      <Button
        variant={suspended ? 'primary' : 'danger'}
        disabled={busy}
        loading={pending === 'status'}
        loadingLabel="Working…"
        onClick={() => void act(suspended ? 'activate' : 'suspend')}
      >
        {suspended ? 'Activate campus' : 'Suspend campus'}
      </Button>
      <Button
        variant="ghost"
        disabled={busy || suspended}
        loading={pending === 'impersonate'}
        loadingLabel="Starting…"
        title={suspended ? 'Activate the campus before impersonating' : undefined}
        onClick={() => void impersonate()}
      >
        Impersonate admin
      </Button>
      {error ? <span className={`${ui.inlineMsg} ${ui.inlineErr}`}>{error}</span> : null}
    </div>
  );
}
