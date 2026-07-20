'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field } from '@fe/ui';
import ui from './ui/ui.module.scss';

/**
 * Control Plane–only billing country for campus subscription offer resolution (ADR-010).
 */
export function SchoolBillingCountryEditor({
  schoolId,
  initial,
}: {
  schoolId: string;
  initial: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const trimmed = value.trim().toUpperCase();
      const res = await fetch(`/api/platform/schools/${schoolId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCountry: trimmed || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Save failed (${res.status})`);
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={ui.actionRow} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <Field
        label="Billing country"
        placeholder="UA (empty = product default)"
        hint="ISO alpha-2. Drives Campus subscription rail and price. Not from IP."
        value={value}
        onChange={(e) => {
          setSaved(false);
          setValue(e.target.value.toUpperCase());
        }}
      />
      <Button variant="primary" disabled={pending} loading={pending} onClick={() => void save()}>
        Save country
      </Button>
      {saved ? <span className={`${ui.inlineMsg} ${ui.inlineOk}`}>Saved</span> : null}
      {error ? <span className={`${ui.inlineMsg} ${ui.inlineErr}`}>{error}</span> : null}
    </div>
  );
}
