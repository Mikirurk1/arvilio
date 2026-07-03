'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Metadata } from 'next';
import styles from './page.module.scss';

interface HealthData {
  status: 'ok' | 'degraded';
  db: 'ok' | 'error';
  ts: string;
}

type LoadState = 'loading' | 'ok' | 'error';

// Metadata cannot be exported from a client component; kept here for reference.
// Move to a server wrapper if SEO matters for this page.
void (null as unknown as Metadata);

function StatusBadge({ value }: { value: 'ok' | 'error' | 'degraded' | null }) {
  if (value === null) {
    return <span className={`${styles.badge} ${styles.unknown}`}><span className={styles.dot} />Checking…</span>;
  }
  if (value === 'ok') {
    return <span className={`${styles.badge} ${styles.ok}`}><span className={styles.dot} />Operational</span>;
  }
  return <span className={`${styles.badge} ${styles.degraded}`}><span className={styles.dot} />{value === 'degraded' ? 'Degraded' : 'Error'}</span>;
}

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  const check = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const json = (await res.json()) as HealthData;
      setData(json);
      setState('ok');
    } catch {
      setData(null);
      setState('error');
    }
  }, []);

  useEffect(() => {
    void check();
    const interval = setInterval(() => void check(), 60_000);
    return () => clearInterval(interval);
  }, [check]);

  const overallStatus = state === 'error' ? 'degraded' : (data?.status ?? null);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>System Status</h1>
        <p className={styles.subtitle}>
          SoEnglish platform — live component health. Auto-refreshes every 60 seconds.
        </p>

        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.service}>API</span>
            <StatusBadge value={state === 'loading' ? null : overallStatus} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.service}>Database</span>
            <StatusBadge value={state === 'loading' ? null : (state === 'error' ? 'error' : (data?.db ?? null))} />
          </div>
        </div>

        <button type="button" className={styles.refreshBtn} onClick={() => void check()}>
          Refresh now
        </button>

        {data?.ts && (
          <p className={styles.ts}>
            Last checked: {new Date(data.ts).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
}
