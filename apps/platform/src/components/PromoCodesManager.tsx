'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PromoCodeDto } from '../lib/platform-api';

/**
 * Promo-code management (Phase 4.5.2): list + create + enable/disable. Same-origin
 * calls to the platform REST surface; the operator's cookies authorize.
 */
export function PromoCodesManager({ initial }: { initial: PromoCodeDto[] }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [trialDays, setTrialDays] = useState('14');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/platform/promo-codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          trialDays: Number(trialDays),
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Create failed (${res.status})`);
      }
      setCode('');
      setMaxRedemptions('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/platform/promo-codes/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
  };
  const cell: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
    fontSize: 'var(--fs-14)',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 'var(--fs-14)' }}>
          Code
          <input style={inputStyle} value={code} onChange={(e) => setCode(e.target.value)} placeholder="LAUNCH14" />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 'var(--fs-14)', width: 110 }}>
          Trial days
          <input style={inputStyle} type="number" min={1} value={trialDays} onChange={(e) => setTrialDays(e.target.value)} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 'var(--fs-14)', width: 150 }}>
          Max redemptions
          <input style={inputStyle} type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="unlimited" />
        </label>
        <button
          type="button"
          disabled={busy || !code.trim()}
          onClick={() => void create()}
          style={{
            padding: '9px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--accent)',
            color: '#06202b',
            fontWeight: 600,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy || !code.trim() ? 0.6 : 1,
          }}
        >
          Create code
        </button>
        {error ? <span style={{ color: 'var(--red)', fontSize: 'var(--fs-14)' }}>{error}</span> : null}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Code</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Trial days</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Redeemed</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }}>Status</th>
            <th style={{ ...cell, color: 'var(--text-muted)' }} />
          </tr>
        </thead>
        <tbody>
          {initial.map((p) => (
            <tr key={p.id}>
              <td style={cell}>{p.code}</td>
              <td style={cell}>{p.trialDays}</td>
              <td style={cell}>
                {p.redeemedCount}
                {p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ''}
              </td>
              <td style={{ ...cell, color: p.active ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                {p.active ? 'Active' : 'Disabled'}
              </td>
              <td style={cell}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggle(p.id, !p.active)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    cursor: busy ? 'default' : 'pointer',
                  }}
                >
                  {p.active ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
          {initial.length === 0 ? (
            <tr>
              <td style={{ ...cell, color: 'var(--text-muted)' }} colSpan={5}>
                No promo codes yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
