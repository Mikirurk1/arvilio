'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Edits the platform-wide payment-method allowlist (Phase 4D). Same-origin PUT;
 * empty selection = no restriction (schools may enable any method).
 */
export function PaymentAllowlistEditor({
  allMethods,
  initialAllowed,
}: {
  allMethods: string[];
  initialAllowed: string[];
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<Set<string>>(new Set(initialAllowed));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggle(method: string) {
    setSaved(false);
    setAllowed((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/platform/payment-methods', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowed: Array.from(allowed) }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-14)' }}>
        Schools may only enable methods that are checked. Leave all unchecked to allow every method.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
        {allMethods.map((method) => (
          <label key={method} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={allowed.has(method)}
              onChange={() => toggle(method)}
            />
            <span>{method}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          disabled={pending}
          onClick={() => void save()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--accent)',
            color: '#06202b',
            fontWeight: 600,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? 'Saving…' : 'Save allowlist'}
        </button>
        {saved ? <span style={{ color: 'var(--green)', fontSize: 'var(--fs-14)' }}>Saved</span> : null}
        {error ? <span style={{ color: 'var(--red)', fontSize: 'var(--fs-14)' }}>{error}</span> : null}
      </div>
    </div>
  );
}
