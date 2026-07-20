'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PromoCodeDto } from '../lib/platform-api';
import { Button, Field } from '@fe/ui';
import { DataTable, Td } from './ui';
import ui from './ui/ui.module.scss';

/**
 * Promo-code management: list + create + enable/disable. Same-origin calls to
 * the platform REST surface; the operator's cookies authorize.
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

  return (
    <div>
      <div className={ui.formRow}>
        <div className={`${ui.formField} ${ui.formFieldWide}`}>
          <Field
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="LAUNCH14"
          />
        </div>
        <div className={ui.formField}>
          <Field
            label="Trial days"
            type="number"
            min={1}
            value={trialDays}
            onChange={(e) => setTrialDays(e.target.value)}
          />
        </div>
        <div className={ui.formField}>
          <Field
            label="Max redemptions"
            type="number"
            min={1}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder="unlimited"
          />
        </div>
        <Button
          variant="primary"
          disabled={busy || !code.trim()}
          loading={busy}
          onClick={() => void create()}
        >
          Create code
        </Button>
      </div>
      {error ? <p className={`${ui.inlineMsg} ${ui.inlineErr}`}>{error}</p> : null}

      <DataTable headers={['Code', 'Trial days', 'Redeemed', 'Status', '']} empty="No promo codes yet.">
        {initial.map((p) => (
          <tr key={p.id}>
            <Td>{p.code}</Td>
            <Td>{p.trialDays}</Td>
            <Td>
              {p.redeemedCount}
              {p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ''}
            </Td>
            <Td>
              <span className={[ui.badge, p.active ? ui.badgeActive : ui.badgeNeutral].join(' ')}>
                {p.active ? 'Active' : 'Disabled'}
              </span>
            </Td>
            <Td>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => void toggle(p.id, !p.active)}
              >
                {p.active ? 'Disable' : 'Enable'}
              </Button>
            </Td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
