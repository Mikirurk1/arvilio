'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Metadata } from 'next';
import { Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();
  if (value === null) {
    return <span className={`${styles.badge} ${styles.unknown}`}><span className={styles.dot} />{t('status.checking')}</span>;
  }
  if (value === 'ok') {
    return <span className={`${styles.badge} ${styles.ok}`}><span className={styles.dot} />{t('status.operational')}</span>;
  }
  return <span className={`${styles.badge} ${styles.degraded}`}><span className={styles.dot} />{value === 'degraded' ? t('status.degraded') : t('status.error')}</span>;
}

export default function StatusPage() {
  const t = useCampusT();
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
        <h1 className={styles.heading}>{t('status.title')}</h1>
        <p className={styles.subtitle}>{t('status.subtitle')}</p>

        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.service}>{t('status.api')}</span>
            <StatusBadge value={state === 'loading' ? null : overallStatus} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.service}>{t('status.database')}</span>
            <StatusBadge value={state === 'loading' ? null : (state === 'error' ? 'error' : (data?.db ?? null))} />
          </div>
        </div>

        <Button type="button" className={styles.refreshBtn} onClick={() => void check()}>
          {t('status.refresh')}
        </Button>

        {data?.ts && (
          <p className={styles.ts}>
            {t('status.lastChecked', { time: new Date(data.ts).toLocaleString() })}
          </p>
        )}
      </div>
    </main>
  );
}
